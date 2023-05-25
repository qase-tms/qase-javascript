import { execSync } from 'child_process';
import { createReadStream } from 'fs';

import chalk from 'chalk';
import { QaseApi, QaseApiInterface, BASE_URL } from 'qaseio';

import { AbstractReporter, ReporterOptionsType, LoggerInterface } from './reporter';

import { AttachmentType, StatusesEnum, TestResultType } from '../models';

import { getPackageVersion } from '../utils/get-package-version';
import { CustomBoundaryFormData } from '../utils/custom-boundary';
import { ResultCreate, ResultCreateStatusEnum } from 'qaseio/dist';
import stripAnsi from 'strip-ansi';
import { ParamType } from '../models/param';

export type TestOpsOptionsType = {
    apiToken: string;
    projectCode: string;

    frameworkName: string;
    reporterName: string;

    baseUrl?: string;

    customFrameworkName?: string | undefined;
    customReporterName?: string | undefined;

    uploadAttachments?: boolean | undefined;

    runId?: number | undefined;
    runName?: string | undefined;
    runDescription?: string | undefined;
    runComplete?: boolean | undefined;
    environmentId?: number | undefined;
}

export class TestOpsReporter extends AbstractReporter {
    private projectCode: string;

    private frameworkName: string;
    private reporterName: string;

    private baseUrl: string;

    private customFrameworkName: string | undefined;
    private customReporterName: string | undefined;

    private uploadAttachments: boolean | undefined;

    private runId: number | undefined;
    private runName: string | undefined;
    private runDescription: string | undefined;
    private runComplete: boolean | undefined;
    private environmentId: number | undefined;

    private api: QaseApiInterface;
    private results: Array<ResultCreate & Record<'id', string>> = [];
    private attachments: Record<string, AttachmentType[]> = {};

    constructor(options: ReporterOptionsType & TestOpsOptionsType, logger?: LoggerInterface) {
        const {
            apiToken,
            projectCode,

            frameworkName,
            reporterName,

            baseUrl = BASE_URL,

            customFrameworkName,
            customReporterName,

            uploadAttachments,

            runId,
            runName,
            runDescription,
            runComplete,
            environmentId,

            ...restOptions
        } = options;

        super(restOptions, logger);

        this.projectCode = projectCode;
        this.frameworkName = frameworkName;
        this.reporterName = reporterName;
        this.baseUrl = baseUrl;
        this.customFrameworkName = customFrameworkName;
        this.customReporterName = customReporterName;
        this.uploadAttachments = uploadAttachments;
        this.runId = runId;
        this.runName = runName;
        this.runDescription = runDescription;
        this.runComplete = runComplete;
        this.environmentId = environmentId;

        this.api = new QaseApi({
            apiToken,
            headers: this.createHeaders(),
            formDataCtor: CustomBoundaryFormData,
        });
    }

    public addTestResult(result: TestResultType) {
        this.results.push(this.transformTestToResultCreateObject(result));

        if (result.attachments?.length) {
            this.attachments[result.id] = result.attachments;
        }
    }

