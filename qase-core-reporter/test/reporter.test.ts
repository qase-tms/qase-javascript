import { describe, it, expect, vi } from 'vitest'
import { unlinkSync, writeFileSync } from 'fs'
import { ResultCreateStatusEnum } from 'qaseio/dist/src'
import {
    QaseCoreReporter,
    QaseCoreReporterOptions,
    QaseOptions,
    qase,
    qaseTitle,
    TestResult,
    qaseParam,
    Statuses
} from '../src';

describe('QaseCoreReporter', () => {

    const qaseCoreReporterOptions: QaseCoreReporterOptions = {
        reporterName: 'qase-core-reporter',
        frameworkName: 'qase-core-reporter',
    };

    describe('load Qase config', () => {
        it('should load config from setting loadConfig=true,qase.config.json', () => {
            const testConfigData = require('../qase.config.json');
            const reporter = new QaseCoreReporter(
                {} as any,
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter',
                    loadConfig: true
                });
            expect(reporter.options.apiToken).toEqual(testConfigData.apiToken);
        });

        it('should load config from setting loadConfig=true,.qaserc', () => {
            // delete qase.config.json
            const testConfigData = require('../qase.config.json');
            unlinkSync(process.cwd() + '/qase.config.json');
            const reporter = new QaseCoreReporter(
                {} as any,
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter',
                    loadConfig: true
                });
            expect(reporter.options.projectCode).toEqual('ConfigRCProject');
            // restore qase.config.json
            writeFileSync(process.cwd() + '/qase.config.json', JSON.stringify(testConfigData, null, 2));
        });

        it('should load config from loadConfig public method - qase.config.json', () => {
            const loadedConfig = QaseCoreReporter.loadConfig('qase.config.json');
            const testConfigData = require('../qase.config.json');
            expect(testConfigData).toEqual(loadedConfig);
        });

        it('should load config from loadConfig public method - .qaserc', () => {
            const loadedConfig = QaseCoreReporter.loadConfig('.qaserc');
            expect(loadedConfig).toEqual({
                "projectCode": "ConfigRCProject",
                "apiToken": "11235678909"
            });
        });

        it('should return empty object when config parsing throws error', () => {
            const testConfigData = require('../qase.config.json');
            // create invalid json
            writeFileSync(process.cwd() + '/qase.config.json', 'invalid json');
            const loadedConfig = QaseCoreReporter.loadConfig('qase.config.json');
            expect(loadedConfig).toEqual({});
            // restore qase.config.json
            writeFileSync(process.cwd() + '/qase.config.json', JSON.stringify(testConfigData, null, 2));
        });

    });

    describe('public methods', () => {
        delete process.env.QASE_PROJECT_CODE;
        describe('start', () => {
            it('should check valid project, and existing run', async () => {
                const reporter = new QaseCoreReporter(
                    {
                        report: true,
                        apiToken: '123',
                        projectCode: 'TP',
                        logging: true,
                        basePath: 'https://api.qase.io/v1',
                        runComplete: true,
                        environmentId: 1,
                        rootSuiteTitle: 'Cypress tests',
                    },
                    qaseCoreReporterOptions);

                await reporter.start();
                expect(reporter['isDisabled']).toBe(false);
            });

            it('should disable if project does not exist', async () => {
                const reporter = new QaseCoreReporter(
                    {
                        report: true,
                        apiToken: '123',
                        projectCode: 'TP-invalid',
                        logging: true,
                        basePath: 'https://api.qase.io/v1',
                        runComplete: true,
                        environmentId: 1,
                        rootSuiteTitle: 'Cypress tests',
                    },
                    qaseCoreReporterOptions);

                await reporter.start();
                expect(reporter['isDisabled']).toBe(true);
            });
        });

        describe('addTestResult', () => {
            const options = {
                report: true,
                apiToken: '123',
                projectCode: 'TP',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            };

            const qaseCoreOptions = {
                frameworkName: 'jest',
                reporterName: 'qase-core-reporter',
                screenshotFolder: './',
                uploadAttachments: true,
            };

            it('should add unknown case', () => {
                const testData: TestResult = {
                    id: '1245643254',
                    title: 'Test 1',
                    status: ResultCreateStatusEnum.PASSED,
                    duration: 100,
                };

                const expectedData = {
                    id: '1245643254',
                    status: 'passed',
                    time_ms: 100,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: false,
                    param: undefined,
                    attachments: undefined,
                    case: {
                        title: 'Test 1',
                        suite_title: 'Cypress tests'
                    }
                };

                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.PASSED, [{ path: process.cwd() + '/screenshots/' + 'screenshot.png' }]);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });

            it('should add test case with title and status only', () => {
                const testData: TestResult = {
                    title: 'Test 4',
                    status: ResultCreateStatusEnum.FAILED,
                };

                const expectedData = {
                    status: 'failed',
                    time_ms: 0,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: true,
                    param: undefined,
                    attachments: undefined,
                    case: { title: 'Test 4', suite_title: 'Cypress tests' }
                };
                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });

            it('should add test with error', () => {
                const testData: TestResult = {
                    title: 'Test 2',
                    status: ResultCreateStatusEnum.FAILED,
                    duration: 100,
                    error: new Error('Test 2 error'),
                    suitePath: 'tMy First Test\tTest Suite - Level 2',
                };

                const expectedData = {
                    status: 'failed',
                    time_ms: 100,
                    comment: 'Test 2: Test 2 error',
                    defect: true,
                    param: undefined,
                    attachments: undefined,
                    case: {
                        title: 'Test 2',
                        suite_title: 'Cypress tests\ttMy First Test\tTest Suite - Level 2'
                    }
                };
                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED, []);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });

            it('should add test with error and stacktrace', () => {
                const testData: TestResult = {
                    title: 'Test 3',
                    status: ResultCreateStatusEnum.FAILED,
                    duration: 100,
                    stacktrace: 'Test 3 error stacktrace',
                    error: new Error('Test 3 error'),
                    suitePath: 'My First Test\tTest Suite - Level 4',
                };

                const expectedData = {
                    status: 'failed',
                    time_ms: 100,
                    stacktrace: 'Test 3 error stacktrace',
                    comment: 'Test 3: Test 3 error',
                    defect: true,
                    param: undefined,
                    attachments: undefined,
                    case: {
                        title: 'Test 3',
                        suite_title: 'Cypress tests\tMy First Test\tTest Suite - Level 4'
                    }
                };
                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED, []);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });

            it('should add test with attachment hash', () => {
                const testData: TestResult = {
                    title: 'Test 2',
                    status: ResultCreateStatusEnum.FAILED,
                    duration: 100,
                    error: new Error('Test 2 error'),
                    attachments: ['123454328o798u9p4jnkjfn'],
                    suitePath: 'My First Test\tTest Suite - Level 2',
                };

                const expectedData = {
                    status: 'failed',
                    time_ms: 100,
                    comment: 'Test 2: Test 2 error',
                    defect: true,
                    param: undefined,
                    attachments: ['123454328o798u9p4jnkjfn'],
                    case: {
                        title: 'Test 2',
                        suite_title: 'Cypress tests\tMy First Test\tTest Suite - Level 2'
                    }
                }

                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED, []);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });

            it('should parse param from title', () => {
                const testData: TestResult = {
                    title: 'Test 5 (Qase Dataset: #0 (expected data))',
                    status: ResultCreateStatusEnum.SKIPPED,
                }

                const expectedData = {
                    status: 'skipped',
                    time_ms: 0,
                    stacktrace: undefined,
                    comment: '::_using data set #0 (expected data)_',
                    defect: false,
                    param: { jest: '#0' },
                    attachments: undefined,
                    case: {
                        title: 'Test 5',
                        suite_title: 'Cypress tests'
                    }
                };

                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.SKIPPED);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });

            it('should parse param from failed test', () => {
                const testData: TestResult = {
                    title: 'Test 5 (Qase Dataset: #0 (expected data))',
                    error: new Error('Test 5 error'),
                    stacktrace: 'Test 5 error stacktrace',
                    status: ResultCreateStatusEnum.FAILED,
                }

                const expectedData = {
                    status: 'failed',
                    time_ms: 0,
                    stacktrace: 'Test 5 error stacktrace',
                    defect: true,
                    param: { jest: '#0' },
                    attachments: undefined,
                    case: {
                        title: 'Test 5',
                        suite_title: 'Cypress tests'
                    }
                };

                const reporter = new QaseCoreReporter(options, qaseCoreOptions);
                reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED);
                expect(reporter['resultsForPublishing'][0])
                    .toEqual(expect.objectContaining(expectedData));
            });
        });

        describe('end', () => {

            it('no test results added', async () => {
                const reporter = new QaseCoreReporter(
                    { apiToken: '123', projectCode: 'TP', report: true, runComplete: true },
                    { frameworkName: 'jest', reporterName: 'qase' }
                );

                await reporter.start();
                await reporter.end({ spawn: false });
                expect(reporter.resultsForPublishingCount).toEqual(0);
            });

            it('add test result with attachments', async () => {
                const reporter = new QaseCoreReporter(
                    { apiToken: '123', projectCode: 'TP', runComplete: true, report: true },
                    { frameworkName: 'jest', reporterName: 'qase', uploadAttachments: true }
                );

                const testResult: TestResult = {
                    id: '123',
                    title: 'test',
                    caseIds: [1],
                    status: ResultCreateStatusEnum.PASSED,
                };

                const attachmentPath = process.cwd() + '/screenshots/screenshot.png';
                await reporter.start();
                reporter.addTestResult(testResult, ResultCreateStatusEnum.PASSED, [{ path: attachmentPath }]);
                await reporter.end({ spawn: false });

                expect(reporter.resultsForPublishingCount).toEqual(1);
                expect(reporter['resultsForPublishing'][0]).toEqual(
                    {
                        "attachments": ['6a8544c6384de9cdc7a27cc00e6538e90b9e69c5'],
                        "case_id": 1,
                        "comment": undefined,
                        "defect": false,
                        "id": "123",
                        "param": undefined,
                        "stacktrace": undefined,
                        "status": "passed",
                        "time_ms": 0
                    });
                expect(reporter['attachments']).toEqual({ 123: [{ path: attachmentPath }] });
            });

            it.skip('end report using spawn', async () => {

                const reporter = new QaseCoreReporter(
                    { apiToken: '123', projectCode: 'TP', report: true },
                    { frameworkName: 'jest', reporterName: 'qase', uploadAttachments: true, screenshotFolder: 'screenshots' }
                );
                const endSpy = vi.spyOn(reporter, 'end');
                reporter['end'] = vi.fn(reporter.end);

                // start mock server in separate process
                await reporter.start();

                reporter.addTestResult({ title: 'test', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);

                await reporter.end({ spawn: true });

                // check on child process
                expect(endSpy).toHaveBeenCalled();
            });
        });
    });

    describe('constructor', () => {
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

        describe('qaseCoreReporterOptions', () => {
            it('should be able to set qaseCoreReporterOptions.frameworkName', () => {
                const reporter = new QaseCoreReporter(
                    {
                        apiToken: 'token',
                        projectCode: 'code',
                    },
                    {
                        frameworkName: 'framework',
                    } as any);

                expect(reporter['options']['qaseCoreReporterOptions']?.frameworkName)
                    .toBe('framework');
            });
            it('should be able to set qaseCoreReporterOptions.reporterName', () => {
                const reporter = new QaseCoreReporter(
                    {
                        apiToken: 'token',
                        projectCode: 'code',
                    },
                    {
                        reporterName: 'reporter',
                    } as any);

                expect(reporter['options']['qaseCoreReporterOptions']?.reporterName)
                    .toBe('reporter');
            });
            it('should be able to set qaseCoreReporterOptions.screenshotFolder', () => {
                const reporter = new QaseCoreReporter(
                    {
                        apiToken: 'token',
                        projectCode: 'code',
                    },
                    {
                        screenshotFolder: 'screenshotFolder',
                    } as any);

                expect(reporter['options']['qaseCoreReporterOptions']?.screenshotFolder)
                    .toBe('screenshotFolder');
            });
            it('should be able to set qaseCoreReporterOptions.videoFolder', () => {
                const reporter = new QaseCoreReporter(
                    {
                        apiToken: 'token',
                        projectCode: 'code',
                    },
                    {
                        videoFolder: 'videoFolder',
                    } as any);

                expect(reporter['options']['qaseCoreReporterOptions']?.videoFolder)
                    .toBe('videoFolder');
            });
            it('should be able to set qaseCoreReporterOptions.uploadAttachments', () => {
                const reporter = new QaseCoreReporter(
                    {
                        apiToken: 'token',
                        projectCode: 'code',
                    },
                    {
                        uploadAttachments: true,
                    } as any);

                expect(reporter['options']['qaseCoreReporterOptions']?.uploadAttachments)
                    .toBe(true);
            });
            it('should be able to set qaseCoreReporterOptions.loadConfig', () => {
                const reporter = new QaseCoreReporter(
                    {
                        apiToken: 'token',
                        projectCode: 'code',
                    },
                    {
                        loadConfig: true,
                    } as any);

                expect(reporter['options']['qaseCoreReporterOptions']?.loadConfig)
                    .toBe(true);
            });
        });
    });

    describe('qase exports', () => {
        describe('qase', () => {
            it('should return test when test is undefined', () => {
                const testData = undefined;
                const result = qase([1], testData);
                expect(result).toBe(undefined);
            });

            it('should return test object with Qase ID when string is used', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qase('1', test);
                expect(newTest.title).toBe('test (Qase ID: 1)');
            });

            it('should return test object with Qase ID when number is used', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qase(1, test);
                expect(newTest.title).toBe('test (Qase ID: 1)');
            });

            it('should return test object with Qase ID when array is used', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qase([1, 2], test);
                expect(newTest.title).toBe('test (Qase ID: 1,2)');
            });
        });

        describe('qaseParam', () => {
            it('should return test title with param format - object, caseId array', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qaseParam([1, 2], [0, { a: 'a', b: 'b', expected: 'ab' }], test.title);
                expect(newTest).toBe('test (Qase ID: 1,2) (Qase Dataset: #0 (a: a, b: b, expected: ab))');
            });

            it('should return test title with param format - string, caseId array', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qaseParam([1, 2], [0, 'a: a, b: b, expected: ab'], test.title);
                expect(newTest).toBe('test (Qase ID: 1,2) (Qase Dataset: #0 (a: a, b: b, expected: ab))');
            });

            it('should return test title with param format - string, no caseId', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qaseParam(null, [0, 'a: a, b: b, expected: ab'], test.title);
                expect(newTest).toBe('test (Qase Dataset: #0 (a: a, b: b, expected: ab))');
            });

            it('should return test title with param format - string, caseId string|number', () => {
                const test = {
                    title: 'test',
                };
                const newTest = qaseParam('1', [0, 'a: a, b: b, expected: ab'], test.title);
                expect(newTest).toBe('test (Qase ID: 1) (Qase Dataset: #0 (a: a, b: b, expected: ab))');
            });
        });

        describe('qaseTitle', () => {
            it('should return title with Qase ID when string is used', () => {
                const title = qaseTitle('1', 'My First Test');
                expect(title).toBe('My First Test (Qase ID: 1)');
            });

            it('should return title with Qase ID when number is used', () => {
                const title = qaseTitle(1, 'My First Test');
                expect(title).toBe('My First Test (Qase ID: 1)');
            });

            it('should return title with Qase ID when array is used', () => {
                const title = qaseTitle([1, 2], 'My First Test');
                expect(title).toBe('My First Test (Qase ID: 1,2)');
            });
        });
    });

    describe('getSuitePath', () => {

        it('should return suite title', () => {
            const suiteWithoutParent = {
                title: 'My First Test',
                parent: '',
            };

            const suitePath = QaseCoreReporter['getSuitePath'](suiteWithoutParent);
            expect(suitePath).toBe(suiteWithoutParent.title);
        });


        it('should return suite path with parent', () => {
            const suiteWithParent = {
                title: 'My First Test',
                parent: {
                    title: 'Describe 1',
                    parent: '',
                }
            };
            const suitePath = QaseCoreReporter['getSuitePath'](suiteWithParent);
            expect(suitePath).toBe('Describe 1\tMy First Test');
        });


        it('should return suite path with parent and grand parent', () => {
            const suiteWithParentAndGrandParent = {
                title: 'My First Test',
                parent: {
                    title: 'Describe 2',
                    parent: {
                        title: 'Describe 1',
                        parent: '',
                    }
                }
            };
            const suitePath = QaseCoreReporter['getSuitePath'](suiteWithParentAndGrandParent);
            expect(suitePath).toBe('Describe 1\tDescribe 2\tMy First Test');
        });
    });

    describe('parseScreenshotDirectory', () => {
        it('should return screenshot directory', () => {
            const screenshotDirectory = QaseCoreReporter.parseAttachmentDirectory('/screenshots');
            expect(screenshotDirectory).toEqual({
                2: {
                    caseId: 2,
                    file: ["withCaseId/screenshot (Qase ID: 2).png"]
                }
            });
        });
        it('should return empty when no files are found', () => {
            const screenshotDirectory = QaseCoreReporter.parseAttachmentDirectory(__dirname + '/not-existing');
            expect(screenshotDirectory).toEqual({});
        });
    });
});

