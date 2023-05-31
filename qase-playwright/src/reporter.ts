import { Reporter, TestCase, TestError, TestResult, TestStep } from "@playwright/test/reporter";
import { OptionsType, QaseReporter, ReporterInterface, StatusesEnum, TestStepType } from "qase-javascript-commons";

type AttachmentType = TestResult['attachments'] extends Array<infer T> ? T : never;

const statusMap = {
  passed: StatusesEnum.passed,
  failed: StatusesEnum.failed,
  skipped: StatusesEnum.skipped,
  disabled: StatusesEnum.disabled,
  pending: StatusesEnum.blocked,
  timedOut: StatusesEnum.failed,
  interrupted: StatusesEnum.failed,
};

const qaseIdRegExp = /\(Qase ID: ([\d,]+)\)/;

export type PlaywrightQaseOptionsType = Omit<OptionsType, 'frameworkName' | 'reporterName'>;

export class PlaywrightQaseReporter implements Reporter {
  private static getCaseIds(title: string): number[] {
    const [, ids] = title.match(qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

  private reporter: ReporterInterface;

  public constructor(options: PlaywrightQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'playwright',
      reporterName: 'playwright-qase-reporter',
    });
  }

  public onTestEnd(test: TestCase, result: TestResult) {
    const [id, ...restIds] = PlaywrightQaseReporter.getCaseIds(test.title);

    if (id) {
      this.reporter.addTestResult({
        id: test.id,
        testOpsId: [id, ...restIds],
        title: test.title,
        status: statusMap[result.status],
        error: result.error ? this.transformError(result.error) : undefined,
        duration: result.duration,
        steps: this.transformSteps(result.steps),
        attachments: this.transformAttachments(result.attachments),
      });
    }
  }

  public async onEnd() {
    await this.reporter.publish();
  }

  private transformAttachments(testAttachments: AttachmentType[]) {
    return testAttachments
      .map(({ path }) => path)
      .filter((attachment): attachment is string => !!attachment);
  }

  private transformError(testError: TestError) {
    const error = new Error(testError.message);

    error.stack = testError.stack || '';

    return error;
  }

  private transformSteps(testSteps: TestStep[]): TestStepType[] {
    return testSteps.map(({
      title,
      duration,
      error,
      steps,
    }) => ({
      title,
      status: error ? StatusesEnum.failed : StatusesEnum.passed,
      duration,
      error: error ? this.transformError(error) : undefined,
      steps: this.transformSteps(steps),
    }));
  }
}
