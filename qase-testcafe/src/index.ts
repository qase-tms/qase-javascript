/* eslint-disable no-console,@typescript-eslint/require-await */
import {ResultCreate, ResultCreated, ResultStatus, RunCreate, RunCreated} from 'qaseio/dist/src/models';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import RuntimeError = WebAssembly.RuntimeError;

interface Config {
    enabled: boolean;
    apiToken: string;
    projectCode: string;
    runId: string | number | undefined;
    runName: string;
    runDescription?: string;
    logging: boolean;
}

interface Meta {
    [key: string]: string;
}

interface TaskResult {
    passedCount: number;
    failedCount: number;
    skippedCount: number;
}

interface Screenshot {
    screenshotPath: string;
    thumbnailPath: string;
    userAgent: string;
    quarantineAttempt: number;
    takenOnFail: boolean;
}

interface TestRunInfo {
    errs: Array<Record<string, unknown>>;
    warnings: string[];
    durationMs: number;
    unstable: boolean;
    screenshotPath: string;
    screenshots: Screenshot[];
    quarantine: { [key: string]: { passed: boolean } };
    skipped: boolean;
}

interface Test {
    name: string;
    meta: Meta;
    info: TestRunInfo;
    error: string;
}

const loadJSON = (file: string): Config | undefined => {
    try {
        const data = fs.readFileSync(file, { encoding: 'utf8' });

        if (data) {
            return JSON.parse(data) as Config;
        }
    } catch (error) {
        // Ignore error when file does not exist or it's malformed
    }

    return undefined;
};

const prepareConfig = (options: Config = {} as Config): Config => {
    const loaded = loadJSON(path.join(process.cwd(), '.qaserc'));
    if (!loaded) {
        throw new RuntimeError();
    }
    const config: Config = Object.assign(
        loaded,
        options
    );

    return {
        enabled: process.env.QASE_ENABLED === 'true' || config.enabled || false,
        apiToken: process.env.QASE_API_TOKEN || config.apiToken,
        projectCode: process.env.QASE_PROJECT || config.projectCode || ''
        ,
        runId: process.env.QASE_RUN_ID || config.runId || '',
        runName:
            process.env.QASE_RUN_NAME ||
            config.runName ||
            'Automated Run %DATE%',
        runDescription:
            process.env.QASE_RUN_DESCRIPTION || config.runDescription,
        logging: process.env.QASE_LOGGING !== '' || config.logging,
    };
};

const prepareReportName = (
    config: Config,
    userAgents: string[]
) => {
    const date = moment().format();
    return config.runName
        .replace('%DATE%', date)
        .replace('%AGENTS%', `(${userAgents.join(', ')})`);
};

const verifyConfig = (config: Config) => {
    const { enabled, apiToken, projectCode } = config;
    if (enabled) {
        if (!projectCode) {
            console.log('[Qase] Project Code should be provided');
        }
        if (apiToken && projectCode) {
            return true;
        }
    }

    return false;
};

class TestcafeQaseReporter {
    private formatError: unknown;

    private config: Config;
    private api: QaseApi;
    private enabled: boolean;

    private userAgents!: string[];
    private pending: Array<(runId: string | number) => void> = [];
    private results: Array<{test: Test; result: ResultCreated}>;
    private screenshots: {
        [key: string]: Screenshot[];
    };

    public constructor() {
        this.config = prepareConfig();
        this.enabled = verifyConfig(this.config);
        this.api = new QaseApi(this.config.apiToken);

        this.results = [];
        this.screenshots = {};
    }

    public reportTaskStart = async (_startTime: number, userAgents: string[]) => {
        if (!this.enabled) {
            return;
        }
        this.userAgents = userAgents;
        this.config.runName = prepareReportName(this.config, this.userAgents);

        this.checkProject(
            this.config.projectCode,
            (prjExists) => {
                if (prjExists) {
                    this.log(chalk`{green Project ${this.config.projectCode} exists}`);
                    if (this.config.runId) {
                        this.saveRunId(this.config.runId);
                        this.checkRun(
                            this.config.runId,
                            (runExists: boolean) => {
                                const run = this.config.runId as unknown as string;
                                if (runExists) {
                                    this.log(chalk`{green Using run ${run} to publish test results}`);
                                } else {
                                    this.log(chalk`{red Run ${run} does not exist}`);
                                }
                            }
                        );
                    } else if (!this.config.runId) {
                        this.createRun(
                            this.config.runName,
                            this.config.runDescription,
                            (created) => {
                                if (created) {
                                    this.saveRunId(created.id);
                                    this.log(chalk`{green Using run ${this.config.runId} to publish test results}`);
                                } else {
                                    this.log(chalk`{red Could not create run in project ${this.config.projectCode}}`);
                                }
                            }
                        );
                    }
                } else {
                    this.log(chalk`{red Project ${this.config.projectCode} does not exist}`);
                }
            }
        );
    };

