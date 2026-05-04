import type { Reporter } from 'vitest/reporters';
import type { TestAnnotation } from '@vitest/runner';
import type { TestCase, TestSuite } from 'vitest/node';
import {
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStepType,
  composeOptions,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

import { MetadataAccumulator } from './modules/metadataAccumulator';
import { ProfilerTracker } from './modules/profilerTracker';
import { ResultBuilder } from './modules/resultBuilder';

export type VitestQaseOptionsType = ConfigType;

export class VitestQaseReporter implements Reporter {
  private reporter: ReporterInterface;
  private profilerTracker: ProfilerTracker;
  private metadataAccumulator: MetadataAccumulator;

  constructor(
    options: VitestQaseOptionsType = {},
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();
    const composedOptions = composeOptions(options, config);

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'vitest',
      frameworkName: 'vitest',
      reporterName: 'vitest-qase-reporter',
    });

    const profiler = composedOptions.profilers?.includes('network')
      ? new NetworkProfiler({
          skipDomains: composedOptions.networkProfiler?.skip_domains,
          trackOnFail: composedOptions.networkProfiler?.track_on_fail,
        })
      : null;
    this.profilerTracker = new ProfilerTracker(profiler);
    this.metadataAccumulator = new MetadataAccumulator();
  }

  onTestRunStart?(): void {
    this.reporter.startTestRun();
    this.profilerTracker.enable();
  }

  async onTestRunEnd?(): Promise<void> {
    this.profilerTracker.restore();
    await this.reporter.publish();
  }

  async onTestCaseResult?(testCase: TestCase): Promise<void> {
    const testId = testCase.id;
    const metadata = this.metadataAccumulator.getMetadata(testId);
    const currentSuite = this.metadataAccumulator.getCurrentSuite();
    const localProfilerSteps = this.profilerTracker.getNewSteps();
    const workerProfilerSteps = this.extractWorkerProfilerSteps(testCase);
    const profilerSteps = [...localProfilerSteps, ...workerProfilerSteps];

    const result = ResultBuilder.build({ testCase, metadata, currentSuite, profilerSteps });
    this.metadataAccumulator.clearMetadata(testId);
    await this.reporter.addTestResult(result);
  }

  onTestCaseAnnotate?(testCase: TestCase, annotation: TestAnnotation): void {
    const testId = testCase.id;
    this.metadataAccumulator.parseAnnotation(testId, annotation);
  }

  onTestSuiteReady?(testSuite: TestSuite): void {
    this.metadataAccumulator.setCurrentSuite(testSuite.name);
  }

  onTestSuiteResult?(): void {
    this.metadataAccumulator.clearCurrentSuite();
  }

  private extractWorkerProfilerSteps(testCase: TestCase): TestStepType[] {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const metaSteps = (testCase.meta() as any)?._qaseProfilerSteps as string | undefined;
      if (metaSteps) {
        return JSON.parse(metaSteps) as TestStepType[];
      }
    } catch {
      // Silent failure — corrupted profiler data should not affect test results
    }
    return [];
  }
}

export default VitestQaseReporter;
