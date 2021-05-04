/* eslint-disable no-console,no-underscore-dangle,@typescript-eslint/no-non-null-assertion */
import {ResultCreate, ResultCreated, ResultStatus, RunCreate, RunCreated} from 'qaseio/dist/src/models';
import {Formatter} from '@cucumber/cucumber';
import {IFormatterOptions} from '@cucumber/cucumber/lib/formatter';
import {QaseApi} from 'qaseio';
import chalk from 'chalk';
import fs from 'fs';
import {io} from '@cucumber/messages/dist/src/messages';
import moment from 'moment';
import path from 'path';
import IEnvelope = io.cucumber.messages.IEnvelope;
import ITestCaseFinished = io.cucumber.messages.ITestCaseFinished;
import ITestCaseStarted = io.cucumber.messages.ITestCaseStarted;
import Status = io.cucumber.messages.TestStepFinished.TestStepResult.Status;

interface Config {
    enabled: boolean;
    apiToken: string;
    projectCode: string;
    runId: string | number | undefined;
    runName: string;
    runDescription?: string;
    logging: boolean;
}

interface Test {
    name: string;
    started: ITestCaseStarted;
    finished: ITestCaseFinished;
    duration: number;
    tags: string[];
    error?: string;
}

const StatusMapping: Record<Status, ResultStatus | null> = {
    [Status.PASSED]: ResultStatus.PASSED,
    [Status.FAILED]: ResultStatus.FAILED,
    [Status.SKIPPED]: ResultStatus.SKIPPED,
    [Status.AMBIGUOUS]: null,
    [Status.PENDING]: null,
    [Status.UNDEFINED]: null,
    [Status.UNKNOWN]: null,
};

const loadJSON = (file: string): Config | undefined => {
    try {
        const data = fs.readFileSync(file, {encoding: 'utf8'});

        if (data) {
            return JSON.parse(data) as Config;
        }
    } catch (error) {
        // Ignore error when file does not exist or it's malformed
    }

    return undefined;
};

