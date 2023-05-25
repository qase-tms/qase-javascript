import { EventEmitter } from 'events';

import { EventList, Item } from 'postman-collection';

class NewmanQaseReporter {
    public constructor(
        emitter: EventEmitter,
        options: QaseOptions,
    ) {
        this.qaseReporter = new QaseReporter(options);
        this.addRunnerListeners(emitter);
    }

    private addRunnerListeners(runner: EventEmitter) {
        runner.on('beforeItem', (err, args: Record<string, unknown>) => {
            const item: Item = args.item;
            const name = this.itemName(args);
            const ids = this.extractIds(item.events);
            if (name) {
                this.prePending[name] = {
                    name,
                    result: StatusesEnum.PASSED,
                    duration: 0,
                    ids,
                    startStamp: Date.now(),
                };
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
                this.prePending[name].result = StatusesEnum.FAILED;
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
            this.qaseReporter.publish();
        });

        runner.on('done', () => {
            this.preventExit();
        });
    }

    private preventExit() {
        const { version } = require('newman/package.json');
        const [core] = version.split(/[-+]/);
        const [major, minor, patch] = core.split('.');

        // TODO: use semver package
        if (major < 5 || minor < 3 || patch < 2) {
            const { exit } = process;

            const processToPatch: {
                exit: (code?: number) => void;
            } = process;

            processToPatch.exit = (code?: number) => {
                process.exitCode = code;
                process.exit = exit;
            };
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

    private itemName(args: Record<string, unknown>) {
        if (args.item) {
            const item: Item = args.item as Item;
            const name = item.name;
            return name;
        }
    }
}

export = NewmanQaseReporter;
