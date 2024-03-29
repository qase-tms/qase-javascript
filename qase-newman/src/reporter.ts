import { EventEmitter } from 'events';

import semver from 'semver';
import { NewmanRunExecution } from 'newman';
import {
  EventList,
} from 'postman-collection';

import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestResultType,
  getPackageVersion,
  ConfigLoader,
  composeOptions,
} from 'qase-javascript-commons';

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

  // /**
  //  * @param {PropertyBase<PropertyBaseDefinition>} item
  //  * @param {string[]} titles
  //  * @returns {string[]}
  //  * @private
  //  */
  // private static getParentTitles(
  //   item: PropertyBase<PropertyBaseDefinition>,
  //   titles: string[] = [],
  // ) {
  //   const parent = item.parent();
  //
  //   if (parent) {
  //     NewmanQaseReporter.getParentTitles(parent, titles);
  //   }
  //
  //   if ('name' in item) {
  //     titles.push(String(item.name));
  //   }
  //
  //   return titles;
  // }

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

  /**
   * @param {EventEmitter} emitter
   * @param {NewmanQaseOptionsType} options
   * @param {unknown} _
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    emitter: EventEmitter,
    options: NewmanQaseOptionsType,
    _: unknown,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();

    this.reporter = new QaseReporter({
      ...composeOptions(options, config),
      frameworkPackage: 'newman',
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
        // const parent = item.parent();

        this.pendingResultMap.set(item.id, {
          attachments: [],
          author: null,
          execution: {
            status: TestStatusEnum.passed,
            start_time: 0,
            end_time: 0,
            duration: 0,
            stacktrace: null,
            thread: null,
          },
          fields: new Map<string, string>(),
          message: null,
          muted: false,
          params: new Map<string, string>(),
          relations: [],
          run_id: null,
          signature: '',
          steps: [],
          testops_id: NewmanQaseReporter.getCaseIds(item.events)[0] ?? null,
          id: item.id,
          title: item.name,
          // suiteTitle: parent ? NewmanQaseReporter.getParentTitles(parent) : [],
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

          pendingResult.execution.status = TestStatusEnum.failed;
          pendingResult.execution.stacktrace = err.stack ?? null;
          pendingResult.message = err.message;
        }
      },
    );

    runner.on('item', (_err: Error | undefined, exec: NewmanRunExecution) => {
      const { item } = exec;
      const pendingResult = this.pendingResultMap.get(item.id);

      if (pendingResult) {
        const timer = this.timerMap.get(item.id);

        if (timer) {
          const now = Date.now();
          pendingResult.execution.start_time = timer;
          pendingResult.execution.end_time = now;
          pendingResult.execution.duration = now - timer;
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
    const newmanVersion = getPackageVersion('newman');

    if (!newmanVersion || semver.lt(newmanVersion, '5.3.2')) {
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
