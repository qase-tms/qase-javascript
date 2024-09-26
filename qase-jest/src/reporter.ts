import has from 'lodash.has';
import get from 'lodash.get';
import { v4 as uuidv4 } from 'uuid';
import { Config, Reporter, Test, TestResult } from '@jest/reporters';
import { AssertionResult, Status, TestCaseResult } from '@jest/test-result';

import {
  Attachment,
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  Relation,
  ReporterInterface,
  Suite,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { Qase } from './global';
import { Metadata } from './models';

export type JestQaseOptionsType = ConfigType;

/**
 * @class JestQaseReporter
 * @implements Reporter
 */
export class JestQaseReporter implements Reporter {
  /**
   * @type {Record<Status, TestStatusEnum>}
   */
  static statusMap: Record<Status, TestStatusEnum> = {
    passed: TestStatusEnum.passed,
    failed: TestStatusEnum.failed,
    skipped: TestStatusEnum.skipped,
    disabled: TestStatusEnum.disabled,
    pending: TestStatusEnum.skipped,
    todo: TestStatusEnum.disabled,
    focused: TestStatusEnum.passed,
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
  private static getCaseId(title: string): number[] {
    const [, ids] = title.match(JestQaseReporter.qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  /**
   * @type {Metadata}
   * @private
   */
  private metadata: Metadata;

  /**
   * @param {Config.GlobalConfig} _
   * @param {JestQaseOptionsType} options
   * @param {unknown} _state
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    _: Config.GlobalConfig,
    options: JestQaseOptionsType,
    _state: unknown,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();

    this.reporter = QaseReporter.getInstance({
      ...composeOptions(options, config),
      frameworkPackage: 'jest',
      frameworkName: 'jest',
      reporterName: 'jest-qase-reporter',
    });

    global.Qase = new Qase(this);
    this.metadata = this.createEmptyMetadata();
  }

  /**
   * @see {Reporter.onRunStart}
   */
  public onRunStart() {
    void this.reporter.startTestRun();
  }

  public onTestCaseResult(
    test: Test,
    testCaseResult: TestCaseResult,
  ) {

    if (this.metadata.ignore) {
      this.cleanMetadata();
      return;
    }

    const result = this.convertToResult(testCaseResult, test.path);

    if (this.metadata.title) {
      result.title = this.metadata.title;
    }

    if (this.metadata.comment) {
      result.message = this.metadata.comment;
    }

    if (this.metadata.suite) {
      result.relations = {
        suite: {
          data: [
            {
              title: this.metadata.suite,
              public_id: null,
            },
          ],
        },
      };
    }

    if (Object.keys(this.metadata.fields).length > 0) {
      result.fields = this.metadata.fields;
    }

    if (Object.keys(this.metadata.parameters).length > 0) {
      result.params = this.metadata.parameters;
    }

    if (Object.keys(this.metadata.groupParams).length > 0) {
      result.group_params = this.metadata.groupParams;
    }

    if (this.metadata.steps.length > 0) {
      result.steps = this.metadata.steps;
    }

    if (this.metadata.attachments.length > 0) {
      result.attachments = this.metadata.attachments;
    }

    this.cleanMetadata();

    void this.reporter.addTestResult(result);
  }

  /**
   * @param {Test} _
   * @param {TestResult} result
   */
  public onTestResult(_: Test, result: TestResult) {
    result.testResults.forEach(
      (value) => {

        if (value.status !== 'pending') {
          return;
        }

        const model = this.convertToResult(value, result.testFilePath);
        void this.reporter.addTestResult(model);
      },
    );
  }

  /**
   * @see {Reporter.getLastError}
   */
  public getLastError() {/* empty */
  }

  /**
   * @see {Reporter.onRunComplete}
   */
  public onRunComplete() {
    void this.reporter.publish();
  }

  /**
   * @param {string} filePath
   * @param {string} fullName
   * @param {number[]} ids
   * @private
   */
  private getSignature(filePath: string, fullName: string, ids: number[]) {
    let signature = filePath.split('/').join('::');

    signature += '::' + fullName.toLowerCase().replace(/\s/g, '_');

    if (ids.length > 0) {
      signature += '::' + ids.join('::');
    }

    return signature;
  }

  /**
   * @param {string} filePath
   * @param {string[]} suites
   * @private
   */
  private getRelations(filePath: string, suites: string[]): Relation {
    const suite: Suite = {
      data: [],
    };

    for (const part of filePath.split('/')) {
      suite.data.push({
        title: part,
        public_id: null,
      });
    }

    for (const part of suites) {
      suite.data.push({
        title: part,
        public_id: null,
      });
    }

    return {
      suite: suite,
    };
  }

  /**
   * @param {string} fullPath
   * @private
   */
  private getCurrentTestPath(fullPath: string) {
    const executionPath = process.cwd() + '/';

    return fullPath.replace(executionPath, '');
  }

  public addTitle(title: string) {
    this.metadata.title = title;
  }

  public addComment(comment: string) {
    this.metadata.comment = comment;
  }

  public addSuite(suite: string) {
    this.metadata.suite = suite;
  }

  public addFields(fields: Record<string, string>) {
    this.metadata.fields = fields;
  }

  public addParameters(parameters: Record<string, string>) {
    this.metadata.parameters = parameters;
  }

  public addGroupParams(groupParams: Record<string, string>) {
    this.metadata.groupParams = groupParams;
  }

  public addIgnore() {
    this.metadata.ignore = true;
  }

  public addStep(step: TestStepType) {
    this.metadata.steps.push(step);
  }

  public addAttachment(attachment: Attachment) {
    this.metadata.attachments.push(attachment);
  }

  private cleanMetadata() {
    this.metadata = this.createEmptyMetadata();
  }

  /**
   * @param {AssertionResult} value
   * @param {string} path
   * @private
   * @returns {TestResultType}
   */
  private convertToResult(value: AssertionResult, path: string): TestResultType {
    let error;
    if (value.status === 'failed') {
      error = new Error(value.failureDetails.map((item) => {
        if (has(item, 'matcherResult.message')) {
          return String(get(item, 'matcherResult.message'));
        }

        return 'Runtime exception';
      }).join('\n\n'));

      error.stack = value.failureMessages.join('\n\n');
    }

    const ids = JestQaseReporter.getCaseId(value.title);
    const filePath = this.getCurrentTestPath(path);

    return {
      attachments: [],
      author: null,
      execution: {
        status: JestQaseReporter.statusMap[value.status],
        start_time: null,
        end_time: null,
        duration: value.duration ?? 0,
        stacktrace: error?.stack ?? null,
        thread: null,
      },
      fields: {},
      message: error?.message ?? null,
      muted: false,
      params: {},
      group_params: {},
      relations: this.getRelations(filePath, value.ancestorTitles),
      run_id: null,
      signature: this.getSignature(filePath, value.fullName, ids),
      steps: [],
      testops_id: ids.length > 0 ? ids : null,
      id: uuidv4(),
      title: value.title,
    };
  }

  /**
   * @returns {Metadata}
   * @private
   */
  private createEmptyMetadata(): Metadata {
    return {
      title: undefined,
      ignore: false,
      comment: undefined,
      suite: undefined,
      fields: {},
      parameters: {},
      groupParams: {},
      steps: [],
      attachments: [],
    };
  }
}
