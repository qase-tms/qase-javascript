import {
  ConfigLoader,
  ConfigType,
  QaseReporter,
  ReporterInterface,
  composeOptions,
  Attachment,
  TestStepType,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { Qase } from './global';
import { configSchema } from './configSchema';
import { ReporterOptionsType } from './options';
import {
  metadataEnum,
  TestRunInfoType,
  TestStartInfoType,
} from './types';
import { MetadataParser } from './modules/metadataParser';
import { ProfilerTracker } from './modules/profilerTracker';
import { BrowserNameResolver } from './modules/browserNameResolver';
import { ResultBuilder } from './modules/resultBuilder';
import { currentTestRunId } from './modules/testRunContext';

export type { TestRunInfoType };

export type TestcafeQaseOptionsType = ConfigType;

interface RecordedType {
  steps: TestStepType[];
  attachments: Attachment[];
}

const emptyRecord = (): RecordedType => ({ steps: [], attachments: [] });

/**
 * @class TestcafeQaseReporter
 */
export class TestcafeQaseReporter {
  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  // Tests run concurrently with `-c` and per browser, so what a test records is kept by its test run.
  private readonly recorded = new Map<string, RecordedType>();
  // Calls made where no test run can be resolved.
  private unattributed: RecordedType = emptyRecord();
  private readonly startTimes = new Map<string, number>();
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

  public addStep(step: TestStepType, testRunId = currentTestRunId()) {
    this.recordOf(testRunId).steps.push(step);
  }

  public addAttachment(attachment: Attachment, testRunId = currentTestRunId()) {
    this.recordOf(testRunId).attachments.push(attachment);
  }

  private recordOf(testRunId: string | null): RecordedType {
    if (!testRunId) {
      return this.unattributed;
    }
    let record = this.recorded.get(testRunId);
    if (!record) {
      record = emptyRecord();
      this.recorded.set(testRunId, record);
    }
    return record;
  }

  /**
   * TestCafe reports a test once for all its browsers. Steps come from the first browser, since
   * every browser runs the same ones; attachments from all. Quarantine attempts before the
   * final one are dropped.
   */
  private takeRecorded(testRunInfo: TestRunInfoType): RecordedType {
    const browsers = testRunInfo.browsers ?? [];
    const finalRuns = browsers
      .map((browser) => this.recorded.get(browser.testRunId))
      .filter((record): record is RecordedType => record !== undefined);

    const taken: RecordedType = {
      steps: [...(finalRuns[0]?.steps ?? []), ...this.unattributed.steps],
      attachments: [...finalRuns.flatMap((record) => record.attachments), ...this.unattributed.attachments],
    };

    for (const browser of browsers) {
      this.recorded.delete(browser.testRunId);
      for (const id of browser.quarantineAttemptsTestRunIds ?? []) {
        this.recorded.delete(id);
      }
    }
    this.unattributed = emptyRecord();
    return taken;
  }

  /**
   * @returns {Promise<void>}
   */
  public startTestRun = (): void => {
    this.reporter.startTestRun();
  };

  public reportTestStart = (testStartInfo?: TestStartInfoType) => {
    this.unattributed = emptyRecord();
    this.testBeginTime = Date.now();
    if (testStartInfo) {
      this.startTimes.set(testStartInfo.testId, new Date(testStartInfo.startTime).getTime());
    }
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
    const { steps, attachments } = this.takeRecorded(testRunInfo);
    const testBeginTime = (testRunInfo.testId && this.startTimes.get(testRunInfo.testId)) || this.testBeginTime;
    if (testRunInfo.testId) {
      this.startTimes.delete(testRunInfo.testId);
    }

    if (metadata[metadataEnum.ignore]) {
      return;
    }

    const browserName = this.browserOptions?.addAsParameter
      ? BrowserNameResolver.resolve(testRunInfo, this.userAgents)
      : null;

    const profilerSteps: TestStepType[] = this.profilerTracker.getEvents();
    this.profilerTracker.reset();

    const result = ResultBuilder.build({
      title,
      testRunInfo,
      metadata,
      formatError,
      steps,
      attachments,
      profilerSteps,
      testBeginTime,
      browserName,
      browserOptions: this.browserOptions,
    });

    await this.reporter.addTestResult(result);
  };

  /**
   * @returns {Promise<void>}
   */
  public reportTaskDone = async (): Promise<void> => {
    this.profilerTracker.restore();
    await this.reporter.publish();
  };

}

