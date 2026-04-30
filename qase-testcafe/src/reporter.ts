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
} from './types';
import { MetadataParser } from './modules/metadataParser';
import { ProfilerTracker } from './modules/profilerTracker';
import { BrowserNameResolver } from './modules/browserNameResolver';
import { ResultBuilder } from './modules/resultBuilder';

export type { TestRunInfoType };

export type TestcafeQaseOptionsType = ConfigType;

/**
 * @class TestcafeQaseReporter
 */
export class TestcafeQaseReporter {
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
      steps: this.steps,
      attachments: this.attachments,
      profilerSteps,
      testBeginTime: this.testBeginTime,
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

