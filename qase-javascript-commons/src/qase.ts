import { join } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

import mergeWith from 'lodash.mergewith';
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
import { ModeEnum, OptionsType } from './options';
import { ConfigType, configValidationSchema } from './config';
import {
  EnvApiEnum,
  EnvTestOpsEnum,
  envToConfig,
  envValidationSchema,
} from './env';
import { TestStatusEnum, TestResultType } from './models';
import { DriverEnum, FsWriter } from './writer';
import { JsonFormatter } from './formatter';

import { JsonValidationError, validateJson } from './utils/validate-json';
import { getPackageVersion } from './utils/get-package-version';
import { CustomBoundaryFormData } from './utils/custom-boundary';
import { DisabledException } from './utils/disabled-exception';
import { QaseError } from './utils/qase-error';

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
   * @type {string[]}
   */
  public static configFiles = ['qase.config.json', '.qaserc'];

  /**
   * @returns {null | string}
   * @private
   */
  private static readConfig() {
    for (const file of QaseReporter.configFiles) {
      const filePath = join(process.cwd(), file);

      try {
        return readFileSync(filePath, 'utf8');
      } catch (error) {
        const isNotFound =
          error instanceof Error &&
          'code' in error &&
          (error.code === 'ENOENT' || error.code === 'EISDIR');

        if (!isNotFound) {
          throw new QaseError('Cannot read config file', { cause: error });
        }
      }
    }

    return null;
  }

  /**
   * @returns {ConfigType}
   * @private
   */
  private static loadConfig(): ConfigType {
    try {
      const data = QaseReporter.readConfig();

      if (data) {
        const json: unknown = JSON.parse(data);

        validateJson(configValidationSchema, json);

        return json;
      }
    } catch (error) {
      if (error instanceof JsonValidationError) {
        const [validationError] = error.validationErrors;

        const { instancePath = '', message = '' } = validationError ?? {};
        const configPath = instancePath
          ? `\`${instancePath.substring(1).replace('/', '.')}\``
          : 'it';

        throw new Error(`Invalid config: "${configPath}" ${message}`);
      }

      throw error;
    }

    return {};
  }

  /**
   * @param {string} frameworkName
   * @param {string} reporterName
   * @param {string} customFrameworkName
   * @param {string} customReporterName
   * @returns {Record<string, string>}
   * @private
   */
  private static createHeaders(
    frameworkName: string,
    reporterName: string,
    customFrameworkName?: string,
    customReporterName?: string,
  ): Record<string, string> {
    const { version: nodeVersion, platform: os, arch } = process;
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(
      /['"\n]+/g,
      '',
    );
    const qaseApiVersion = getPackageVersion('qaseio');
    const qaseReporterVersion = getPackageVersion('qase-javascript-commons');
    const frameworkVersion = getPackageVersion(frameworkName);
    const reporterVersion = getPackageVersion(reporterName);

    const fv = frameworkVersion
      ? `${customFrameworkName || frameworkName}=${frameworkVersion}`
      : '';
    const rv = reporterVersion
      ? `${customReporterName || reporterName}=${reporterVersion}`
      : '';
    const qcr = qaseReporterVersion
      ? `qase-core-reporter=${qaseReporterVersion}`
      : '';

    return {
      'X-Client': `${fv}; ${rv}; ${qcr}; qaseapi=${String(qaseApiVersion)}`,
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
    const composedOptions = mergeWith(
      {},
      options,
      QaseReporter.loadConfig(),
      envToConfig(envSchema({ schema: envValidationSchema })),
      (value: unknown, src: unknown) => (src === undefined ? value : undefined),
    );

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
      frameworkName,
      reporterName,
      mode = ModeEnum.off,
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
          baseUrl,
          projectCode,
          run: {
            title,
            description,
            ...run
          } = {},
          uploadAttachments,
        } = testops;

        if (!token) {
          throw new Error(
            `Either "testops.api.token" parameter or "${EnvApiEnum.token}" environment variable is required in "testops" mode`,
          );
        }

        if (!projectCode) {
          throw new Error(
            `Either "testops.projectCode" parameter or "${EnvTestOpsEnum.projectCode}" environment variable is required in "testops" mode`,
          );
        }

        const apiClient = new QaseApi({
          token,
          headers: {
            ...headers,
            ...QaseReporter.createHeaders(frameworkName, reporterName),
          },
          ...api
        }, CustomBoundaryFormData);

        return new TestOpsReporter(
          {
            baseUrl,
            projectCode,
            uploadAttachments,
            run: {
              title: title ?? `Automated run ${new Date().toISOString()}`,
              description: description ?? `${reporterName} automated run`,
              ...run,
            },
            ...commonOptions,
          },
          apiClient,
          logger,
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
