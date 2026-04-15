import chalk from 'chalk';

import { InternalReporterInterface } from './reporters';
import { ModeEnum, OptionsType } from './options';
import { TestStatusEnum, TestResultType, Attachment } from './models';
import { ConfigType } from './config';

import { DisabledException } from './utils/disabled-exception';
import { Logger, LoggerInterface } from './utils/logger';
import { getHostInfo } from './utils/hostData';
import { sanitizeOptionsForLog } from './utils/token-masker';
import { StateManager, StateModel } from './state/state';

import { OptionsResolver, ResolvedOptions } from './qase/options-resolver';
import { ReporterFactory } from './qase/reporter-factory';
import { StatusProcessor } from './qase/status-processor';
import { FallbackCoordinator } from './reporters/shared/fallback-coordinator';

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
 *
 * Thin orchestrator: delegates to OptionsResolver, ReporterFactory,
 * StatusProcessor, and FallbackCoordinator. Public API is preserved.
 */
export class QaseReporter implements ReporterInterface {
  private static instance: QaseReporter | null;

  private readonly logger: LoggerInterface;
  private readonly options: ConfigType & OptionsType;
  private readonly withState: boolean;
  private readonly captureLogs: boolean | undefined;
  private readonly statusProcessor: StatusProcessor;
  private readonly fallback: FallbackCoordinator;

  private startTestRunOperation?: Promise<void> | undefined;

  /**
   * @param {OptionsType} options
   */
  private constructor(options: OptionsType) {
    const resolved = new OptionsResolver().resolve(options);
    this.options = resolved.composed;
    this.withState = resolved.withState;
    this.captureLogs = resolved.composed.captureLogs;

    this.logger = this.buildLogger(resolved);
    this.logger.logDebug(
      `Config: ${JSON.stringify(sanitizeOptionsForLog(resolved.composed))}`,
    );

    const hostData = getHostInfo(options.frameworkPackage, options.reporterName);
    this.logger.logDebug(`Host data: ${JSON.stringify(hostData)}`);

    const factory = new ReporterFactory(this.logger, hostData);
    const { upstream, fallback, disabled, useFallbackFromStart } =
      this.buildReporters(factory, resolved);

    this.statusProcessor = new StatusProcessor(
      this.logger,
      resolved.composed.statusMapping,
      resolved.composed.testops?.statusFilter as string[] | undefined,
    );

    this.fallback = new FallbackCoordinator(this.logger, upstream, fallback, {
      onFallbackActivated: () => {
        if (this.withState) {
          StateManager.setMode(resolved.composed.fallback as ModeEnum);
        }
      },
      onDisabled: () => {
        if (this.withState) {
          StateManager.setMode(ModeEnum.off);
        }
      },
    });

    if (disabled) {
      this.fallback.setDisabled(true);
    }
    if (useFallbackFromStart) {
      this.fallback.setUseFallback(true);
    }

    this.persistInitialState(resolved, disabled, useFallbackFromStart);
  }

  private buildLogger(resolved: ResolvedOptions): LoggerInterface {
    const opts: {
      debug?: boolean | undefined;
      consoleLogging?: boolean | undefined;
      fileLogging?: boolean | undefined;
    } = { debug: resolved.composed.debug };

    if (resolved.composed.logging?.console !== undefined) {
      opts.consoleLogging = resolved.composed.logging.console;
    }
    if (resolved.composed.logging?.file !== undefined) {
      opts.fileLogging = resolved.composed.logging.file;
    }
    return new Logger(opts);
  }

