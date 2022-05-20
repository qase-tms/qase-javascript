/* eslint-disable no-console */
/* eslint-disable camelcase */
import { EventList, Item } from 'postman-collection';
import {
    IdResponse,
    ResultCreateStatusEnum,
} from 'qaseio/dist/src';
import { execSync, spawnSync } from 'child_process';
import { EventEmitter } from 'events';
import { NewmanRunOptions } from 'newman';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';
import { readFileSync } from 'fs';


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
    rootSuiteTitle = 'QASE_ROOT_SUITE_TITLE',
}

interface QaseOptions {
    apiToken: string;
    basePath?: string;
    rootSuiteTitle?: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    runName?: string;
    runDescription?: string;
    logging?: boolean;
    runComplete?: boolean;
    environmentId?: number;
}

interface Test {
    name: string;
    response?: any;
    err?: Error;
    result: ResultCreateStatusEnum;
    duration: number;
    ids: string[];
    startStamp: number;
    endStamp: number;
}

interface BulkCaseObject {
    case_id?: number;
    status: ResultCreateStatusEnum;
    time_ms: number;
    stacktrace?: string;
    comment: string;
}

class NewmanQaseReporter {
    private api: QaseApi;
    private prePending: Record<string, Test> = {};
    private options: QaseOptions;
    private collectionOptions: NewmanRunOptions;
    private runId?: number | string;
    private isDisabled = false;

    public constructor(
        emitter: EventEmitter,
        _options: QaseOptions,
        collectionRunOptions: NewmanRunOptions
    ) {
        this.options = _options;
        this.options.projectCode =
            _options.projectCode || this.getEnv(Envs.projectCode) || '';
        this.collectionOptions = collectionRunOptions;
        this.options.runComplete =
            !!this.getEnv(Envs.runComplete) || this.options.runComplete;

        this.api = new QaseApi(
            this.getEnv(Envs.apiToken) || this.options.apiToken || '',
            this.getEnv(Envs.basePath) || this.options.basePath,
            this.createHeaders()
        );

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        if (!this.options.projectCode) {
            return;
        }

        this.addRunnerListeners(emitter);
    }

