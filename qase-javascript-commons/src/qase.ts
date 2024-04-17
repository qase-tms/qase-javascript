import { execSync } from 'child_process';

import envSchema from 'env-schema';
import chalk from 'chalk';
import { QaseApi } from 'qaseio';

import {
  AbstractReporter,
  ReporterInterface,
  TestOpsReporter,
  ReportReporter,
  LoggerInterface,
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

/**
 * @class QaseReporter
 * @implements AbstractReporter
 */
export class QaseReporter extends AbstractReporter {
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
   * @type {ReporterInterface}
   * @private
   */
  private readonly upstreamReporter?: ReporterInterface;

  /**
   * @type {ReporterInterface}
   * @private
   */
  private readonly fallbackReporter?: ReporterInterface;


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

  /**
   * @param {OptionsType} options
   * @param {LoggerInterface} logger
   */
  constructor(options: OptionsType, logger?: LoggerInterface) {
    const env = envToConfig(envSchema({ schema: envValidationSchema }));
    const composedOptions = composeOptions(options, env);

    super({ debug: composedOptions.debug, captureLogs: composedOptions.captureLogs }, logger);

    try {
      this.upstreamReporter = this.createReporter(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        composedOptions.mode as ModeEnum || ModeEnum.off,
        composedOptions,
        logger,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        this.disabled = true;
      } else {
        this.logError('Unable to create upstream reporter:', error);

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
        logger,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        if (this.useFallback) {
          this.disabled = true;
        }
      } else {
        this.logError('Unable to create fallback reporter:', error);

        if (this.useFallback && this.upstreamReporter === undefined) {
          this.disabled = true;
        }
      }
    }
  }

  /**
   * @returns {Promise<void>}
   */
  public override async startTestRun(): Promise<void> {
    if (!this.disabled) {

      try {
        await this.upstreamReporter?.startTestRun();
      } catch (error) {
        this.logError('Unable to start test run in the upstream reporter: ', error);

        if (this.fallbackReporter == undefined) {
          this.disabled = true;
          return;
        }

        try {
          await this.fallbackReporter?.startTestRun();
        } catch (error) {
          this.logError('Unable to start test run in the fallback reporter: ', error);
          this.disabled = true;
        }
      }
    }
  }

  /**
   * @param {TestResultType} result
   */
  public override async addTestResult(result: TestResultType) {
    if (!this.disabled) {
      this.logTestItem(result);

      if (this.useFallback) {
        await this.addTestResultToFallback(result);
        return;
      }

      try {
        await this.upstreamReporter?.addTestResult(result);
      } catch (error) {
        this.logError('Unable to add the result to the upstream reporter:', error);

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
      this.logError('Unable to add the result to the fallback reporter:', error);
      this.disabled = true;
    }
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish(): Promise<void> {
    if (!this.disabled) {
      if (this.useFallback) {
        await this.publishFallback();
      }

      try {
        await this.upstreamReporter?.publish();
      } catch (error) {
        this.logError('Unable to publish the run results to the upstream reporter:', error);

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
      this.logError('Unable to publish the run results to the fallback reporter:', error);
      this.disabled = true;
    }
  }

  /**
   * @todo implement mode registry
   * @param {ModeEnum} mode
   * @param {OptionsType} options
   * @param {LoggerInterface} logger
   * @returns {ReporterInterface}
   * @private
   */
  private createReporter(
    mode: ModeEnum,
    options: OptionsType,
    logger?: LoggerInterface,
  ): ReporterInterface {
    const {
      frameworkPackage,
      frameworkName,
      reporterName,
      environment,
      report = {},
      testops = {},
      ...commonOptions
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
          batch= {},
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
            debug: commonOptions.debug,
            captureLogs: commonOptions.captureLogs,
          },
          apiClient,
          logger,
          typeof environment === 'number' ? environment : undefined,
        );
      }

      case ModeEnum.report: {
        const localOptions = report.connections?.[DriverEnum.local];
        const writer = new FsWriter(localOptions);

        return new ReportReporter({
            debug: commonOptions.debug,
            captureLogs: commonOptions.captureLogs,
          }, writer, logger,
          typeof environment === 'number' ? environment.toString() : environment, testops.run?.id);
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
    this.log(resultLogMap[test.execution.status](test));
  }
}
