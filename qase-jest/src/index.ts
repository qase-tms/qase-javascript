/* eslint-disable camelcase */
import { AssertionResult, Status } from '@jest/test-result';
import {
    IdResponse,
    ResultCreate,
    ResultCreateStatusEnum,
} from 'qaseio/dist/src';
import { Reporter, Test, TestResult } from '@jest/reporters';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';

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
    rootSuite = 'QASE_ROOT_SUITE_TITLE'
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
    basePath: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
}

interface PreparedForReportingTestCase {
    path: string;
    result: Status;
    duration: number | null | undefined;
    status: Status;
    title: string;
    failureMessages: string[];
    caseIds?: number[];
}

const alwaysUndefined = () => undefined;

class QaseReporter implements Reporter {
    private api: QaseApi;
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private publishedResultsCount = 0;
    private preparedTestCases: PreparedForReportingTestCase[];

    public constructor(_: Record<string, unknown>, _options: QaseOptions) {
        this.options = _options;
        this.options.projectCode = _options.projectCode || this.getEnv(Envs.projectCode) || '';
        this.options.runComplete = !!this.getEnv(Envs.runComplete) || this.options.runComplete;
        this.api = new QaseApi(
            this.getEnv(Envs.apiToken) || this.options.apiToken || '',
            this.getEnv(Envs.basePath) || this.options.basePath
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);
        this.preparedTestCases = [];

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
        this.preparedTestCases = this.createPreparedForPublishTestsArray(testResult.testResults);

        await this.publishBulkTestResult().then(alwaysUndefined);
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
            await this.api.runs.completeRun(this.options.projectCode, Number(this.runId));
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

    private createPreparedForPublishTestsArray(testResults: AssertionResult[]) {
        const transformedMap = testResults.map((result) => {
            this.logTestItem(result);
            const item: PreparedForReportingTestCase = {
                path: result.ancestorTitles.join('\t'),
                result: result.status,
                duration: result.duration,
                status: result.status,
                title: result.title,
                failureMessages: result.failureMessages,
            };

            const caseIds = this.getCaseIds(result);

            if (caseIds) {
                item.caseIds = caseIds;
            }

            return item;
        });

        return transformedMap;
    }

    private async publishBulkTestResult() {
        try {
            const body = {
                results: this.createResultCasesArray(),
            };

            const res = await this.api.results.createResultBulk(
                this.options.projectCode,
                Number(this.runId),
                body
            );

            if (res.status === 200) {
                this.publishedResultsCount++;
            }
        } catch (error) {
            this.log(JSON.stringify(error));
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

            const runObject = this.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'Jest automated run',
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

    private createResultCasesArray() {
        return this.preparedTestCases.map((elem) => {
            const failureMessages = elem.failureMessages.map((value) =>
                value.replace(/\u001b\[.*?m/g, ''));
            const caseObject: ResultCreate = {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                status: Statuses[elem.status] || Statuses.failed,
                time_ms: Number(elem.duration),
                stacktrace: failureMessages.join('\n'),
                comment: failureMessages.length > 0 ? failureMessages.map(
                    (value) => value.split('\n')[0]).join('\n') : undefined,
            };

            // Checks that user defined case ID with 'qase' wrapper;
            if (elem.caseIds && elem.caseIds?.length > 0) {
                caseObject.case_id = elem.caseIds[0];
            } else {
                caseObject.case = {
                    title: elem.title,
                    suite_title: elem.path,
                };
            }

            return caseObject;
        });
    }
}

export = QaseReporter;
