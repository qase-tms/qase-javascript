import { Config, Reporter, Test, TestResult } from '@jest/reporters';
import { Status, TestCaseResult } from '@jest/test-result';

import {
  Attachment,
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { Qase } from './global';
import { MetadataApplier } from './modules/metadataApplier';
import { ProfilerTracker } from './modules/profilerTracker';
import { ResultBuilder } from './modules/resultBuilder';

export type JestQaseOptionsType = ConfigType;

const STATUS_MAP: Record<Status, TestStatusEnum> = {
  passed: TestStatusEnum.passed,
  failed: TestStatusEnum.failed,
  skipped: TestStatusEnum.skipped,
  disabled: TestStatusEnum.disabled,
  pending: TestStatusEnum.skipped,
  todo: TestStatusEnum.disabled,
  focused: TestStatusEnum.passed,
};

/**
 * @class JestQaseReporter
 * @implements Reporter
 */
export class JestQaseReporter implements Reporter {
  static statusMap: Record<Status, TestStatusEnum> = STATUS_MAP;

  private reporter: ReporterInterface;
  private profilerTracker: ProfilerTracker;
  private metadataApplier: MetadataApplier;

  public constructor(
    _: Config.GlobalConfig,
    options: JestQaseOptionsType,
    _state: unknown,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();
    const composedOptions = composeOptions(options, config);

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'jest',
      frameworkName: 'jest',
      reporterName: 'jest-qase-reporter',
    });

    const profiler = composedOptions.profilers?.includes('network')
      ? new NetworkProfiler({
          skipDomains: composedOptions.networkProfiler?.skip_domains,
          trackOnFail: composedOptions.networkProfiler?.track_on_fail,
        })
      : null;
    this.profilerTracker = new ProfilerTracker(profiler);
    this.metadataApplier = new MetadataApplier();

    // @ts-expect-error - global.Qase is dynamically added at runtime
    global.Qase = new Qase(this);
  }

  public onRunStart() {
    this.reporter.startTestRun();
    this.profilerTracker.enable();
  }

  public onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    if (this.metadataApplier.get().ignore) {
      this.metadataApplier.reset();
      return;
    }

    const result = ResultBuilder.build({
      value: testCaseResult,
      path: test.path,
      metadata: this.metadataApplier.get(),
      profilerSteps: this.profilerTracker.getNewSteps(),
    });

    this.metadataApplier.reset();
    void this.reporter.addTestResult(result);
  }

  public onTestResult(_: Test, result: TestResult) {
    result.testResults.forEach((value) => {
      if (value.status !== 'pending') return;
      const model = ResultBuilder.build({
        value,
        path: result.testFilePath,
        metadata: MetadataApplier.empty(),
        profilerSteps: [],
      });
      void this.reporter.addTestResult(model);
    });
  }

  public getLastError() {/* empty */}

  public onRunComplete() {
    this.profilerTracker.restore();
    void this.reporter.publish();
  }

  async onRunnerEnd() {
    await this.reporter.publish();
  }

  public addTitle(title: string) {
    this.metadataApplier.applyTitle(title);
  }

  public addComment(comment: string) {
    this.metadataApplier.applyComment(comment);
  }

  public addSuite(suite: string) {
    this.metadataApplier.applySuite(suite);
  }

  public addFields(fields: Record<string, string>) {
    this.metadataApplier.applyFields(fields);
  }

  public addParameters(parameters: Record<string, string>) {
    this.metadataApplier.applyParameters(parameters);
  }

  public addGroupParams(groupParams: Record<string, string>) {
    this.metadataApplier.applyGroupParams(groupParams);
  }

  public addTags(tags: string[]) {
    this.metadataApplier.applyTags(tags);
  }

  public addIgnore() {
    this.metadataApplier.applyIgnore();
  }

  public addStep(step: TestStepType) {
    this.metadataApplier.applyStep(step);
  }

  public addAttachment(attachment: Attachment) {
    this.metadataApplier.applyAttachment(attachment);
  }
}
