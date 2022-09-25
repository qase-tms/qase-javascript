import { describe, it, expect, vi } from 'vitest'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
} from '../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
    reporterName: 'qase-core-reporter',
    frameworkName: 'qase-core-reporter',
};

describe('reporterOptions', () => {
    describe('report', () => {
        it('should disable reporter if reporterOptions.report is false', () => {
            delete process.env.QASE_LOGGING;
            const consoleSpy = vi.spyOn(console, 'log');
            const reporter = new QaseCoreReporter(
                {
                    report: false,
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                },
                qaseCoreReporterOptions);

            expect(reporter['isDisabled']).toBe(true);
            expect(consoleSpy).toBeCalledWith(expect.stringContaining('Reporting to qase.io is disabled.'));
        });
        it('should disable reporter if QASE_REPORT and reporterOptions.report is not set', () => {
            delete process.env.QASE_LOGGING;
            const consoleSpy = vi.spyOn(console, 'log');
            const qaseCoreReporterOptions: QaseCoreReporterOptions = {
                reporterName: 'qase-core-reporter',
                frameworkName: 'qase-core-reporter',
            };
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                },
                qaseCoreReporterOptions);

            expect(reporter['isDisabled']).toBe(true);
            expect(consoleSpy).toBeCalledWith(expect.stringContaining('Reporting to qase.io is disabled.'));
        });

        it('should enable reporter if reporterOptions.report is true', () => {
            const qaseCoreReporterOptions: QaseCoreReporterOptions = {
                reporterName: 'qase-core-reporter',
                frameworkName: 'qase-core-reporter',
            };
            const reporter = new QaseCoreReporter(
                {
                    report: true,
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['isDisabled']).toBe(false);
        });

        it('should enable reporter if QASE_REPORT is set', () => {
            process.env.QASE_REPORT = '1';
            const qaseCoreReporterOptions: QaseCoreReporterOptions = {
                reporterName: 'qase-core-reporter',
                frameworkName: 'qase-core-reporter',
            };
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['isDisabled']).toBe(false);
        });

        it('should log QASE_ENABLED message if qaseCoreReporterOptions.enabledSupport is true', () => {
            delete process.env.QASE_REPORT;
            const consoleSpy = vi.spyOn(console, 'log');
            const qaseCoreReporterOptions: QaseCoreReporterOptions = {
                reporterName: 'qase-core-reporter',
                frameworkName: 'qase-core-reporter',
                enabledSupport: true,
            };
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(consoleSpy).toBeCalledWith(
                expect.stringContaining('QASE_ENABLED env variable is not set or Qase reporter option "enabled" is false.')
            );
        });
    });

    describe('runName', () => {
        it('should be able to set from reporterOptions.runName', () => {
            const reporter = new QaseCoreReporter(
                {
                    report: true,
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                    runName: 'runName',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runName).toBe('runName');
        });
        it('should be able to set from QASE_RUN_NAME', () => {
            process.env.QASE_RUN_NAME = 'runNameENV';
            const reporter = new QaseCoreReporter(
                {
                    report: true,
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runName).toBe('runNameENV');
        });
        it('should default to false if QASE_RUN_NAME and ', () => {
            process.env.QASE_RUN_NAME = 'runNameENV';
            const reporter = new QaseCoreReporter(
                {
                    report: true,
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                    runName: 'runName',
                },
                qaseCoreReporterOptions);
            expect(reporter['options'].runName).toBe('runNameENV');
        });
    });

    describe('runDescription', () => {
        it('should be able to set from reporterOptions.runDescription', () => {
            const reporter = new QaseCoreReporter(
                {
                    report: true,
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                    runDescription: 'runDescription',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runDescription).toBe('runDescription');
        });
        it('should be able to set from QASE_RUN_DESCRIPTION', () => {
            process.env.QASE_RUN_DESCRIPTION = 'runDescriptionENV';
            const reporter = new QaseCoreReporter(
                {
                    report: true,
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runDescription).toBe('runDescriptionENV');
        });

        it('should default to empty string if QASE_RUN_DESCRIPTION and ', () => {
            delete process.env.QASE_RUN_DESCRIPTION;
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);
            expect(reporter['options'].runDescription).toBe('');
        });
    });

    describe('basePath', () => {
        it('should be able to set from reporterOptions.basePath', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    basePath: 'https://qase.io',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].basePath).toBe('https://qase.io');
        });
        it('should be able to set from QASE_API_BASE_URL', () => {
            process.env.QASE_API_BASE_URL = 'https://qase.io';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].basePath).toBe('https://qase.io');
        });

        it('should take QASE_API_BASE_URL over reporterOptions.basePath', () => {
            process.env.QASE_API_BASE_URL = 'https://qase.io';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    basePath: 'https://qase.io/api',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].basePath).toBe('https://qase.io');
        });
    });

    describe('rootSuiteTitle', () => {
        it('should be able to set from reporterOptions.rootSuiteTitle', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    rootSuiteTitle: 'rootSuiteTitle-Text',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].rootSuiteTitle).toBe('rootSuiteTitle-Text');
        });

        it('should be able to set from QASE_ROOT_SUITE_TITLE', () => {
            process.env.QASE_ROOT_SUITE_TITLE = 'rootSuiteTitle-ENV';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].rootSuiteTitle).toBe('rootSuiteTitle-ENV');
        });

        it('should take QASE_ROOT_SUITE_TITLE over reporterOptions.rootSuiteTitle', () => {
            process.env.QASE_ROOT_SUITE_TITLE = 'rootSuiteTitle-ENV';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    rootSuiteTitle: 'rootSuiteTitle-Text',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].rootSuiteTitle).toBe('rootSuiteTitle-ENV');
        });
    });

    describe('environmentId', () => {
        it('should be able to set from reporterOptions.environmentId', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    environmentId: 1,
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].environmentId).toBe(1);
        });

        it('should be able to set from QASE_ENVIRONMENT_ID', () => {
            process.env.QASE_ENVIRONMENT_ID = '2';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].environmentId).toBe(2);
        });

        it('should take QASE_ENVIRONMENT_ID over reporterOptions.environmentId', () => {
            process.env.QASE_ENVIRONMENT_ID = '2';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    environmentId: 1,
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].environmentId).toBe(2);
        });
    });

    describe('logging', () => {
        it('should be able to set from reporterOptions.logging', () => {
            const _ = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                },
                qaseCoreReporterOptions);

            expect(process.env.QASE_LOGGING).toBe('true');
        });

        it('should default to false if reporterOptions.logging and QASE_LOGGING is not set', () => {
            delete process.env.QASE_LOGGING;
            const _ = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(process.env.QASE_LOGGING).toBe('false');
        });

        it('should be able to set from QASE_LOGGING', () => {
            process.env.QASE_LOGGING = 'true';
            const _ = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(process.env.QASE_LOGGING).toBe('true');
        });

        it('should take QASE_LOGGING over reporterOptions.logging', () => {
            process.env.QASE_LOGGING = 'false';
            const _ = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    logging: true,
                },
                qaseCoreReporterOptions);

            expect(process.env.QASE_LOGGING).toBe('false');
        });
    });

    describe('runComplete', () => {
        it('should be false by default', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runComplete).toBe(false);
        });
        it('should be able to set from reporterOptions.runComplete', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    runComplete: true,
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runComplete).toBe(true);
        });
        it('should be able to set from QASE_RUN_COMPLETE', () => {
            process.env.QASE_RUN_COMPLETE = 'true';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runComplete).toBe(true);
        });

        it('should take QASE_RUN_COMPLETE over reporterOptions.runComplete', () => {
            process.env.QASE_RUN_COMPLETE = 'true';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                    runComplete: false,
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].runComplete).toBe(true);
        });
    });

    describe('projectCode', () => {
        it('should be able to set from reporterOptions.projectCode', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].projectCode).toBe('code');
        });
        it('should be able to set from QASE_PROJECT_CODE', () => {
            process.env.QASE_PROJECT_CODE = 'code_env';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                } as any,
                qaseCoreReporterOptions);

            expect(reporter['options'].projectCode).toBe('code_env');
        });

        it('should take QASE_PROJECT_CODE over reporterOptions.projectCode', () => {
            process.env.QASE_PROJECT_CODE = 'code_env';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].projectCode).toBe('code_env');
        });
    });

    describe('apiToken', () => {
        it('should be able to set from reporterOptions.apiToken ', () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].apiToken).toBe('token');
        });

        it('should be able to set from QASE_API_TOKEN', () => {
            process.env.QASE_API_TOKEN = 'token_env';
            const reporter = new QaseCoreReporter(
                {
                    projectCode: 'code',
                } as any,
                qaseCoreReporterOptions);

            expect(reporter['options'].apiToken).toBe('token_env');
        });

        it('should take QASE_API_TOKEN over reporterOptions.apiToken', () => {
            process.env.QASE_API_TOKEN = 'token_env';
            const reporter = new QaseCoreReporter(
                {
                    apiToken: 'token',
                    projectCode: 'code',
                },
                qaseCoreReporterOptions);

            expect(reporter['options'].apiToken).toBe('token_env');
        });
    });
});