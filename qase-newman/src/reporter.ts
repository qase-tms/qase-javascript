import { EventEmitter } from 'events';

import { configSchema } from './configSchema';
import semver from 'semver';
import { NewmanRunExecution, NewmanRunOptions } from 'newman';
import { EventList, Item, PropertyBase, PropertyBaseDefinition } from 'postman-collection';
import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestResultType,
  getPackageVersion,
  ConfigLoader,
  composeOptions,
  Relation,
  SuiteData,
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
   * @type {RegExp}
   */
  static qaseParamRegExp = /qase\.parameters:\s*([\w.]+(?:\s*,\s*[\w.]+)*)/i;

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
   * @param {Item} item
   * @returns {string[]}
   * @private
   */
  private static getParameters(item: Item): string[] {
    const params: string[] = [];

    item.events.each((event) => {
      if (event.listen === 'test' && event.script.exec) {
        event.script.exec.forEach((line) => {
          const match = line.match(NewmanQaseReporter.qaseParamRegExp);

          if (match) {
            const parameters: string[] = match[1]?.split(/\s*,\s*/) ?? [];
            params.push(...parameters);
          }
        });
      }
    });

    const parent = item.parent();
    if (parent && 'events' in parent) {
      params.push(...NewmanQaseReporter.getParameters(parent as Item));
    }

    return params;
  }

  /**
   * @param {PropertyBase<PropertyBaseDefinition>} item
   * @returns {string[]}
   * @private
   */
  private static getParentTitles(
    item: PropertyBase<PropertyBaseDefinition>,
  ) {
    const titles: string[] = [];

    if ('name' in item) {
      titles.push(String(item.name));
    }

    const parent = item.parent();
    if (parent) {
      titles.concat(NewmanQaseReporter.getParentTitles(parent));
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
  private pendingResultMap: Map<string, TestResultType> = new Map<string, TestResultType>();

  /**
   * @type {Map<string, number>}
   * @private
   */
  private timerMap: Map<string, number> = new Map<string, number>();

  /**
   * @type {Record<string, string>[]}
   * @private
   */
  private readonly parameters: Record<string, string>[] = [];

  /**
   * @type {boolean}
   * @private
   */
  private autoCollectParams: boolean;

  /**
   * @param {EventEmitter} emitter
   * @param {NewmanQaseOptionsType} options
   * @param {NewmanRunOptions} collectionOptions
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    emitter: EventEmitter,
    options: NewmanQaseOptionsType,
    collectionOptions: NewmanRunOptions,
    configLoader = new ConfigLoader(configSchema),
  ) {
    const config = configLoader.load();

    this.reporter = QaseReporter.getInstance({
      ...composeOptions(options, config),
      frameworkPackage: 'newman',
      frameworkName: 'newman',
      reporterName: 'newman-reporter-qase',
    });

    this.autoCollectParams = config?.framework?.newman?.autoCollectParams ?? false;

    this.parameters = this.getParameters(collectionOptions.iterationData);
    this.addRunnerListeners(emitter);
  }

  /**
   * @param {EventEmitter} runner
   * @private
   */
  private addRunnerListeners(runner: EventEmitter) {
    runner.on('start', () => {
      this.reporter.startTestRun();
    });

    runner.on(
      'beforeItem',
      (_err: Error | undefined, exec: NewmanRunExecution) => {
        const { item } = exec;
        const parent = item.parent();
        const suites = parent ? NewmanQaseReporter.getParentTitles(parent) : [];
        let relation: Relation | null = null;
        if (suites.length > 0) {
          const data: SuiteData[] = suites.map(title => {
            return {
              title: title,
              public_id: null,
            };
          });
          relation = {
            suite: {
              data: data,
            },
          };
        }
        const ids = NewmanQaseReporter.getCaseIds(item.events);
        this.pendingResultMap.set(item.id, {
          attachments: [],
          author: null,
          execution: {
            status: TestStatusEnum.passed,
            start_time: null,
            end_time: null,
            duration: 0,
            stacktrace: null,
            thread: null,
          },
          fields: {},
          message: null,
          muted: false,
          params: {},
          group_params: {},
          relations: relation,
          run_id: null,
          signature: this.getSignature(suites, item.name, ids),
          steps: [],
          testops_id: ids.length > 0 ? ids : null,
          id: item.id,
          title: item.name,
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
          pendingResult.execution.duration = now - timer;
        }

        pendingResult.params = this.prepareParameters(item, exec.cursor.iteration);

        void this.reporter.addTestResult(pendingResult);
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

  /**
   * @param {string[]} suites
   * @param {string} title
   * @param {number[]} ids
   * @private
   */
  private getSignature(suites: string[], title: string, ids: number[]) {
    let signature = '';

    for (const suite of suites) {
      signature += suite.toLowerCase().replace(/\s/g, '_') + '::';
    }

    signature += title.toLowerCase().replace(/\s/g, '_');

    if (ids.length > 0) {
      signature += '::' + ids.join('::');
    }

    return signature;
  }

  /**
   * @param {Item} item
   * @param {number} iteration
   * @returns {Record<string, string>}
   * @private
   */
  private prepareParameters(item: Item, iteration: number): Record<string, string> {
    if (this.parameters.length === 0) {
      return {};
    }

    const availableParameters = this.parameters[iteration] ?? {};
    const params = NewmanQaseReporter.getParameters(item);

    if (params.length === 0) {
      if (this.autoCollectParams) {
        return availableParameters;
      }

      return {};
    }

    return params.reduce<Record<string, string>>((filteredParams, param) => {
      const value = availableParameters[param.toLowerCase()];
      if (value) {
        filteredParams[param.toLowerCase()] = value;
      }
      return filteredParams;
    }, {});
  }


  /**
   * @param {any} iterationData
   * @private
   */
  private getParameters(iterationData: any): Record<string, string>[] {
    if (!iterationData) {
      return [];
    }

    if (Array.isArray(iterationData) && iterationData.every(item => typeof item === 'object' && item !== null)) {
      return iterationData.map((item: Record<string, any>) => this.convertToRecord(item));
    }

    return [];
  }

  /**
   * @param {unknown} obj
   * @param parentKey
   * @returns {Record<string, string>}
   * @private
   */
  private convertToRecord(obj: unknown, parentKey = ''): Record<string, string> {
    const record: Record<string, string> = {};

    if (this.isRecord(obj)) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const newKey = parentKey ? `${parentKey}.${key}` : key;

          if (this.isRecord(value)) {
            Object.assign(record, this.convertToRecord(value, newKey));
          } else {
            record[newKey.toLowerCase()] = String(value);
          }
        }
      }
    }

    return record;
  }

  /**
   * @param {unknown} obj
   * @private
   */
  private isRecord(obj: unknown): obj is Record<string, unknown> {
    return typeof obj === 'object' && obj !== null;
  }
}
