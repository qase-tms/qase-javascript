import envSchema from 'env-schema';
import chalk from 'chalk';

import {
  InternalReporterInterface,
  TestOpsReporter,
  TestOpsMultiReporter,
  ReportReporter,
} from './reporters';
import { composeOptions, ModeEnum, OptionsType } from './options';
import {
  EnvApiEnum,
  EnvEnum,
  EnvRunEnum,
  EnvTestOpsEnum,
  envToConfig,
  envValidationSchema,
} from './env';
import { TestStatusEnum, TestResultType, Attachment } from './models';
import { DriverEnum, FsWriter } from './writer';

import { DisabledException } from './utils/disabled-exception';
import { Logger, LoggerInterface } from './utils/logger';
import { StateManager, StateModel } from './state/state';
import { ConfigType } from './config';
import { getHostInfo, getMinimalHostData } from './utils/hostData';
import { ClientV2 } from './client/clientV2';
import { TestOpsOptionsType } from './models/config/TestOpsOptionsType';
import { applyStatusMapping } from './utils/status-mapping-utils';
import { HostData } from './models/host-data';

/**
 * @type {Record<TestStatusEnum, (test: TestResultType) => string>}
 */
const resultLogMap: Record<TestStatusEnum, (test: TestResultType) => string> = {
  [TestStatusEnum.failed]: (test) => chalk`{red Test ${test.title} ${test.execution.status}}`,
  [TestStatusEnum.passed]: (test) => chalk`{green Test ${test.title} ${test.execution.status}}`,
  [TestStatusEnum.skipped]: (test) => chalk`{blueBright Test ${test.title} ${test.execution.status}}`,
  [TestStatusEnum.blocked]: (test) => chalk`{blueBright Test ${test.title} ${test.execution.status}}`,
  [TestStatusEnum.disabled]: (test) => chalk`{grey Test ${test.title} ${test.execution.status}}`,
  [TestStatusEnum.invalid]: (test) => chalk`{yellowBright Test ${test.title} ${test.execution.status}}`,
};

export interface ReporterInterface {
  addTestResult(result: TestResultType): Promise<void>;

  publish(): Promise<void>;

  startTestRun(): void;

  startTestRunAsync(): Promise<void>;

  isCaptureLogs(): boolean;

  getResults(): TestResultType[];

  sendResults(): Promise<void>;

  complete(): Promise<void>;

  uploadAttachment(attachment: Attachment): Promise<string>;
}

/**
 * @class QaseReporter
 * @implements AbstractReporter
 */
export class QaseReporter implements ReporterInterface {
  private static instance: QaseReporter | null;

  /**
   * @type {InternalReporterInterface}
   * @private
   */
  private readonly upstreamReporter?: InternalReporterInterface;

  /**
   * @type {InternalReporterInterface}
   * @private
   */
  private readonly fallbackReporter?: InternalReporterInterface;

  /**
   * @type {boolean | undefined}
   * @private
   */
  private readonly captureLogs: boolean | undefined;

  /**
   * @type {boolean}
   * @private
   */
  private disabled = false;

  /**
   * @type {boolean}
   * @private
   */
  private useFallback = false;

  private readonly logger: LoggerInterface;

  private startTestRunOperation?: Promise<void> | undefined;

  private options: ConfigType & OptionsType;

  private withState: boolean;

  private readonly hostData: HostData;

