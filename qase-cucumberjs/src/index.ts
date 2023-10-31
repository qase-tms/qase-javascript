/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-console,no-underscore-dangle,@typescript-eslint/no-non-null-assertion */
import { IdResponse, ResultCreate, ResultCreateStatusEnum } from 'qaseio/dist/src';
import FormData from 'form-data';
import { Formatter } from '@cucumber/cucumber';
import { IFormatterOptions } from '@cucumber/cucumber/lib/formatter';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';
import crypto from 'crypto';
import { execSync } from 'child_process';
import fs from 'fs';
import { io } from '@cucumber/messages/dist/src/messages';
import mime from 'mime-types';
import moment from 'moment';
import os from 'os';
import path from 'path';
import IEnvelope = io.cucumber.messages.IEnvelope;
import ITestCaseFinished = io.cucumber.messages.ITestCaseFinished;
import ITestCaseStarted = io.cucumber.messages.ITestCaseStarted;
import Status = io.cucumber.messages.TestStepFinished.TestStepResult.Status;

interface Config {
    enabled: boolean;
    apiToken: string;
    basePath?: string;
    rootSuiteTitle?: string;
    environmentId?: number;
    projectCode: string;
    runId: string | number | undefined;
    runName: string;
    runDescription?: string;
    logging: boolean;
    runComplete?: boolean;
}

interface Test {
    name: string;
    started: ITestCaseStarted;
    finished: ITestCaseFinished;
    duration: number;
    caseIds: string[];
    error?: string;
    lastAstNodeId: string | null;
}

const StatusMapping: Record<Status, ResultCreateStatusEnum | null> = {
    [Status.PASSED]: ResultCreateStatusEnum.PASSED,
    [Status.FAILED]: ResultCreateStatusEnum.FAILED,
    [Status.SKIPPED]: ResultCreateStatusEnum.SKIPPED,
    [Status.AMBIGUOUS]: null,
    [Status.PENDING]: null,
    [Status.UNDEFINED]: null,
    [Status.UNKNOWN]: null,
};

let customBoundary = '----------------------------';
crypto.randomBytes(24).forEach((value) => {
    customBoundary += Math.floor(value * 10).toString(16);
});

