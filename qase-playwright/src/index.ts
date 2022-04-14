/* eslint-disable max-len */
/* eslint-disable camelcase */
import {
    IdResponse,
    ResultCreateStatusEnum,
} from 'qaseio/dist/src';

import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { createReadStream, readFileSync } from 'fs';
import FormData from 'form-data';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';
import { execSync } from 'child_process';

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
    uploadAttachments = 'QASE_UPLOAD_ATTACHMENTS',
}

const Statuses = {
    passed: ResultCreateStatusEnum.PASSED,
    failed: ResultCreateStatusEnum.FAILED,
    skipped: ResultCreateStatusEnum.SKIPPED,
    pending: ResultCreateStatusEnum.SKIPPED,
    disabled: ResultCreateStatusEnum.BLOCKED,
};

interface QaseOptions {
    apiToken: string;
    basePath?: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
    uploadAttachments?: boolean;
}

const alwaysUndefined = () => undefined;

let customBoundary = '----------------------------';
for (let i = 0; i < 24; i++) {
    customBoundary += Math.floor(Math.random() * 10).toString(16);
}

class CustomBoundaryFormData extends FormData {
    public constructor() {
        super();
    }

    public getBoundary(): string {
        return customBoundary;
    }
}

class PlaywrightReporter implements Reporter {
    private api: QaseApi;
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private publishedResultsCount = 0;
    private resultsToBePublished: string[] = [];

