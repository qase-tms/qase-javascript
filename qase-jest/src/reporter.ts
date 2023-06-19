import has from 'lodash.has';
import get from 'lodash.get';
import { v4 as uuidv4 } from 'uuid';
import { Reporter, Test, TestResult, Config } from '@jest/reporters';
import { Status } from "@jest/test-result";
import {
  QaseReporter,
  ConfigType,
  ReporterInterface,
  TestStatusEnum,
} from "qase-javascript-commons";

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
   */
  public constructor(_: Config.GlobalConfig, options: JestQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'jest',
      reporterName: 'jest-qase-reporter',
    });
  }

  /**
   * @see {Reporter.onRunStart}
   */
  public onRunStart() {/* empty */}

  /**
   * @param {Test} _
   * @param {TestResult} result
   */
  public onTestResult(_: Test, result: TestResult) {
    result.testResults.forEach(
      ({
        ancestorTitles,
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

        this.reporter.addTestResult({
          id: uuidv4(),
          testOpsId: JestQaseReporter.getCaseId(title),
          title: title,
          suiteTitle: ancestorTitles,
          status: JestQaseReporter.statusMap[status],
          duration: duration ?? 0,
          error,
        });
      },
    );
  }

  /**
   * @see {Reporter.getLastError}
   */
  public getLastError() {/* empty */}

  /**
   * @see {Reporter.onRunComplete}
   */
  public onRunComplete() {
    void this.reporter.publish();
  }
}
