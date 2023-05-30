import { v4 as uuid4 } from "uuid";
import { FullProject } from "@playwright/test";
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

const qaseIdRegExp = /(\(Qase ID: ([\d,]+)\))/;

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

  public onTestEnd(test: TestCase, testResult: TestResult) {
    const [id, ...restIds] = PlaywrightQaseReporter.getCaseIds(test.title);

    if (id) {
      const project = test.parent.project();

      this.reporter.addTestResult({
        id: test.id,
        testOpsId: [id, ...restIds],
        title: test.title,
        status: statusMap[testResult.status],
        error: testResult.error ? this.transformError(testResult.error) : undefined,
        duration: testResult.duration,
        steps: this.transformSteps(testResult.steps),
        attachments: this.transformAttachments(testResult.attachments),
        param: project ? this.transformParam(project) : undefined,
      });
    }
  }

  public onEnd() {
    this.reporter.publish();
  }

  private transformAttachments(testAttachments: AttachmentType[]) {
    return testAttachments
      .map(({ path }) => path)
      .filter((attachment): attachment is string => !!attachment);
  }

  private transformParam(project: FullProject) {
    try {
      return {
        id: uuid4(),
        dataset: JSON.stringify(project.use),
      };
    } catch (error) {/* ignore */}

    return undefined;
  }

  private transformError(testError: TestError) {
    const error = new Error(testError.message);

    error.stack = testError.stack || '';

    return error;
  }

  private transformSteps(testSteps: TestStep[]): TestStepType[] {
    return testSteps.map(({
                            error,
                            steps,
                            title,
                            ...step
                          }) => ({
      ...step,
      title,
      status: error ? StatusesEnum.failed : StatusesEnum.passed,
      error: error ? this.transformError(error) : undefined,
      steps: this.transformSteps(steps),
    }));
  }
}
