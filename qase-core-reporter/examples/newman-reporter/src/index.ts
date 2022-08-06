/* eslint-disable  sort-imports*/
import {
    ResultCreateStatusEnum,
} from 'qaseio/dist/src';
import { EventEmitter } from 'events';
import { EventList, Item } from 'postman-collection';
import { QaseCoreReporter, QaseOptions, Statuses, TestResult } from 'qase-core-reporter';

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

class NewmanQaseReporter {
    private prePending: Record<string, Test> = {};
    private reporter: QaseCoreReporter;

    public constructor(
        emitter: EventEmitter,
        _options: QaseOptions,
    ) {
        QaseCoreReporter.reporterPrettyName = 'Newman';
        this.reporter = new QaseCoreReporter(_options, {
            frameworkName: 'newman',
            reporterName: 'qase-newman-reporter',
        });

        this.addRunnerListeners(emitter);
    }


    private addRunnerListeners(runner: EventEmitter) {
        runner.on('beforeItem', (err, args: Record<string, unknown>) => {
            const item: Item = args.item as Item;
            const name = this.itemName(args);
            const ids = this.extractIds(item.events);
            if (name) {
                QaseCoreReporter.logger(`Test ${name} starting, case ids: ${ids.toString()}`);
                this.prePending[name] = {
                    name,
                    result: ResultCreateStatusEnum.PASSED,
                    duration: 0,
                    ids,
                    startStamp: Date.now(),
                } as Test;
            }
        });

        runner.on('request', (_, args: Record<string, unknown>) => {
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

        runner.on('item', (_, args: Record<string, unknown>) => {

            const name = this.itemName(args);

            if (name && this.prePending[name]) {

                const item = this.prePending[name];

                item.endStamp = Date.now();
                item.duration = item.endStamp - item.startStamp;

                const test: TestResult = {
                    title: item.name,
                    caseIds: item.ids.length > 0
                        ? item.ids.map((id) => Number(id))
                        : undefined,
                    status: item.result as keyof typeof Statuses,
                    duration: item.duration,
                    stacktrace: item.err?.stack,
                    error: item.err,
                    suitePath: '',
                };

                this.reporter.addTestResult(test, item.result);
            }
        });

        runner.on('beforeDone', () => {
            void this.reporter.start().then(() => {
                void this.reporter.end({ spawn: true });
            });
        });
    }

    private itemName(args: Record<string, unknown>) {
        if (args.item) {
            const item: Item = args.item as Item;
            const name = item.name;
            return name;
        }
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
}
export = NewmanQaseReporter;
