/* eslint-disable no-console */
import { EventList, Item } from 'postman-collection';
import { ResultCreate, ResultCreated, ResultStatus } from 'qaseio/dist/src/models';
import { EventEmitter } from 'events';
import { NewmanRunOptions } from 'newman';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';

enum Envs {
    runId = 'QASE_RUN_ID',
}

interface QaseOptions {
    apiToken: string;
    projectCode: string;
    runId?: string;
    logging?: boolean;
}

interface Test {
    name: string;
    response?: any;
    err?: Error;
    result: ResultStatus;
    duration: number;
    ids: string[];
}

class NewmanQaseReporter {
    private api: QaseApi;
    private prePending: Record<string, Test> = {};
    private pending: Array<(runId: string | number) => void> = [];
    private results: Array<{test: Test; result: ResultCreated}> = [];
    private options: QaseOptions;
    private collectionOptions: NewmanRunOptions;
    private runId?: number | string;

    public constructor(
        emitter: EventEmitter,
        options: QaseOptions,
        collectionRunOptions: NewmanRunOptions,
    ) {
        this.options = options;
        this.collectionOptions = collectionRunOptions;
        this.api = new QaseApi(this.options.apiToken);

        if (!this.options.projectCode) {
            return;
        }

        this.addRunnerListeners(emitter);

        this.checkProject(
            this.options.projectCode,
            (prjExists) => {
                if (prjExists) {
                    this.log(chalk`{green Project ${this.options.projectCode} exists}`);
                    let runId = this.getEnv(Envs.runId);
                    if (!runId) {
                        runId = this.options.runId;
                    }
                    this.checkRun(
                        runId,
                        (runExists: boolean) => {
                            if (runExists) {
                                this.log(chalk`{green Using run ${runId} to publish test results}`);
                                this.saveRunId(runId);
                            } else {
                                this.log(chalk`{red Run ${runId} does not exist}`);
                            }
                        }
                    );
                } else {
                    this.log(chalk`{red Project ${this.options.projectCode} does not exist}`);
                }
            }
        );
    }

    private getEnv(name: Envs) {
        return process.env[name];
    }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging){
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private addRunnerListeners(runner: EventEmitter) {
        runner.on('beforeItem', (err, args: Record<string,unknown>) => {
            const item: Item = args.item && args.item as Item;
            const name = this.itemName(args);
            const ids = this.extractIds(item.events);
            if (name) {
                this.log('Test', name, 'starting, case ids:', ids);
                this.prePending[name] = {
                    name,
                    result: ResultStatus.PASSED,
                    duration: 0,
                    ids,
                } as Test;
            }
        });

        runner.on('request', (err, args: Record<string,unknown>) => {
            const name = this.itemName(args);
            if (name && this.prePending[name]) {
                this.prePending[name].response = args.response;
            }
        });

        runner.on('assertion', (err: Error, args: Record<string,unknown>) => {
            const name = this.itemName(args);
            if (name && this.prePending[name] && err) {
                this.prePending[name].result = ResultStatus.FAILED;
                this.prePending[name].err = err;
            }
        });

        runner.on('item', (err, args: Record<string,unknown>) => {
            const name = this.itemName(args);
            if (name && this.prePending[name]) {
                this.publishCaseResult(this.prePending[name]);
            }
        });

        runner.on('done', () => {
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

    private checkProject(projectCode: string, cb: (exists: boolean) => void) {
        this.api.projects.exists(projectCode)
            .then(cb)
            .catch((err) => {
                this.log(err);
            });
    }

    private checkRun(runId: string | number | undefined, cb: (exists: boolean) => void) {
        if (runId !== undefined) {
            this.api.runs.exists(this.options.projectCode, runId)
                .then(cb)
                .catch((err) => {
                    this.log(err);
                });
        } else {
            cb(false);
        }
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

    private itemName(args: Record<string, unknown>){
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

    private publishCaseResult(test: Test){
        this.logTestItem(test);

        const publishTest = (runId: string | number) => {
            if (test.ids.length !== 0) {
                test.ids.forEach((caseId) => {
                    this.log(chalk`{gray Result publishing: ${test.name} case: ${caseId}}`);
                    this.api.results.create(this.options.projectCode, runId, new ResultCreate(
                        parseInt(caseId, 10),
                        test.result,
                        {
                            time: test.duration,
                            stacktrace: test.err?.stack,
                            comment: test.err ? test.err.message:`Qase Newman Reporter ${new Date().toLocaleString()}`,
                        }
                    ))
                        .then((res) => {
                            this.results.push({test, result: res.data});
                            this.log(chalk`{gray Result published: ${test.name} case ${caseId}}`);
                        })
                        .catch((err) => {
                            this.log(`Got error on publishing: ${err as string}`);
                        });
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

export = NewmanQaseReporter;
