import { QaseApi } from 'qaseio';
import crypto from 'crypto';
import {
    IdResponse,
    ResultCreate,
    ResultCreateStatusEnum,
} from 'qaseio/dist/src';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { readFileSync, createReadStream } from 'fs';

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    basePath = 'QASE_API_BASE_URL',
    projectCode = 'QASE_PROJECT_CODE',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
    runComplete = 'QASE_RUN_COMPLETE',
    environmentId = 'QASE_ENVIRONMENT_ID',
    rootSuiteTitle = 'QASE_ROOT_SUITE_TITLE'
}

const Statuses = {
    passed: ResultCreateStatusEnum.PASSED,
    failed: ResultCreateStatusEnum.FAILED,
    skipped: ResultCreateStatusEnum.SKIPPED,
    pending: ResultCreateStatusEnum.SKIPPED,
    disabled: ResultCreateStatusEnum.BLOCKED,
    in_process: ResultCreateStatusEnum.IN_PROGRESS,
    invalid: ResultCreateStatusEnum.INVALID,
};

interface QaseOptions {
    apiToken: string;
    basePath?: string;
    rootSuiteTitle?: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
    qaseCoreReporterOptions: {
        frameworkName: string;
        reporterName: string;
    }
}

interface TestResult {
    title: string;
    status: ResultCreateStatusEnum;
    error?: Error;
    stacktrace?: string;
    duration?: number;
    parent?: string;
}


interface ParameterizedTestData {
    id: string;
    dataset: string;
}


let customBoundary = '----------------------------';
crypto.randomBytes(24).forEach((value) => {
    customBoundary += Math.floor(value * 10).toString(16);
});

class CustomBoundaryFormData extends FormData {
    public constructor() {
        super();
    }

    public getBoundary(): string {
        return customBoundary;
    }
}

