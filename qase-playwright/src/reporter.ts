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
  Attachment, TestResultType,
} from 'qase-javascript-commons';
import { MetadataMessage, ReporterContentType } from './playwright';

type ArrayItemType<T> = T extends (infer R)[] ? R : never;

const stepAttachRegexp = /^step_attach_(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})_/i;

interface TestCaseMetadata {
  ids: number[];
  title: string;
  fields: Record<string, string>;
  parameters: Record<string, string>;
  attachments: Attachment[];
}

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
   * @type {Map<string, number[]>}
   * @private
   */
  private static qaseIds: Map<string, number[]> = new Map<string, number[]>();

  // private static transformSuiteTitle(test: TestCase) {
  //   return test.titlePath().filter(Boolean);
  // }

  /**
   * @type {Map<TestStep, TestCase>}
   * @private
   */
  private stepCache: Map<TestStep, TestCase> = new Map<TestStep, TestCase>();

  /**
   * @type {Map<string, TestStep>}
   * @private
   */
  private stepAttachments: Map<TestStep, Attachment[]> = new Map<TestStep, Attachment[]>();

  /**
   * @param {ArrayItemType<TestResult['attachments']>[]} testAttachments
   * @returns {TestCaseMetadata}
   * @private
   */
  private transformAttachments(
    testAttachments: ArrayItemType<TestResult['attachments']>[],
  ): TestCaseMetadata {
    const metadata: TestCaseMetadata = {
      ids: [],
      title: '',
      fields: {},
      parameters: {},
      attachments: [],
    };
    const attachments: Attachment[] = [];

    for (const attachment of testAttachments) {

      if (attachment.contentType === ReporterContentType) {
        if (attachment.body == undefined) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const message: MetadataMessage = JSON.parse(attachment.body.toString());

        if (message.title) {
          metadata.title = message.title;
        }

        if (message.ids) {
          metadata.ids = message.ids;
        }

        if (message.fields) {
          metadata.fields = message.fields;
        }

        if (message.parameters) {
          metadata.parameters = message.parameters;
        }

        continue;
      }

      if (attachment.name.match(stepAttachRegexp)) {
        const step = [...this.stepCache.keys()].find((step: TestStep) => step.title === attachment.name);

        if (step) {
          this.stepCache.delete(step);
        }

        const attachmentModel: Attachment = {
          content: attachment.body,
          file_name: attachment.name,
          file_path: attachment.path == undefined ? null : attachment.path,
          mime_type: attachment.contentType,
          size: 0,
          id: uuidv4(),
        };

        if (step?.parent) {
          if (!this.stepAttachments.has(step.parent)) {
            this.stepAttachments.set(step.parent, [attachmentModel]);
            continue;
          }

          const stepAttachs = this.stepAttachments.get(step.parent);
          if (stepAttachs) {
            stepAttachs.push(attachmentModel);
            this.stepAttachments.set(step.parent, stepAttachs);
          }
          continue;
        }

        attachments.push(attachmentModel);
      }
    }
    metadata.attachments = attachments;

    return metadata;
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
  private transformSteps(testSteps: TestStep[], parentId: string | null): TestStepType[] {
    const steps: TestStepType[] = [];

    for (const testStep of testSteps) {
      if ((testStep.category !== 'test.step' && testStep.category !== 'hook')
        || testStep.title.match(stepAttachRegexp)) {
        continue;
      }

      const attachments = this.stepAttachments.get(testStep);

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
        attachments: attachments ? attachments : [],
        steps: this.transformSteps(testStep.steps, id),
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
   * @param _result
   * @param step
   */
  onStepBegin(test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category !== 'test.step') {
      return;
    }
    if (this.stepCache.get(step)) {
      return;
    }
    this.stepCache.set(step, test);
  }

  /**
   * @param {TestCase} test
   * @param {TestResult} result
   */
  public onTestEnd(test: TestCase, result: TestResult) {
    const testCaseMetadata = this.transformAttachments(result.attachments);
    const error = result.error ? PlaywrightQaseReporter.transformError(result.error) : null;

    const testResult: TestResultType = {
      attachments: testCaseMetadata.attachments,
      author: null,
      execution: {
        status: PlaywrightQaseReporter.statusMap[result.status],
        start_time: result.startTime.valueOf() / 1000,
        end_time: null,
        duration: result.duration,
        stacktrace: error
          ? error.stack ? error.stack : null
          : null,
        thread: result.parallelIndex.toString(),
      },
      fields: testCaseMetadata.fields,
      id: uuidv4(),
      message: error
        ? error.message ? error.message : null
        : null,
      muted: false,
      params: testCaseMetadata.parameters,
      relations: [],
      run_id: null,
      signature: '',
      steps: this.transformSteps(result.steps, null),
      // suiteTitle: PlaywrightQaseReporter.transformSuiteTitle(test),
      testops_id: null,
      title: testCaseMetadata.title === '' ? test.title : testCaseMetadata.title,
    };

    if (testCaseMetadata.ids.length > 0) {
      testResult.testops_id = testCaseMetadata.ids;
    } else {
      testResult.testops_id = PlaywrightQaseReporter.qaseIds.get(test.title) ?? null;
    }

    this.reporter.addTestResult(testResult);
  }

  /**
   * @returns {Promise<void>}
   */
  public async onEnd(): Promise<void> {
    await this.reporter.publish();
  }

  // add this method for supporting old version of qase
  public static addIds(ids: number[], title: string): void {
    this.qaseIds.set(title, ids);
  }
}
