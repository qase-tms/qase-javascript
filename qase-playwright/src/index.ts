/* eslint-disable max-len */
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import {
    ResultCreate,
    ResultStatus,
    RunCreate,
    RunCreated,
} from 'qaseio/dist/src/models';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';
import fs from 'fs';

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
    runComplete = 'QASE_RUN_COMPLETE',
    environmentId = 'QASE_ENVIRONMENT_ID',
    uploadAttachments = 'QASE_UPLOAD_ATTACHMENTS',
}

const Statuses = {
    passed: ResultStatus.PASSED,
    failed: ResultStatus.FAILED,
    skipped: ResultStatus.SKIPPED,
    pending: ResultStatus.SKIPPED,
    disabled: ResultStatus.BLOCKED,
};

interface QaseOptions {
    apiToken: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
    uploadAttachments?: boolean;
}

const alwaysUndefined = () => undefined;

class PlaywrightReporter implements Reporter {
    private api: QaseApi;
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private publishedResultsCount = 0;

    public constructor(_options: QaseOptions) {
        this.options = _options;
        this.options.runComplete = !!this.getEnv(Envs.runComplete) || this.options.runComplete;
        this.options.uploadAttachments = !!this.getEnv(Envs.uploadAttachments) || this.options.uploadAttachments;

        this.api = new QaseApi(
            this.getEnv(Envs.apiToken) || this.options.apiToken || ''
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        if (!this.getEnv(Envs.report)) {
            this.log(
                chalk`{yellow QASE_REPORT env variable is not set. Reporting to qase.io is disabled.}`
            );
            this.isDisabled = true;
            return;
        }
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
                const userDefinedRunId = this.getEnv(Envs.runId) || this.options.runId;
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
                        this.getEnv(Envs.runName),
                        this.getEnv(Envs.runDescription),
                        (created) => {
                            if (created) {
                                this.runId = created.id;
                                process.env.QASE_RUN_ID = this.runId.toString();
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await this.api.runs.complete(this.options.projectCode, this.runId!);
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

    private getEnv(name: Envs) {
        return process.env[name];
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

    private checkProject(
        projectCode: string,
        cb: (exists: boolean) => Promise<void>
    ): Promise<void> {

        return this.api.projects
            .exists(projectCode)
            .then(cb)
            .catch((err) => {
                this.log(err);
                this.isDisabled = true;
            });
    }

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: RunCreated | undefined) => void
    ): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const environmentId = Number.parseInt(this.getEnv(Envs.environmentId)!, 10) ||
            this.options.environmentId;

            const res = await this.api.runs.create(
                this.options.projectCode,
                new RunCreate(name || `Automated run ${new Date().toLocaleString()}`, [], {
                    description: description || 'Playwright automated run',
                    // eslint-disable-next-line camelcase
                    environment_id: environmentId,
                })
            );
            cb(res.data);
        } catch (err) {
            this.log(`Error on creating run ${err as string}`);
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
            .exists(this.options.projectCode, runId)
            .then(cb)
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private async uploadAttachments(testResult: TestResult): Promise<string[]> {
        return Promise.all(
            testResult.attachments.map(async (attachment) => {
                const data: Blob = (fs.createReadStream(attachment?.path as string) as unknown) as Blob;
                let fileExtention = '';
                if (/[\w-]+[.][\w]{3,4}$/.test(attachment?.path as string)) {
                    fileExtention = /[\w-]+[.][\w]{3,4}$/.exec(attachment?.path as string)![0];
                }
                const filename = fileExtention !== '' ? fileExtention : attachment.name;
                const resp = await this.api.attachments.create(
                    this.options.projectCode,
                    { value: data, filename }
                );
                // TODO: need fix response format for attachments.create method in qase.io package
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return (resp.data[0].hash as string);

            })
        );

    }


    private async publishCaseResult(test: TestCase, testResult: TestResult): Promise<void> {
        this.logTestItem(test, testResult);
        const caseIds = this.getCaseIds(test);
        if (caseIds.length === 0) {
            // TODO: autocreate case for result
            return;
        }
        let attachmentsArray: string[] = [];
        if (this.options.uploadAttachments && testResult.attachments.length > 0) {
            attachmentsArray = await this.uploadAttachments(testResult);
        }
        return Promise.all(
            caseIds.map(async (caseId) => {
                const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}` : '';
                this.log(chalk`{gray Start publishing: ${test.title}}${add}`);
                try {
                    while(!this.runId) { // need wait runId variable to be initialised in onBegin() hook
                        await new Promise((resolve) => setTimeout(resolve, 50));
                    }

                    const res = await this.api.results.create(
                        this.options.projectCode,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.runId,
                        new ResultCreate(caseId, Statuses[testResult.status], {
                        // eslint-disable-next-line camelcase, @typescript-eslint/no-non-null-assertion
                            time_ms: testResult.duration,
                            stacktrace: testResult.error?.stack?.replace(/\u001b\[.*?m/g, ''),
                            // eslint-disable-next-line max-len
                            comment: testResult.error ? `${test.title}: ${testResult.error?.message?.replace(/\u001b\[.*?m/g, '') as string}` : undefined,
                            attachments: attachmentsArray.length > 0 ? attachmentsArray : undefined,
                        })
                    );

                    this.publishedResultsCount++;
                    this.log(
                        chalk`{gray Result published: ${test.title} ${res.data.hash}}${add}`
                    );
                } catch (err) {
                    this.log(chalk`{red ${err}}`);
                }
            })
        ).then(alwaysUndefined);
    }
}

export default PlaywrightReporter;
