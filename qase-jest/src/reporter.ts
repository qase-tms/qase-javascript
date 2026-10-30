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
  // When each test started, from `onTestCaseStart` (Jest 29+); consumed when it is reported.
  private testCaseStartTimes = new Map<string, number>();
  // Project id → key its tests' metadata is written under (see MetadataReader.tagProject).
  private projectKeys = new Map<string, string>();
  // Jest gives `onTestCaseResult` the runner's context, shared by all projects, so a per-test
  // result does not say which project ran it. File-level events carry the real project: they
  // track which projects are running each file, and a file run by several projects at once is
  // reported from `onTestResult` instead.
  private projectsRunningFile = new Map<string, Set<string>>();
  private fileLevelRuns = new Set<string>();
  private reportedTests = new Set<string>();

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

  public onTestFileStart(test: Test) {
    const { config } = test.context;
    this.projectKeys.set(config.id, this.metadataReader.tagProject(config));

    const running = this.projectsRunningFile.get(test.path) ?? new Set<string>();
    running.add(config.id);
    this.projectsRunningFile.set(test.path, running);
    if (running.size > 1) {
      for (const project of running) {
        this.fileLevelRuns.add(runKey(project, test.path));
      }
    }
  }

  public onTestCaseStart(test: Test, testCaseStartInfo: Circus.TestCaseStartInfo) {
    const startedAt = testCaseStartInfo.startedAt ?? Date.now();
    this.testCaseStartTimes.set(startTimeKey(test.path, testCaseStartInfo.fullName), startedAt);
  }

  public onTestCaseResult(test: Test, testCaseResult: TestCaseResult) {
    const running = this.projectsRunningFile.get(test.path);
    const [project] = running ?? [];
    if (running?.size !== 1 || project === undefined) return;
    if (this.fileLevelRuns.has(runKey(project, test.path))) return;

    this.reportedTests.add(testKey(project, test.path, testCaseResult.fullName));
    this.report(project, test.path, testCaseResult);
  }

  public onTestResult(test: Test, result: TestResult) {
    const project = test.context.config.id;
    const run = runKey(project, result.testFilePath);
    const fileLevel = this.fileLevelRuns.has(run);

    result.testResults.forEach((value) => {
      if (value.status === 'pending') {
        const model = ResultBuilder.build({
          value,
          path: result.testFilePath,
          metadata: MetadataApplier.empty(),
          profilerSteps: [],
        });
        void this.reporter.addTestResult(model);
        return;
      }
      if (fileLevel && !this.reportedTests.has(testKey(project, result.testFilePath, value.fullName))) {
        this.report(project, result.testFilePath, value);
      }
    });

    this.fileLevelRuns.delete(run);
    for (const value of result.testResults) {
      this.reportedTests.delete(testKey(project, result.testFilePath, value.fullName));
    }
    const running = this.projectsRunningFile.get(result.testFilePath);
    running?.delete(project);
    if (running?.size === 0) this.projectsRunningFile.delete(result.testFilePath);
  }

  private report(project: string, path: string, value: TestCaseResult): void {
    const metadata = this.metadataReader.take({
      project: this.projectKeys.get(project) ?? '',
      testPath: path,
      testName: value.fullName,
      invocation: value.invocations ?? 1,
    });
    if (metadata.ignore) {
      return;
    }

    const key = startTimeKey(path, value.fullName);
    const startTimeMs = this.testCaseStartTimes.get(key) ?? null;
    this.testCaseStartTimes.delete(key);

    const result = ResultBuilder.build({
      value,
      path,
      metadata,
      profilerSteps: this.profilerTracker.getNewSteps(),
      startTimeMs,
    });

    void this.reporter.addTestResult(result);
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

const runKey = (project: string, path: string): string => `${project}\0${path}`;
const testKey = (project: string, path: string, fullName: string): string =>
  `${project}\0${path}\0${fullName}`;
const startTimeKey = (path: string, fullName: string): string => `${path}::${fullName}`;
