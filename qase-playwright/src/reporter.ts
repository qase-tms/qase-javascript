import { Reporter, TestCase, TestError, TestResult, TestStatus, TestStep } from '@playwright/test/reporter';
import { v4 as uuidv4 } from 'uuid';

import {
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  StepStatusEnum,
  TestStatusEnum,
  TestStepType,
  Attachment
} from 'qase-javascript-commons';

type ArrayItemType<T> = T extends (infer R)[] ? R : never;

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

  // private static transformSuiteTitle(test: TestCase) {
  //   return test.titlePath().filter(Boolean);
  // }

  /**
   * @param {ArrayItemType<TestResult['attachments']>[]} testAttachments
   * @returns {string[]}
   * @private
   */
  private static transformAttachments(
    testAttachments: ArrayItemType<TestResult['attachments']>[],
  ): Attachment[] {
    const attachments: Attachment[] = [];

    for (const attachment of testAttachments) {

      attachments.push({
        content: attachment.body,
        file_name: attachment.name,
        file_path: attachment.path == undefined ? null : attachment.path,
        mime_type: attachment.contentType,
        size: 0,
        id: uuidv4(),
      });

    }
    return attachments;
  }

  /**
   * @param {TestError} testError
   * @returns {Error}
   * @private
   */
  private static transformError(testError: TestError): Error {
    const error = new Error(testError.message);

    error.stack = testError.stack ?? '';

    return error;
  }

  /**
   * @param {TestStep[]} testSteps
   * @param parentId
   * @returns {TestStepType[]}
   * @private
   */
  private static transformSteps(testSteps: TestStep[], parentId: string | null): TestStepType[] {
    const steps: TestStepType[] = [];

    for (const testStep of testSteps) {
      const id = uuidv4();
      const step: TestStepType = {
        id: id,
        step_type: 'text',
        data: {
          action: testStep.title,
          expected_result: null,
        },
        parent_id: parentId,
        execution: {
          status: testStep.error ? StepStatusEnum.failed : StepStatusEnum.passed,
          start_time: testStep.startTime.valueOf() / 1000,
          duration: testStep.duration,
          end_time: null,
        },
        attachments: [],
        steps: PlaywrightQaseReporter.transformSteps(testStep.steps, id),
      };

      steps.push(step);
    }

    return steps;
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
    const error = result.error ? PlaywrightQaseReporter.transformError(result.error) : null;
    const ids = PlaywrightQaseReporter.getCaseIds(test.title);
    this.reporter.addTestResult({
      attachments: PlaywrightQaseReporter.transformAttachments(
        result.attachments,
      ),
      author: null,
      execution: {
        status: PlaywrightQaseReporter.statusMap[result.status],
        start_time: result.startTime.valueOf() / 1000,
        end_time: null,
        duration: result.duration,
        stacktrace: error
          ? error.stack ? error.stack : null
          : null,
        thread: null,
      },
      fields: new Map(),
      id: test.id,
      message: error
        ? error.message ? error.message : null
        : null,
      muted: false,
      params: new Map(),
      relations: [],
      run_id: null,
      signature: '',
      steps: PlaywrightQaseReporter.transformSteps(result.steps, null),
      // suiteTitle: PlaywrightQaseReporter.transformSuiteTitle(test),
      testops_id: ids[0] ?? null,
      title: test.title,
    });
  }

  /**
   * @returns {Promise<void>}
   */
  public async onEnd() {
    await this.reporter.publish();
  }
}
