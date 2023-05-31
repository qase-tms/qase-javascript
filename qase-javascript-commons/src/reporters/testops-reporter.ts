import { createReadStream } from 'fs';

import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import { QaseApiInterface, ResultCreate, ResultCreateStatusEnum } from 'qaseio';

import { AbstractReporter, ReporterOptionsType, LoggerInterface } from './reporter';

import { StatusesEnum, TestResultType, ParamType } from '../models';

const statusMap = {
    [StatusesEnum.passed]: ResultCreateStatusEnum.PASSED,
    [StatusesEnum.failed]: ResultCreateStatusEnum.FAILED,
    [StatusesEnum.skipped]: ResultCreateStatusEnum.SKIPPED,
    [StatusesEnum.disabled]: ResultCreateStatusEnum.SKIPPED,
    [StatusesEnum.blocked]: ResultCreateStatusEnum.BLOCKED,
    [StatusesEnum.invalid]: ResultCreateStatusEnum.INVALID,
}

export type TestOpsOptionsType = {
    baseUrl: string;
    projectCode: string;
    frameworkName: string;
    uploadAttachments?: boolean | undefined;
    runName: string;
    runDescription: string;
    runId?: number | undefined;
    runComplete?: boolean | undefined;
    environmentId?: number | undefined;
}

export class TestOpsReporter extends AbstractReporter {
    private baseUrl: string;
    private projectCode: string;

    private frameworkName: string;

    private uploadAttachments: boolean | undefined;

    private runId: number | undefined;
    private runName: string;
    private runDescription: string;
    private runComplete: boolean | undefined;
    private environmentId: number | undefined;

    private api: QaseApiInterface;
    private results: ResultCreate[] = [];
    private attachments: Record<string, string[]> = {};

    constructor(
       options: ReporterOptionsType & TestOpsOptionsType,
       apiClient: QaseApiInterface,
       logger?: LoggerInterface,
    ) {
        const {
            baseUrl,
            projectCode,

            frameworkName,

            uploadAttachments,

            runId,
            runName,
            runDescription,
            runComplete,
            environmentId,

            ...restOptions
        } = options;

        super(restOptions, logger);

        this.baseUrl = baseUrl;
        this.projectCode = projectCode;
        this.frameworkName = frameworkName;
        this.uploadAttachments = uploadAttachments;
        this.runId = runId;
        this.runName = runName;
        this.runDescription = runDescription;
        this.runComplete = runComplete;
        this.environmentId = environmentId;

        this.api = apiClient;
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
                this.runName,
                this.runDescription,
                this.environmentId,
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
                if (result.case_id) {
                    result.attachments = attachmentsMap[result.case_id]?.filter((hash): hash is string => !!hash) || null;
                }
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

    private transformTestToResultCreateObject(result: TestResultType): ResultCreate {
        if (result.attachments?.length) {
            this.attachments[result.testOpsId[0]] = result.attachments;
        }

        return {
            case_id: result.testOpsId[0],
            status: statusMap[result.status],
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
        title: string,
        description: string,
        environmentId: number,
    ) {
        try {
            const runObject = {
                title,
                description,
                environment_id: environmentId,
                is_autotest: true,
                cases: [],
            };

            const { data } = await this.api.runs.createRun(
                this.projectCode,
                runObject,
            );

            return data;
        } catch (error) {
            throw new Error(`Error on creating run ${String(error)}`);
        }
    }

    private async doUploadAttachments(attachments: string[]) {
        return await Promise.all(
            attachments.map(async (attachment) => {
                const data = createReadStream(attachment);

                const response = await this.api.attachments.uploadAttachment(
                    this.projectCode,
                    [data],
                );

                return response.data.result?.[0]?.hash;
            })
        );
    }
}
