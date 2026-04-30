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
  TestResultType,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { normalizeSuitePart } from 'qase-javascript-commons/internal';
import { Qase } from './global';
import { configSchema } from './configSchema';
import { ReporterOptionsType } from './options';
import {
  ScreenshotType,
  FixtureType,
  metadataEnum,
  TestRunInfoType,
} from './types';
import { MetadataParser } from './modules/metadataParser';
import { ProfilerTracker } from './modules/profilerTracker';
import { BrowserNameResolver } from './modules/browserNameResolver';

export type { TestRunInfoType };

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
  private profilerTracker: ProfilerTracker;
  private userAgents: string[] = [];
  private browserOptions: ReporterOptionsType['browser'];

  /**
   * @param {TestcafeQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: TestcafeQaseOptionsType,
    configLoader = new ConfigLoader(configSchema),
  ) {
    const config = configLoader.load();

    const { framework, ...composedOptions } = composeOptions(options, config);
    this.browserOptions = framework?.testcafe?.browser;
    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'testcafe',
      frameworkName: 'testcafe',
      reporterName: 'testcafe-reporter-qase',
    });

    let profiler: NetworkProfiler | null = null;
    if (composedOptions.profilers?.includes('network')) {
      profiler = new NetworkProfiler({
        skipDomains: composedOptions.networkProfiler?.skip_domains,
        trackOnFail: composedOptions.networkProfiler?.track_on_fail,
      });
      profiler.enable();
    }
    this.profilerTracker = new ProfilerTracker(profiler);

    // @ts-expect-error - global.Qase is dynamically added at runtime
    global.Qase = new Qase(this);
  }

  public setUserAgents(userAgents: string[]) {
    this.userAgents = userAgents;
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
    this.profilerTracker.onTestStart();
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
    const metadata = MetadataParser.parse(meta);

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

    const profilerSteps: TestStepType[] = this.profilerTracker.getEvents();
    this.profilerTracker.reset();

    const projectMapping = metadata[metadataEnum.projects];

    const params = { ...metadata[metadataEnum.parameters] };
    if (this.browserOptions?.addAsParameter) {
      const browserName = BrowserNameResolver.resolve(testRunInfo, this.userAgents);
      if (browserName) {
        const paramName = this.browserOptions.parameterName ?? 'browser';
        params[paramName] = browserName;
      }
    }

    const result = {
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
      tags: metadata[metadataEnum.tags],
      message: errorLog ? errorLog.split('\n')[0] ?? '' : '',
      muted: false,
      params: params,
      group_params: metadata[metadataEnum.groupParameters],
      relations: {
        suite: {
          data: metadata[metadataEnum.suite]
            ? metadata[metadataEnum.suite].split('\t').map((s) => ({
                title: s,
                public_id: null,
              }))
            : [
                {
                  title: testRunInfo.fixture.name,
                  public_id: null,
                },
              ],
        },
      },
      run_id: null,
      signature: this.getSignature(testRunInfo.fixture, title, metadata[metadataEnum.id], params),
      steps: [...this.steps, ...profilerSteps],
      id: uuidv4(),
      testops_id: metadata[metadataEnum.id].length > 0 ? metadata[metadataEnum.id] : null,
      title: metadata[metadataEnum.title] != undefined ? metadata[metadataEnum.title] : title,
      attachments: attachments,
      testops_project_mapping: (projectMapping && Object.keys(projectMapping).length > 0) ? projectMapping : null,
    } as unknown as TestResultType;

    await this.reporter.addTestResult(result);
  };

  /**
   * @returns {Promise<void>}
   */
  public reportTaskDone = async (): Promise<void> => {
    this.profilerTracker.restore();
    await this.reporter.publish();
  };

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

    suites.push(normalizeSuitePart(fixture.name));
    suites.push(normalizeSuitePart(title));

    return generateSignature(ids, suites, parameters);
  }

}
