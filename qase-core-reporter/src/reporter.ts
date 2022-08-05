/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable sort-imports */
/* eslint-disable @typescript-eslint/unbound-method */
import {
    createReadStream,
    lstatSync,
    readFileSync,
    readdirSync,
} from 'fs';
import chalk from 'chalk';
import crypto from 'crypto';
import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { QaseApi } from 'qaseio';
import FormData from 'form-data';
import {
    IdResponse,
    ResultCreate,
    ResultCreateStatusEnum,
    ResultCreateBulk,
} from 'qaseio/dist/src';


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

export interface QaseOptions {
    apiToken: string;
    basePath?: string;
    rootSuiteTitle?: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
    qaseCoreReporterOptions?: QaseCoreReporterOptions;
}

export interface QaseCoreReporterOptions {
    frameworkName: string;
    reporterName: string;
    screenshotFolder?: string;
    sendScreenshot?: boolean;
}

interface TestResult {
    title: string;
    status: keyof typeof Statuses;
    error?: Error;
    stacktrace?: string;
    duration?: number;
    parent?: TestResult | string;
}


interface ParameterizedTestData {
    id: string;
    dataset: string;
}

interface File {
    caseId: string;
    file: string[];
}

interface FilePathByCaseId {
    caseId: File;
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
const REGEX_QASE_ID = /(\(Qase ID: ([\d,]+)\))/;

export class QaseCoreReporter {
    public static reporterPrettyName = 'Qase Core';
    private api: QaseApi;
    private options: QaseOptions;
    private pending: Array<(runId: string | number) => void> = [];
    private runId?: number | string;
    private isDisabled = false;
    private resultsForPublishingCount = 0;
    private resultsForPublishing: ResultCreate[] = [];

    public constructor(_reporterOptions: QaseOptions, _options: QaseCoreReporterOptions) {
        this.options = _reporterOptions;
        this.options.qaseCoreReporterOptions = _options;
        this.options.projectCode = _reporterOptions.projectCode || QaseCoreReporter.getEnv(Envs.projectCode) || '';
        this.options.rootSuiteTitle = _reporterOptions.rootSuiteTitle || QaseCoreReporter.getEnv(Envs.rootSuiteTitle);
        this.options.runComplete = !!QaseCoreReporter.getEnv(Envs.runComplete) || _reporterOptions.runComplete;
        this.api = new QaseApi(
            QaseCoreReporter.getEnv(Envs.apiToken) || this.options.apiToken || '',
            QaseCoreReporter.getEnv(Envs.basePath) || this.options.basePath,
            QaseCoreReporter.createHeaders({
                frameworkName: _options.frameworkName,
                reporterName: _options.reporterName,
            }),
            _options.sendScreenshot
                ? CustomBoundaryFormData
                : undefined
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        if (!QaseCoreReporter.getEnv(Envs.report)) {
            this.log(
                chalk`{yellow QASE_REPORT env variable is not set. Reporting to qase.io is disabled.}`);
            this.isDisabled = true;
            return;
        }
    }

    public static logger(message?: string, ...optionalParams: any[]): void {
        // eslint-disable-next-line no-console
        console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
    }

    private static getSuitePath(suite: TestResult): string {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (suite.parent) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const parentSuite = String(QaseCoreReporter.getSuitePath(suite.parent as TestResult));
            if (parentSuite) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return parentSuite + '\t' + String(suite.title);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return String(suite.title);
            }
        }
        return suite.title;
    }

    private static removeQaseDataset(title: string): string {
        return title.replace(REGEX_QASE_DATASET, '');
    }

