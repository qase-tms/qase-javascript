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
import { composeOptions, ModeEnum, OptionsType } from './options'
import {
  EnvApiEnum,
  EnvTestOpsEnum,
  envToConfig,
  envValidationSchema,
} from './env';
import { TestStatusEnum, TestResultType } from './models';
import { DriverEnum, FsWriter } from './writer';
import { JsonFormatter } from './formatter';

import { getPackageVersion } from './utils/get-package-version';
import { CustomBoundaryFormData } from './utils/custom-boundary';
import { DisabledException } from './utils/disabled-exception';

/**
 * @type {Record<TestStatusEnum, (test: TestResultType) => string>}
 */
const resultLogMap: Record<TestStatusEnum, (test: TestResultType) => string> = {
  [TestStatusEnum.failed]: (test) => chalk`{red Test ${test.title} ${test.status}}`,
  [TestStatusEnum.passed]: (test) => chalk`{green Test ${test.title} ${test.status}}`,
  [TestStatusEnum.skipped]: (test) => chalk`{blueBright Test ${test.title} ${test.status}}`,
  [TestStatusEnum.blocked]: (test) => chalk`{blueBright Test ${test.title} ${test.status}}`,
  [TestStatusEnum.disabled]: (test) => chalk`{grey Test ${test.title} ${test.status}}`,
  [TestStatusEnum.invalid]: (test) => chalk`{yellowBright Test ${test.title} ${test.status}}`,
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
      client.push(`qaseapi=${String(qaseApiVersion)}`);
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
  private upstreamReporter?: ReporterInterface;

  /**
   * @type {boolean}
   * @private
   */
  private disabled = false;

  /**
   * @param {OptionsType} options
   * @param {LoggerInterface} logger
   */
  constructor(options: OptionsType, logger?: LoggerInterface) {
    const env = envToConfig(envSchema({ schema: envValidationSchema }));
    const composedOptions = composeOptions(options, env);

    super({ debug: composedOptions.debug }, logger);

    try {
      this.upstreamReporter = this.createUpstreamReporter(
        composedOptions,
        logger,
      );
    } catch (error) {
      if (error instanceof DisabledException) {
        this.disabled = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * @param {TestResultType} result
   */
  public addTestResult(result: TestResultType) {
    if (!this.disabled) {
      try {
        this.logTestItem(result);
        this.upstreamReporter?.addTestResult(result);
      } catch (error) {
        this.logError('Unable to process result:', error);

        this.disabled = true;
      }
    }
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish() {
    if (!this.disabled) {
      try {
        await this.upstreamReporter?.publish();
      } catch (error) {
        this.logError('Unable to publish run results:', error);

        this.disabled = true;
      }
    }
  }

  /**
   * @todo implement mode registry
   * @param {OptionsType} options
   * @param {LoggerInterface} logger
   * @returns {ReporterInterface}
   * @private
   */
  private createUpstreamReporter(
    options: OptionsType,
    logger?: LoggerInterface,
  ): ReporterInterface {
    const {
      frameworkPackage,
      frameworkName,
      reporterName,
      mode = ModeEnum.off,
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
          ...api
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
            ...commonOptions,
          },
          apiClient,
          logger,
          typeof environment === 'number' ? environment : undefined
        );
      }

      case ModeEnum.report: {
        const localOptions = report.connections?.[DriverEnum.local];
        const writer = new FsWriter(localOptions, new JsonFormatter());

        return new ReportReporter(commonOptions, writer, logger);
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
    this.log(resultLogMap[test.status](test));
  }
}