    public reportTestDone = async (
        name: string,
        testRunInfo: TestRunInfo,
        meta: Meta,
        formatError: (x: Record<string, unknown>) => string
    ) => {
        if (!this.enabled) {
            return;
        }
        if (meta.CID) {
            const hasErr = testRunInfo.errs.length;
            let testStatus: ResultStatus;

            if (testRunInfo.skipped) {
                testStatus = ResultStatus.BLOCKED;
            } else if (hasErr > 0) {
                testStatus = ResultStatus.FAILED;
            } else {
                testStatus = ResultStatus.PASSED;
            }

            const errorLog = testRunInfo.errs
                .map((x: Record<string, unknown>) => formatError(x).replace(
                    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                    ''
                ))
                .join('\n');
            this.publishCaseResult({name, info: testRunInfo, meta, error: errorLog}, testStatus);
        }
    };

    public reportTaskDone = async () => {
        if (!this.enabled) {
            return;
        }
        const check = () => {
            setTimeout(() => {
                if (this.pending) {
                    check();
                } else {
                    if (this.results.length === 0) {
                        console.warn(
                            `\n(Qase Reporter)
                                \nNo testcases were matched.
                                Ensure that your tests are declared correctly.\n`
                        );
                    }
                }
            }, 1000);
        };
    };

    private log(message?: any, ...optionalParams: any[]) {
        if (this.config.logging){
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
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
            this.config.projectCode,
            new RunCreate(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                // eslint-disable-next-line camelcase
                {description: description || 'Cypress automated run', is_autotest: true}
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
            this.api.runs.exists(this.config.projectCode, runId)
                .then(cb)
                .catch((err) => {
                    this.log(`Error on checking run ${err as string}`);
                });
        } else {
            cb(false);
        }
    }

    private saveRunId(runId?: string | number) {
        this.config.runId = runId;
        if (this.config.runId) {
            while (this.pending.length) {
                this.log(`Number of pending: ${this.pending.length}`);
                const cb = this.pending.shift();
                if (cb) {
                    cb(this.config.runId);
                }
            }
        }
    }

    private getCaseId(meta: Meta): string[] {
        if (!meta.CID) {
            return [];
        }
        return meta.CID as unknown as string[];
    }

    private logTestItem(name: string, status: ResultStatus) {
        const map = {
            failed: chalk`{red Test ${name} ${status}}`,
            passed: chalk`{green Test ${name} ${status}}`,
            pending: chalk`{blueBright Test ${name} ${status}}`,
        };
        if (status) {
            this.log(map[status]);
        }
    }

    private publishCaseResult(test: Test, status: ResultStatus){
        this.logTestItem(test.name, status);

        const caseIds = this.getCaseId(test.meta);
        caseIds.forEach((caseId) => {
            const publishTest = (runId: string | number) => {
                if (caseId) {
                    const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}`:'';
                    this.log(
                        chalk`{gray Start publishing: ${test.name}}${add}`
                    );
                    this.api.results.create(this.config.projectCode, runId, new ResultCreate(
                        parseInt(caseId, 10),
                        status,
                        {
                            // eslint-disable-next-line camelcase
                            time_ms: test.info.durationMs,
                            stacktrace: test.error,
                            comment: test.error ? test.error.split('\n')[0]:undefined,
                        }
                    ))
                        .then((res) => {
                            this.results.push({test, result: res.data});
                            this.log(chalk`{gray Result published: ${test.name} ${res.data.hash}}${add}`);
                        })
                        .catch((err) => {
                            this.log(err);
                        });
                }
            };

            if (this.config.runId) {
                publishTest(this.config.runId);
            } else {
                this.pending.push(publishTest);
            }
        });
    }
}

/// This weird setup is required due to TestCafe prototype injection method.
export = () => {
    const reporter = new TestcafeQaseReporter();
    return {
        reportTaskStart: reporter.reportTaskStart,
        reportFixtureStart: () => { /* Not Implemented */ },
        async reportTestDone(
            name: string,
            testRunInfo: TestRunInfo,
            meta: Meta
        ): Promise<void> {
            return reporter.reportTestDone(
                name,
                testRunInfo,
                meta,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error Inject testrail error formatting method with bound context
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                this.formatError.bind(this)
            );
        },
        reportTaskDone: reporter.reportTaskDone,
        reporter,
    };
};