  /**
   * @param {OptionsType} options
   */
  private constructor(options: OptionsType) {
    this.withState = this.setWithState(options);

    if (this.withState) {
      if (StateManager.isStateExists()) {
        const state = StateManager.getState();
        if (state.IsModeChanged && state.Mode) {
          process.env[EnvEnum.mode] = state.Mode.toString();
        }

        if (state.RunId) {
          process.env[EnvRunEnum.id] = state.RunId.toString();
        }
      }
    }

    const env = envToConfig(envSchema({ schema: envValidationSchema }));
    const composedOptions = composeOptions(options, env);
    this.options = composedOptions;

    // Process logging options with backward compatibility
    const loggerOptions: {
      debug?: boolean | undefined,
      consoleLogging?: boolean | undefined,
      fileLogging?: boolean | undefined,
    } = {
      debug: composedOptions.debug,
    };

    if (composedOptions.logging?.console !== undefined) {
      loggerOptions.consoleLogging = composedOptions.logging.console;
    }

    if (composedOptions.logging?.file !== undefined) {
      loggerOptions.fileLogging = composedOptions.logging.file;
    }

    this.logger = new Logger(loggerOptions);
    this.logger.logDebug(`Config: ${JSON.stringify(this.sanitizeOptions(composedOptions))}`);

    const effectiveMode = (composedOptions.mode as ModeEnum) || ModeEnum.off;
    const effectiveFallback = (composedOptions.fallback as ModeEnum) || ModeEnum.off;
    const needsHostData =
      effectiveMode === ModeEnum.testops ||
      effectiveMode === ModeEnum.testops_multi ||
      effectiveFallback === ModeEnum.testops ||
      effectiveFallback === ModeEnum.testops_multi;
    this.hostData = needsHostData
      ? getHostInfo(options.frameworkPackage, options.reporterName)
      : getMinimalHostData();
    this.logger.logDebug(`Host data: ${JSON.stringify(this.hostData)}`);

    this.captureLogs = composedOptions.captureLogs;

    try {
      this.upstreamReporter = this.createReporter(
        effectiveMode,
        composedOptions,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        this.disabled = true;
      } else {
        this.logger.logError('Unable to create upstream reporter:', error);

        if (composedOptions.fallback != undefined) {
          this.disabled = true;
          return;
        }

        this.useFallback = true;
      }
    }

    try {
      this.fallbackReporter = this.createReporter(
        effectiveFallback,
        composedOptions,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        if (this.useFallback) {
          this.disabled = true;
        }
      } else {
        this.logger.logError('Unable to create fallback reporter:', error);

        if (this.useFallback && this.upstreamReporter === undefined) {
          this.disabled = true;
        }
      }
    }

    if (this.withState) {
      if (!StateManager.isStateExists()) {
        const state: StateModel = {
          RunId: undefined,
          Mode: this.useFallback ? composedOptions.fallback as ModeEnum : composedOptions.mode as ModeEnum,
          IsModeChanged: undefined,
        };

        if (this.disabled) {
          state.Mode = ModeEnum.off;
        }

        StateManager.setState(state);
      }
    }
  }

  async uploadAttachment(attachment: Attachment): Promise<string> {
    if (this.disabled) {
      return '';
    }

    if (this.useFallback) {
      return await this.fallbackReporter?.uploadAttachment(attachment) ?? '';
    }

    return await this.upstreamReporter?.uploadAttachment(attachment) ?? '';
  }

  getResults(): TestResultType[] {
    if (this.disabled) {
      return [];
    }

    if (this.useFallback) {
      return this.fallbackReporter?.getTestResults() ?? [];
    }

    return this.upstreamReporter?.getTestResults() ?? [];
  }

  setTestResults(results: TestResultType[]): void {
    if (this.disabled) {
      return;
    }

    if (this.useFallback) {
      this.fallbackReporter?.setTestResults(results);
    } else {
      this.upstreamReporter?.setTestResults(results);
    }
  }

  async sendResults(): Promise<void> {
    if (this.disabled) {
      return;
    }

    try {
      await this.upstreamReporter?.sendResults();
    } catch (error) {
      this.logger.logError('Unable to send the results to the upstream reporter:', error);

      if (this.fallbackReporter == undefined) {
        if (this.withState) {
          StateManager.setMode(ModeEnum.off);
        }
        return;
      }

      if (!this.useFallback) {
        this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
        this.useFallback = true;
      }

      try {
        await this.fallbackReporter.sendResults();
        if (this.withState) {
          StateManager.setMode(this.options.fallback as ModeEnum);
        }
      } catch (error) {
        this.logger.logError('Unable to send the results to the fallback reporter:', error);
        if (this.withState) {
          StateManager.setMode(ModeEnum.off);
        }
      }
    }
  }

  async complete(): Promise<void> {
    if (this.withState) {
      StateManager.clearState();
    }
    if (this.disabled) {
      return;
    }

    try {
      await this.upstreamReporter?.complete();
    } catch (error) {
      this.logger.logError('Unable to complete the run in the upstream reporter:', error);

      if (this.fallbackReporter == undefined) {
        return;
      }

      if (!this.useFallback) {
        this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
        this.useFallback = true;
      }

      try {
        await this.fallbackReporter.complete();
      } catch (error) {
        this.logger.logError('Unable to complete the run in the fallback reporter:', error);
      }
    }
  }

