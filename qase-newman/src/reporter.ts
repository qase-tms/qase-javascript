import { EventEmitter } from 'events';

import { configSchema } from './configSchema';
import semver from 'semver';
import { NewmanRunExecution, NewmanRunOptions } from 'newman';
import { Item } from 'postman-collection';
import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestResultType,
  getPackageVersion,
  ConfigLoader,
  composeOptions,
  generateSignature,
  determineTestStatus,
} from 'qase-javascript-commons';

import { MetadataExtractor } from './modules/metadataExtractor';
import { IterationDataParser } from './modules/iterationDataParser';
import { ResultBuilder } from './modules/resultBuilder';

export type NewmanQaseOptionsType = ConfigType;

/**
 * @class NewmanQaseReporter
 */
export class NewmanQaseReporter {
  // Public re-exports — preserve API
  static qaseIdRegExp = MetadataExtractor.qaseIdRegExp;
  static qaseParamRegExp = MetadataExtractor.qaseParamRegExp;
  static qaseProjectRegExp = MetadataExtractor.qaseProjectRegExp;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  static getCaseIds = MetadataExtractor.getCaseIds;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  static getProjectMapping = MetadataExtractor.getProjectMapping;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  static getParameters = MetadataExtractor.getParameters;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  static getParentTitles = MetadataExtractor.getParentTitles;

  private reporter: ReporterInterface;
  private pendingResultMap = new Map<string, TestResultType>();
  private timerMap = new Map<string, number>();
  private readonly parameters: Record<string, string>[];
  private autoCollectParams: boolean;

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
    this.parameters = new IterationDataParser().parse(collectionOptions.iterationData);
    this.addRunnerListeners(emitter);
  }

  private addRunnerListeners(runner: EventEmitter) {
    runner.on('start', () => {
      this.reporter.startTestRun();
    });

    runner.on('beforeItem', (_err: Error | undefined, exec: NewmanRunExecution) => {
      const { item } = exec;
      const parent = item.parent();
      const suites = parent ? MetadataExtractor.getParentTitles(parent) : [];
      const ids = MetadataExtractor.getCaseIds(item.events);
      const projectMapping = MetadataExtractor.getProjectMapping(item.events);
      const signature = generateSignature(ids, [...suites, item.name], {});
      const pending = ResultBuilder.buildPending({ item, suites, ids, projectMapping, signature });
      this.pendingResultMap.set(item.id, pending);
      this.timerMap.set(item.id, Date.now());
    });

    runner.on('assertion', (err: Error | undefined, exec: NewmanRunExecution) => {
      const pending = this.pendingResultMap.get(exec.item.id);
      if (pending && err) {
        pending.execution.status = determineTestStatus(err, 'failed');
        pending.execution.stacktrace = err.stack ?? null;
        pending.message = err.message;
      }
    });

    runner.on('item', (_err: Error | undefined, exec: NewmanRunExecution) => {
      const { item } = exec;
      const pending = this.pendingResultMap.get(item.id);
      if (!pending) return;

      const timer = this.timerMap.get(item.id);
      if (timer) {
        const now = Date.now();
        const durationMs = now - timer;
        if (durationMs >= 0) {
          pending.execution.duration = Math.round(durationMs);
          pending.execution.start_time = timer / 1000;
          pending.execution.end_time = now / 1000;
        } else {
          pending.execution.duration = 0;
          pending.execution.start_time = now / 1000;
          pending.execution.end_time = now / 1000;
        }
      }

      pending.params = this.prepareParameters(item, exec.cursor.iteration);
      void this.reporter.addTestResult(pending);

      this.timerMap.delete(item.id);
      this.pendingResultMap.delete(item.id);
    });

    runner.on('beforeDone', () => {
      void this.reporter.publish();
    });

    runner.on('done', () => {
      this.preventExit();
    });
  }

  private prepareParameters(item: Item, iteration: number): Record<string, string> {
    if (this.parameters.length === 0) {
      return {};
    }
    const availableParameters = this.parameters[iteration] ?? {};
    const params = MetadataExtractor.getParameters(item);
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
