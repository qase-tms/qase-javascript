/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable sort-imports */
/* eslint-disable @typescript-eslint/unbound-method */
import {
    createReadStream,
    lstatSync,
    readFileSync,
    readdirSync,
    existsSync,
} from 'fs';
import chalk from 'chalk';
import crypto from 'crypto';
import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { QaseApi } from 'qaseio';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import {
    IdResponse,
    ResultCreate,
    ResultCreateStatusEnum,
} from 'qaseio/dist/src';

// eslint-disable-next-line no-shadow
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
    rootSuiteTitle = 'QASE_ROOT_SUITE_TITLE',
    logging = 'QASE_LOGGING',
    uploadAttachments = 'QASE_UPLOAD_ATTACHMENTS',
}

export const Statuses = {
    passed: ResultCreateStatusEnum.PASSED,
    failed: ResultCreateStatusEnum.FAILED,
    skipped: ResultCreateStatusEnum.SKIPPED,
    pending: ResultCreateStatusEnum.SKIPPED,
    disabled: ResultCreateStatusEnum.BLOCKED,
    in_process: ResultCreateStatusEnum.IN_PROGRESS,
    invalid: ResultCreateStatusEnum.INVALID,
};

export interface QaseOptions {
    report?: boolean;
    apiToken: string;
    basePath?: string;
    rootSuiteTitle?: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
    runDescription?: string;
    runName?: string;
    qaseCoreReporterOptions?: QaseCoreReporterOptions;
}

export interface QaseCoreReporterOptions {
    frameworkName: string;
    reporterName: string;
    customFrameworkName?: string;
    customReporterName?: string;
    screenshotFolder?: string;
    videoFolder?: string;
    uploadAttachments?: boolean;
    loadConfig?: boolean;
}

export interface TestResult {
    id?: string;
    caseIds?: number[];
    title: string;
    status: keyof typeof Statuses;
    error?: Error;
    stacktrace?: string;
    duration?: number;
    suitePath?: string;
    comment?: string;
    attachments?: string[];
}

export interface Suite {
    parent: Suite | string;
    title: string;
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

interface IAttachment {
    path: string;
}

interface HeadersInput {
    frameworkName: string;
    reporterName: string;
    customFrameworkName?: string;
    customReporterName?: string;
}


type ResultsForPublishing = Array<ResultCreate & { id: string }>;

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
    public resultsForPublishingCount = 0;
    public options: QaseOptions;
    private api: QaseApi;
    private runId?: number | string;
    private isDisabled = false;
    private resultsForPublishing: ResultsForPublishing = [];
    private attachments: Record<string, IAttachment[]> = {};
    private headers: Record<string, any> = {};
    private host = 'https://app.qase.io';

    public constructor(_reporterOptions: QaseOptions, _options: QaseCoreReporterOptions) {
        if (process.env.QASE_LOGGING === undefined) {
            process.env.QASE_LOGGING = _reporterOptions.logging
                ? String(_reporterOptions.logging)
                : 'false';
        }

        // check if loadConfig is set to true and if so, load the config from the file
        const reporterOptions = _options.loadConfig
            ? QaseCoreReporter.loadConfig()
            : _reporterOptions;

        this.options = reporterOptions;
        this.options.qaseCoreReporterOptions = _options;
        this.options.qaseCoreReporterOptions.uploadAttachments = !!QaseCoreReporter.getEnv(Envs.uploadAttachments)
            || this.options.qaseCoreReporterOptions.uploadAttachments
            || false;
        // All reporter options can be set via environment variables
        // add default value if not set
        this.options.runName = QaseCoreReporter.getEnv(Envs.runName) || reporterOptions.runName;
        this.options.runDescription = QaseCoreReporter.getEnv(Envs.runDescription)
            || reporterOptions.runDescription
            || '';
        this.options.projectCode = QaseCoreReporter.getEnv(Envs.projectCode) || reporterOptions.projectCode;
        this.options.rootSuiteTitle = QaseCoreReporter.getEnv(Envs.rootSuiteTitle) || reporterOptions.rootSuiteTitle;
        this.options.runComplete = !!QaseCoreReporter.getEnv(Envs.runComplete) || reporterOptions.runComplete || false;
        this.options.environmentId = Number.parseInt(QaseCoreReporter.getEnv(Envs.environmentId) as string, 10)
            || reporterOptions.environmentId;
        this.options.basePath = QaseCoreReporter.getEnv(Envs.basePath) || reporterOptions.basePath;
        this.options.apiToken = QaseCoreReporter.getEnv(Envs.apiToken) || reporterOptions.apiToken;
        this.headers = QaseCoreReporter.createHeaders({
            frameworkName: _options.frameworkName,
            reporterName: _options.reporterName,
            customFrameworkName: _options.customFrameworkName,
            customReporterName: _options.customReporterName,
        });
        this.attachments = {};
        this.api = new QaseApi(
            this.options.apiToken,
            this.options.basePath,
            this.headers,
            this.options.qaseCoreReporterOptions.uploadAttachments
                ? CustomBoundaryFormData
                : undefined
        );

        QaseCoreReporter.logger(chalk`{yellow Current PID: ${process.pid}}`);

        const report = QaseCoreReporter.getEnv(Envs.report)
            || this.options.report
            || false;

        if (!report) {
            QaseCoreReporter.logger(
                chalk`{yellow QASE_REPORT env variable is not set or qaseReporterOptions.report is false. 
      Reporting to qase.io is disabled.}`);
            this.isDisabled = true;
            return;
        }
    }

