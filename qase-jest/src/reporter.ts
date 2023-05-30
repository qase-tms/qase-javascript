import { v4 as uuidv4 } from 'uuid';
import { Reporter, Test, TestResult, Config } from '@jest/reporters';
import { QaseReporter, OptionsType, ReporterInterface, StatusesEnum } from "qase-javascript-commons";

const statusMap = {
  passed: StatusesEnum.passed,
  failed: StatusesEnum.failed,
  skipped: StatusesEnum.skipped,
  disabled: StatusesEnum.disabled,
  pending: StatusesEnum.blocked,
  todo: StatusesEnum.disabled,
  focused: StatusesEnum.passed,
};

const qaseIdRegExp = /\(Qase ID: ([\d,]+)\)/;

export type JestQaseOptionsType = Omit<OptionsType, 'frameworkName' | 'reporterName'>;

export class JestQaseReporter implements Reporter {
  private static getCaseId(title: string) {
    const [, ids] = title.match(qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

  private reporter: ReporterInterface;

  public constructor(_: Config.GlobalConfig, options: JestQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'jest',
      reporterName: 'jest-qase-reporter',
    });
  }

  public onRunStart() {/* empty */}

  public onTestResult(_: Test, result: TestResult) {
    result.testResults.forEach(({
      ancestorTitles,
      title,
      status,
      duration,
      failureMessages,
      failureDetails,
    }) => {
      const ids = JestQaseReporter.getCaseId(title);
      const [id, ...restIds] = ids;

      if (id) {
        const error = status === 'failed'
          ? new Error(`${failureMessages.join(', ')}: ${failureDetails.join(', ')}`)
          : undefined;

        if (error) {
          error.stack = '';
        }

        this.reporter.addTestResult({
          id: uuidv4(),
          testOpsId: [id, ...restIds],
          title: `${ancestorTitles.join('\t')}\t${title}`,
          status:  statusMap[status],
          duration: duration || 0,
          error,
        });
      }
    });
  }

  public getLastError() {/* empty */}

  public onRunComplete() {
    this.reporter.publish();
  }
}
