import type { Reporter, TestCase, Vitest } from 'vitest/node';
import type { TestAnnotation } from 'vitest';
import {
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStepType,
  composeOptions,
} from 'qase-javascript-commons';
import { NetworkProfiler, NetworkProfilerOptions } from 'qase-javascript-commons/profilers';

import { MetadataAccumulator } from './modules/metadataAccumulator';
import { ProfilerTracker } from './modules/profilerTracker';
import { ResultBuilder } from './modules/resultBuilder';
import { PROFILER_OPTIONS_KEY, profilerOptionsFrom } from './modules/workerProfiler';

export type VitestQaseOptionsType = ConfigType;

export class VitestQaseReporter implements Reporter {
  private reporter: ReporterInterface;
  private profilerTracker: ProfilerTracker;
  private metadataAccumulator: MetadataAccumulator;
  private workerProfilerOptions: NetworkProfilerOptions | null;

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

    this.workerProfilerOptions = profilerOptionsFrom(composedOptions);
    const profiler = this.workerProfilerOptions ? new NetworkProfiler(this.workerProfilerOptions) : null;
    this.profilerTracker = new ProfilerTracker(profiler);
    this.metadataAccumulator = new MetadataAccumulator();
  }

  // The setup file runs in the workers and cannot see the inline reporter options otherwise.
  onInit?(vitest: Vitest): void {
    // Without `provide` (older Vitest) the setup file falls back to qase.config.json and env.
    (vitest as { provide?: (key: string, value: unknown) => void }).provide?.(
      PROFILER_OPTIONS_KEY,
      this.workerProfilerOptions,
    );
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
    const localProfilerSteps = this.profilerTracker.getNewSteps();
    const workerProfilerSteps = this.extractWorkerProfilerSteps(testCase);
    const profilerSteps = [...localProfilerSteps, ...workerProfilerSteps];

    const result = ResultBuilder.build({ testCase, metadata, profilerSteps });
    this.metadataAccumulator.clearMetadata(testId);
    await this.reporter.addTestResult(result);
  }

  onTestCaseAnnotate?(testCase: TestCase, annotation: TestAnnotation): void {
    const testId = testCase.id;
    this.metadataAccumulator.parseAnnotation(testId, annotation);
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
