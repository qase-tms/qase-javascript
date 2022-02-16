/* eslint-disable no-console */
import { MochaOptions, Runner, Test, reporters } from 'mocha';
import { ResultCreate, ResultCreated, ResultStatus, RunCreate, RunCreated } from 'qaseio/dist/src/models';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';


// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const {
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_TEST_PENDING,
    EVENT_RUN_END,
} = Runner.constants;

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
}

interface QaseOptions {
    apiToken: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
}

class CypressQaseReporter extends reporters.Base {
    private api: QaseApi;
    private pending: Array<(runId: string | number) => void> = [];
    private results: Array<{test: Test; result: ResultCreated}> = [];
    private shouldPublish = 0;
    private options: QaseOptions;
    private runId?: number | string;

    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        this.options = options.reporterOptions as QaseOptions;
        this.api = new QaseApi(this.options.apiToken || this.getEnv(Envs.apiToken) || '');

        if (!this.getEnv(Envs.report)) {
            return;
        }

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        this.addRunnerListeners(runner);

        this.checkProject(
            this.options.projectCode,
            (prjExists) => {
                if (prjExists) {
                    this.log(chalk`{green Project ${this.options.projectCode} exists}`);
                    if (this.getEnv(Envs.runId) || this.options.runId) {
                        this.saveRunId(this.getEnv(Envs.runId) || this.options.runId);
                        this.checkRun(
                            this.runId,
                            (runExists: boolean) => {
                                const run = this.runId as unknown as string;
                                if (runExists) {
                                    this.log(chalk`{green Using run ${run} to publish test results}`);
                                } else {
                                    this.log(chalk`{red Run ${run} does not exist}`);
                                }
                            }
                        );
                    } else if (!this.runId) {
                        this.createRun(
                            this.getEnv(Envs.runName),
                            this.getEnv(Envs.runDescription),
                            (created) => {
                                if (created) {
                                    this.saveRunId(created.id);
                                    process.env.QASE_RUN_ID = created.id.toString();
                                    this.log(chalk`{green Using run ${this.runId} to publish test results}`);
                                } else {
                                    this.log(chalk`{red Could not create run in project ${this.options.projectCode}}`);
                                }
                            }
                        );
                    }
                } else {
                    this.log(chalk`{red Project ${this.options.projectCode} does not exist}`);
                }
            }
        );
    }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging){
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private addRunnerListeners(runner: Runner) {
        runner.on(EVENT_TEST_PASS, (test: Test) => {
            this.publishCaseResult(test, ResultStatus.PASSED);
        });

        runner.on(EVENT_TEST_PENDING, (test: Test) => {
            this.publishCaseResult(test, ResultStatus.SKIPPED);
        });

        runner.on(EVENT_TEST_FAIL, (test: Test) => {
            this.publishCaseResult(test, ResultStatus.FAILED);
        });

        runner.on(EVENT_RUN_END, () => {
            if (this.results.length === 0 && this.shouldPublish === 0) {
                this.log('No testcases were matched. Ensure that your tests are declared correctly.');
            }
            if (this.runId && this.shouldPublish !== 0) {
                this.log(
                    chalk`{blue Waiting for 30 seconds to publish pending results}`
                );
                const endTime = Date.now() + 60e3;
                while ((this.shouldPublish !== 0) && (Date.now() < endTime)) {
                    // sleep 500 ms
                    const sharedArrayBuffer = new SharedArrayBuffer(8);
                    const int32array = new Int32Array(sharedArrayBuffer);
                    Atomics.wait(int32array, 0, 0, 500);
                }
                if (this.runId && this.shouldPublish !== 0) {
                    this.log(
                        chalk`{red Could not send all results for 30 seconds after run. Please contact Qase Team.}`
                    );
                }
            }
        });
    }

    private checkProject(projectCode: string, cb: (exists: boolean) => void) {
        this.api.projects.exists(projectCode)
            .then(cb)
            .catch((err) => {
                this.log(err);
            });
    }

    private createRun(
        name: string | undefined, description: string | undefined, cb: (created: RunCreated | undefined) => void
    ) {
        this.api.runs.create(
            this.options.projectCode,
            new RunCreate(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                // eslint-disable-next-line camelcase
                {description: description || 'Cypress automated run', is_autotest: true }
            )
        )
            .then((res) => res.data)
            .then(cb)
            .catch((err) => {
                this.log(`Error on creating run ${err as string}`);
            });
    }

    private checkRun(runId: string | number | undefined, cb: (exists: boolean) => void) {
        if (runId !== undefined) {
            this.api.runs.exists(this.options.projectCode, runId)
                .then(cb)
                .catch((err) => {
                    this.log(`Error on checking run ${err as string}`);
                });
        } else {
            cb(false);
        }
    }

    private getEnv(name: Envs) {
        return process.env[name];
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

    private getCaseId(test: Test): number[] {
        const regexp = /(\(Qase ID: ([\d,]+)\))/;
        const results = regexp.exec(test.title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private logTestItem(test: Test) {
        const map = {
            failed: chalk`{red Test ${test.title} ${test.state}}`,
            passed: chalk`{green Test ${test.title} ${test.state}}`,
            pending: chalk`{blueBright Test ${test.title} ${test.state}}`,
        };
        if (test.state) {
            this.log(map[test.state]);
        }
    }

    private publishCaseResult(test: Test, status: ResultStatus){
        this.logTestItem(test);

        const caseIds = this.getCaseId(test);
        caseIds.forEach((caseId) => {
            this.shouldPublish++;
            const publishTest = (runId: string | number) => {
                if (caseId) {
                    const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}`:'';
                    this.log(
                        chalk`{gray Start publishing: ${test.title}}${add}`
                    );
                    this.api.results.create(this.options.projectCode, runId, new ResultCreate(
                        caseId,
                        status,
                        {
                            // eslint-disable-next-line camelcase
                            time_ms: test.duration,
                            stacktrace: test.err?.stack,
                            comment: test.err ? `${test.err.name}: ${test.err.message}`:undefined,
                        }
                    ))
                        .then((res) => {
                            this.results.push({test, result: res.data});
                            this.log(chalk`{gray Result published: ${test.title} ${res.data.hash}}${add}`);
                            this.shouldPublish--;
                        })
                        .catch((err) => {
                            this.log(err);
                            this.shouldPublish--;
                        });
                }
            };

            if (this.runId) {
                publishTest(this.runId);
            } else {
                this.pending.push(publishTest);
            }
        });
    }
}

export = CypressQaseReporter;
