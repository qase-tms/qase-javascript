import {
  Reporter,
  TestCase,
  TestError,
  TestResult,
  TestStep,
  TestStatus,
} from '@playwright/test/reporter';
import { v4 as uuidv4 } from 'uuid';

import {
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  TestStepType,
  composeOptions,
} from 'qase-javascript-commons';

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
    return test.titlePath().filter(Boolean);
  }

  /**
   * @param {ArrayItemType<TestResult["attachments"]>[]} testAttachments
   * @returns {string[]}
   * @private
   */
  private static transformAttachments(
    testAttachments: ArrayItemType<TestResult['attachments']>[],
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
      id: uuidv4(),
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
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: PlaywrightQaseOptionsType,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();

    this.reporter = new QaseReporter({
      ...composeOptions(options, config),
      frameworkPackage: '@playwright/test',
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
      startTime: result.startTime.valueOf(),
      duration: result.duration,
      steps: PlaywrightQaseReporter.transformSteps(result.steps),
      attachments: PlaywrightQaseReporter.transformAttachments(
        result.attachments,
      ),
    });
  }

  /**
   * @returns {Promise<void>}
   */
  public async onEnd() {
    await this.reporter.publish();
  }
}
