// import { spawnSync } from 'child_process';

import type { MochaOptions, Runner, Suite, Test } from 'mocha';

import {
  composeOptions,
  ConfigLoader,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
} from 'qase-javascript-commons';

import { configSchema } from './configSchema';
import { ReporterOptionsType } from './options';
import { MetadataManager } from './metadata/manager';
import { ResultsManager } from './metadata/resultsManager';
import { TestTracker } from './test-tracker';
import { StepConverter } from './step-converter';
import { ResultBuilder } from './result-builder';
import { SkippedTestHandler } from './skipped-test-handler';

// Mocha's Runner.constants, inlined so the reporter does not load mocha at runtime:
// Cypress drives the reporter with its own bundled mocha, and a required peer would install a second copy.
const EVENT_TEST_FAIL = 'fail';
const EVENT_TEST_PASS = 'pass';
const EVENT_TEST_PENDING = 'pending';
const EVENT_RUN_END = 'end';
const EVENT_TEST_BEGIN = 'test';
const EVENT_SUITE_END = 'suite end';

type CypressState = 'failed' | 'passed' | 'pending';

export type CypressQaseOptionsType = Omit<MochaOptions, 'reporterOptions'> & {
  reporterOptions: ReporterOptionsType;
};

/**
 * @class CypressQaseReporter
 */
export class CypressQaseReporter {
  /**
   * @type {Record<CypressState, TestStatusEnum>}
   */
  static statusMap: Record<CypressState, TestStatusEnum> = {
    failed: TestStatusEnum.failed,
    passed: TestStatusEnum.passed,
    pending: TestStatusEnum.skipped,
  };

  /**
   * @type {string | undefined}
   * @private
   */
  private screenshotsFolder: string | undefined;

  // /**
  //  * @type {string | undefined}
  //  * @private
  //  */
  // private videosFolder: string | undefined;

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  private testBeginTime: number = Date.now();

  /**
   * Tracks processed tests to identify ones skipped when beforeEach fails.
   * @type {TestTracker}
   * @private
   */
  private tracker: TestTracker = new TestTracker();

  private stepConverter: StepConverter = new StepConverter();

  private resultBuilder: ResultBuilder = new ResultBuilder(this.stepConverter);

  private skippedHandler!: SkippedTestHandler;

  // private options: Omit<(FrameworkOptionsType<'cypress', ReporterOptionsType> & ConfigType & ReporterOptionsType & NonNullable<unknown>) | (null & ReporterOptionsType & NonNullable<unknown>), 'framework'>;

  /**
   * @param {Runner} runner
   * @param {CypressQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    runner: Runner,
    options: CypressQaseOptionsType,
    configLoader = new ConfigLoader(configSchema),
  ) {
    const { reporterOptions } = options;
    const config = configLoader.load();
    const { framework, ...composedOptions } = composeOptions(reporterOptions, config);

    this.screenshotsFolder = framework?.cypress?.screenshotsFolder;
    // this.videosFolder = framework?.cypress?.videosFolder;
    // this.options = composedOptions;

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'cypress',
      frameworkName: 'cypress',
      reporterName: 'cypress-qase-reporter',
    });

    this.skippedHandler = new SkippedTestHandler(
      this.tracker,
      this.resultBuilder,
      (result) => { void this.reporter.addTestResult(result); },
      () => ({
        screenshotsFolder: this.screenshotsFolder,
        testBeginTime: this.testBeginTime,
      }),
    );

    this.addRunnerListeners(runner);
  }

  /**
   * @param {Runner} runner
   * @private
   */
  private addRunnerListeners(runner: Runner) {
    runner.on(EVENT_TEST_PASS, (test: Test) => {
      this.markTestAsProcessed(test);
      this.addTestResult(test);
    });
    runner.on(EVENT_TEST_PENDING, (test: Test) => {
      this.markTestAsProcessed(test);
      this.addTestResult(test);
    });
    runner.on(EVENT_TEST_FAIL, (test: Test) => {
      this.markTestAsProcessed(test);
      this.addTestResult(test);
    });
    runner.on(EVENT_TEST_BEGIN, () => {
      this.testBeginTime = Date.now();
      MetadataManager.clear();
    });
    runner.on(EVENT_SUITE_END, (suite: Suite) => {
      this.handleSkippedTestsInSuite(suite);
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    runner.once(EVENT_RUN_END, () => {
      const results = this.reporter.getResults();
      ResultsManager.setResults(results);
    });
  }

  /**
   * Mark a test as processed
   * @param {Test} test
   * @private
   */
  private markTestAsProcessed(test: Test): void {
    this.tracker.markProcessed(test);
  }

  /**
   * Handle skipped tests in a suite when beforeEach hook fails
   * @param {Suite} suite
   * @private
   */
  private handleSkippedTestsInSuite(suite: Suite): void {
    this.skippedHandler.handleSuiteEnd(suite);
  }

  /**
   * @param {Test} test
   * @private
   */
  private addTestResult(test: Test) {
    const metadata = MetadataManager.getMetadata();
    const isCucumber = (metadata?.cucumberSteps?.length ?? 0) > 0;
    const result = this.resultBuilder.build({
      test,
      metadata,
      screenshotsFolder: this.screenshotsFolder,
      testBeginTime: this.testBeginTime,
      isCucumber,
      options: {} as ReporterOptionsType,
    });

    if (result === null) {
      this.markTestAsProcessed(test);
      MetadataManager.clear();
      return;
    }

    void this.reporter.addTestResult(result);
    MetadataManager.clear();
  }
}