  /**
   * @returns {void}
   */
  public startTestRun(): void {
    if (this.withState) {
      StateManager.clearState();
    }

    if (!this.disabled) {

      this.logger.logDebug('Starting test run');

      try {
        this.startTestRunOperation = this.upstreamReporter?.startTestRun();
      } catch (error) {
        this.logger.logError('Unable to start test run in the upstream reporter: ', error);

        if (this.fallbackReporter == undefined) {
          this.disabled = true;
          if (this.withState) {
            StateManager.setMode(ModeEnum.off);
          }
          return;
        }

        try {
          this.startTestRunOperation = this.fallbackReporter.startTestRun();
          if (this.withState) {
            StateManager.setMode(this.options.fallback as ModeEnum);
          }
        } catch (error) {
          this.logger.logError('Unable to start test run in the fallback reporter: ', error);
          this.disabled = true;
          if (this.withState) {
            StateManager.setMode(ModeEnum.off);
          }
        }
      }
    }
  }

  public async startTestRunAsync(): Promise<void> {
    this.startTestRun();
    await this.startTestRunOperation;
  }

  /**
   * @param {OptionsType} options
   * @returns {QaseReporter}
   */
  public static getInstance(options: OptionsType): QaseReporter {
    if (!QaseReporter.instance) {
      QaseReporter.instance = new QaseReporter(options);
    }

    return QaseReporter.instance;
  }

  /**
   * Get status mapping configuration
   * @returns Status mapping configuration or undefined
   */
  public getStatusMapping(): Record<string, string> | undefined {
    return this.options.statusMapping;
  }

  /**
   * @param {TestResultType} result
   */
  public async addTestResult(result: TestResultType) {
    if (!this.disabled) {
      // Apply status mapping if configured
      const statusMapping = this.getStatusMapping();
      if (statusMapping) {
        const originalStatus = result.execution.status;
        const mappedStatus = applyStatusMapping(originalStatus, statusMapping);
        if (mappedStatus !== originalStatus) {
          this.logger.logDebug(`Status mapping applied: ${originalStatus} -> ${mappedStatus}`);
          result.execution.status = mappedStatus;
        }
      }

      // Check if result should be filtered out based on status
      if (this.shouldFilterResult(result)) {
        this.logger.logDebug(`Filtering out test result with status: ${result.execution.status}`);
        return;
      }

      await this.startTestRunOperation;

      this.logTestItem(result);

      if (this.useFallback) {
        await this.addTestResultToFallback(result);
        return;
      }

      try {
        await this.upstreamReporter?.addTestResult(result);
      } catch (error) {
        this.logger.logError('Unable to add the result to the upstream reporter:', error);

        if (this.fallbackReporter == undefined) {
          this.disabled = true;
          if (this.withState) {
            StateManager.setMode(ModeEnum.off);
          }
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.useFallback) {
          this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
          this.useFallback = true;
        }

        await this.addTestResultToFallback(result);
      }
    }
  }

  /**
   * @param {TestResultType} result
   * @private
   */
  private shouldFilterResult(result: TestResultType): boolean {
    const statusFilter = this.options.testops?.statusFilter;

    if (!statusFilter || statusFilter.length === 0) {
      return false;
    }

    // Convert TestStatusEnum to string for comparison
    const statusString = result.execution.status.toString();

    this.logger.logDebug(`Checking filter: status="${statusString}", filter=${JSON.stringify(statusFilter)}`);

    // Check if the status is in the filter list
    const shouldFilter = statusFilter.includes(statusString);

    this.logger.logDebug(`Filter result: ${shouldFilter ? 'FILTERED' : 'NOT FILTERED'}`);

    return shouldFilter;
  }

  /**
   * @param {TestResultType} result
   * @private
   */
  private async addTestResultToFallback(result: TestResultType): Promise<void> {
    try {
      await this.fallbackReporter?.addTestResult(result);
      if (this.withState) {
        StateManager.setMode(this.options.fallback as ModeEnum);
      }
    } catch (error) {
      this.logger.logError('Unable to add the result to the fallback reporter:', error);
      this.disabled = true;
      StateManager.setMode(ModeEnum.off);
    }
  }