    public static loadConfig(file?: string): QaseOptions {
        let config = {} as QaseOptions;
        let data = '';

        const qaseConfigJson = existsSync(join(process.cwd(), 'qase.config.json'));
        const qaseConfigRC = existsSync(join(process.cwd(), '.qaserc'));

        if (file) {
            data = readFileSync(file, 'utf8');
        } else if (qaseConfigJson) {
            data = readFileSync(join(process.cwd(), 'qase.config.json'), 'utf8');
        } else if (qaseConfigRC) {
            data = readFileSync(join(process.cwd(), '.qaserc'), 'utf8');
        }

        if (data) {
            try {
                config = JSON.parse(data) as QaseOptions;
            } catch {
                QaseCoreReporter.logger('Failed to parse config file, please check the file format');
            }
        }

        return config;
    }

    public static logger(message?: string, ...optionalParams: any[]): void {
        // eslint-disable-next-line no-console
        const logging = QaseCoreReporter.getEnv(Envs.logging) === 'true'
            ? true
            : false;
        if (logging) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    public static getSuitePath(suite: Suite): string {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (suite.parent) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const parentSuite = String(QaseCoreReporter.getSuitePath(suite.parent as Suite));
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

    public static parseAttachmentDirectory = (folder: string): FilePathByCaseId => {
        const pathToAttachmentDir = join(process.cwd(), folder);
        const files = QaseCoreReporter.getFiles(pathToAttachmentDir);
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

    private static removeQaseDataset(title: string): string {
        return title.replace(REGEX_QASE_DATASET, '').trim();
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

    private static createHeaders({
        frameworkName,
        reporterName,
        customFrameworkName,
        customReporterName,
    }: HeadersInput) {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseapiVersion = QaseCoreReporter.getPackageVersion('qaseio');
        const frameworkVersion = QaseCoreReporter.getPackageVersion(frameworkName);
        const reporterVersion = QaseCoreReporter.getPackageVersion(reporterName);
        const qaseCoreReporter = QaseCoreReporter.getPackageVersion('qase-core-reporter');
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const xPlatformHeader = `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`;
        const fv = frameworkVersion && frameworkName ?
            `${customFrameworkName || frameworkName}=${frameworkVersion}` : '';
        const rv = reporterVersion && reporterName ?
            `${customReporterName || reporterName}=${reporterVersion}` : '';
        const qcr = qaseCoreReporter ? `qase-core-reporter=${qaseCoreReporter}` : '';
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const xClientHeader = `${fv}; ${rv}; ${qcr}; qaseapi=${qaseapiVersion as string}`;

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
        if (existsSync(pathToFile)) {
            for (const file of readdirSync(pathToFile)) {
                QaseCoreReporter.logger(`File: ${pathToFile}/${file}`);
                const fullPath = `${pathToFile}/${file}`;

                if (lstatSync(fullPath).isDirectory()) {
                    QaseCoreReporter.getFiles(fullPath).forEach((x) => files.push(`${file}/${x}`));
                } else {
                    files.push(file);
                }
            }
        } else {
            QaseCoreReporter.logger(`Directory ${pathToFile} not found!`);
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

        QaseCoreReporter.logger(chalk`{yellow Starting QASE reporter}`);

        return this.checkProject(
            this.options.projectCode,
            async (prjExists): Promise<void> => {

                if (!prjExists) {
                    QaseCoreReporter.logger(
                        chalk`{red Project ${this.options.projectCode} does not exist}`
                    );
                    this.isDisabled = true;
                    return;
                }

                QaseCoreReporter.logger(chalk`{green Project ${this.options.projectCode} exists}`);
                const userDefinedRunId = QaseCoreReporter.getEnv(Envs.runId) || this.options.runId;
                if (userDefinedRunId) {
                    this.saveRunId(
                        userDefinedRunId
                    );
                    return this.checkRun(this.runId, (runExists: boolean) => {
                        if (runExists) {
                            QaseCoreReporter.logger(
                                chalk`{green Using run ${this.runId} to publish test results}`
                            );
                        } else {
                            QaseCoreReporter.logger(chalk`{red Run ${this.runId} does not exist}`);
                            this.isDisabled = true;
                        }
                    });
                } else {
                    return this.createRun(
                        this.options.runName,
                        this.options.runDescription,
                        (created) => {
                            if (created) {
                                this.runId = created.result?.id;
                                process.env.QASE_RUN_ID = String(this?.runId);
                                QaseCoreReporter.logger(
                                    chalk`{green Using run ${this.runId} to publish test results}`
                                );
                            } else {
                                QaseCoreReporter.logger(
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

        if (this.resultsForPublishing.length === 0) {
            this.isDisabled = true;
            QaseCoreReporter.logger(
                'No test cases were matched. Ensure that your tests are declared correctly.'
            );
            return;
        }

        const runUrl = `${this.host}/run/${this.options.projectCode}/dashboard/${this.runId as string}`;

        if (spawn) {
            const { qaseCoreReporterOptions } = this.options;
            const {
                screenshotFolder,
                videoFolder,
                uploadAttachments,
            } = qaseCoreReporterOptions as QaseCoreReporterOptions;
            const headers = QaseCoreReporter.createHeaders(
                qaseCoreReporterOptions as HeadersInput
            );
            const config = {
                apiToken: QaseCoreReporter.getEnv(Envs.apiToken) || this.options.apiToken || '',
                basePath: QaseCoreReporter.getEnv(Envs.basePath) || this.options.basePath,
                headers,
                code: this.options.projectCode,
                runId: Number(this.runId),
                runUrl,
                body: {
                    results: this.resultsForPublishing,
                },
                runComplete: QaseCoreReporter.getEnv(Envs.runComplete) || this.options.runComplete || false,
                qaseCoreReporterOptions,
            };

            const attachmentsConfig = {
                screenshotFolder: screenshotFolder || undefined,
                videoFolder: videoFolder || undefined,
                uploadAttachments: uploadAttachments || false,
                attachmentsMap: this.attachments,
            };

            spawnSync('node', [`${__dirname}/result-bulk-detached.js`], {
                stdio: 'inherit',
                env: Object.assign(process.env, {
                    QASE_LOGGING: process.env.QASE_LOGGING,
                    NODE_NO_WARNINGS: '1',
                    reporting_config: JSON.stringify(config),
                    attachments_config: JSON.stringify(attachmentsConfig) || {},
                }),
            });
            return;
        }

        if (this.options.qaseCoreReporterOptions?.uploadAttachments
            && Object.keys(this.attachments).length > 0) {
            QaseCoreReporter.logger(chalk`{yellow Uploading attachments to Qase}`);

            const attachmentKeys = Object.keys(this.attachments);

            const attachmentsToUpload = attachmentKeys.map(async (key) => {
                const attachment = this.attachments[key];
                const attachmentsHash = await this.uploadAttachments(attachment);
                return {
                    testCaseId: key,
                    attachmentsHash,
                };
            });

            const attachmentsToUploadResult = await Promise.all(attachmentsToUpload);
            this.resultsForPublishing = this.resultsForPublishing.map((result) => {
                const attachmentMapping = attachmentsToUploadResult
                    .find((data) => data.testCaseId === result.id);
                if (attachmentMapping) {
                    result.attachments = attachmentMapping.attachmentsHash;
                }
                return result;
            });
        }

        const body = {
            results: this.resultsForPublishing,
        };

        await this.api.results.createResultBulk(
            this.options.projectCode,
            Number(this.runId),
            body
        );

        QaseCoreReporter.logger(chalk`{green ${this.resultsForPublishing.length} result(s) sent to Qase}`);

        if (!this.options.runComplete) {
            return;
        }

        try {
            await this.api.runs.completeRun(this.options.projectCode, Number(this.runId));
            QaseCoreReporter.logger(chalk`{green Run ${this.runId} completed}`);
        } catch (err) {
            QaseCoreReporter.logger(`Error on completing run ${err as string}`);
        }

        QaseCoreReporter.logger(chalk`{blue Test run link: ${runUrl}}`);
    }

    public addTestResult(test: TestResult, status: ResultCreateStatusEnum, attachment?: any[]): void {
        this.transformTestToResultCreateObject(test, status, attachment);
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
            QaseCoreReporter.logger(map[test.status]);
        }
    }

    private addToAttachments(attachments: any[], id: string): void {
        this.attachments[id]
            = attachments as Array<{ path: string }>;
    }

    private transformTestToResultCreateObject(testResult: TestResult,
        // eslint-disable-next-line @typescript-eslint/indent
        status: ResultCreateStatusEnum,
        // eslint-disable-next-line @typescript-eslint/indent
        attachments?: any[]) {
        this.resultsForPublishingCount++;
        this.logTestItem(testResult);
        const caseIds = testResult.caseIds
            ? testResult.caseIds
            : QaseCoreReporter.getCaseIds(testResult.title);
        const parameterizedData = QaseCoreReporter.getParameterizedData(testResult.title);
        const frameworkName = this.options.qaseCoreReporterOptions
            && this.options.qaseCoreReporterOptions.frameworkName;

        const caseObject: ResultCreate & { id: string } = {
            id: testResult.id ? testResult.id : uuidv4(),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            status: Statuses[status] || Statuses.failed,
            time_ms: testResult.duration || 0,
            stacktrace: testResult.stacktrace
                ? testResult.stacktrace
                : testResult.error?.stack?.replace(/\u001b\[.*?m/g, ''),
            comment: testResult.error
                ? this.formatComment(testResult.title, testResult.error, parameterizedData)
                : parameterizedData
                    ? `::_using data set ${parameterizedData.id} ${parameterizedData.dataset}_`
                    : undefined,
            defect: Statuses[status] === Statuses.failed,
            param: parameterizedData
                ? { [frameworkName as string]: String(parameterizedData.id) }
                : undefined,
            attachments: testResult.attachments ? testResult.attachments : undefined,
        };

        if (attachments && attachments.length > 0 && !testResult.attachments) {
            this.addToAttachments(attachments, caseObject.id);
        }

        if (caseIds.length === 0) {
            const suitePath = testResult.suitePath || '';
            caseObject.case = {
                title: parameterizedData
                    ? QaseCoreReporter.removeQaseDataset(testResult.title)
                    : testResult.title,
                suite_title: this.options.rootSuiteTitle
                    ? `${this.options.rootSuiteTitle}${suitePath ? `\t${suitePath}` : ''}`
                    : suitePath,
            };

            this.resultsForPublishing.push(caseObject);
            QaseCoreReporter.logger(
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
            QaseCoreReporter.logger(err as string);
            this.isDisabled = true;
        }
    }

    private async checkRun(
        runId: string | number | undefined,
        cb: (exists: boolean) => void
    ): Promise<void> {

        return this.api.runs
            .getRun(this.options.projectCode, Number(runId))
            .then((resp) => {
                QaseCoreReporter.logger(
                    `Get run result on checking run ${resp.data.result?.id as unknown as string
                    }`
                );
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                QaseCoreReporter.logger(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: IdResponse | undefined) => void
    ): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion


            const runObject = QaseCoreReporter.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || `${QaseCoreReporter.reporterPrettyName} automated run`,
                    environment_id: this.options.environmentId,
                    is_autotest: true,
                }
            );

            const res = await this.api.runs.createRun(
                this.options.projectCode,
                runObject
            );
            cb(res.data);
        } catch (err) {
            QaseCoreReporter.logger(`Error on creating run ${err as string}`);
            this.isDisabled = true;
        }
    }

    private saveRunId(runId?: string | number) {
        this.runId = runId;
    }
}
