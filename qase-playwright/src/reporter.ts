import {
  Reporter,
  TestCase,
  TestError,
  TestResult,
  TestStep,
  TestStatus,
} from '@playwright/test/reporter';
import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestStepType,
} from "qase-javascript-commons";

type ArrayItemType<T> = T extends Array<infer R> ? R : never;

export type PlaywrightQaseOptionsType = ConfigType;

/**
 * @class PlaywrightQaseReporter
 * @implements Reporter
 */
export class PlaywrightQaseReporter implements Reporter {
  /**
   * @type {Record<TestStatus, TestStatusEnum>}
   */
  static statusMap: Record<TestStatus, TestStatusEnum> = {
    passed: TestStatusEnum.passed,
    failed: TestStatusEnum.failed,
    skipped: TestStatusEnum.skipped,
    timedOut: TestStatusEnum.failed,
    interrupted: TestStatusEnum.failed,
  };

  /**
   * @type {RegExp}
   */
  static qaseIdRegExp = /\(Qase ID: ([\d,]+)\)/;

  /**
   * @param {string} title
   * @returns {number[]}
   * @private
   */
  private static getCaseIds(title: string): number[] {
    const [, ids] = title.match(PlaywrightQaseReporter.qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

  private static transformSuiteTitle(test: TestCase) {
    const [, ...titles] = test.titlePath();

    return titles;
  }

  /**
   * @param {ArrayItemType<TestResult["attachments"]>[]} testAttachments
   * @returns {string[]}
   * @private
   */
  private static transformAttachments(
    testAttachments: ArrayItemType<TestResult["attachments"]>[],
  ) {
    return testAttachments
      .map(({ path }) => path)
      .filter((attachment): attachment is string => !!attachment);
  }

  /**
   * @param {TestError} testError
   * @returns {Error}
   * @private
   */
  private static transformError(testError: TestError) {
    const error = new Error(testError.message);

    error.stack = testError.stack ?? '';

    return error;
  }

  /**
   * @param {TestStep[]} testSteps
   * @returns {TestStepType[]}
   * @private
   */
  private static transformSteps(testSteps: TestStep[]): TestStepType[] {
    return testSteps.map(({ title, duration, error, steps }) => ({
      title,
      status: error ? TestStatusEnum.failed : TestStatusEnum.passed,
      duration,
      error: error ? PlaywrightQaseReporter.transformError(error) : undefined,
      steps: PlaywrightQaseReporter.transformSteps(steps),
    }));
  }

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  /**
   * @param {PlaywrightQaseOptionsType} options
   */
  public constructor(options: PlaywrightQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'playwright',
      reporterName: 'playwright-qase-reporter',
    });
  }

  /**
   * @param {TestCase} test
   * @param {TestResult} result
   */
  public onTestEnd(test: TestCase, result: TestResult) {
    this.reporter.addTestResult({
      id: test.id,
      testOpsId: PlaywrightQaseReporter.getCaseIds(test.title),
      title: test.title,
      suiteTitle: PlaywrightQaseReporter.transformSuiteTitle(test),
      status: PlaywrightQaseReporter.statusMap[result.status],
      error: result.error
        ? PlaywrightQaseReporter.transformError(result.error)
        : undefined,
      duration: result.duration,
      steps: PlaywrightQaseReporter.transformSteps(result.steps),
      attachments: PlaywrightQaseReporter.transformAttachments(result.attachments),
    });
  }

  /**
   * @returns {Promise<void>}
   */
  public async onEnd() {
    await this.reporter.publish();
  }
}
