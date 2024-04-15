import has from 'lodash.has';
import get from 'lodash.get';
import { v4 as uuidv4 } from 'uuid';
import { Reporter, Test, TestResult, Config } from '@jest/reporters';
import { Status } from '@jest/test-result';

import {
  QaseReporter,
  ConfigType,
  ReporterInterface,
  TestStatusEnum,
  ConfigLoader,
  composeOptions,
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
    pending: TestStatusEnum.blocked,
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

    this.reporter = new QaseReporter({
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
    result.testResults.forEach(
      ({
         title,
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
          message: error?.message ?? null,
          muted: false,
          params: {},
          relations: {},
          run_id: null,
          signature: '',
          steps: [],
          testops_id: ids.length > 0 ? ids : null,
          id: uuidv4(),
          title: title,
          // suiteTitle: ancestorTitles,
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
}