    private static getCaseIds(title: string): number[] {
        const results = REGEX_QASE_ID.exec(title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private static getParameterizedData(title: string): ParameterizedTestData {
        const results = REGEX_QASE_DATASET.exec(title) || [];
        if (results?.length > 0) {
            return {
                id: results[1],
                dataset: results[2],
            };
        }
        return undefined as unknown as ParameterizedTestData;
    }

    private static createHeaders({ frameworkName, reporterName }: { frameworkName?: string; reporterName?: string }) {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseapiVersion = QaseCoreReporter.getPackageVersion('qaseio');
        const frameworkVersion = QaseCoreReporter.getPackageVersion(frameworkName);
        const reporterVersion = QaseCoreReporter.getPackageVersion(reporterName);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const xPlatformHeader = `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`;
        const fv = frameworkVersion && frameworkName ? `${frameworkName}=${frameworkVersion}` : '';
        const rv = reporterVersion && reporterName ? `${reporterName}=${reporterVersion}` : '';
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const xClientHeader = `${fv}; ${rv}; qaseapi=${qaseapiVersion as string}`;

        return {
            'X-Client': xClientHeader,
            'X-Platform': xPlatformHeader,
        };
    }

    private static getPackageVersion(name: string | undefined) {
        const UNDEFINED = 'undefined';
        try {
            const pathToPackageJson = require.resolve(`${name || ''}/package.json`, { paths: [process.cwd()] });
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

    private static getFiles = (pathToFile: string) => {
        const files: string[] = [];
        for (const file of readdirSync(pathToFile)) {
            const fullPath = `${pathToFile}/${file}`;

            if (lstatSync(fullPath).isDirectory()) {
                QaseCoreReporter.getFiles(fullPath).forEach((x) => files.push(`${file}/${x}`));
            } else {
                files.push(file);
            }
        }
        return files;
    };

    private static getEnv(name: Envs) {
        return process.env[name];
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

    public async start(): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        this.log(chalk`{yellow Starting QASE reporter}`);

        return this.checkProject(
            this.options.projectCode,
            async (prjExists): Promise<void> => {

                if (!prjExists) {
                    this.log(
                        chalk`{red Project ${this.options.projectCode} does not exist}`
                    );
                    this.isDisabled = true;
                    return;
                }

                this.log(chalk`{green Project ${this.options.projectCode} exists}`);
                const userDefinedRunId = QaseCoreReporter.getEnv(Envs.runId) || this.options.runId;
                if (userDefinedRunId) {
                    this.saveRunId(
                        QaseCoreReporter.getEnv(Envs.runId) || this.options.runId
                    );
                    return this.checkRun(this.runId, (runExists: boolean) => {
                        if (runExists) {
                            this.log(
                                chalk`{green Using run ${this.runId} to publish test results}`
                            );
                        } else {
                            this.log(chalk`{red Run ${this.runId} does not exist}`);
                            this.isDisabled = true;
                        }
                    });
                } else {
                    return this.createRun(
                        QaseCoreReporter.getEnv(Envs.runName),
                        QaseCoreReporter.getEnv(Envs.runDescription),
                        (created) => {
                            if (created) {
                                this.runId = created.result?.id;
                                process.env.QASE_RUN_ID = String(this?.runId);
                                this.log(
                                    chalk`{green Using run ${this.runId} to publish test results}`
                                );
                            } else {
                                this.log(
                                    chalk`{red Could not create run in project ${this.options.projectCode}}`
                                );
                                this.isDisabled = true;
                            }
                        }
                    );
                }
            }
        );
    }

    public async end({ spawn }: { spawn: boolean }): Promise<void> {
        // let hashesMap = {};
        if (this.isDisabled) {
            return;
        }

        if (spawn) {
            const { qaseCoreReporterOptions } = this.options;
            const {
                screenshotFolder,
                sendScreenshot,
            } = qaseCoreReporterOptions as QaseCoreReporterOptions;
            const headers = QaseCoreReporter.createHeaders(
                qaseCoreReporterOptions as { frameworkName?: string; reporterName?: string }
            );
            const config = {
                apiToken: QaseCoreReporter.getEnv(Envs.apiToken) || this.options.apiToken || '',
                basePath: QaseCoreReporter.getEnv(Envs.basePath) || this.options.basePath,
                headers,
                code: this.options.projectCode,
                runId: Number(this.runId),
                body: {
                    results: this.resultsForPublishing,
                },
                runComplete: QaseCoreReporter.getEnv(Envs.runComplete) || this.options.runComplete || false,
            };

            const screenshotsConfig = {
                screenshotFolder: screenshotFolder || 'screenshots',
                sendScreenshot: sendScreenshot || false,
            };

            spawnSync('node', [`${__dirname}/result-bulk-detached.js`], {
                stdio: 'inherit',
                env: Object.assign(process.env, {
                    NODE_NO_WARNINGS: '1',
                    reporting_config: JSON.stringify(config),
                    screenshots_config: JSON.stringify(screenshotsConfig),
                }),
            });
            return;
        }

        await new Promise((resolve, reject) => {
            let timer = 0;
            const interval = setInterval(() => {
                timer++;
                if (this.runId && this.resultsForPublishingCount === 0) {
                    clearInterval(interval);
                    resolve();
                }
                if (timer > 30) {
                    clearInterval(interval);
                    reject();
                }
            }, 1000);
        });

        if (this.resultsForPublishing.length === 0) {
            this.log(
                'No testcases were matched. Ensure that your tests are declared correctly.'
            );
            return;
        }

        const body = {
            results: this.resultsForPublishing,
        };

        await this.api.results.createResultBulk(
            this.options.projectCode,
            Number(this.runId),
            body
        );

        this.log(chalk`{green ${this.resultsForPublishing.length} result(s) sent to Qase}`);

        if (!this.options.runComplete) {
            return;
        }

        try {
            await this.api.runs.completeRun(this.options.projectCode, Number(this.runId));
            this.log(chalk`{green Run ${this.runId} completed}`);
        } catch (err) {
            this.log(`Error on completing run ${err as string}`);
        }
    }

    public addTestResult(test: TestResult, status: ResultCreateStatusEnum): void {
        this.transformTestToResultCreateObject(test, status);
    }

    public async uploadAttachments(attachments: Array<{ path: string }>): Promise<string[]> {
        return await Promise.all(
            attachments.map(async (attachment) => {
                const data = createReadStream(attachment?.path);

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


    private transformTestToResultCreateObject(testResult: TestResult,
        // eslint-disable-next-line @typescript-eslint/indent
        status: ResultCreateStatusEnum,
        // eslint-disable-next-line @typescript-eslint/indent
        attachments?: any[]) {
        this.resultsForPublishingCount++;
        this.logTestItem(testResult);
        const caseIds = QaseCoreReporter.getCaseIds(testResult.title);
        const parameterizedData = QaseCoreReporter.getParameterizedData(testResult.title);
        const frameworkName = this.options.qaseCoreReporterOptions
            && this.options.qaseCoreReporterOptions.frameworkName;

        const caseObject: ResultCreate = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            status: Statuses[status] || Statuses.failed,
            time_ms: testResult.duration || 0,
            stacktrace: testResult.error?.stack?.replace(/\u001b\[.*?m/g, ''),
            comment: testResult.error
                ? this.formatComment(testResult.title, testResult.error, parameterizedData)
                : undefined,
            attachments: attachments && attachments.length > 0
                ? attachments
                : undefined,
            defect: Statuses[status] === Statuses.failed,
            param: parameterizedData
                ? { [frameworkName as string]: String(parameterizedData.id) }
                : undefined,
        };

        if (caseIds.length === 0) {
            const suitePath = QaseCoreReporter.getSuitePath(testResult.parent as TestResult);
            caseObject.case = {
                title: testResult.title,
                suite_title: this.options.rootSuiteTitle
                    ? `${this.options.rootSuiteTitle}\t${suitePath}`
                    : suitePath,
            };
            this.resultsForPublishing.push(caseObject);
            this.log(
                chalk`{gray Result prepared for publish: ${testResult.title} }`
            );
        } else {
            caseIds.forEach((caseId) => {
                const caseObjectWithId = { case_id: caseId, ...caseObject };
                this.resultsForPublishing.push(caseObjectWithId);
            });
        }
    }

    private formatComment(title: string, error: Error, parameterizedData: ParameterizedTestData): string {
        let comment = `${parameterizedData ? QaseCoreReporter.removeQaseDataset(title) : title}`.trim();

        if (parameterizedData) {
            comment += `::_using data set ${parameterizedData.id} ${parameterizedData.dataset}_
            \n\n>${error?.message?.replace(/\u001b\[.*?m/g, '')}`;
        } else {
            comment += `: ${error?.message?.replace(/\u001b\[.*?m/g, '')}`;
        }

        return comment;
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

    private async completeRun(cb: (completed: boolean) => void): Promise<void> {
        if (this.runId === undefined) {
            cb(false);
            return;
        }

        return this.api.runs
            .completeRun(this.options.projectCode, Number(this.runId))
            .then((resp) => {
                this.log(
                    `Run ${this.runId as string} completed`
                );
                cb(Boolean(resp.data));
            })
            .catch((err) => {
                this.log(`Error on completing run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private async createResults(
        code: string,
        runId: number,
        body: ResultCreateBulk,
        cb: (response: IdResponse | undefined) => void
    ): Promise<void> {
        try {
            const res = await this.api.results.createResultBulk(code, runId, body);
            cb(res.data);
        } catch (error) {
            this.log(`Error on creating results ${error as string}`);
            this.isDisabled = true;
        }
    }

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: IdResponse | undefined) => void
    ): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const environmentId = Number.parseInt(QaseCoreReporter.getEnv(Envs.environmentId)!, 10)
                || this.options.environmentId;

            const runObject = QaseCoreReporter.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || `${QaseCoreReporter.reporterPrettyName} automated run`,
                    environment_id: environmentId,
                    is_autotest: true,
                }
            );
            const res = await this.api.runs.createRun(
                this.options.projectCode,
                runObject
            );
            cb(res.data);
        } catch (err) {
            this.log(`Error on creating run ${err as string}`);
            this.isDisabled = true;
        }
    }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
            QaseCoreReporter.logger(message, ...optionalParams);
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

    private parseScreenshotDirectory = () => {
        const screenshotFolder = this.options.qaseCoreReporterOptions
            && this.options.qaseCoreReporterOptions.screenshotFolder
            || '';
        const pathToScreenshotDir = join(process.cwd(), screenshotFolder);
        const files = QaseCoreReporter.getFiles(pathToScreenshotDir);
        const filePathByCaseIdMap = {};

        files.forEach((file) => {
            if (file.includes('Qase ID')) {
                const caseIds = QaseCoreReporter.getCaseIds(file);

                if (caseIds) {
                    caseIds.forEach((caseId) => {
                        const attachmentObject = {
                            caseId,
                            file: [file],
                        };

                        filePathByCaseIdMap[caseId] = attachmentObject;
                    });
                }
            }
        });

        return filePathByCaseIdMap as FilePathByCaseId;
    };
}