const REGEX_QASE_DATASET = /\(Qase Dataset: (#\d) (\(.*\))\)/;
const REGEX_QASE_ID = /\(Qase ID: (#\d)\)/;

class QaseCoreReporter {
    private api: QaseApi;
    private options: QaseOptions;
    private pending: Array<(runId: string | number) => void> = [];
    private runId?: number | string;
    private isDisabled = false;
    private resultsForPublishingCount = 0;
    private resultsForPublishing: ResultCreate[] = [];

    public constructor(_: Record<string, unknown>, _options: QaseOptions) {
        this.options = _options;
        this.options.projectCode = _options.projectCode || QaseCoreReporter.getEnv(Envs.projectCode) || '';
        this.options.rootSuiteTitle = _options.rootSuiteTitle || QaseCoreReporter.getEnv(Envs.rootSuiteTitle);
        this.options.runComplete = !!QaseCoreReporter.getEnv(Envs.runComplete) || _options.runComplete;
        this.api = new QaseApi(
            QaseCoreReporter.getEnv(Envs.apiToken) || this.options.apiToken || '',
            QaseCoreReporter.getEnv(Envs.basePath) || this.options.basePath,
            QaseCoreReporter.createHeaders({
                frameworkName: _options.qaseCoreReporterOptions.frameworkName,
                reporterName: _options.qaseCoreReporterOptions.reporterName,
            }),
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        if (!QaseCoreReporter.getEnv(Envs.report)) {
            this.log(
                chalk`{yellow QASE_REPORT env variable is not set. Reporting to qase.io is disabled.}`);
            this.isDisabled = true;
            return;
        }
    }

    public addTestResult(test: TestResult, status: ResultCreateStatusEnum) {
        this.transformTestToResultCreateObject(test, status);
    }

    private logTestItem(test: TestResult) {
        const map = {
            failed: chalk`{red Test ${test.title} ${test.status}}`,
            passed: chalk`{green Test ${test.title} ${test.status}}`,
            pending: chalk`{blueBright Test ${test.title} ${test.status}}`,
            skipped: chalk`{blueBright Test ${test.title} ${test.status}}`,
            disabled: chalk`{grey Test ${test.title} ${test.status}}`,
            in_process: chalk`{yellowBright Test ${test.title} ${test.status}}`,
            invalid: chalk`{yellowBright Test ${test.title} ${test.status}}`,
        };
        if (test.status) {
            this.log(map[test.status]);
        }
    }

    private formatComment(title: string, error: Error, parameterizedData: ParameterizedTestData): string {
        let comment = `${parameterizedData ? QaseCoreReporter.removeQaseDataset(title) : title}`.trim();

        if (parameterizedData) {
            comment += `::_using data set ${parameterizedData.id as string} ${parameterizedData.dataset as string}_ \n\n\n>${error?.message?.replace(/\u001b\[.*?m/g, '') as string}`;
        } else {
            comment += `: ${error?.message?.replace(/\u001b\[.*?m/g, '') as string}`;
        }

        return comment;
    }

    private transformTestToResultCreateObject(testResult: TestResult, status: ResultCreateStatusEnum, attachments?: any[]) {
        this.resultsForPublishingCount++;
        this.logTestItem(testResult);
        const caseIds = QaseCoreReporter.getCaseIds(testResult.title);
        const parameterizedData = QaseCoreReporter.getParameterizedData(testResult.title);

        const caseObject: ResultCreate = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            status: Statuses[testResult.status] || Statuses.failed,
            time_ms: testResult.duration || 0,
            stacktrace: testResult.error?.stack?.replace(/\u001b\[.*?m/g, ''),
            comment: testResult.error
                ? this.formatComment(testResult.title, testResult.error, parameterizedData)
                : undefined,
            attachments: attachments && attachments.length > 0
                ? attachments
                : undefined,
            defect: Statuses[testResult.status] === Statuses.failed,
            param: parameterizedData
                ? { [this.options.qaseCoreReporterOptions.frameworkName]: String(parameterizedData.id) }
                : undefined,
        };

        caseIds.forEach((caseId) => {
            if (caseId) {
                const createResultObject = {
                    case_id: caseId,
                    ...caseObject,
                };
                this.resultsForPublishing.push(createResultObject);
            }
        });
    }


    private async uploadAttachments(attachments: any[]) {
        return await Promise.all(
            attachments.map(async (attachment) => {
                const data = createReadStream(attachment?.path as string);

                const options = {
                    headers: {
                        'Content-Type': 'multipart/form-data; boundary=' + customBoundary,
                    },
                };

                const response = await this.api.attachments.uploadAttachment(
                    this.options.projectCode,
                    [data],
                    options
                );

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return (response.data.result?.[0].hash as string);
            })
        );
    }

    private async checkProject(
        projectCode: string,
        cb: (exists: boolean) => Promise<void>
    ): Promise<void> {
        try {
            const resp = await this.api.projects.getProject(projectCode);

            await cb(Boolean(resp.data.result?.code));
        } catch (err) {
            this.log(err);
            this.isDisabled = true;
        }
    }

    private async checkRun(
        runId: string | number | undefined,
        cb: (exists: boolean) => void
    ): Promise<void> {
        if (runId === undefined) {
            cb(false);
            return;
        }

        return this.api.runs
            .getRun(this.options.projectCode, Number(runId))
            .then((resp) => {
                this.log(
                    `Get run result on checking run ${resp.data.result?.id as unknown as string
                    }`
                );
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private static createRunObject(
        name: string,
        cases: number[],
        args?: {
            description?: string;
            environment_id: number | undefined;
            is_autotest: boolean;
        }
    ) {
        return {
            title: name,
            cases,
            ...args,
        };
    }

    private static getEnv(name: Envs) {
        return process.env[name];
    }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
            // eslint-disable-next-line no-console
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private saveRunId(runId?: string | number) {
        this.runId = runId;
        if (this.runId) {
            while (this.pending.length) {
                this.log(`Number of pending: ${this.pending.length}`);
                const cb = this.pending.shift();
                if (cb) {
                    cb(this.runId);
                }
            }
        }
    }

    private static removeQaseDataset(title: string): string {
        const regexp = /\(Qase Dataset: (#\d) (\(.*\))\)/;
        return title.replace(regexp, '');
    }

    private static getCaseIds(title: string): number[] {
        const regexp = /(\(Qase ID: ([\d,]+)\))/;
        const results = regexp.exec(title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private static getParameterizedData(title: string): ParameterizedTestData {
        const regexp = /\(Qase Dataset: (#\d) (\(.*\))\)/;
        const results = regexp.exec(title) || [];
        if (results?.length > 0) {
            return {
                id: results[1],
                dataset: results[2],
            };
        }
        return undefined as unknown as ParameterizedTestData;
    }

    private static createHeaders({ frameworkName, reporterName }: { frameworkName?: string, reporterName?: string }) {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseapiVersion = QaseCoreReporter.getPackageVersion('qaseio');
        const frameworkVersion = QaseCoreReporter.getPackageVersion(frameworkName);
        const reporterVersion = QaseCoreReporter.getPackageVersion(reporterName);
        const xPlatformHeader = `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`;
        const xClientHeader = `${frameworkName}=${frameworkVersion as string};${reporterName}=${reporterVersion as string};qaseapi=${qaseapiVersion as string}`;

        return {
            'X-Client': xClientHeader,
            'X-Platform': xPlatformHeader,
        };
    }

    private static getPackageVersion(name: string | undefined) {
        const UNDEFINED = 'undefined';
        try {
            const pathToPackageJson = require.resolve(`${name}/package.json`, { paths: [process.cwd()] });
            if (pathToPackageJson) {
                try {
                    const packageString = readFileSync(pathToPackageJson, { encoding: 'utf8' });
                    if (packageString) {
                        const packageObject = JSON.parse(packageString) as { version: string };
                        return packageObject.version;
                    }
                    return UNDEFINED;
                } catch (error) {
                    return UNDEFINED;
                }
            }
        } catch (error) {
            return UNDEFINED;
        }
    }
}

export = QaseCoreReporter;