import has from 'lodash.has';
import get from 'lodash.get';
import { v4 as uuidv4 } from 'uuid';
import { Config, Reporter, Test, TestResult } from '@jest/reporters';
import { Status } from '@jest/test-result';

import {
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  Relation,
  ReporterInterface,
  Suite,
  TestStatusEnum,
} from 'qase-javascript-commons';

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
   * @returns {any}
   * @private
   */
  private static getCaseId(title: string) {
    const [, ids] = title.match(JestQaseReporter.qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

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
  }

  /**
   * @see {Reporter.onRunStart}
   */
  public onRunStart() {
    void this.reporter.startTestRun();
  }

  /**
   * @param {Test} _
   * @param {TestResult} result
   */
  public onTestResult(_: Test, result: TestResult) {
    console.log(result);
    result.testResults.forEach(
      ({
         title,
         fullName,
         ancestorTitles,
         status,
         duration,
         failureMessages,
         failureDetails,
       }) => {
        let error;
        if (status === 'failed') {
          error = new Error(failureDetails.map((item) => {
            if (has(item, 'matcherResult.message')) {
              return String(get(item, 'matcherResult.message'));
            }

            return 'Runtime exception';
          }).join('\n\n'));

          error.stack = failureMessages.join('\n\n');
        }

        const ids = JestQaseReporter.getCaseId(title);
        const filePath = this.getCurrentTestPath(result.testFilePath);

        void this.reporter.addTestResult({
          attachments: [],
          author: null,
          execution: {
            status: JestQaseReporter.statusMap[status],
            start_time: null,
            end_time: null,
            duration: duration ?? 0,
            stacktrace: error?.stack ?? null,
            thread: null,
          },
          fields: {},
          message: null,
          muted: false,
          params: {},
          relations: this.getRelations(filePath, ancestorTitles),
          run_id: null,
          signature: this.getSignature(filePath, fullName, ids),
          steps: [],
          testops_id: ids.length > 0 ? ids : null,
          id: uuidv4(),
          title: title,
        });
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
}
