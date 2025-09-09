import { v4 as uuidv4 } from 'uuid';

import {
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  composeOptions,
  Attachment,
  TestStepType,
  generateSignature,
  determineTestStatus,
} from 'qase-javascript-commons';
import { Qase } from './global';

interface CallsiteRecordType {
  filename?: string;
  lineNum?: number;
  callsiteFrameIdx?: number;
  stackFrames?: unknown[];
  isV8Frames?: boolean;
}

interface TestRunErrorFormattableAdapterType {
  userAgent: string;
  screenshotPath: string;
  testRunId: string;
  testRunPhase: string;
  type: string;
  code?: string;
  isTestCafeError?: boolean;
  callsite?: CallsiteRecordType;
  errMsg: string;
  diff?: boolean;
  id?: string;
}

interface ScreenshotType {
  screenshotPath: string;
  thumbnailPath: string;
  userAgent: string;
  quarantineAttempt: number;
  takenOnFail: boolean;
}

interface FixtureType {
  id: string;
  name: string;
  path?: string;
  meta: Record<string, unknown>;
}

enum metadataEnum {
  id = 'QaseID',
  title = 'QaseTitle',
  fields = 'QaseFields',
  parameters = 'QaseParameters',
  groupParameters = 'QaseGroupParameters',
  oldID = 'CID',
  ignore = 'QaseIgnore',
}

interface MetadataType {
  [metadataEnum.id]: number[];
  [metadataEnum.title]: string | undefined;
  [metadataEnum.fields]: Record<string, string>;
  [metadataEnum.parameters]: Record<string, string>;
  [metadataEnum.groupParameters]: Record<string, string>;
  [metadataEnum.ignore]: boolean;
}

export interface TestRunInfoType {
  errs: TestRunErrorFormattableAdapterType[];
  warnings: string[];
  durationMs: number;
  unstable: boolean;
  screenshotPath: string;
  screenshots: ScreenshotType[];
  quarantine: Record<string, Record<'passed', boolean>>;
  skipped: boolean;
  fixture: FixtureType;
}

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
      // Create error object for status determination
      const firstError = testRunInfo.errs[0];
      const error = new Error(firstError?.errMsg ?? 'Test failed');
      if (firstError?.callsite) {
        const filename = firstError.callsite.filename ?? 'unknown';
        const lineNum = firstError.callsite.lineNum ?? 'unknown';
        error.stack = `Error: ${firstError.errMsg}\n    at ${filename}:${lineNum}`;
      }
      
      return determineTestStatus(error, 'failed');
    }

    return TestStatusEnum.passed;
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

  private steps: TestStepType[] = [];
  private attachments: Attachment[] = [];
  private testBeginTime: number = Date.now();

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

    global.Qase = new Qase(this);
  }

  public addStep(step: TestStepType) {
    this.steps.push(step);
  }

  public addAttachment(attachment: Attachment) {
    this.attachments.push(attachment);
  }

  /**
   * @returns {Promise<void>}
   */
  public startTestRun = (): void => {
    this.reporter.startTestRun();
  };

  public reportTestStart = () => {
    this.steps = [];
    this.attachments = [];
    this.testBeginTime = Date.now();
  };

  /**
   * @param {string} title
   * @param {TestRunInfoType} testRunInfo
   * @param {Record<string, string>} meta
   * @param formatError
   */
  public reportTestDone = async (
    title: string,
    testRunInfo: TestRunInfoType,
    meta: Record<string, string>,
    formatError: (error: unknown, prefix: string) => string,
  ) => {
    const metadata = this.getMeta(meta);

    if (metadata[metadataEnum.ignore]) {
      return;
    }

    const errorLog = testRunInfo.errs
      .map((error, index) => formatError(error, `${index + 1} `).replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '',
      ))
      .join('\n');

    const attachments = TestcafeQaseReporter.transformAttachments(
      testRunInfo.screenshots,
    );

    attachments.push(...this.attachments);

    await this.reporter.addTestResult({
      author: null,
      execution: {
        status: TestcafeQaseReporter.getStatus(testRunInfo),
        start_time: this.testBeginTime / 1000,
        end_time: (this.testBeginTime + testRunInfo.durationMs) / 1000,
        duration: testRunInfo.durationMs,
        stacktrace: errorLog,
        thread: null,
      },
      fields: metadata[metadataEnum.fields],
      message: errorLog ? errorLog.split('\n')[0] ?? '' : '',
      muted: false,
      params: metadata[metadataEnum.parameters],
      group_params: metadata[metadataEnum.groupParameters],
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
      signature: this.getSignature(testRunInfo.fixture, title, metadata[metadataEnum.id], metadata[metadataEnum.parameters]),
      steps: this.steps,
      id: uuidv4(),
      testops_id: metadata[metadataEnum.id].length > 0 ? metadata[metadataEnum.id] : null,
      title: metadata[metadataEnum.title] != undefined ? metadata[metadataEnum.title] : title,
      attachments: attachments,
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
      QaseGroupParameters: {},
      QaseIgnore: false,
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

    if (meta[metadataEnum.groupParameters] !== undefined && meta[metadataEnum.groupParameters] !== '') {
      metadata.QaseGroupParameters = JSON.parse(meta[metadataEnum.groupParameters]) as Record<string, string>;
    }

    if (meta[metadataEnum.ignore] !== undefined && meta[metadataEnum.ignore] !== '') {
      metadata.QaseIgnore = meta[metadataEnum.ignore] === 'true';
    }

    return metadata;
  }

  /**
   * @param {FixtureType} fixture
   * @param {string} title
   * @param {number[]} ids
   * @param {Record<string, string>} parameters
   * @private
   */
  private getSignature(fixture: FixtureType, title: string, ids: number[], parameters: Record<string, string>) {
    const executionPath = process.cwd() + '/';
    const path = fixture.path?.replace(executionPath, '') ?? '';
    const suites = [];

    if (path != '') {
      suites.push(...path.split('/'));
    }

    suites.push(fixture.name.toLowerCase().replace(/\s/g, '_'));
    suites.push(title.toLowerCase().replace(/\s/g, '_'));

    return generateSignature(ids, suites, parameters);
  }
}
