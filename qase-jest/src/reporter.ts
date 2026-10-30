import { Config, Reporter, Test, TestResult } from '@jest/reporters';
import { Status, TestCaseResult } from '@jest/test-result';
import type { Circus } from '@jest/types';

import {
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { MetadataReader } from './metadataChannel';
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
  private metadataReader: MetadataReader;
  // Map keyed by `${test.path}::${fullName}` → ms-since-epoch when the test
  // actually started executing. Populated in `onTestCaseStart` (Jest 29+),
  // consumed in `onTestCaseResult`, then evicted.
  private testCaseStartTimes: Map<string, number> = new Map();

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
    this.metadataReader = new MetadataReader();
  }

  public onRunStart() {
    this.reporter.startTestRun();
    this.profilerTracker.enable();
  }

  public onTestCaseStart(test: Test, testCaseStartInfo: Circus.TestCaseStartInfo) {
    const startedAt = testCaseStartInfo.startedAt ?? Date.now();
    this.testCaseStartTimes.set(
      JestQaseReporter.startTimeKey(test.path, testCaseStartInfo.fullName),
      startedAt,
    );
  }

  public onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    const metadata = this.metadataReader.take(
      test.path,
      testCaseResult.fullName,
      testCaseResult.invocations ?? 1,
    );
    if (metadata.ignore) {
      return;
    }

    const key = JestQaseReporter.startTimeKey(test.path, testCaseResult.fullName);
    const startTimeMs = this.testCaseStartTimes.get(key) ?? null;
    this.testCaseStartTimes.delete(key);

    const result = ResultBuilder.build({
      value: testCaseResult,
      path: test.path,
      metadata,
      profilerSteps: this.profilerTracker.getNewSteps(),
      startTimeMs,
    });

    void this.reporter.addTestResult(result);
  }

  private static startTimeKey(path: string, fullName: string): string {
    return `${path}::${fullName}`;
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
}
