import { EventEmitter } from 'events';

import semver from "semver";
import { NewmanRunExecution } from "newman";
import newmanPackage from 'newman/package.json';
import { EventList } from 'postman-collection';
import { OptionsType, QaseReporter, ReporterInterface, StatusesEnum, TestResultType } from "qase-javascript-commons";

export type NewmanQaseOptionsType = Omit<OptionsType, 'frameworkName' | 'reporterName'>;

const qaseIdRegExp = /\/\/\s*?[qQ]ase:\s?((?:[\d]+[\s,]{0,})+)/;

export class NewmanQaseReporter {
  private static getCaseIds(eventList: EventList) {
    const ids: number[] = [];

    eventList.each((event) => {
      if (event.listen === 'test' && event.script.exec) {
        event.script.exec.forEach((line) => {
          const [, match] = line.match(qaseIdRegExp) ?? [];

          if (match) {
            ids.push(...match.split(',').map((id) => Number(id)));
          }
        });
      }
    });

    return ids;
  }

  private reporter: ReporterInterface;
  private pendingResultMap: Map<string, TestResultType>;
  private timerMap: Map<string, number>;

  public constructor(
    emitter: EventEmitter,
    options: NewmanQaseOptionsType,
  ) {
    console.log('newman-reporter-qase', options);
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'newman',
      reporterName: 'newman-reporter-qase',
    });

    this.pendingResultMap = new Map();
    this.timerMap = new Map();

    this.addRunnerListeners(emitter);
  }

  private addRunnerListeners(runner: EventEmitter) {
    runner.on('beforeItem', (_err: Error | undefined, exec: NewmanRunExecution) => {
      const { item } = exec;
      const [id, ...restIds] = NewmanQaseReporter.getCaseIds(item.events);

      if (id) {
        this.pendingResultMap.set(item.id, {
          id: item.id,
          testOpsId: [id, ...restIds],
          title: item.name,
          status: StatusesEnum.passed,
          duration: 0,
        });

        this.timerMap.set(item.id, Date.now());
      }
    });

    runner.on('assertion', (err: Error | undefined, exec: NewmanRunExecution) => {
      const { item } = exec;
      const pendingResult = this.pendingResultMap.get(item.id);

      if (pendingResult && err) {
        pendingResult.status = StatusesEnum.failed;
        pendingResult.error = err;
      }
    });

    runner.on('item', (_err: Error | undefined, exec: NewmanRunExecution) => {
      const { item } = exec;
      const pendingResult = this.pendingResultMap.get(item.id);

      if (pendingResult) {
        const timer = this.timerMap.get(item.id);

        if (timer) {
          pendingResult.duration = Date.now() - timer;
        }

        this.reporter.addTestResult(pendingResult);
      }
    });

    runner.on('beforeDone', () => {
      this.reporter.publish();
    });

    runner.on('done', () => {
      this.preventExit();
    });
  }

  private preventExit() {
    if (semver.lt(newmanPackage.version, '5.3.2')) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const _exit = process.exit;

      const mutableProcess: Record<'exit', (code: number) => void> = process;

      mutableProcess.exit = (code?: number) => {
        process.exitCode = code;
        process.exit = _exit;
      };
    }
  }
}