  private buildReporters(
    factory: ReporterFactory,
    resolved: ResolvedOptions,
  ): {
    upstream: InternalReporterInterface | undefined;
    fallback: InternalReporterInterface | undefined;
    disabled: boolean;
    useFallbackFromStart: boolean;
  } {
    let upstream: InternalReporterInterface | undefined;
    let fallbackReporter: InternalReporterInterface | undefined;
    let disabled = false;
    let upstreamFailed = false;

    try {
      upstream = factory.create(
        resolved.effectiveMode,
        resolved.composed,
        this.withState,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        disabled = true;
      } else {
        this.logger.logError('Unable to create upstream reporter:', error);
        if (resolved.composed.fallback === undefined) {
          disabled = true;
          return { upstream, fallback: fallbackReporter, disabled, useFallbackFromStart: false };
        }
        upstreamFailed = true;
      }
    }

    try {
      fallbackReporter = factory.create(
        resolved.effectiveFallback,
        resolved.composed,
        this.withState,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        if (upstreamFailed) disabled = true;
      } else {
        this.logger.logError('Unable to create fallback reporter:', error);
        if (upstreamFailed && upstream === undefined) disabled = true;
      }
    }

    const useFallbackFromStart = upstreamFailed && fallbackReporter !== undefined;

    return { upstream, fallback: fallbackReporter, disabled, useFallbackFromStart };
  }

  private persistInitialState(
    resolved: ResolvedOptions,
    disabled: boolean,
    useFallbackFromStart: boolean,
  ): void {
    if (!this.withState) return;
    if (StateManager.isStateExists()) return;

    const state: StateModel = {
      RunId: undefined,
      Mode: useFallbackFromStart
        ? (resolved.composed.fallback as ModeEnum)
        : (resolved.composed.mode as ModeEnum),
      IsModeChanged: undefined,
    };

    if (disabled) {
      state.Mode = ModeEnum.off;
    }

    StateManager.setState(state);
  }

  public static getInstance(options: OptionsType): QaseReporter {
    if (!QaseReporter.instance) {
      QaseReporter.instance = new QaseReporter(options);
    }
    return QaseReporter.instance;
  }

  public getStatusMapping(): Record<string, string> | undefined {
    return this.options.statusMapping;
  }

  public async uploadAttachment(attachment: Attachment): Promise<string> {
    const result = await this.fallback.run(
      (r) => r.uploadAttachment(attachment),
      'upload attachment',
    );
    return result ?? '';
  }

  public getResults(): TestResultType[] {
    if (this.fallback.isDisabled()) return [];
    const active = this.fallback.isUsingFallback()
      ? this.fallback.getFallback()
      : this.fallback.getUpstream();
    return active?.getTestResults() ?? [];
  }

  public setTestResults(results: TestResultType[]): void {
    if (this.fallback.isDisabled()) return;
    const active = this.fallback.isUsingFallback()
      ? this.fallback.getFallback()
      : this.fallback.getUpstream();
    active?.setTestResults(results);
  }

  public async addTestResult(result: TestResultType): Promise<void> {
    if (this.fallback.isDisabled()) return;

    const processed = this.statusProcessor.process(result);
    if (!processed) return;

    await this.startTestRunOperation;
    this.logger.log(resultLogMap[processed.execution.status](processed));
    await this.fallback.run(
      (r) => r.addTestResult(processed),
      'add the result',
    );
  }

  public startTestRun(): void {
    if (this.withState) StateManager.clearState();
    this.fallback.reset();
    this.logger.logDebug('Starting test run');

    const runOp = this.fallback.run(
      async (r) => {
        await r.startTestRun();
      },
      'start test run',
    );
    this.startTestRunOperation = runOp.then(() => undefined);
  }

  public async startTestRunAsync(): Promise<void> {
    this.startTestRun();
    await this.startTestRunOperation;
  }

  public async sendResults(): Promise<void> {
    if (this.fallback.isDisabled()) return;
    await this.fallback.run((r) => r.sendResults(), 'send the results');
  }

  public async publish(): Promise<void> {
    if (!this.fallback.isDisabled()) {
      await this.startTestRunOperation;
      this.logger.logDebug('Publishing test run results');
      await this.fallback.run(
        (r) => r.publish(),
        'publish the run results',
      );
    }
    if (this.withState) StateManager.clearState();
  }

  public async complete(): Promise<void> {
    if (this.withState) StateManager.clearState();
    if (this.fallback.isDisabled()) return;
    await this.fallback.run((r) => r.complete(), 'complete the run');
  }

  public isCaptureLogs(): boolean {
    return this.captureLogs ?? false;
  }
}