    private createHeaders() {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(
            /['"\n]+/g,
            ''
        );
        const qaseapiVersion = this.getPackageVersion('qaseio');
        const frameworkVersion = this.getPackageVersion('newman');
        const reporterVersion = this.getPackageVersion('newman-reporter-qase');
        const xPlatformHeader = `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`;
        // eslint-disable-next-line max-len
        const xClientHeader = `newman=${frameworkVersion as string}; qase-newman=${reporterVersion as string}; qaseapi=${qaseapiVersion as string}`;

        return {
            'X-Client': xClientHeader,
            'X-Platform': xPlatformHeader,
        };
    }

    private getEnv(name: Envs) {
        return process.env[name];
    }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private getPackageVersion(name: string) {
        const UNDEFINED = 'undefined';
        try {
            const pathToPackageJson = require.resolve(`${name}/package.json`, {
                paths: [process.cwd()],
            });
            if (pathToPackageJson) {
                try {
                    const packageString = readFileSync(pathToPackageJson, {
                        encoding: 'utf8',
                    });
                    if (packageString) {
                        const packageObject = JSON.parse(packageString) as {
                            version: string;
                        };
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

    private addRunnerListeners(runner: EventEmitter) {
        runner.on('start', () => {
            if (this.isDisabled) {
                return;
            }
        });

        runner.on('beforeItem', (err, args: Record<string, unknown>) => {
            const item: Item = args.item as Item;
            const name = this.itemName(args);
            const ids = this.extractIds(item.events);
            if (name) {
                this.log('Test', name, 'starting, case ids:', ids);
                this.prePending[name] = {
                    name,
                    result: ResultCreateStatusEnum.PASSED,
                    duration: 0,
                    ids,
                    startStamp: Date.now(),
                } as Test;
            }
        });

        runner.on('request', (err, args: Record<string, unknown>) => {
            const name = this.itemName(args);
            if (name && this.prePending[name]) {
                this.prePending[name].response = args.response;
            }
        });

        runner.on('assertion', (err: Error, args: Record<string, unknown>) => {
            const name = this.itemName(args);
            if (name && this.prePending[name] && err) {
                this.prePending[name].result = ResultCreateStatusEnum.FAILED;
                this.prePending[name].err = err;
            }
        });

        runner.on('item', (err, args: Record<string, unknown>) => {
            const name = this.itemName(args);
            if (name && this.prePending[name]) {
                const item = this.prePending[name];
                item.endStamp = Date.now();
                item.duration = item.endStamp - item.startStamp;
                this.logTestItem(this.prePending[name]);
            }
        });

        runner.on('beforeDone', () => {
            void this.checkProject(
                this.options.projectCode,
                async (prjExists) => {
                    if (!prjExists) {
                        this.log(
                            chalk`{red Project ${this.options.projectCode} does not exist}`
                        );
                        this.isDisabled = true;
                        return;
                    }
                    this.log(
                        chalk`{green Project ${this.options.projectCode} exists}`
                    );
                    const providedRunId =
                        this.getEnv(Envs.runId) || this.options.runId;
                    if (providedRunId) {
                        this.runId = providedRunId;
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
                            this.getEnv(Envs.runName) || this.options.runName,
                            this.getEnv(Envs.runDescription) ||
                            this.options.runDescription,
                            (created) => {
                                if (created) {
                                    this.runId = created.result?.id;
                                    process.env.QASE_RUN_ID = String(this.runId);
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
            ).then(() => {
                const config = {
                    apiToken: this.getEnv(Envs.apiToken) || this.options.apiToken || '',
                    basePath: this.getEnv(Envs.basePath) || this.options.basePath,
                    headers: this.createHeaders(),
                    code: this.options.projectCode,
                    runId: Number(this.runId),
                    body: {
                        results: this.createBulkResultsBodyObject(),
                    },
                };

                spawnSync('node', [`${__dirname}/reportBulk.js`], {
                    stdio: 'inherit',
                    env: Object.assign(process.env, {
                        reporting_config: JSON.stringify(config),
                    }),
                });
            });
        });

        runner.on('done', () => {
            this.log('Done');
            this.log('Run finished');
        });
    }

    private extractIds(eventList: EventList): string[] {
        const regex = /\/\/\s?[qQ]ase:\s?((?:[\d]+[\s,]{0,})+)/g;
        const ids: string[] = [];
        eventList.each((event) => {
            if (event.listen === 'test' && event.script.exec) {
                event.script.exec.forEach((line) => {
                    let m: RegExpExecArray | null;
                    while ((m = regex.exec(line)) !== null) {
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                        m.forEach((match, groupIndex) => {
                            if (groupIndex === 1) {
                                const hereIds = match.split(/[, ]/).filter((val) => val !== '');
                                ids.push(...hereIds);
                            }
                        });
                    }
                });
            }
        });

        return ids;
    }

    private async checkProject(
        projectCode: string,
        cb: (exists: boolean) => Promise<void>
    ): Promise<void> {
        try {
            const resp = await this.api.projects.getProject(projectCode);

            await cb(Boolean(resp.data.result?.code));
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
            const runObject = this.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'Newman automated run',
                    is_autotest: true,
                }
            );

            const resp = await this.api.runs.createRun(
                this.options.projectCode,
                runObject
            );

            cb(resp.data);
        } catch (err) {
            this.log(`Error on creating run ${err as string}`);
            this.isDisabled = true;
        }
    }

    private createRunObject(
        name: string,
        cases: number[],
        args?: {
            description?: string;
            is_autotest: boolean;
        }
    ) {
        return {
            title: name,
            cases,
            ...args,
        };
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
            .getRun(this.options.projectCode, Number(runId))
            .then((resp) => {
                this.log(
                    `Get run result on checking run ${resp.data.result?.id as unknown as string
                    }`
                );
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private itemName(args: Record<string, unknown>) {
        if (args.item) {
            const item: Item = args.item as Item;
            const name = item.name;
            return name;
        }
    }

    private logTestItem(test: Test) {
        const map = {
            failed: chalk`{red Test ${test.name} ${test.result}}`,
            passed: chalk`{green Test ${test.name} ${test.result}}`,
            pending: chalk`{blueBright Test ${test.name} ${test.result}}`,
        };
        if (test.result) {
            this.log(map[test.result]);
        }
    }

    private createBulkResultsBodyObject() {
        const prePandingValuesArray = Object.values(this.prePending);

        return prePandingValuesArray.reduce((accum, test) => {
            const { ids } = test;

            if (ids && ids.length > 0) {
                const testsByIdArray = ids.map((id) => ({
                    case_id: Number(id),
                    status: test.result,
                    time_ms: test.duration,
                    stacktrace: test.err?.stack,
                    comment: test.err ? test.err.message : '',
                }));
                return [
                    ...accum,
                    ...testsByIdArray,
                ];
            } else {
                const testByIdArray = [
                    {
                        case: {
                            title: test.name,
                            suite_title: this.options.rootSuiteTitle || 'Autocreated Root Suite',
                        },
                        status: test.result,
                        time_ms: test.duration,
                        stacktrace: test.err?.stack,
                        comment: test.err ? test.err.message : '',
                    },
                ];

                return [...accum, ...testByIdArray];
            }

        }, [] as BulkCaseObject[]);
    }
}

export = NewmanQaseReporter;
