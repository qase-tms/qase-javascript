import WDIOReporter, {
  AfterCommandArgs,
  BeforeCommandArgs,
  RunnerStats,
  SuiteStats,
  TestStats,
  Tag,
} from '@wdio/reporter';
import {
  composeOptions,
  CompoundError,
  ConfigLoader,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

import { Storage } from './storage';
import { TestLifecycle } from './lifecycle';
import { MetadataApplier } from './metadata';
import { CucumberTagAdapter } from './cucumber-tags';
import { IpcBridge } from './ipc';
import { CommandTracker } from './command-tracker';
import { ResultFinalizer } from './finalizer';
import { QaseReporterOptions } from './options';
import {
  AddAttachmentEventArgs,
  AddCommentEventArgs,
  AddQaseIdEventArgs,
  AddRecordsEventArgs,
  AddSuiteEventArgs,
  AddTagsEventArgs,
  AddTitleEventArgs,
} from './models';

export default class WDIOQaseReporter extends WDIOReporter {
  /**
   * @type {Record<string, TestStatusEnum>}
   */
  static statusMap: Record<string, TestStatusEnum> = {
    'passed': TestStatusEnum.passed,
    'failed': TestStatusEnum.failed,
    'skipped': TestStatusEnum.skipped,
    'pending': TestStatusEnum.skipped,
  };

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  private storage: Storage;

  private lifecycle: TestLifecycle;

  private metadata: MetadataApplier;

  private cucumberTags: CucumberTagAdapter;

  private ipc: IpcBridge;

  private commandTracker: CommandTracker;

  private finalizer: ResultFinalizer;

  /**
   * @type {boolean}
   * @private
   */
  private isSync: boolean;

  private _options: QaseReporterOptions;

  /**
   * @type {NetworkProfiler | null}
   * @private
   */
  private profiler: NetworkProfiler | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(options: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(options);
    const configLoader = new ConfigLoader();
    const config = configLoader.load();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
    const composedOptions = composeOptions(options, config);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.reporter = QaseReporter.getInstance({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...composedOptions,
      frameworkPackage: '@wdio/cli',
      frameworkName: 'wdio',
      reporterName: 'wdio-qase-reporter',
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (composedOptions.profilers?.includes('network')) {
      this.profiler = new NetworkProfiler({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        skipDomains: composedOptions.networkProfiler?.skip_domains,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        trackOnFail: composedOptions.networkProfiler?.track_on_fail,
      });
    }

    this.isSync = true;
    this.storage = new Storage();
    this.lifecycle = new TestLifecycle(this.storage);
    this.metadata = new MetadataApplier(this.storage);
    this.cucumberTags = new CucumberTagAdapter(this.metadata);
    this.ipc = new IpcBridge(this.metadata);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._options = Object.assign(new QaseReporterOptions(), options);
    this.commandTracker = new CommandTracker(this.lifecycle, this.storage, this._options, this.profiler);
    this.finalizer = new ResultFinalizer(this.storage, this.reporter, this.commandTracker, this.ipc);

    this.registerListeners();
  }

  override get isSynchronised() {
    return this.isSync;
  }

  override set isSynchronised(value: boolean) {
    this.isSync = value;
  }

  override onRunnerStart(runner: RunnerStats) {
    this.commandTracker.setMultiremote(runner.isMultiremote);
    this.isSync = false;
  }

  override onSuiteStart(suite: SuiteStats) {
    this.storage.currentFile = suite.file;

    if (this._options.useCucumber && suite.type === 'scenario') {
      this._startTest(suite.title, suite.cid ?? '');
      if (suite.tags) {
        this.cucumberTags.applyTags(suite.tags as Tag[]);
      }
      return;
    }

    this.storage.suites.push(suite.title);
  }

  override async onSuiteEnd(suite: SuiteStats) {
    this.storage.currentFile = undefined;

    if (this._options.useCucumber && suite.type === 'scenario') {
      suite.hooks = suite.hooks.map((hook) => {
        hook.state = hook.state ?? 'passed';
        return hook;
      });

      const suiteChildren = [...suite.tests, ...suite.hooks];

      const isSkipped = suite.tests.every(item => ['skipped'].includes(item.state))
        && suite.hooks.every(item => ['passed', 'skipped'].includes(item.state ?? 'passed'));

      if (isSkipped) {
        await this._endTest(TestStatusEnum.skipped, null);
        return;
      }

      const isFailed = suiteChildren.find(item => item.state === 'failed');

      if (isFailed) {
        const err = WDIOQaseReporter.transformError(isFailed.errors ?? []);
        await this._endTest(TestStatusEnum.failed, err);
        return;
      }

      const isPassed = suiteChildren.every(item => item.state === 'passed');
      const isPartiallySkipped = suiteChildren.every(item => ['passed', 'skipped'].includes(item.state ?? 'passed'));

      if (isPassed || isPartiallySkipped) {
        await this._endTest(TestStatusEnum.passed, null);
        return;
      }

      return;
    }

    this.storage.clear();
  }

  override async onRunnerEnd() {
    this.profiler?.restore();
    await this.reporter.sendResults();
    this.isSync = true;
  }

  override onTestStart(test: TestStats) {
    if (this._options.useCucumber) {
      this._startStep(test.title);
      return;
    }

    this.commandTracker.takeProfilerSnapshot();
    this._startTest(test.title, test.cid, test.start.valueOf() / 1000);
  }


  /**
   * @param {Error[]} testErrors
   * @returns {CompoundError}
   * @private
   */
  private static transformError(testErrors: Error[]): CompoundError {
    const err = new CompoundError();
    for (const error of testErrors) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (error.message == undefined) {
        continue;
      }
      err.addMessage(error.message);
    }

    for (const error of testErrors) {
      if (error.stack == undefined) {
        continue;
      }
      err.addStacktrace(error.stack);
    }

    return err;
  }

  override async onTestPass() {
    if (this._options.useCucumber) {
      this._endStep();
      return;
    }

    await this._endTest(TestStatusEnum.passed, null);
  }

  override async onTestRetry(test: TestStats) {
    const error = test.errors ? WDIOQaseReporter.transformError(test.errors) : null;

    if (this._options.useCucumber) {
      this._endStep(error ? TestStatusEnum.failed : TestStatusEnum.passed);
      return;
    }

    await this._endTest(WDIOQaseReporter.statusMap[test.state] ?? TestStatusEnum.skipped,
      error,
      test.end ? test.end.valueOf() / 1000 : Date.now().valueOf() / 1000);
  }

  override async onTestFail(test: TestStats) {
    const error = test.errors ? WDIOQaseReporter.transformError(test.errors) : null;

    if (this._options.useCucumber) {
      this._endStep(TestStatusEnum.failed);
      return;
    }

    await this._endTest(WDIOQaseReporter.statusMap[test.state] ?? TestStatusEnum.skipped,
      error,
      test.end ? test.end.valueOf() / 1000 : Date.now().valueOf() / 1000);
  }

  override async onTestSkip(test: TestStats) {
    if (this._options.useCucumber) {
      this._endStep(TestStatusEnum.skipped);
      return;
    }

    if (this.storage.getCurrentTest()?.title !== test.title) {
      this._startTest(test.title, test.cid, test.start.valueOf() / 1000);
    }

    await this._endTest(WDIOQaseReporter.statusMap[test.state] ?? TestStatusEnum.skipped, null);
  }

  private async _endTest(status: TestStatusEnum, err: CompoundError | null, end_time: number = Date.now().valueOf() / 1000) {
    await this.finalizer.finalize(status, err, end_time);
  }

  override onBeforeCommand(command: BeforeCommandArgs) {
    this.commandTracker.onBeforeCommand(command);
  }

  override onAfterCommand(command: AfterCommandArgs) {
    this.commandTracker.onAfterCommand(command);
  }

  registerListeners() {
    this.ipc.registerListeners();
  }

  addQaseId(args: AddQaseIdEventArgs) {
    this.metadata.addQaseId(args);
  }

  addTitle(args: AddTitleEventArgs) {
    this.metadata.addTitle(args);
  }

  addComment(args: AddCommentEventArgs) {
    this.metadata.addComment(args);
  }

  addSuite(args: AddSuiteEventArgs) {
    this.metadata.addSuite(args);
  }

  addParameters(args: AddRecordsEventArgs) {
    this.metadata.addParameters(args);
  }

  addGroupParameters(args: AddRecordsEventArgs) {
    this.metadata.addGroupParameters(args);
  }

  addFields(args: AddRecordsEventArgs) {
    this.metadata.addFields(args);
  }

  addTags(args: AddTagsEventArgs) {
    this.metadata.addTags(args);
  }

  addAttachment(args: AddAttachmentEventArgs) {
    this.metadata.addAttachment(args);
  }

  ignore() {
    this.metadata.ignore();
  }

  addStep(step: TestStepType) {
    this.metadata.addStep(step);
  }

  private _startTest(title: string, cid: string, start_time: number = Date.now().valueOf() / 1000) {
    this.lifecycle.startTest(title, cid, start_time);
  }

  private _startStep(title: string) {
    this.lifecycle.startStep(title);
  }

  private _endStep(status: TestStatusEnum = TestStatusEnum.passed) {
    this.lifecycle.endStep(status);
  }
}
