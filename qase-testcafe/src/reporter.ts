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

enum metadataEnum {
  id = 'QaseID',
  title = 'QaseTitle',
  fields = 'QaseFields',
  parameters = 'QaseParameters',
  oldID = 'CID',
}

interface MetadataType {
  [metadataEnum.id]: number[];
  [metadataEnum.title]: string | undefined;
  [metadataEnum.fields]: Record<string, string>;
  [metadataEnum.parameters]: Record<string, string>;
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
   * @param {TestRunInfoType} testRunInfo
   * @returns {TestStatusEnum}
   * @private
   */
  private static getStatus(testRunInfo: TestRunInfoType): TestStatusEnum {
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
    const attachments: Attachment[] = [];

    for (const screenshot of screenshots) {
      attachments.push({
        file_name: screenshot.screenshotPath,
        file_path: screenshot.screenshotPath,
        mime_type: '',
        content: '',
        size: 0,
        id: uuidv4(),
      });
    }

    return attachments;
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

    this.reporter = QaseReporter.getInstance({
      ...composeOptions(options, config),
      frameworkPackage: 'testcafe',
      frameworkName: 'testcafe',
      reporterName: 'testcafe-reporter-qase',
    });
  }

  /**
   * @returns {Promise<void>}
   */
  public startTestRun = (): void => {
    void this.reporter.startTestRun();
  };

  /**
   * @param {string} title
   * @param {TestRunInfoType} testRunInfo
   * @param {Record<string, string>} meta
   */
  public reportTestDone = async (
    title: string,
    testRunInfo: TestRunInfoType,
    meta: Record<string, string>,
  ) => {
    const error = TestcafeQaseReporter.transformErrors(testRunInfo.errs);
    const metadata = this.getMeta(meta);
    await this.reporter.addTestResult({
      author: null,
      execution: {
        status: TestcafeQaseReporter.getStatus(testRunInfo),
        start_time: null,
        end_time: null,
        duration: testRunInfo.durationMs,
        stacktrace: error.stack ?? null,
        thread: null,
      },
      fields: metadata[metadataEnum.fields],
      message: error.message,
      muted: false,
      params: metadata[metadataEnum.parameters],
      relations: {
        suite: {
          data: [
            {
              title: testRunInfo.fixture.name,
              public_id: null,
            },
          ],
        },
      },
      run_id: null,
      signature: `${testRunInfo.fixture.name}::${title}`,
      steps: [],
      id: uuidv4(),
      testops_id: metadata[metadataEnum.id].length > 0 ? metadata[metadataEnum.id] : null,
      title: metadata[metadataEnum.title] != undefined ? metadata[metadataEnum.title] : title,
      attachments: TestcafeQaseReporter.transformAttachments(
        testRunInfo.screenshots,
      ),
    });
  };

  /**
   * @returns {Promise<void>}
   */
  public reportTaskDone = async (): Promise<void> => {
    await this.reporter.publish();
  };

  private getMeta(meta: Record<string, string>) {
    const metadata: MetadataType = {
      QaseID: [],
      QaseTitle: undefined,
      QaseFields: {},
      QaseParameters: {},
    };

    if (meta[metadataEnum.oldID] !== undefined && meta[metadataEnum.oldID] !== '') {
      const v = meta[metadataEnum.oldID].split(',');
      metadata.QaseID = Array.isArray(v) ? v.map(Number) : [Number(v)];
    }

    if (meta[metadataEnum.id] !== undefined && meta[metadataEnum.id] !== '') {
      const v = meta[metadataEnum.id].split(',');
      metadata.QaseID = Array.isArray(v) ? v.map(Number) : [Number(v)];
    }

    if (meta[metadataEnum.title] !== undefined && meta[metadataEnum.title] !== '') {
      metadata.QaseTitle = meta[metadataEnum.title];
    }

    if (meta[metadataEnum.fields] !== undefined && meta[metadataEnum.fields] !== '') {
      metadata.QaseFields = JSON.parse(meta[metadataEnum.fields]) as Record<string, string>;
    }

    if (meta[metadataEnum.parameters] !== undefined && meta[metadataEnum.parameters] !== '') {
      metadata.QaseParameters = JSON.parse(meta[metadataEnum.parameters]) as Record<string, string>;
    }

    return metadata;
  }
}
