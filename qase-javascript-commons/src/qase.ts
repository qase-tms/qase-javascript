import { join } from 'path';
import { readFileSync } from 'fs';

import envSchema from 'env-schema';
import chalk from 'chalk';

import { AbstractReporter, ReporterInterface, TestOpsReporter, FileReporter, LoggerInterface } from './reporters';
import { ModeEnum, OptionsType } from './options';
import { configValidationSchema } from './config';
import { EnvEnum, envToOptions, envValidationSchema } from './env';
import { TestResultType } from './models';

import { JSONValidationError, validateJson } from './utils/validate-json';
import { omitEmpty } from './utils/omit-empty';
import { merge } from './utils/merge';

const resultLogMap = {
    failed: (test: TestResultType) => chalk`{red Test ${test.title} ${test.status}}`,
    passed: (test: TestResultType) => chalk`{green Test ${test.title} ${test.status}}`,
    pending: (test: TestResultType) => chalk`{blueBright Test ${test.title} ${test.status}}`,
    skipped: (test: TestResultType) => chalk`{blueBright Test ${test.title} ${test.status}}`,
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

        return null;
    }

    private upstreamReporter: ReporterInterface;

    private disabled = false;

    constructor(options: Partial<OptionsType>, logger?: LoggerInterface) {
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

    private createUpstreamReporter(
        options: Partial<OptionsType>,
        logger?: LoggerInterface,
    ): ReporterInterface {
        const {
            mode,
            report,
            testops,
            ...commonOptions
        } = options;

        switch (mode) {
            case ModeEnum.testops:
                const {
                    apiToken,
                    projectCode,
                    frameworkName,
                    reporterName,
                    runId,
                    environmentId,
                    ...restTestops
                } = testops || {};

                if (!apiToken) {
                    throw new Error(`Either "apiToken" parameter or "${EnvEnum.testopsApiToken}" environment variable is required in "testops" mode`);
                }

                if (!projectCode) {
                    throw new Error(`Either "projectCode" parameter or "${EnvEnum.testopsProjectCode}" environment variable is required in "testops" mode`);
                }

                if (!runId && !environmentId) {
                    throw new Error(`Either "runId"/"${EnvEnum.testopsRunId}" or "environmentId"/"${EnvEnum.testopsEnvironmentId}" is required in "testops" mode`);
                }

                if (!frameworkName) {
                    throw new Error('"frameworkName" parameter is required in "testops" mode');
                }

                if (!reporterName) {
                    throw new Error('"reporterName" parameter is required in "testops" mode');
                }

                return new TestOpsReporter({
                    apiToken,
                    projectCode,
                    frameworkName,
                    reporterName,
                    runId,
                    environmentId,
                    ...commonOptions,
                    ...restTestops,
                }, logger);

            case ModeEnum.report:
                const { path, ...restReport } = report || {};

                if (!path) {
                    throw new Error('Either "path" parameter or "QASE_REPORT_PATH" environment variable is required in "report" mode');
                }

                return new FileReporter({
                    path,
                    ...commonOptions,
                    ...restReport,
                }, logger);

            default:
                throw new Error(`Unknown mode type`);
        }
    }

    private logTestItem(test: TestResultType) {
        this.log(resultLogMap[test.status](test));
    }
}