  /**
   * @returns {boolean}
   */
  public isCaptureLogs(): boolean {
    return this.captureLogs ?? false;
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish(): Promise<void> {
    if (!this.disabled) {

      await this.startTestRunOperation;

      this.logger.logDebug('Publishing test run results');

      if (this.useFallback) {
        await this.publishFallback();
      }

      try {
        await this.upstreamReporter?.publish();
      } catch (error) {
        this.logger.logError('Unable to publish the run results to the upstream reporter:', error);

        if (this.fallbackReporter == undefined) {
          this.disabled = true;
          if (this.withState) {
            StateManager.setMode(ModeEnum.off);
          }
          return;
        }

        if (!this.useFallback) {
          this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
          this.useFallback = true;
        }

        await this.publishFallback();
      }
    }
    if (this.withState) {
      StateManager.clearState();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  private async publishFallback(): Promise<void> {
    try {
      await this.fallbackReporter?.publish();
      if (this.withState) {
        StateManager.setMode(this.options.fallback as ModeEnum);
      }
    } catch (error) {
      if (this.withState) {
        StateManager.setMode(ModeEnum.off);
      }
      this.logger.logError('Unable to publish the run results to the fallback reporter:', error);
      this.disabled = true;
    }
  }

  /**
   * @todo implement mode registry
   * @param {ModeEnum} mode
   * @param {OptionsType} options
   * @returns {InternalReporterInterface}
   * @private
   */
  private createReporter(
    mode: ModeEnum,
    options: OptionsType,
  ): InternalReporterInterface {

    switch (mode) {
      case ModeEnum.testops: {
        if (!options.testops?.api?.token) {
          throw new Error(
            `Either "testops.api.token" parameter or "${EnvApiEnum.token}" environment variable is required in "testops" mode`,
          );
        }

        if (!options.testops.project) {
          throw new Error(
            `Either "testops.project" parameter or "${EnvTestOpsEnum.project}" environment variable is required in "testops" mode`,
          );
        }

        const apiClient = new ClientV2(
          this.logger,
          options.testops as TestOpsOptionsType,
          options.environment,
          options.rootSuite,
          this.hostData,
          options.reporterName,
          options.frameworkPackage
        );

        return new TestOpsReporter(
          this.logger,
          apiClient,
          this.withState,
          options.testops.project,
          options.testops.api.host,
          options.testops.batch?.size,
          options.testops.run?.id,
          options.testops.showPublicReportLink
        );
      }

      case ModeEnum.testops_multi: {
        if (!options.testops?.api?.token) {
          throw new Error(
            `Either "testops.api.token" parameter or "${EnvApiEnum.token}" environment variable is required in "testops_multi" mode`,
          );
        }

        const multi = options.testops_multi;
        if (!multi?.projects?.length) {
          throw new Error(
            '"testops_multi.projects" must contain at least one project with a "code" field',
          );
        }
        for (const p of multi.projects) {
          if (!p?.code) {
            throw new Error('Each project in "testops_multi.projects" must have a "code" field');
          }
        }

        return new TestOpsMultiReporter(
          this.logger,
          options.testops as TestOpsOptionsType,
          multi,
          this.withState,
          this.hostData,
          options.reporterName,
          options.frameworkPackage,
          options.environment,
          options.testops.api?.host,
          options.testops.batch?.size,
          options.testops.showPublicReportLink
        );
      }

      case ModeEnum.report: {
        const localOptions = options.report?.connections?.[DriverEnum.local];
        const writer = new FsWriter(localOptions);

        return new ReportReporter(
          this.logger,
          writer,
          options.frameworkPackage,
          options.reporterName,
          options.environment,
          options.rootSuite,
          options.testops?.run?.id);
      }

      case ModeEnum.off:
        throw new DisabledException();

      default:
        throw new Error(`Unknown mode type`);
    }
  }

  /**
   * @param {TestResultType} test
   * @private
   */
  private logTestItem(test: TestResultType) {
    this.logger.log(resultLogMap[test.execution.status](test));
  }

  private setWithState(options: OptionsType): boolean {
    return options.frameworkName === 'cypress' || !options.frameworkName;
  }

  private maskToken(token: string): string {
    if (token.length <= 7) {
      return '*'.repeat(token.length);
    }
    return `${token.slice(0, 3)}****${token.slice(-4)}`;
  }

  private sanitizeOptions(options: ConfigType & OptionsType): ConfigType & OptionsType {
    const sanitized = JSON.parse(JSON.stringify(options)) as ConfigType & OptionsType;

    if (sanitized.testops?.api?.token) {
      sanitized.testops.api.token = this.maskToken(sanitized.testops.api.token);
    }

    return sanitized;
  }
}
