import { v4 as uuidv4 } from 'uuid';
import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum
} from "qase-javascript-commons";

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

type FixtureType = {
  id: string;
  name: string;
  path?: string;
  meta: Record<string, unknown>;
}

export type TestRunInfoType = {
  errs: TestRunErrorFormattableAdapterType[];
  warnings: string[];
  durationMs: number;
  unstable: boolean;
  screenshotPath: string;
  screenshots: ScreenshotType[];
  quarantine: Record<string, Record<'passed', boolean>>;
  skipped: boolean;
  fixture: FixtureType;
};

export type TestcafeQaseOptionsType = ConfigType;

/**
 * @class TestcafeQaseReporter
 */
export class TestcafeQaseReporter {
  /**
   * @param {Record<string, string>} meta
   * @returns {number[]}
   * @private
   */
  private static getCaseId(meta: Record<string, string>) {
    if (!meta['CID']) {
      return [];
    }

    const ids: string[] = Array.isArray(meta['CID'])
      ? meta['CID']
      : meta['CID'].split(',');

    return ids.map((id) => Number(id));
  }

  /**
   * @param {TestRunInfoType} testRunInfo
   * @returns {TestStatusEnum}
   * @private
   */
  private static getStatus(testRunInfo: TestRunInfoType) {
    if (testRunInfo.skipped) {
      return TestStatusEnum.skipped;
    } else if (testRunInfo.errs.length > 0) {
      return TestStatusEnum.failed;
    }

    return TestStatusEnum.passed;
  }

  /**
   * @param {TestRunErrorFormattableAdapterType[]} errors
   * @returns {Error}
   * @private
   */
  private static transformErrors(errors: TestRunErrorFormattableAdapterType[]) {
    const [
      errorMessages,
      errorStacks,
    ] = errors.reduce<[string[], string[]]>((
      [messages, stacks],
      error,
    ) => {
      const stack =
        error.callsite?.stackFrames?.map((line) => String(line)) ?? [];

      messages.push(error.errMsg ?? 'Error');
      stacks.push(stack.join('\n'));

      return [messages, stacks];
    }, [[], []]);

    const error = new Error(errorMessages.join('\n\n'));

    error.stack = errorStacks.join('\n\n');

    return error;
  }

  /**
   * @param {ScreenshotType[]} attachments
   * @returns {string[]}
   * @private
   */
  private static transformAttachments(attachments: ScreenshotType[]) {
    return attachments.map(({ screenshotPath }) => screenshotPath);
  }

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  /**
   * @param {TestcafeQaseOptionsType} options
   */
  public constructor(options: TestcafeQaseOptionsType) {
    this.reporter = new QaseReporter({
      ...options,
      frameworkName: 'testcafe',
      reporterName: 'testcafe-reporter-qase',
    });
  }

  /**
   * @param {string} title
   * @param {TestRunInfoType} testRunInfo
   * @param {Record<string, string>} meta
   */
  public reportTestDone = (
    title: string,
    testRunInfo: TestRunInfoType,
    meta: Record<string, string>,
  ) => {
    this.reporter.addTestResult({
      id: uuidv4(),
      testOpsId: TestcafeQaseReporter.getCaseId(meta),
      title: title,
      suiteTitle: testRunInfo.fixture.name,
      status: TestcafeQaseReporter.getStatus(testRunInfo),
      error: TestcafeQaseReporter.transformErrors(testRunInfo.errs),
      duration: testRunInfo.durationMs,
      attachments: TestcafeQaseReporter.transformAttachments(
        testRunInfo.screenshots,
      ),
    });
  };

  /**
   * @returns {Promise<void>}
   */
  public reportTaskDone = async () => {
    await this.reporter.publish();
  };
}