const prepareConfig = (options: Config = {} as Config, configFile = '.qaserc'): Config => {
    const loaded = loadJSON(path.join(process.cwd(), configFile || '.qaserc'));
    if (!loaded) {
        // eslint-disable-next-line no-throw-literal
        console.log(chalk`{bold {blue qase:}} {red Missing .qaserc file}`);
    }
    const config: Config = Object.assign(
        loaded || {},
        options,
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
) => {
    const date = moment().format();
    return config.runName
        .replace('%DATE%', date);
};

const verifyConfig = (config: Config) => {
    const {enabled, apiToken, projectCode} = config;
    if (enabled) {
        if (!projectCode) {
            console.log(chalk`{bold {blue qase:}} {red Project Code should be provided}`);
        }
        if (apiToken && projectCode) {
            return true;
        }
    }

    return false;
};

class QaseReporter extends Formatter {
    private config: Config;
    private api: QaseApi;
    private enabled: boolean;

    private pickleInfo: Record<string, { tags: string[]; name: string }> = {};
    private testCaseStarts: Record<string, ITestCaseStarted> = {};
    private testCaseStartedResult: Record<string, ResultStatus> = {};
    private testCaseStartedErrors: Record<string, string[]> = {};
    private testCaseScenarioId: Record<string, string> = {};
    private pending: Array<(runId: string | number) => void> = [];
    private results: Array<{test: Test; result: ResultCreated}> = [];
    private shouldPublish = 0;

    public constructor(options: IFormatterOptions) {
        super(options);
        this.config = prepareConfig(options.parsedArgvOptions as Config, options.parsedArgvOptions?.qaseConfig);
        this.enabled = verifyConfig(this.config);
        this.api = new QaseApi(this.config.apiToken);

        if (!this.enabled) {
            return;
        }

        this.config.runName = prepareReportName(this.config);

        options.eventBroadcaster
            .on('envelope', (envelope: IEnvelope) => {
                if (envelope.pickle) {
                    this.pickleInfo[envelope.pickle.id!] = {
                        tags: this.extractIds(envelope.pickle.tags!), name: envelope.pickle.name!,
                    };
                } else if (envelope.testRunStarted) {
                    this.checkProject(
                        this.config.projectCode,
                        (prjExists) => {
                            if (prjExists) {
                                this._log(chalk`{green Project ${this.config.projectCode} exists}`);
                                const willRun = Object.keys(this.pickleInfo).length !== 0;
                                if (this.config.runId && willRun) {
                                    this.saveRunId(this.config.runId);
                                    this.checkRun(
                                        this.config.runId,
                                        (runExists: boolean) => {
                                            const run = this.config.runId as unknown as string;
                                            if (runExists) {
                                                this._log(chalk`{green Using run ${run} to publish test results}`);
                                            } else {
                                                this._log(chalk`{red Run ${run} does not exist}`);
                                            }
                                        }
                                    );
                                } else if (!this.config.runId && willRun) {
                                    this.createRun(
                                        this.config.runName,
                                        this.config.runDescription,
                                        (created) => {
                                            if (created) {
                                                this.saveRunId(created.id);
                                                this._log(
                                                    // eslint-disable-next-line max-len
                                                    chalk`{green Using run ${this.config.runId} to publish test results}`
                                                );
                                            } else {
                                                this._log(
                                                    // eslint-disable-next-line max-len
                                                    chalk`{red Could not create run in project ${this.config.projectCode}}`
                                                );
                                            }
                                        }
                                    );
                                } else if (!willRun) {
                                    this._log(chalk`{red No cases would be executed}`);
                                }
                            } else {
                                this._log(chalk`{red Project ${this.config.projectCode} does not exist}`);
                            }
                        }
                    );
                } else if (envelope.testRunFinished) {
                    if (this.results.length === 0 && this.shouldPublish === 0) {
                        this._log('No testcases were matched. Ensure that your tests are declared correctly.');
                    }
                    if (envelope.testRunFinished.success) {
                        this._log('Finished success');
                    } else {
                        this._log('Finished with errors');
                    }
                } else if (envelope.testCase) {
                    this.testCaseScenarioId[envelope.testCase.id!] = envelope.testCase.pickleId!;
                } else if (envelope.testCaseStarted) {
                    this.testCaseStarts[envelope.testCaseStarted.id!] = envelope.testCaseStarted;
                } else if (envelope.testStepFinished) {
                    const stepFin = envelope.testStepFinished;
                    const oldStatus = this.testCaseStartedResult[stepFin.testCaseStartedId!];
                    const newStatus = StatusMapping[stepFin.testStepResult!.status!];
                    if (newStatus !== ResultStatus.PASSED) {
                        this.addErrorMessage(stepFin.testCaseStartedId!, stepFin.testStepResult?.message);
                        if (oldStatus) {
                            if (oldStatus !== ResultStatus.FAILED && newStatus) {
                                this.testCaseStartedResult[stepFin.testCaseStartedId!] = newStatus;
                            }
                        } else {
                            if (newStatus) {
                                this.testCaseStartedResult[stepFin.testCaseStartedId!] = newStatus;
                            }
                        }
                    }
                } else if (envelope.testCaseFinished) {
                    const tcs = this.testCaseStarts[envelope.testCaseFinished.testCaseStartedId!];
                    const pickleId = this.testCaseScenarioId[tcs.testCaseId!];
                    const info = this.pickleInfo[pickleId];
                    const status = this.testCaseStartedResult[envelope.testCaseFinished.testCaseStartedId!];
                    const test: Test = {
                        name: info.name,
                        started: tcs,
                        finished: envelope.testCaseFinished,
                        tags: info.tags,
                        duration: Math.abs((envelope.testCaseFinished.timestamp!.seconds! - tcs.timestamp!.seconds!)),
                        error: this.testCaseStartedErrors[tcs.id!]?.join('\n\n'),
                    };
                    this.publishCaseResult(test, status);
                } else if (envelope.parseError) {
                    console.log('Error:', envelope.parseError);
                }
            });
    }

    private addErrorMessage(tcsid: string, error: string | null | undefined) {
        if (error) {
            if (tcsid in this.testCaseStartedErrors) {
                this.testCaseStartedErrors[tcsid].push(error);
            } else {
                this.testCaseStartedErrors[tcsid] = [error];
            }
        }
    }

    private _log(message?: any, ...optionalParams: any[]) {
        if (this.config.logging){
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private checkProject(projectCode: string, cb: (exists: boolean) => void) {
        this.api.projects.exists(projectCode)
            .then(cb)
            .catch((err) => {
                this._log(err);
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
                {description: description || 'Cypress automated run'}
            )
        )
            .then((res) => res.data)
            .then(cb)
            .catch((err) => {
                this._log(`Error on creating run ${err as string}`);
            });
    }

    private checkRun(runId: string | number | undefined, cb: (exists: boolean) => void) {
        if (runId !== undefined) {
            this.api.runs.exists(this.config.projectCode, runId)
                .then(cb)
                .catch((err) => {
                    this._log(`Error on checking run ${err as string}`);
                });
        } else {
            cb(false);
        }
    }

    private saveRunId(runId?: string | number) {
        this.config.runId = runId;
        if (this.config.runId) {
            while (this.pending.length) {
                this._log(`Number of pending: ${this.pending.length}`);
                const cb = this.pending.shift();
                if (cb) {
                    cb(this.config.runId);
                }
            }
        }
    }

    private logTestItem(name: string, status: ResultStatus) {
        const map = {
            failed: chalk`{red Test ${name} ${status}}`,
            passed: chalk`{green Test ${name} ${status}}`,
            pending: chalk`{blueBright Test ${name} ${status}}`,
        };
        if (status) {
            this._log(map[status]);
        }
    }

    private publishCaseResult(test: Test, status: ResultStatus){
        this.logTestItem(test.name, status);

        const caseIds = test.tags;
        caseIds.forEach((caseId) => {
            this.shouldPublish++;
            const publishTest = (runId: string | number) => {
                if (caseId) {
                    const add = caseIds.length > 1 ? chalk` {white For case ${caseId}}`:'';
                    this._log(
                        chalk`{gray Start publishing: ${test.name}}${add}`
                    );
                    const result = new ResultCreate(
                        parseInt(caseId, 10),
                        status,
                        {
                            time: test.duration,
                            stacktrace: test.error,
                            comment: test.error ? test.error.split('\n')[0]:undefined,
                        }
                    );
                    this.api.results.create(this.config.projectCode, runId, result)
                        .then((res) => {
                            this.results.push({test, result: res.data});
                            this._log(chalk`{gray Result published: ${test.name} ${res.data.hash}}${add}`);
                            this.shouldPublish--;
                        })
                        .catch((err) => {
                            this._log(err);
                            this.shouldPublish--;
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

    private extractIds(tagsList: io.cucumber.messages.Pickle.IPickleTag[]): string[] {
        const regex = /[Qq]-*(\d+)/;
        return tagsList.filter((tagInfo) => regex.test(tagInfo.name!)).map((tagInfo) => regex.exec(tagInfo.name!)![1]);
    }
}

export = QaseReporter;
