import { EventEmitter } from 'events';

import semver from 'semver';
import { NewmanRunExecution } from "newman";
import newmanPackage from 'newman/package.json';
import {
  EventList,
  PropertyBase,
  PropertyBaseDefinition,
} from "postman-collection";
import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestResultType
} from "qase-javascript-commons";

export type NewmanQaseOptionsType = ConfigType;

/**
 * @class NewmanQaseReporter
 */
export class NewmanQaseReporter {
  /**
   * @type {RegExp}
   */
  static qaseIdRegExp = /\/\/\s*?[qQ]ase:\s?((?:[\d]+[\s,]{0,})+)/;

  /**
   * @param {EventList} eventList
   * @returns {number[]}
   * @private
   */
  private static getCaseIds(eventList: EventList) {
    const ids: number[] = [];

    eventList.each((event) => {
      if (event.listen === 'test' && event.script.exec) {
        event.script.exec.forEach((line) => {
          const [, match] = line.match(NewmanQaseReporter.qaseIdRegExp) ?? [];

          if (match) {
            ids.push(...match.split(',').map((id) => Number(id)));
          }
        });
      }
    });

    return ids;
  }

  /**
   * @param {PropertyBase<PropertyBaseDefinition>} item
   * @param {string[]} titles
   * @returns {string[]}
   * @private
   */
  private static getParentTitles(
    item: PropertyBase<PropertyBaseDefinition>,
    titles: string[] = [],
  ) {
    const parent = item.parent();

    if (parent) {
      NewmanQaseReporter.getParentTitles(parent, titles);
    }

    if ('name' in item) {
      titles.push(String(item.name));
    }

    return titles;
  }

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;
  /**
   * @type {Map<string, TestResultType>}
   * @private
   */
  private pendingResultMap = new Map<string, TestResultType>();
  /**
   * @type {Map<string, number>}
   * @private
   */
  private timerMap = new Map<string, number>();

  public constructor(emitter: EventEmitter, options: NewmanQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'newman',
      reporterName: 'newman-reporter-qase',
    });

    this.addRunnerListeners(emitter);
  }

  /**
   * @param {EventEmitter} runner
   * @private
   */
  private addRunnerListeners(runner: EventEmitter) {
    runner.on(
      'beforeItem',
      (_err: Error | undefined, exec: NewmanRunExecution) => {
        const { item } = exec;
        const parent = item.parent();

        this.pendingResultMap.set(item.id, {
          id: item.id,
          testOpsId: NewmanQaseReporter.getCaseIds(item.events),
          title: item.name,
          suiteTitle: parent ? NewmanQaseReporter.getParentTitles(parent) : [],
          status: TestStatusEnum.passed,
          duration: 0,
        });

        this.timerMap.set(item.id, Date.now());
      },
    );

    runner.on(
      'assertion',
      (err: Error | undefined, exec: NewmanRunExecution) => {
        const { item } = exec;
        const pendingResult = this.pendingResultMap.get(item.id);

        if (pendingResult && err) {
          pendingResult.status = TestStatusEnum.failed;
          pendingResult.error = err;
        }
      },
    );

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
      void this.reporter.publish();
    });

    runner.on('done', () => {
      this.preventExit();
    });
  }

  /**
   * @private
   */
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
