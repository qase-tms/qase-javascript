import { v4 as uuidv4 } from 'uuid';

import {
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  composeOptions,
  Attachment,
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

type FixtureType = {
  id: string;
  name: string;
  path?: string;
  meta: Record<string, unknown>;
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
  private static transformErrors(errors: TestRunErrorFormattableAdapterType[]): Error {
    const [errorMessages, errorStacks] = errors.reduce<[string[], string[]]>(
      ([messages, stacks], error) => {
        const stack =
          error.callsite?.stackFrames?.map((line) => String(line)) ?? [];

        messages.push(error.errMsg ?? 'Error');
        stacks.push(stack.join('\n'));

        return [messages, stacks];
      },
      [[], []],
    );

    const error = new Error(errorMessages.join('\n\n'));

    error.stack = errorStacks.join('\n\n');

    return error;
  }

  /**
   * @param {ScreenshotType[]} screenshots
   * @returns {Attachment[]}
   * @private
   */
  private static transformAttachments(screenshots: ScreenshotType[]): Attachment[] {
    const attachs: Attachment[] = [];

    for (const screenshot of screenshots) {
      attachs.push({
        file_name: screenshot.screenshotPath,
        file_path: screenshot.screenshotPath,
        mime_type: '',
        content: '',
        size: 0,
        id: uuidv4(),
      });
    }

    return attachs;
  }

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  /**
   * @param {TestcafeQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: TestcafeQaseOptionsType,
    configLoader = new ConfigLoader(),
  ) {
    const config = configLoader.load();

    this.reporter = new QaseReporter({
      ...composeOptions(options, config),
      frameworkPackage: 'testcafe',
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
    const error = TestcafeQaseReporter.transformErrors(testRunInfo.errs);
    const ids = TestcafeQaseReporter.getCaseId(meta);
    this.reporter.addTestResult({
      author: null,
      execution: {
        status: TestcafeQaseReporter.getStatus(testRunInfo),
        start_time: null,
        end_time: null,
        duration: testRunInfo.durationMs,
        stacktrace: error.stack ?? null,
        thread: null,
      },
      fields: {},
      message: error.message,
      muted: false,
      params: {},
      relations: {},
      run_id: null,
      signature: '',
      steps: [],
      id: uuidv4(),
      testops_id: ids.length > 0 ? ids : null,
      title: title,
      // suiteTitle: testRunInfo.fixture.name,
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
