/* eslint-disable no-console */
import { MochaOptions, Runner, Test, reporters } from 'mocha';
import { ResultCreate, ResultCreated, ResultStatus } from 'qaseio/dist/src/models';
import { QaseApi } from 'qaseio';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const {
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_TEST_PENDING,
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
} = Runner.constants;

enum Envs {
    report = 'QASE_REPORT',
    runId = 'QASE_RUN_ID',
}

interface QaseOptions {
    apiToken: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
}

class CypressQaseReporter extends reporters.Base {
    private api: QaseApi;
    private pending: Array<(runId: string | number) => void> = [];
    private results: Array<{test: Test; result: ResultCreated}> = [];
    private options: QaseOptions;
    private runId?: number | string;

    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        this.options = options.reporterOptions as QaseOptions;
        this.api = new QaseApi(this.options.apiToken);

        if (!this.getEnv(Envs.report)) {
            return;
        }

        runner.on(EVENT_RUN_BEGIN, () => {
            if (this.getEnv(Envs.runId)) {
                this.saveRunId(this.getEnv(Envs.runId));
            }
            if (!this.runId) {
                this.saveRunId(this.options.runId);
            }
        });

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
            if (this.results.length === 0) {
                console.warn(
                    `\n(Qase Reporter)
                    \nNo testcases were matched.
                    Ensure that your tests are declared correctly.\n`
                );
            }
        });
    }

    private getEnv(name: Envs) {
        return process.env[name];
    }

    private saveRunId(runId?: string | number) {
        this.runId = runId;
        if (this.runId) {
            this.pending.map((fn) => {
                if (this.runId) {
                    fn(this.runId);
                }
            });
        }
    }

    private getCaseId(test: Test): number | undefined {
        const regexp = /(\(Qase ID: (\d+)\))/;
        const results = regexp.exec(test.title);
        if (results && results.length === 3) {
            return Number.parseInt(results[2], 10);
        }
    }

    private logTestItem(test: Test) {
        console.log('Test %s %s', test.title, test.state);
    }

    private publishCaseResult(test: Test, status: ResultStatus){
        this.logTestItem(test);

        const caseId = this.getCaseId(test);
        const publishTest = (runId: string | number) => {
            if (caseId) {
                this.api.results.create(this.options.projectCode, runId, new ResultCreate(
                    caseId,
                    status,
                    {
                        time: test.duration,
                        stacktrace: test.err?.stack,
                        comment: test.err ? `${test.err.name}: ${test.err.message}`:undefined,
                    }
                ))
                    .then((res) => {
                        this.results.push({test, result: res.data});
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        };
        if (this.runId) {
            publishTest(this.runId);
        } else {
            this.pending.push(publishTest);
        }
    }
}

export = CypressQaseReporter;
