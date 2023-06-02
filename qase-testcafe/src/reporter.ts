import { v4 as uuidv4 } from 'uuid';
import {
  OptionsType,
  QaseReporter,
  ReporterInterface,
  StatusesEnum,
} from 'qase-javascript-commons';

type CallsiteRecordType = {
  filename?: string;
  lineNum?: number;
  callsiteFrameIdx?: number;
  stackFrames?: Array<unknown>;
  isV8Frames?: boolean;
};

type TestRunErrorFormattableAdapterType = {
  userAgent: string;
  screenshotPath: string;
  testRunId: string;
  testRunPhase: string;
  code?: string;
  isTestCafeError?: boolean;
  callsite?: CallsiteRecordType;
  errMsg?: string;
  diff?: boolean;
  id?: string;
};

type ScreenshotType = {
  screenshotPath: string;
  thumbnailPath: string;
  userAgent: string;
  quarantineAttempt: number;
  takenOnFail: boolean;
};

export type TestRunInfoType = {
  errs: TestRunErrorFormattableAdapterType[];
  warnings: string[];
  durationMs: number;
  unstable: boolean;
  screenshotPath: string;
  screenshots: ScreenshotType[];
  quarantine: Record<string, Record<'passed', boolean>>;
  skipped: boolean;
};

export type TestcafeQaseOptionsType = Omit<
  OptionsType,
  'frameworkName' | 'reporterName'
>;

export class TestcafeQaseReporter {
  private static getCaseId(meta: Record<string, string>) {
    if (!meta['CID']) {
      return [];
    }

    const ids = Array.isArray(meta['CID'])
      ? meta['CID']
      : meta['CID'].split(',');

    return ids.map((id) => Number(id));
  }

  private static getStatus(testRunInfo: TestRunInfoType) {
    if (testRunInfo.skipped) {
      return StatusesEnum.skipped;
    } else if (testRunInfo.errs.length > 0) {
      return StatusesEnum.failed;
    }

    return StatusesEnum.passed;
  }

  private static transformErrors(errors: TestRunErrorFormattableAdapterType[]) {
    const errorStrings = errors.map((error) => {
      const stack =
        error.callsite?.stackFrames?.map((line) => String(line)) || [];

      return `${error.errMsg || 'Error:'}\n${stack.join('\n')}\n`;
    });

    const error = new Error(errorStrings.join('\n'));

    error.stack = '';

    return error;
  }

  private static transformAttachments(attachments: ScreenshotType[]) {
    return attachments.map(({ screenshotPath }) => screenshotPath);
  }

  private reporter: ReporterInterface;

  public constructor(options: TestcafeQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'testcafe',
      reporterName: 'testcafe-reporter-qase',
    });
  }

  public reportTestDone = (
    title: string,
    testRunInfo: TestRunInfoType,
    meta: Record<string, string>,
  ) => {
    const [id, ...restIds] = TestcafeQaseReporter.getCaseId(meta);

    if (id) {
      this.reporter.addTestResult({
        id: uuidv4(),
        testOpsId: [id, ...restIds],
        title: title,
        status: TestcafeQaseReporter.getStatus(testRunInfo),
        error: TestcafeQaseReporter.transformErrors(testRunInfo.errs),
        duration: testRunInfo.durationMs,
        attachments: TestcafeQaseReporter.transformAttachments(
          testRunInfo.screenshots,
        ),
      });
    }
  };

  public reportTaskDone = async () => {
    await this.reporter.publish();
  };
}
