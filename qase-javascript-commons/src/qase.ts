import { join } from 'path';
import { readFileSync } from 'fs';
import { execSync } from "child_process";

import envSchema from 'env-schema';
import chalk from 'chalk';
import { QaseApi } from "qaseio";

import { AbstractReporter, ReporterInterface, TestOpsReporter, FileReporter, LoggerInterface } from './reporters';
import { ModeEnum, OptionsType } from './options';
import { configValidationSchema } from './config';
import { EnvReportEnum, EnvTestOpsEnum, envToOptions, envValidationSchema } from './env';
import { TestResultType } from './models';

import { JSONValidationError, validateJson } from './utils/validate-json';
import { omitEmpty } from './utils/omit-empty';
import { merge } from './utils/merge';
import { getPackageVersion } from "./utils/get-package-version";
import { CustomBoundaryFormData } from "./utils/custom-boundary";

const BASE_URL = 'https://qase.io/';

const resultLogMap = {
    failed: (test: TestResultType) => chalk`{red Test ${test.title} ${test.status}}`,
    passed: (test: TestResultType) => chalk`{green Test ${test.title} ${test.status}}`,
    skipped: (test: TestResultType) => chalk`{blueBright Test ${test.title} ${test.status}}`,
    blocked: (test: TestResultType) => chalk`{blueBright Test ${test.title} ${test.status}}`,
    disabled: (test: TestResultType) => chalk`{grey Test ${test.title} ${test.status}}`,
    invalid: (test: TestResultType) => chalk`{yellowBright Test ${test.title} ${test.status}}`,
};

export class QaseReporter extends AbstractReporter {
    static configFiles = [
        'qase.config.json',
        '.qaserc',
    ];

    private static readConfig() {
        for (const file of QaseReporter.configFiles) {
            const filePath = join(process.cwd(), file);

            try {
                return readFileSync(filePath, 'utf8');
            } catch (error) {
                const isNotFound = error instanceof Error
                    && 'code' in error
                    && (error.code === 'ENOENT' || error.code === 'EISDIR');

                if (!isNotFound) {
                    throw new Error(`Cannot read config file: ${String(error)}`);
                }
            }
        }

        return null;
    }

    private static loadConfig() {
        try {
            const data = QaseReporter.readConfig()

            if (data) {
                const json: unknown = JSON.parse(data);

                validateJson(configValidationSchema, json);
                omitEmpty(json);

                return json;
            }
        } catch (error) {
            if (error instanceof JSONValidationError) {
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

    private static createHeaders(
      frameworkName: string,
      reporterName: string,
      customFrameworkName?: string,
      customReporterName?: string,
    ) {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(/['"\n]+/g, '');
        const qaseApiVersion = getPackageVersion('qaseio');
        const qaseReporterVersion = getPackageVersion('qase-javascript-commons');
        const frameworkVersion = getPackageVersion(frameworkName);
        const reporterVersion = getPackageVersion(reporterName);

        const fv = frameworkVersion ? `${customFrameworkName || frameworkName}=${frameworkVersion}` : '';
        const rv = reporterVersion ? `${customReporterName || reporterName}=${reporterVersion}` : '';
        const qcr = qaseReporterVersion ? `qase-core-reporter=${qaseReporterVersion}` : '';

        return {
            'X-Client': `${fv}; ${rv}; ${qcr}; qaseapi=${String(qaseApiVersion)}`,
            'X-Platform': `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`,
        };
    }

    private upstreamReporter: ReporterInterface;

    private disabled = false;

    constructor(options: OptionsType, logger?: LoggerInterface) {
        const composedOptions = merge(
            options,
            QaseReporter.loadConfig(),
            envToOptions(envSchema({ schema: envValidationSchema })),
        );

        super({ logging: composedOptions.logging }, logger);

        this.upstreamReporter = this.createUpstreamReporter(composedOptions, logger);
    }

    public addTestResult(result: TestResultType) {
        if (!this.disabled) {
            try {
                this.logTestItem(result);
                this.upstreamReporter.addTestResult(result);
            } catch (error) {
                this.log(`Unable to process result: ${String(error)}`);

                this.disabled = true;
            }
        }
    }

    public publish() {
        if (!this.disabled) {
            try {
                this.upstreamReporter.publish();
            } catch (error) {
                this.log(`Unable to publish run results: ${String(error)}`);

                this.disabled = true;
            }
        }
    }

    // TODO: implement mode registry
    private createUpstreamReporter(
        options: OptionsType,
        logger?: LoggerInterface,
    ): ReporterInterface {
        const {
            frameworkName,
            reporterName,
            mode = ModeEnum.testops,
            report = {},
            testops = {},
            ...commonOptions
        } = options;

        switch (mode) {
            case ModeEnum.testops: {
                const {
                    apiToken,
                    baseUrl = BASE_URL,
                    projectCode,
                    frameworkName: customFrameworkName = frameworkName,
                    reporterName: customReporterName = reporterName,
                    runId,
                    runName,
                    runDescription,
                    environmentId,
                    ...restTestops
                } = testops;

                if (!apiToken) {
                    throw new Error(`Either "apiToken" parameter or "${EnvTestOpsEnum.apiToken}" environment variable is required in "testops" mode`);
                }

                if (!projectCode) {
                    throw new Error(`Either "projectCode" parameter or "${EnvTestOpsEnum.projectCode}" environment variable is required in "testops" mode`);
                }

                if (!runId && !environmentId) {
                    throw new Error(`Either "runId"/"${EnvTestOpsEnum.runId}" or "environmentId"/"${EnvTestOpsEnum.environmentId}" is required in "testops" mode`);
                }

                const apiClient = new QaseApi({
                    apiToken,
                    headers: QaseReporter.createHeaders(
                      frameworkName,
                      reporterName,
                      customFrameworkName,
                      customReporterName,
                    ),
                    formDataCtor: CustomBoundaryFormData
                });

                return new TestOpsReporter({
                    baseUrl,
                    projectCode,
                    runId,
                    runName: runName || `Automated run ${new Date().toISOString()}`,
                    runDescription: runDescription || `${customReporterName} automated run`,
                    frameworkName: customFrameworkName,
                    environmentId,
                    ...commonOptions,
                    ...restTestops,
                }, apiClient, logger);
            }

            case ModeEnum.report: {
                const { path, ...restReport } = report;

                if (!path) {
                    throw new Error(`Either \"path\" parameter or \"${EnvReportEnum.path}\" environment variable is required in \"report\" mode`);
                }

                return new FileReporter({
                    path,
                    ...commonOptions,
                    ...restReport,
                }, logger);
            }

            default:
                throw new Error(`Unknown mode type`);
        }
    }

    private logTestItem(test: TestResultType) {
        this.log(resultLogMap[test.status](test));
    }
}