class CustomBoundaryFormData extends FormData {
    public constructor() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        super();
    }

    public getBoundary(): string {
        return customBoundary;
    }
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
        basePath: process.env.QASE_API_BASE_URL || config.basePath,
        apiToken: process.env.QASE_API_TOKEN || config.apiToken || '',
        rootSuiteTitle: process.env.QASE_ROOT_SUITE_TITLE || config.rootSuiteTitle,
        environmentId: Number.parseInt(process.env.QASE_ENVIRONMENT_ID!, 10) || config.environmentId,
        projectCode: process.env.QASE_PROJECT || config.projectCode || '',
        runId: process.env.QASE_RUN_ID || config.runId || '',
        runName: process.env.QASE_RUN_NAME || config.runName || 'Automated Run %DATE%',
        runDescription: process.env.QASE_RUN_DESCRIPTION || config.runDescription,
        logging: process.env.QASE_LOGGING !== '' || config.logging,
        runComplete: process.env.QASE_RUN_COMPLETE === 'true' || config.runComplete || false,
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
    const { enabled, apiToken, projectCode } = config;
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
    private readonly config: Config;
    private api: QaseApi;
    private enabled: boolean;

    private pickleInfo: Record<string, { caseIds: string[]; name: string; lastAstNodeId: string | null }> = {};
    private testCaseStarts: Record<string, ITestCaseStarted> = {};
    private testCaseStartedResult: Record<string, ResultCreateStatusEnum> = {};
    private testCaseStartedAttachment: Record<string, string[]> = {};
    private testCaseStartedErrors: Record<string, string[]> = {};
    private testCaseScenarioId: Record<string, string> = {};
    private pending: Array<(runId: string | number) => void> = [];
    private results: Record<string, ResultCreate> = {};
    private scenarios: Record<string, string> = {};
    private uploadsInQueueCount = 0;

    private checkOperation: Promise<unknown> | null = null;

    public constructor(options: IFormatterOptions) {
        super(options);
        this.config = prepareConfig(options.parsedArgvOptions as Config, options.parsedArgvOptions?.qaseConfig);
        this.enabled = verifyConfig(this.config);
        this.api = new QaseApi(
            this.config.apiToken,
            this.config.basePath,
            this.createHeaders(),
            CustomBoundaryFormData
        );
        if (!this.enabled) {
            return;
        }

        this.config.runName = prepareReportName(this.config);

        options.eventBroadcaster
            .on('envelope', (envelope: IEnvelope) => {
                if (envelope.gherkinDocument) {
                    envelope.gherkinDocument.feature?.children?.forEach((featureChild) => {
                        if (envelope.gherkinDocument?.feature?.name != null && featureChild.scenario?.id !== undefined && featureChild.scenario?.id !== null) {
                            this.scenarios[featureChild.scenario?.id] = envelope.gherkinDocument?.feature?.name;
                        }
                    });
                } else if (envelope.pickle) {
                    this.pickleInfo[envelope.pickle.id!] = {
                        caseIds: this.extractIds(envelope.pickle.tags!),
                        name: envelope.pickle.name!,
                        lastAstNodeId: envelope.pickle.astNodeIds ? envelope.pickle.astNodeIds[envelope.pickle.astNodeIds.length - 1] : null,
                    };
                } else if (envelope.attachment) {
                    void this.upload(envelope.attachment);
                } else if (envelope.testRunStarted) {
                    this.checkOperation = this.checkProject(
                        this.config.projectCode,
                        async (prjExists): Promise<void> => {
                            if (prjExists) {
                                this._log(chalk`{green Project ${this.config.projectCode} exists}`);
                                const willRun = Object.keys(this.pickleInfo).length !== 0;
                                if (this.config.runId && willRun) {
                                    this.saveRunId(this.config.runId);
                                    return this.checkRun(
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
                                    return this.createRun(
                                        this.config.runName,
                                        this.config.runDescription,
                                        (created) => {
                                            if (created) {
                                                this.saveRunId(created.result?.id);
                                                this._log(
                                                    chalk`{green Using run ${this.config.runId as unknown as string} to publish test results}`
                                                );
                                            } else {
                                                this._log(
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
                    if (Object.keys(this.results).length === 0) {
                        this._log('No testcases were matched. Ensure that your tests are declared correctly.');

                        return;
                    }

                    void this.publishResults();
                } else if (envelope.testCase) {
                    this.testCaseScenarioId[envelope.testCase.id!] = envelope.testCase.pickleId!;
                } else if (envelope.testCaseStarted) {
                    this.testCaseStarts[envelope.testCaseStarted.id!] = envelope.testCaseStarted;
                    this.testCaseStartedResult[envelope.testCaseStarted.id!] = ResultCreateStatusEnum.PASSED;
                } else if (envelope.testStepFinished) {
                    const stepFin = envelope.testStepFinished;
                    const stepStatus = stepFin.testStepResult!.status!;
                    const stepMessage = stepFin.testStepResult!.message!;
                    const oldStatus = this.testCaseStartedResult[stepFin.testCaseStartedId!];
                    const newStatus = StatusMapping[stepFin.testStepResult!.status!];
                    if (newStatus === null) {
                        this._log(
                            chalk`{redBright Unexpected finish status ${stepStatus as unknown as string} received for step ${stepMessage}}`
                        );
                        return;
                    }
                    if (newStatus !== ResultCreateStatusEnum.PASSED) {
                        this.addErrorMessage(stepFin.testCaseStartedId!, stepFin.testStepResult?.message);
                        if (oldStatus) {
                            if (oldStatus !== ResultCreateStatusEnum.FAILED && newStatus) {
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
                        caseIds: info.caseIds,
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        duration: Math.abs((envelope.testCaseFinished.timestamp!.seconds! as number - (tcs.timestamp!.seconds! as number))),
                        error: this.testCaseStartedErrors[tcs.id!]?.join('\n\n'),
                        lastAstNodeId: info.lastAstNodeId,
                    };
                    this.addForSending(test, status);
                } else if (envelope.parseError) {
                    console.log('Error:', envelope.parseError);
                }
            });
    }

    private async waitUploads() {
        while (this.uploadsInQueueCount > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    private async upload(attachment: io.cucumber.messages.IAttachment) {
        const randomString = crypto.randomBytes(20).toString('hex');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        const tmpFilePath = os.tmpdir().concat(randomString, '.', mime.extension(attachment.mediaType));

        fs.writeFile(tmpFilePath, attachment.body as string, 'base64', (err) => {
            if (err !== null) {
                this._log(err.message);
            }
        });

        this.uploadsInQueueCount++;
        await this.api.attachments.uploadAttachment(
            this.config.projectCode,
            [fs.createReadStream(tmpFilePath)],
            {
                headers: {
                    'Content-Type': 'multipart/form-data; boundary=' + customBoundary,
                },
            }
        ).then((response) => {
            const fileHash = response.data.result?.[0].hash as string;

            const caseAttachments = this.testCaseStartedAttachment[attachment.testCaseStartedId as string] || [];
            caseAttachments.push(fileHash);
            this.testCaseStartedAttachment[attachment.testCaseStartedId as string] = caseAttachments;

            this.uploadsInQueueCount--;
        }).catch((err) => {
            this.log(`Error on uploading file ${err as string}`);
            this.uploadsInQueueCount--;
        });
    }

    private async publishResults() {
        await this.checkOperation;
        await this.waitUploads();

        const res: ResultCreate[] = [];
        Object.keys(this.results).forEach((testCaseStartedId) => {
            const result = this.results[testCaseStartedId];
            result.attachments = this.testCaseStartedAttachment[testCaseStartedId] ?? [];
            res.push(result);
        });

        this.api.results.createResultBulk(
            this.config.projectCode,
            Number(this.config.runId),
            {
                results: res,
            }
        ).then(async () => {
            this._log(chalk`{gray Results sent}`);

            if (this.config.runComplete) {
                await this.api.runs.completeRun(this.config.projectCode, Number(this.config.runId));
                this._log(chalk`{green Run completed}`);
            }
        }).catch((err) => {
            this._log(err);
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
        if (this.config.logging) {
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private async checkProject(projectCode: string, cb: (exists: boolean) => Promise<void>): Promise<void> {
        try {
            const resp = await this.api.projects.getProject(projectCode);

            await cb(Boolean(resp.data.result?.code));
        } catch (err) {
            this._log(err);
            this.enabled = false;
        }
    }

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: IdResponse) => void
    ): Promise<void> {
        try {
            const runObject = this.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'CucumberJS automated run',
                    environment_id: this.config.environmentId,
                    is_autotest: true,
                }
            );
            const res = await this.api.runs.createRun(
                this.config.projectCode,
                runObject
            );
            cb(res.data);
        } catch (err) {
            this._log(`Error on creating run ${err as string}`);
            this.enabled = false;
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

    private async checkRun(runId: string | number | undefined, cb: (exists: boolean) => void): Promise<void> {
        if (runId === undefined) {
            cb(false);
            return;
        }

        return this.api.runs.getRun(this.config.projectCode, Number(runId))
            .then((resp) => {
                this._log(`Get run result on checking run ${resp.data.result?.id as unknown as string}`);
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                this._log(`Error on checking run ${err as string}`);
                this.enabled = false;
            });

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

    private logTestItem(name: string, status: ResultCreateStatusEnum) {
        const map = {
            failed: chalk`{red Test ${name} ${status}}`,
            passed: chalk`{green Test ${name} ${status}}`,
            pending: chalk`{blueBright Test ${name} ${status}}`,
            skipped: chalk`{bgGray Test ${name} ${status}}`,
        };
        if (status) {
            this._log(map[status]);
        }
    }

    private addForSending(test: Test, status: ResultCreateStatusEnum) {
        this.logTestItem(test.name, status);

        if (test.caseIds.length) {
            this.addKnownCasesForSending(test, status);
        } else {
            this.addNewCasesForSending(test, status);
        }
    }

    private addKnownCasesForSending(test: Test, status: ResultCreateStatusEnum) {
        test.caseIds.forEach((caseId) => {
            if (!caseId) {
                return;
            }

            const add = test.caseIds.length > 1 ? chalk` {white For case ${caseId}}` : '';
            this._log(
                chalk`{gray Added for publishing: ${test.name}}${add}`
            );

            this.results[test.finished.testCaseStartedId as string] = {
                status,
                case_id: parseInt(caseId, 10),
                time: test.duration,
                stacktrace: test.error,
                comment: test.error ? test.error.split('\n')[0] : undefined,
                defect: status === ResultCreateStatusEnum.FAILED,
            };
        });
    }

    private addNewCasesForSending(test: Test, status: ResultCreateStatusEnum) {
        const suiteTitle: string[] = [test.lastAstNodeId ? this.scenarios[test.lastAstNodeId] : ''];
        if (this.config.rootSuiteTitle) {
            suiteTitle.unshift(this.config.rootSuiteTitle);
        }

        this._log(
            chalk`{gray Added for publishing: ${suiteTitle.join('/')}/${test.name}}`
        );

        this.results[test.finished.testCaseStartedId as string] = {
            case: {
                title: test.name,
                suite_title: suiteTitle.join('\t'),
            },
            status,
            time: test.duration,
            stacktrace: test.error,
            comment: test.error ? test.error.split('\n')[0] : undefined,
            defect: status === ResultCreateStatusEnum.FAILED,
        };
    }

    private extractIds(tagsList: io.cucumber.messages.Pickle.IPickleTag[]): string[] {
        const regex = /[Qq]-*(\d+)/;
        return tagsList.filter((tagInfo) => regex.test(tagInfo.name!)).map((tagInfo) => regex.exec(tagInfo.name!)![1]);
    }

    private createHeaders() {
        const { version: nodeVersion } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseapiVersion = this.getPackageVersion('qaseio');
        const frameworkVersion = this.getPackageVersion('@cucumber/cucumber');
        const reporterVersion = this.getPackageVersion('cucumberjs-qase-reporter');
        const xPlatformHeader = `node=${nodeVersion};npm=${npmVersion};os=${os.platform()};arch=${os.arch()}`;
        const xClientHeader = `cucumberjs=${frameworkVersion as string};qase-cucumberjs=${reporterVersion as string};qaseapi=${qaseapiVersion as string}`;

        return {
            'X-Client': xClientHeader,
            'X-Platform': xPlatformHeader,
        };
    }

    private getPackageVersion(name: string) {
        const UNDEFINED = 'undefined';
        try {
            const pathToPackageJson = require.resolve(`${name}/package.json`, { paths: [process.cwd()] });
            if (pathToPackageJson) {
                try {
                    const packageString = fs.readFileSync(pathToPackageJson, { encoding: 'utf8' });
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
}

export = QaseReporter;
