import { Reporter, TestCase, TestError, TestResult, TestStatus, TestStep } from '@playwright/test/reporter';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import {
  Attachment,
  composeOptions,
  CompoundError,
  ConfigLoader,
  ConfigType,
  generateSignature,
  QaseReporter,
  ReporterInterface,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { MetadataMessage, ReporterContentType } from './playwright';
import { ReporterOptionsType } from './options';

type ArrayItemType<T> = T extends (infer R)[] ? R : never;

const stepAttachRegexp = /^step_attach_(body|file)_(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})_/i;
const logMimeType = 'text/plain';

interface TestCaseMetadata {
  ids: number[];
  title: string;
  fields: Record<string, string>;
  parameters: Record<string, string>;
  groupParams: Record<string, string>;
  attachments: Attachment[];
  ignore: boolean;
  suite: string;
  comment: string;
}

const defaultSteps: string[] = ['Before Hooks', 'After Hooks', 'Worker Cleanup'];

export type PlaywrightQaseOptionsType = Omit<ConfigType, 'reporterOptions'> & {
  framework: ReporterOptionsType;
};

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

  /**
   * @param {TestCase} test
   * @returns {string[]}
   * @private
   */
  private static transformSuiteTitle(test: TestCase): string[] {
    return test.titlePath().filter(Boolean);
  }

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
      groupParams: {},
      attachments: [],
      ignore: false,
      suite: '',
      comment: '',
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

        if (message.ignore) {
          metadata.ignore = message.ignore;
        }

        if (message.suite) {
          metadata.suite = message.suite;
        }

        if (message.comment) {
          metadata.comment = message.comment;
        }

        if (message.groupParams) {
          metadata.groupParams = message.groupParams;
        }

        continue;
      }

      const matches = attachment.name.match(stepAttachRegexp);
      if (matches) {
        const step = [...this.stepCache.keys()].find((step: TestStep) => step.title === attachment.name);

        if (step) {
          this.stepCache.delete(step);
        }

        let attachmentModel: Attachment;
        if (attachment.name.match(/^step_attach_body_/i)) {
          attachmentModel = {
            content: attachment.body == undefined ? '' : attachment.body,
            file_name: decodeURIComponent(attachment.name.substring(matches[0].length)),
            file_path: null,
            mime_type: attachment.contentType,
            size: attachment.body == undefined ? 0 : Buffer.byteLength(attachment.body),
            id: uuidv4(),
          };
        } else {
          attachmentModel = {
            content: '',
            file_name: decodeURIComponent(attachment.name.substring(matches[0].length)),
            file_path: attachment.body != undefined ? attachment.body.toString() : null,
            mime_type: attachment.contentType,
            size: 0,
            id: uuidv4(),
          };
        }

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
        continue;
      }

      const attachmentModel: Attachment = {
        content: attachment.body == undefined ? '' : attachment.body,
        file_name: attachment.path == undefined ? attachment.name : path.basename(attachment.path),
        file_path: attachment.path == undefined ? null : attachment.path,
        mime_type: attachment.contentType,
        size: 0,
        id: uuidv4(),
      };

      attachments.push(attachmentModel);
    }
    metadata.attachments = attachments;

    return metadata;
  }

  /**
   * @param {TestError[]} testErrors
   * @returns {Error}
   * @private
   */
  private static transformError(testErrors: TestError[]): CompoundError {
    const compoundError = new CompoundError();

    for (const error of testErrors) {
      if (error.message == undefined) {
        continue;
      }
      compoundError.addMessage(error.message);
    }

    for (const error of testErrors) {
      if (error.stack == undefined) {
        continue;
      }
      compoundError.addStacktrace(error.stack);
    }

    return compoundError;
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

      if (defaultSteps.includes(testStep.title) && this.checkChildrenSteps(testStep.steps)) {
        continue;
      }

      const attachments = this.stepAttachments.get(testStep);

      const stepData = this.extractAndCleanStep(testStep.title);

      const id = uuidv4();
      const step: TestStepType = {
        id: id,
        step_type: StepType.TEXT,
        data: {
          action: stepData.cleanedString,
          expected_result: stepData.expectedResult,
          data: stepData.data,
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

  private options: ReporterOptionsType;

  /**
   * @param {PlaywrightQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: PlaywrightQaseOptionsType,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();
    const { framework, ...composedOptions } = composeOptions(options, config);

    this.options = options.framework ?? {};

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
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

  public onBegin(): void {
    this.reporter.startTestRun();
  }

  /**
   * @param {TestCase} test
   * @param {TestResult} result
   */
  public async onTestEnd(test: TestCase, result: TestResult) {
    const testCaseMetadata = this.transformAttachments(result.attachments);

    if (testCaseMetadata.ignore) {
      return;
    }

    const error = result.error ? PlaywrightQaseReporter.transformError(result.errors) : null;

    const extractedSuites = this.extractSuiteFromAnnotation(test.annotations);
    let suites = extractedSuites.length > 0
      ? extractedSuites
      : (testCaseMetadata.suite ? [testCaseMetadata.suite] : PlaywrightQaseReporter.transformSuiteTitle(test));

    let message: string | null = null;
    if (testCaseMetadata.comment !== '') {
      message = testCaseMetadata.comment;
    }

    if (error) {
      if (message) {
        message += '\n\n';
      } else {
        message = '';
      }

      message += error.message;
    }

    if (this.options.browser?.addAsParameter) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const browser = (test as any)._projectId ?? null;
      if (browser) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        testCaseMetadata.parameters[this.options.browser?.parameterName ?? 'browser'] = browser;
        suites = suites.filter(suite => suite !== browser);
      }
    }

    // if markAsFlaky is true and the test passed after retries, mark the test as flaky
    if (this.options.markAsFlaky && result.status === 'passed' && result.retry > 0) {
      testCaseMetadata.fields['is_flaky'] = 'true';
    }

    const testTitle = this.removeQaseIdsFromTitle(test.title);
    const testResult: TestResultType = {
      attachments: testCaseMetadata.attachments,
      author: null,
      execution: {
        status: PlaywrightQaseReporter.statusMap[result.status],
        start_time: result.startTime.valueOf() / 1000,
        end_time: null,
        duration: result.duration,
        stacktrace: error === null ?
          null : error.stacktrace === undefined ?
            null : error.stacktrace,
        thread: result.parallelIndex.toString(),
      },
      fields: testCaseMetadata.fields,
      id: uuidv4(),
      message: message,
      muted: false,
      params: testCaseMetadata.parameters,
      group_params: testCaseMetadata.groupParams,
      relations: {
        suite: {
          data: suites.filter((suite) => {
            return suite != test.title;
          }).map((suite) => {
            return {
              title: suite,
              public_id: null,
            };
          }),
        },
      },
      run_id: null,
      signature: '',
      steps: this.transformSteps(result.steps, null),
      testops_id: null,
      title: testCaseMetadata.title === '' ? testTitle : testCaseMetadata.title,
    };

    if (this.reporter.isCaptureLogs()) {
      if (result.stdout.length > 0) {
        testResult.attachments.push(this.convertLogsToAttachments(result.stdout, 'stdout.log'));
      }

      if (result.stderr.length > 0) {
        testResult.attachments.push(this.convertLogsToAttachments(result.stderr, 'stderr.log'));
      }
    }

    const ids = this.extractQaseIdsFromAnnotation(test.annotations);
    if (ids.length > 0) {
      testResult.testops_id = ids;
    } else if (testCaseMetadata.ids.length > 0) {
      testResult.testops_id = testCaseMetadata.ids;
    } else {
      testResult.testops_id = PlaywrightQaseReporter.qaseIds.get(test.title) ?? null;
    }

    testResult.signature = generateSignature(testResult.testops_id, suites, testCaseMetadata.parameters);

    await this.reporter.addTestResult(testResult);
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

  /**
   * @param {(string | Buffer)[]} logs
   * @param {string} name
   * @returns {Attachment}
   * @private
   */
  private convertLogsToAttachments(logs: (string | Buffer)[], name: string): Attachment {
    let content = '';
    for (const line of logs) {
      content = content + line.toString();
    }

    return {
      file_name: name,
      mime_type: logMimeType,
      content: content,
    } as Attachment;
  }

  /**
   * @param {string} title
   * @returns {string}
   * @private
   */
  private removeQaseIdsFromTitle(title: string): string {
    const matches = title.match(/\(Qase ID: ([0-9,]+)\)$/i);
    if (matches) {
      return title.replace(matches[0], '').trimEnd();
    }
    return title;
  }

  /**
   * @param annotation
   * @returns {number[]}
   * @private
   */
  private extractQaseIdsFromAnnotation(annotation: { type: string, description?: string }[]): number[] {
    const ids: number[] = [];
    for (const item of annotation) {
      if (item.type.toLowerCase() === 'qaseid' && item.description) {
        if (item.description.includes(',')) {
          ids.push(...item.description.split(',').map((id) => parseInt(id)));
          continue;
        }

        ids.push(parseInt(item.description));
      }
    }

    return ids;
  }

  /**
   * @param annotation
   * @returns {string[]}
   * @private
   */
  private extractSuiteFromAnnotation(annotation: { type: string, description?: string }[]): string[] {
    const suites: string[] = [];
    for (const item of annotation) {
      if (item.type.toLowerCase() === 'qasesuite' && item.description) {
        suites.push(item.description);
      }
    }

    return suites;
  }

  /**
   * @param {TestStep[]} steps
   * @returns {boolean}
   * @private
   */
  private checkChildrenSteps(steps: TestStep[]): boolean {
    if (steps.length === 0) {
      return true;
    }

    for (const step of steps) {
      if (step.category === 'test.step' || step.category === 'hook') {
        return false;
      }
    }

    return true;
  }

  private extractAndCleanStep(input: string): {
    expectedResult: string | null;
    data: string | null;
    cleanedString: string
  } {
    let expectedResult: string | null = null;
    let data: string | null = null;
    let cleanedString = input;

    const hasExpectedResult = input.includes('QaseExpRes:');
    const hasData = input.includes('QaseData:');

    if (hasExpectedResult || hasData) {
      const regex = /QaseExpRes:\s*:?\s*(.*?)\s*(?=QaseData:|$)QaseData:\s*:?\s*(.*)?/;
      const match = input.match(regex);

      if (match) {
        expectedResult = match[1]?.trim() ?? null;
        data = match[2]?.trim() ?? null;

        cleanedString = input
          .replace(/QaseExpRes:\s*:?\s*.*?(?=QaseData:|$)/, '')
          .replace(/QaseData:\s*:?\s*.*/, '')
          .trim();
      }
    }

    return { expectedResult, data, cleanedString };
  }

}
