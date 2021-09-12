import { Reporter, Test, TestResult } from '@jest/reporters';
import { ResultCreate, ResultStatus, RunCreate, RunCreated } from 'qaseio/dist/src/models';
import { AssertionResult } from '@jest/types/build/TestResult';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
    runComplete = 'QASE_RUN_COMPLETE',
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
}

const alwaysUndefined = () => undefined;

class QaseReporter implements Reporter {
    private api: QaseApi;
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private publishedResultsCount = 0;

    public constructor(_: Record<string, unknown>, _options: QaseOptions ) {
        this.options = _options;
        this.options.runComplete = this.options.runComplete || !!this.getEnv(Envs.runComplete);
        this.api = new QaseApi(this.options.apiToken || this.getEnv(Envs.apiToken) || '');

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        if (!this.getEnv(Envs.report)) {
            this.log(chalk`{yellow QASE_REPORT env variable is not set. Reporting to qase.io is disabled.}`);
            this.isDisabled = true;
            return;
        }
    }

    public async onRunStart(): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        return this.checkProject(
            this.options.projectCode,
            async (prjExists): Promise<void> => {
                if (!prjExists) {
                    this.log(chalk`{red Project ${this.options.projectCode} does not exist}`);
                    this.isDisabled = true;
                    return;
                }

                this.log(chalk`{green Project ${this.options.projectCode} exists}`);
                const userDefinedRunId = this.getEnv(Envs.runId) || this.options.runId;
                if (userDefinedRunId) {
                    this.runId = userDefinedRunId;
                    return this.checkRun(
                        this.runId,
                        (runExists: boolean) => {
                            if (runExists) {
                                this.log(chalk`{green Using run ${this.runId} to publish test results}`);
                            } else {
                                this.log(chalk`{red Run ${this.runId} does not exist}`);
                                this.isDisabled = true;
                            }
                        }
                    );
                } else {
                    return this.createRun(
                        this.getEnv(Envs.runName),
                        this.getEnv(Envs.runDescription),
                        (created) => {
                            if (created) {
                                this.runId = created.id;
                                process.env.QASE_RUN_ID = this.runId.toString();
                                this.log(chalk`{green Using run ${this.runId} to publish test results}`);
                            } else {
                                this.log(chalk`{red Could not create run in project ${this.options.projectCode}}`);
                                this.isDisabled = true;
                            }
                        }
                    );
                }
            }
        );
    }

    public async onTestResult(_test: Test, testResult: TestResult): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        return Promise.all(
            testResult.testResults.map(
                (value): Promise<void> => this.publishCaseResult(value)
            )
        ).then(alwaysUndefined);
    }

    public async onRunComplete(): Promise<void> {
        if (this.isDisabled) {
            return;
        }

        if (this.publishedResultsCount === 0) {
            this.log('No testcases were matched. Ensure that your tests are declared correctly.');
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
        if (this.options.logging){
            // eslint-disable-next-line no-console
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private getEnv(name: Envs) {
        return process.env[name];
    }

    private getCaseIds(test: AssertionResult): number[] {
        const regexp = /(\(Qase ID: ([\d,]+)\))/;
        const results = regexp.exec(test.title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private logTestItem(test: AssertionResult) {
        const map = {
            failed: chalk`{red Test ${test.title} ${test.status}}`,
            passed: chalk`{green Test ${test.title} ${test.status}}`,
            skipped: chalk`{blueBright Test ${test.title} ${test.status}}`,
            pending: chalk`{blueBright Test ${test.title} ${test.status}}`,
            disabled: chalk`{gray Test ${test.title} ${test.status}}`,
        };
        if (test.status) {
            this.log(map[test.status]);
        }
    }

    private checkProject(projectCode: string, cb: (exists: boolean) => Promise<void>): Promise<void> {
        return this.api.projects.exists(projectCode)
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
            const res = await this.api.runs.create(
                this.options.projectCode,
                new RunCreate(
                    name || `Automated run ${new Date().toISOString()}`,
                    [],
                    {description: description || 'Jest automated run'}
                )
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

        return this.api.runs.exists(this.options.projectCode, runId)
            .then(cb)
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });

    }

    private async publishCaseResult(test: AssertionResult): Promise<void> {
        this.logTestItem(test);

        const caseIds = this.getCaseIds(test);
        if (caseIds.length === 0) {
            // TODO: autocreate case for result
            return;
        }
        return Promise.all(
            caseIds.map(
                async (caseId) => {
                    const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}`:'';
                    this.log(
                        chalk`{gray Start publishing: ${test.title}}${add}`
                    );
                    test.failureMessages = test.failureMessages.map((value) => value.replace(/\u001b\[.*?m/g, ''));
                    try {
                        const res = await this.api.results.create(
                            this.options.projectCode,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            this.runId!,
                            new ResultCreate(
                                caseId,
                                Statuses[test.status],
                                {
                                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                    time: test.duration!,
                                    stacktrace: test.failureMessages.join('\n'),
                                    comment: test.failureMessages.length > 0 ? test.failureMessages.map(
                                        (value) => value.split('\n')[0]
                                    ).join('\n'):undefined,
                                }
                            ));
                        this.publishedResultsCount++;
                        this.log(chalk`{gray Result published: ${test.title} ${res.data.hash}}${add}`);
                    } catch (err) {
                        this.log(err);
                    }
                }
            )
        ).then(alwaysUndefined);

    }
}

export = QaseReporter;