    public constructor(_options: QaseOptions) {
        this.options = _options;
        this.options.runComplete = !!PlaywrightReporter.getEnv(Envs.runComplete) || this.options.runComplete;
        this.options.uploadAttachments = !!PlaywrightReporter.getEnv(Envs.uploadAttachments) || this.options.uploadAttachments;

        this.api = new QaseApi(
            PlaywrightReporter.getEnv(Envs.apiToken) || this.options.apiToken || '',
            PlaywrightReporter.getEnv(Envs.basePath) || this.options.basePath,
            PlaywrightReporter.createHeaders(),
            CustomBoundaryFormData
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        if (!PlaywrightReporter.getEnv(Envs.report)) {
            this.log(
                chalk`{yellow QASE_REPORT env variable is not set. Reporting to qase.io is disabled.}`
            );
            this.isDisabled = true;
            return;
        }
    }

    private static createRunObject(name: string, cases: number[], args?: {
        description?: string;
        environment_id: number | undefined;
        is_autotest: boolean;
    }) {
        return {
            title: name,
            cases,
            ...args,
        };
    }

    private static createResultObject(caseId: number, status: ResultCreateStatusEnum, args?: {
        time_ms: number;
        stacktrace: string | undefined;
        comment: string | undefined;
        attachments: string[] | undefined;
    }) {
        return {
            case_id: caseId,
            status,
            ...args,
        };
    }

    private static getEnv(name: Envs) {
        return process.env[name];
    }

    private static getPackageVersion(name: string) {
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

    private static createHeaders() {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseapiVersion = PlaywrightReporter.getPackageVersion('qaseio');
        const playwrightVersion = PlaywrightReporter.getPackageVersion('playwright-core');
        const playwrightCaseReporterVersion = PlaywrightReporter.getPackageVersion('playwright-qase-reporter');
        const xPlatformHeader = `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`;
        const xClientHeader = `playwright=${playwrightVersion as string}; qase-playwright=${playwrightCaseReporterVersion as string}; qaseapi=${qaseapiVersion as string}`;

        return {
            'X-Client': xClientHeader,
            'X-Platform': xPlatformHeader,
        };
    }

    public async onBegin(): Promise<void> {
        if (this.isDisabled) {
            return;
        }

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
                const userDefinedRunId = PlaywrightReporter.getEnv(Envs.runId) || this.options.runId;
                if (userDefinedRunId) {
                    this.runId = userDefinedRunId;
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
                        PlaywrightReporter.getEnv(Envs.runName),
                        PlaywrightReporter.getEnv(Envs.runDescription),
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

    public async onTestEnd(
        test: TestCase,
        testResult: TestResult
    ): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        return this.publishCaseResult(test, testResult).then(alwaysUndefined);
    }

    public async onEnd(): Promise<void> {
        if (this.isDisabled) {
            return;
        }
        while(this.resultsToBePublished.length > 0) { // need wait all results to be published
            this.log(chalk`{gray Waiting for all results to be published. Remaining ${this.resultsToBePublished.length} results}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (this.publishedResultsCount === 0) {
            this.log(
                'No testcases were matched. Ensure that your tests are declared correctly.'
            );
            return;
        }

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public getLastError(): void {}

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
            // eslint-disable-next-line no-console
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private getCaseIds(test: TestCase): number[] {
        const regexp = /(\(Qase ID: ([\d,]+)\))/;
        const results = regexp.exec(test.title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private logTestItem(test: TestCase, testResult: TestResult) {
        const map = {
            failed: chalk`{red Test ${test.title} ${testResult.status}}`,
            passed: chalk`{green Test ${test.title} ${testResult.status}}`,
            skipped: chalk`{blueBright Test ${test.title} ${testResult.status}}`,
            pending: chalk`{blueBright Test ${test.title} ${testResult.status}}`,
            disabled: chalk`{gray Test ${test.title} ${testResult.status}}`,
        };
        if (testResult.status) {
            this.log(map[testResult.status]);
        }
    }

    private async checkProject(projectCode: string, cb: (exists: boolean) => Promise<void>): Promise<void> {
        try {
            const response = await this.api.projects.getProject(projectCode);
            await cb(Boolean(response.data.result?.code));
        } catch (err) {
            this.log(err);
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
            const environmentId = Number.parseInt(PlaywrightReporter.getEnv(Envs.environmentId)!, 10) || this.options.environmentId;

            const runObject = PlaywrightReporter.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'Playwright automated run',
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

    private async checkRun(runId: string | number | undefined, cb: (exists: boolean) => void): Promise<void> {
        if (runId === undefined) {
            cb(false);
            return;
        }

        return this.api.runs.getRun(this.options.projectCode, Number(runId))
            .then((resp) => {
                this.log(`Get run result on checking run ${resp.data.result?.id as unknown as string}`);
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private async uploadAttachments(testResult: TestResult) {
        return await Promise.all(
            testResult.attachments.map(async (attachment) => {
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

    private removePublished(testAlias): void {
        const resultIndex = this.resultsToBePublished.indexOf(testAlias);
        if (resultIndex !== -1) {
            this.resultsToBePublished.splice(resultIndex, 1);
        }
    }

    private async publishCaseResult(test: TestCase, testResult: TestResult): Promise<void> {
        this.logTestItem(test, testResult);
        const caseIds = this.getCaseIds(test);
        if (caseIds.length === 0) {
            // TODO: autocreate case for result
            return;
        }
        return Promise.all(
            caseIds.map(async (caseId) => {
                const testAlias = `${caseId} - ${test.title}`;
                this.resultsToBePublished.push(testAlias);
                const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}` : '';
                this.log(chalk`{gray Start publishing: ${test.title}}${add}`);
                while(!this.runId) { // need wait runId variable to be initialised in onBegin() hook
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }

                let attachmentsArray: any[] = [];
                if (this.options.uploadAttachments && testResult.attachments.length > 0) {
                    attachmentsArray = await this.uploadAttachments(testResult);
                }

                const resultObject = PlaywrightReporter.createResultObject(
                    caseId,
                    Statuses[testResult.status],
                    {
                        time_ms: testResult.duration,
                        stacktrace: testResult.error?.stack?.replace(/\u001b\[.*?m/g, ''),
                        // eslint-disable-next-line max-len
                        comment: testResult.error ? `${test.title}: ${testResult.error?.message?.replace(/\u001b\[.*?m/g, '') as string}` : undefined,
                        attachments: attachmentsArray.length > 0
                            ? attachmentsArray
                            : undefined,
                    }
                );

                this.api.results.createResult(
                    this.options.projectCode,
                    Number(this.runId),
                    resultObject
                ).then(() => {
                    this.removePublished(testAlias);
                    this.publishedResultsCount++;
                    this.log(
                        chalk`{gray Result published: ${test.title} }${add}`
                    );
                }).catch((err) => {
                    this.removePublished(testAlias);
                    this.log(chalk`{red ${err}}`);
                });
            })
        ).then(alwaysUndefined);
    }
}

export default PlaywrightReporter;
