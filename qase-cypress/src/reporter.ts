// import { spawnSync } from 'child_process';

import { MochaOptions, reporters, Runner, Suite, Test } from 'mocha';

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

const {
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_SUITE_END
} = Runner.constants;

type CypressState = 'failed' | 'passed' | 'pending';

export type CypressQaseOptionsType = Omit<MochaOptions, 'reporterOptions'> & {
  reporterOptions: ReporterOptionsType;
};

/**
 * @class CypressQaseReporter
 * @extends reporters.Base
 */
export class CypressQaseReporter extends reporters.Base {
  /**
   * @type {RegExp}
   */
  /** @deprecated Use parseProjectMappingFromTitle from qase-javascript-commons for multi-project support. */
  static qaseIdRegExp = /\(Qase ID:? ([\d,]+)\)/;

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
    super(runner, options);

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
   * Check if a test was processed
   * @param {Test} test
   * @returns {boolean}
   * @private
   */
  private isTestProcessed(test: Test): boolean {
    return this.tracker.isProcessed(test);
  }

  /**
   * Handle skipped tests in a suite when beforeEach hook fails
   * @param {Suite} suite
   * @private
   */
  /**
   * Recursively collect all tests from a suite and its nested suites
   * @param {Suite} suite
   * @param {Test[]} tests
   * @private
   */
  private collectAllTestsFromSuite(suite: Suite, tests: Test[]): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suiteTests = suite.tests ?? [];
    tests.push(...suiteTests);

    // Recursively process nested suites
    const nestedSuites = suite.suites ?? [];
    for (const nestedSuite of nestedSuites) {
      this.collectAllTestsFromSuite(nestedSuite, tests);
    }
  }

  private handleSkippedTestsInSuite(suite: Suite): void {
    // Collect all tests from this suite and nested suites recursively
    const allTests: Test[] = [];
    this.collectAllTestsFromSuite(suite, allTests);

    // Find tests that were not processed (skipped due to beforeEach failure)
    for (const test of allTests) {     
      // Skip if test was already processed (e.g., first test that got EVENT_TEST_FAIL)
      if (!this.isTestProcessed(test)) {
        // Test was skipped due to beforeEach failure, report it as skipped
        this.addSkippedTestResult(test);
      }
    }
  }

  /**
     * Add a test result for a skipped test (due to beforeEach failure)
     * @param {Test} test
     * @private
     */
  private addSkippedTestResult(test: Test): void {
    const result = this.resultBuilder.buildSkipped({
      test,
      screenshotsFolder: this.screenshotsFolder,
      testBeginTime: this.testBeginTime,
    });
    void this.reporter.addTestResult(result);
    this.markTestAsProcessed(test);
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