    public async publish() {
        let runId: number;

        if (this.runId !== undefined) {
            await this.checkRun(this.runId);

            runId = this.runId;
        } else if (this.environmentId !== undefined) {
            const { result } = await this.createRun(
                this.environmentId,
                this.customReporterName || this.reporterName,
                this.runName,
                this.runDescription,
            );

            if (!result?.id) {
                throw new Error('Cannot create run.');
            }

            runId = result.id;
        } else {
            throw new Error('Either "runId" or "environmentId" is required.');
        }

        if (!this.results.length) {
            this.log('No test cases were matched. Ensure that your tests are declared correctly.');

            return;
        }

        if (this.uploadAttachments && Object.keys(this.attachments).length) {
            this.log(chalk`{yellow Uploading attachments to Qase}`);

            const uploads = Object.keys(this.attachments)
                .reduce<[string, Promise<Array<string | undefined>>][]>((acc, caseId) => {
                    const attachment = this.attachments[caseId];

                    if (attachment) {
                        acc.push([caseId, this.doUploadAttachments(attachment)]);
                    }

                    return acc;
                }, []);

            const attachmentHashes = await Promise.all(uploads.map(async ([caseId, request]) => {
                return [caseId, await request] satisfies [string, Array<string | undefined>];
            }));

            const attachmentsMap = Object.fromEntries(attachmentHashes);

            this.results.forEach((result) => {
                result.attachments = attachmentsMap[result.id]?.filter((hash): hash is string => !!hash) || null;
            });
        }

        await this.api.results.createResultBulk(
            this.projectCode,
            runId,
            { results: this.results }
        );

        this.log(chalk`{green ${this.results.length} result(s) sent to Qase}`);

        if (!this.runComplete) {
            return;
        }

        try {
            await this.api.runs.completeRun(this.projectCode, runId);
            this.log(chalk`{green Run ${runId} completed}`);
        } catch (error) {
            throw new Error(`Error on completing run ${String(error)}`);
        }

        const runUrl = `${this.baseUrl}/run/${this.projectCode}/dashboard/${runId}`;

        this.log(chalk`{blue Test run link: ${runUrl}}`);
    }

    private createHeaders() {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseApiVersion = getPackageVersion('qaseio');
        const qaseReporterVersion = getPackageVersion('qase-javascript-commons');
        const frameworkVersion = getPackageVersion(this.frameworkName);
        const reporterVersion = getPackageVersion(this.reporterName);

        const fv = frameworkVersion ? `${this.customFrameworkName || this.frameworkName}=${frameworkVersion}` : '';
        const rv = reporterVersion ? `${this.customReporterName || this.reporterName}=${reporterVersion}` : '';
        const qcr = qaseReporterVersion ? `qase-core-reporter=${qaseReporterVersion}` : '';

        return {
            'X-Client': `${fv}; ${rv}; ${qcr}; qaseapi=${String(qaseApiVersion)}`,
            'X-Platform': `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`,
        };
    }

    private transformTestToResultCreateObject(result: TestResultType): ResultCreate & Record<'id', string> {
        if (result.attachments?.length) {
            this.attachments[result.id] = result.attachments;
        }

        return {
            id: result.id,
            status: result.status as ResultCreateStatusEnum,
            time_ms: result.duration || 0,
            stacktrace: stripAnsi(String(result.error?.stack || '')) || null,
            comment: this.formatComment(result.title, result.error, result.param),
            defect: result.status === StatusesEnum.failed,
            param: result.param ? { [this.frameworkName]: String(result.param.id) } : null,
        };
    }

    private formatComment(title: string, error?: Error, param?: ParamType) {
        let comment = title;
        const errorMessage = stripAnsi(String(error?.message || ''));

        if (param) {
            comment += `::_using data set ${param.id} ${param.dataset}_\n\n>${errorMessage}`;
        } else {
            comment += `: ${errorMessage}`;
        }

        return comment;
    }

    private async checkRun(runId: number) {
        try {
            const resp = await this.api.runs.getRun(this.projectCode, runId);

            this.log(`Get run result on checking run "${String(resp.data.result?.id)}"`);
        } catch (error) {
            throw new Error(`Error on checking run: ${String(error)}`);
        }
    }

    private async createRun(
        environmentId: number,
        reporterName: string,
        name?: string,
        description?: string,
    ) {
        try {
            const runObject = {
                title: name || `Automated run ${new Date().toISOString()}`,
                description: description || `${reporterName} automated run`,
                environment_id: environmentId,
                is_autotest: true,
                cases: [],
            }

            const { data } = await this.api.runs.createRun(
                this.projectCode,
                runObject,
            );

            return data;
        } catch (error) {
            throw new Error(`Error on creating run ${String(error)}`);
        }
    }

    private async doUploadAttachments(attachments: AttachmentType[]) {
        return await Promise.all(
            attachments.map(async (attachment) => {
                const data = createReadStream(attachment.path);

                const response = await this.api.attachments.uploadAttachment(
                    this.projectCode,
                    [data],
                );

                return response.data.result?.[0]?.hash;
            })
        );
    }
}
