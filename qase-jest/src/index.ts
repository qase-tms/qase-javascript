/* eslint-disable camelcase */
import { IdResponse, ResultCreateStatusEnum, ResultCreateStepsStatusEnum } from '../../qaseio/src';
import { Reporter, Test, TestResult } from '@jest/reporters';
import { AssertionResult } from '@jest/types/build/TestResult';
import { QaseApi } from '../../qaseio/src/qaseio';
import chalk from 'chalk';

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    basePath = 'QASE_BASE_PATH',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
    runComplete = 'QASE_RUN_COMPLETE',
    environmentId = 'QASE_ENVIRONMENT_ID',
}

const Statuses = {
    passed: ResultCreateStatusEnum.PASSED,
    failed: ResultCreateStatusEnum.FAILED,
    skipped: ResultCreateStatusEnum.SKIPPED,
    pending: ResultCreateStatusEnum.SKIPPED,
    disabled: ResultCreateStatusEnum.BLOCKED,
};

class ResultStepCreate {
    public position: number;
    public status: ResultCreateStepsStatusEnum;
    public attachments: string[] | undefined;
    public comment?: string | undefined;
    public constructor(
        position: number, status: ResultCreateStepsStatusEnum, attachments?: string[], comment?: string | undefined) {
        this.position = position;
        this.status = status;
        this.attachments = attachments;
        this.comment = comment;
    }
}

class ResultCreate {
    public case_id: number;
    public status: ResultCreateStatusEnum;
    public time_ms?: number;
    public member_id?: number;
    public comment?: string;
    public stacktrace?: string;
    public defect?: boolean;
    public steps?: ResultStepCreate[];
    public attachments?: string[];
    public constructor(case_id: number, status: ResultCreateStatusEnum, args?: {
        time_ms?: number;
        member_id?: number;
        comment?: string;
        stacktrace?: string;
        defect?: boolean;
        steps?: ResultStepCreate[];
        attachments?: string[];
    }) {
        this.case_id = case_id;
        this.status = status;
        this.time_ms = args?.time_ms;
        this.member_id = args?.member_id;
        this.comment = args?.comment;
        this.stacktrace = args?.stacktrace;
        this.defect = args?.defect;
        this.steps = args?.steps;
        this.attachments = args?.attachments;
    }
}

interface QaseOptions {
    apiToken: string;
    basePath: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
}

const alwaysUndefined = () => undefined;

class QaseReporter implements Reporter {
    private api: QaseApi;
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private publishedResultsCount = 0;

    public constructor(_: Record<string, unknown>, _options: QaseOptions) {
        this.options = _options;
        this.options.runComplete = !!this.getEnv(Envs.runComplete) || this.options.runComplete;
        this.api = new QaseApi(
            this.getEnv(Envs.apiToken) || this.options.apiToken || '',
            this.getEnv(Envs.basePath) || this.options.basePath
        );

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
                                this.log(`Runid is ${this.runId as string}`);
                                this.runId = created.result?.id;
                                process.env.QASE_RUN_ID = this.runId!.toString();
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
            await this.api.runs.completeRun(this.options.projectCode, Number(this.runId)!);
            this.log(chalk`{green Run ${this.runId} completed}`);
        } catch (err) {
            this.log(`Error on completing run ${err as string}`);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public getLastError(): void { }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
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

    private async checkProject(projectCode: string, cb: (exists: boolean) => Promise<void>): Promise<void> {
        try {
            const resp = await this.api.projects.getProject(projectCode);

            await cb(Boolean(resp.data.result?.code));
        } catch (err) {
            this.log(err);
            this.isDisabled = true;
        }
    }

    private createRunObject(name: string, cases: number[], args?: {
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

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: IdResponse | undefined) => void
    ): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const environmentId = Number.parseInt(this.getEnv(Envs.environmentId)!, 10) || this.options.environmentId;
            this.log('Here we go');

            const runObject = this.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'Jest automated run',
                    environment_id: environmentId,
                    is_autotest: true,
                }
            );

            this.log(JSON.stringify(runObject));

            const res = await this.api.runs.createRun(
                this.options.projectCode,
                runObject
            );
            this.log(`Received data: ${JSON.stringify(res.data)}`);

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
                    const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}` : '';
                    this.log(
                        chalk`{gray Start publishing: ${test.title}}${add}`
                    );
                    test.failureMessages = test.failureMessages.map((value) => value.replace(/\u001b\[.*?m/g, ''));
                    try {
                        const res = await this.api.results.createResult(
                            this.options.projectCode,
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            this.runId!,
                            new ResultCreate(
                                caseId,
                                Statuses[test.status],
                                {
                                    // eslint-disable-next-line camelcase, @typescript-eslint/no-non-null-assertion
                                    time_ms: test.duration!,
                                    stacktrace: test.failureMessages.join('\n'),
                                    comment: test.failureMessages.length > 0 ? test.failureMessages.map(
                                        (value) => value.split('\n')[0]
                                    ).join('\n') : undefined,
                                }
                            ));
                        this.publishedResultsCount++;
                        this.log(
                            chalk`{gray Result published: ${test.title} ${JSON.stringify(res.data.result)}}${add}`);
                    } catch (err) {
                        this.log(err);
                    }
                }
            )
        ).then(alwaysUndefined);

    }
}

export = QaseReporter;
