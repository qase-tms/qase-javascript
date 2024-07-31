import { Reporter, TestCase, TestError, TestResult, TestStatus, TestStep } from '@playwright/test/reporter';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import * as path from 'path';

import {
  Attachment,
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { MetadataMessage, ReporterContentType } from './playwright';

type ArrayItemType<T> = T extends (infer R)[] ? R : never;

const stepAttachRegexp = /^step_attach_(body|file)_(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})_/i;
const logMimeType = 'text/plain';

interface TestCaseMetadata {
  ids: number[];
  title: string;
  fields: Record<string, string>;
  parameters: Record<string, string>;
  attachments: Attachment[];
  ignore: boolean;
  suite: string;
  comment: string;
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

  /**
   * @type {Map<string, number[]>}
   * @private
   */
  private qaseTestWithOldAnnotation: Map<string, number[]> = new Map<string, number[]>();

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
  private static transformError(testErrors: TestError[]): Error {

    let message = '';
    for (const error of testErrors) {
      if (error.message == undefined) {
        continue;
      }
      message += error.message + '\n\n';
    }

    const error = new Error(message);
    for (const error of testErrors) {
      if (error.stack == undefined) {
        continue;
      }
      error.stack += error.stack + '\n\n';
    }

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
        step_type: StepType.TEXT,
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

    this.reporter = QaseReporter.getInstance({
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
    const suites = testCaseMetadata.suite != '' ? [testCaseMetadata.suite] : PlaywrightQaseReporter.transformSuiteTitle(test);

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
          null : error.stack === undefined ?
            null : error.stack,
        thread: result.parallelIndex.toString(),
      },
      fields: testCaseMetadata.fields,
      id: uuidv4(),
      message: message,
      muted: false,
      params: testCaseMetadata.parameters,
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

    if (testCaseMetadata.ids.length > 0) {
      testResult.testops_id = testCaseMetadata.ids;
    } else {
      const ids = PlaywrightQaseReporter.qaseIds.get(testTitle) ?? null;
      testResult.testops_id = ids;
      if (ids) {
        const path = `${test.location.file}:${test.location.line}:${test.location.column}`;
        this.qaseTestWithOldAnnotation.set(path, ids);
      }
    }

    testResult.signature = this.getSignature(suites, testCaseMetadata.parameters, testResult.testops_id ?? []);

    await this.reporter.addTestResult(testResult);
  }

  /**
   * @returns {Promise<void>}
   */
  public async onEnd(): Promise<void> {
    await this.reporter.publish();

    if (this.qaseTestWithOldAnnotation.size > 0) {
      console.log(chalk`{yellow qase: Some tests are using qase(id, 'Title') syntax.}`);
      console.log(chalk`{yellow qase: Consider using the new syntax: qase.id().title() in the test body. See the docs for reference:}`);
      console.log(chalk`{yellow qase: https://github.com/qase-tms/qase-javascript/tree/main/qase-playwright#readme}`);
    }
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
   * @param {string[]} suites
   * @param {Record<string, string>} parameters
   * @param {number[]} ids
   * @private
   */
  private getSignature(suites: string[], parameters: Record<string, string>, ids: number[]): string {
    let signature = suites.map(suite =>
      suite.toLowerCase()
        .replace('/', '::')
        .replace(/\s/g, '_'),
    ).join('::');

    if (ids.length > 0) {
      signature += '::' + ids.join('::');
    }

    if (Object.keys(parameters).length !== 0) {
      signature += '::';
    }

    signature += Object.entries(parameters)
      .map(([key, value]) => `{${key}:${value}}`)
      .join('::');

    return signature;
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
}
