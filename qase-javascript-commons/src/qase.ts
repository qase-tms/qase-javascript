import { execSync } from 'child_process';

import envSchema from 'env-schema';
import chalk from 'chalk';
import { QaseApi } from 'qaseio';

import {
  InternalReporterInterface,
  TestOpsReporter,
  ReportReporter,
} from './reporters';
import { composeOptions, ModeEnum, OptionsType } from './options';
import {
  EnvApiEnum,
  EnvTestOpsEnum,
  envToConfig,
  envValidationSchema,
} from './env';
import { TestStatusEnum, TestResultType } from './models';
import { DriverEnum, FsWriter } from './writer';

import { getPackageVersion } from './utils/get-package-version';
import { CustomBoundaryFormData } from './utils/custom-boundary';
import { DisabledException } from './utils/disabled-exception';
import { Logger, LoggerInterface } from './utils/logger';

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

  isCaptureLogs(): boolean;
}

/**
 * @class QaseReporter
 * @implements AbstractReporter
 */
export class QaseReporter implements ReporterInterface {
  private static instance: QaseReporter;

  /**
   * @param {string} frameworkPackage
   * @param {string} frameworkName
   * @param {string} reporterName
   * @returns {Record<string, string>}
   * @private
   */
  private static createHeaders(
    frameworkPackage: string,
    frameworkName: string,
    reporterName: string,
  ): Record<string, string> {
    const { version: nodeVersion, platform: os, arch } = process;
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(
      /['"\n]+/g,
      '',
    );
    const qaseApiVersion = getPackageVersion('qaseio');
    const qaseReporterVersion = getPackageVersion('qase-javascript-commons');
    const frameworkVersion = getPackageVersion(frameworkPackage);
    const reporterVersion = getPackageVersion(reporterName);

    const client: string[] = [];

    if (frameworkVersion) {
      client.push(`${frameworkName}=${frameworkVersion}`);
    }

    if (reporterVersion) {
      client.push(`qase-${frameworkName}=${reporterVersion}`);
    }

    if (qaseReporterVersion) {
      client.push(`qase-core-reporter=${qaseReporterVersion}`);
    }

    if (qaseApiVersion) {
      client.push(`qaseio=${String(qaseApiVersion)}`);
    }

    return {
      'X-Client': client.join('; '),
      'X-Platform': `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`,
    };
  }

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

  /**
   * @param {OptionsType} options
   */
  private constructor(options: OptionsType) {
    const env = envToConfig(envSchema({ schema: envValidationSchema }));
    const composedOptions = composeOptions(options, env);

    this.logger = new Logger({ debug: composedOptions.debug });
    this.logger.logDebug(`Config: ${JSON.stringify(composedOptions)}`);

    this.captureLogs = composedOptions.captureLogs;

    try {
      this.upstreamReporter = this.createReporter(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        composedOptions.mode as ModeEnum || ModeEnum.off,
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        composedOptions.fallback as ModeEnum || ModeEnum.off,
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
  }

  /**
   * @returns {void}
   */
  public startTestRun(): void {
    if (!this.disabled) {

      this.logger.logDebug('Starting test run');

      try {
        this.startTestRunOperation = this.upstreamReporter?.startTestRun();
      } catch (error) {
        this.logger.logError('Unable to start test run in the upstream reporter: ', error);

        if (this.fallbackReporter == undefined) {
          this.disabled = true;
          return;
        }

        try {
          this.startTestRunOperation = this.fallbackReporter?.startTestRun();
        } catch (error) {
          this.logger.logError('Unable to start test run in the fallback reporter: ', error);
          this.disabled = true;
        }
      }
    }
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
   * @param {TestResultType} result
   */
  public async addTestResult(result: TestResultType) {
    if (!this.disabled) {
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
          return;
        }

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
  private async addTestResultToFallback(result: TestResultType): Promise<void> {
    try {
      await this.fallbackReporter?.addTestResult(result);
    } catch (error) {
      this.logger.logError('Unable to add the result to the fallback reporter:', error);
      this.disabled = true;
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
          return;
        }

        if (!this.useFallback) {
          this.fallbackReporter.setTestResults(this.upstreamReporter?.getTestResults() ?? []);
          this.useFallback = true;
        }

        await this.publishFallback();
      }
    }
  }

  /**
   * @returns {Promise<void>}
   */
  private async publishFallback(): Promise<void> {
    try {
      await this.fallbackReporter?.publish();
    } catch (error) {
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
    const {
      frameworkPackage,
      frameworkName,
      reporterName,
      environment,
      rootSuite,
      report = {},
      testops = {},
    } = options;

    switch (mode) {
      case ModeEnum.testops: {
        const {
          api: {
            token,
            headers,
            ...api
          } = {},
          project,
          run: {
            title,
            description,
            ...run
          } = {},
          plan = {},
          batch = {},
          useV2,
          defect,
          uploadAttachments,
        } = testops;

        if (!token) {
          throw new Error(
            `Either "testops.api.token" parameter or "${EnvApiEnum.token}" environment variable is required in "testops" mode`,
          );
        }

        if (!project) {
          throw new Error(
            `Either "testops.project" parameter or "${EnvTestOpsEnum.project}" environment variable is required in "testops" mode`,
          );
        }

        const apiClient = new QaseApi({
          token,
          headers: {
            ...headers,
            ...QaseReporter.createHeaders(
              frameworkPackage,
              frameworkName,
              reporterName,
            ),
          },
          ...api,
        }, CustomBoundaryFormData);

        return new TestOpsReporter(
          this.logger,
          {
            project,
            uploadAttachments,
            run: {
              title: title ?? `Automated run ${new Date().toISOString()}`,
              description: description ?? `${reporterName} automated run`,
              ...run,
            },
            plan,
            batch,
            useV2,
            defect,
          },
          apiClient,
          environment,
          rootSuite,
          api.host,
        );
      }

      case ModeEnum.report: {
        const localOptions = report.connections?.[DriverEnum.local];
        const writer = new FsWriter(localOptions);

        return new ReportReporter(
          this.logger,
          writer,
          environment,
          rootSuite,
          testops.run?.id);
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
}
