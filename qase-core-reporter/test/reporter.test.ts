import { describe, expect, it, jest } from '@jest/globals';
import { unlinkSync, writeFileSync } from 'fs'
import { ResultCreateStatusEnum } from 'qaseio/dist/src'
import { QaseCoreReporter, qase, qaseTitle, TestResult, qaseParam } from '../src';

describe('QaseCoreReporter', () => {
    describe('Logging', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        it('disabled - ENV', () => {
            process.env.QASE_LOGGING = 'false'
            const _ = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP'
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            expect(consoleSpy).not.toBeCalledWith(expect.stringContaining('qase'));
        });

        it('disabled - Qase Option', () => {
            process.env.QASE_LOGGING = undefined;
            const _ = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP',
                    logging: false
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            expect(consoleSpy).not.toBeCalledWith(expect.stringContaining('qase'));
        });

        it('disabled - Default', () => {
            process.env.QASE_LOGGING = undefined;
            const _ = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP'
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            expect(consoleSpy).not.toBeCalledWith(expect.stringContaining('qase'));
        });

        it('enabled - ENV', () => {
            process.env.QASE_LOGGING = 'true';
            const _ = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP'
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            expect(consoleSpy).toBeCalledWith(expect.stringContaining('qase'));
        });

        it('enabled - Qase Options', () => {
            process.env.QASE_LOGGING = undefined;
            const _ = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP',
                    logging: true
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            expect(consoleSpy).toBeCalledWith(expect.stringContaining('qase'));
        });
    });

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

    describe('Invalid', () => {
        it('should be disabled if projectCode is non-existent', async () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP-invalid',
                    logging: true
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            await reporter.start();
            expect(reporter['isDisabled']).toBeTruthy();
        });

        it('should be disabled if runId is non-existent', async () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP',
                    runId: '404', // mock server will return 404
                    report: true,
                    logging: true
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            await reporter.start();
            expect(reporter['isDisabled']).toBeTruthy();
        });

        it('should throw error if there was an issue with runComplete request', async () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP-run-incomplete',
                    runId: '3',
                    runComplete: true,
                    report: true,
                    logging: true
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            await reporter.start();
            reporter.addTestResult(
                { title: 'test', status: ResultCreateStatusEnum.INVALID },
                ResultCreateStatusEnum.INVALID
            );
            await reporter.end({ spawn: false });
            expect(reporter['isDisabled']).toBeTruthy();
        });
    });

    describe('qaseOptions', () => {
        it('should set runId from options', async () => {
            const reporter = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP',
                    runId: 123
                } as any,
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            await reporter.start();
            expect(reporter.options.runId).toEqual(123);
        });
    });

    describe('Start -> End Workflows', () => {

        it('Init client', async () => {
            const options = {
                report: true,
                apiToken: '123',
                projectCode: 'TP',
                logging: true,
                basePath: 'https://api.qase.io/v1',
                screenshotFolder: './',
                sendScreenshot: true,
                runComplete: true,
                environmentId: 1,
                rootSuiteTitle: 'Cypress tests',
            };
            const qaseCoreOptions = {
                frameworkName: 'jest',
                reporterName: 'qase-core-reporter',
                sendScreenshot: options.sendScreenshot,
                screenshotFolder: options.screenshotFolder,
                uploadAttachments: true,
            }
            const reporter = new QaseCoreReporter(options, qaseCoreOptions);

            QaseCoreReporter.reporterPrettyName = 'Cypress Reporter';

            const testData: TestResult[] = [
                {
                    id: '1245643254',
                    title: 'Test 1',
                    status: ResultCreateStatusEnum.PASSED,
                    duration: 100,
                }, {
                    title: 'Test 2',
                    status: ResultCreateStatusEnum.FAILED,
                    duration: 100,
                    error: new Error('Test 2 error'),
                    suitePath: 'tMy First Test\tTest Suite - Level 2',
                }, {
                    title: 'Test 2',
                    status: ResultCreateStatusEnum.FAILED,
                    duration: 100,
                    error: new Error('Test 2 error'),
                    attachments: ['123454328o798u9p4jnkjfn'],
                    suitePath: 'My First Test\tTest Suite - Level 2',
                },
                {
                    title: 'Test 3',
                    status: ResultCreateStatusEnum.FAILED,
                    duration: 100,
                    stacktrace: 'Test 3 error stacktrace',
                    error: new Error('Test 3 error'),
                    suitePath: 'My First Test\tTest Suite - Level 4',
                },
                {
                    title: 'Test 4',
                    status: ResultCreateStatusEnum.FAILED,
                },
                {
                    title: 'Test 5 (Qase Dataset: #0 (expected data))',
                    status: ResultCreateStatusEnum.SKIPPED,
                }
            ];

            const expectedResultsForPublishing = [
                {
                    id: '1245643254',
                    status: 'passed',
                    time_ms: 100,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: false,
                    param: undefined,
                    attachments: ['6a8544c6384de9cdc7a27cc00e6538e90b9e69c5'],
                    case: { title: 'Test 1', suite_title: 'Cypress tests' }
                },
                {
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
                },
                {
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
                },
                {
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
                },
                {
                    status: 'failed',
                    time_ms: 0,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: false,
                    param: undefined,
                    attachments: undefined,
                    case: { title: 'Test 4', suite_title: 'Cypress tests' }
                },
                {
                    status: 'skipped',
                    time_ms: 0,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: false,
                    param: { jest: '#0' },
                    attachments: undefined,
                    case: {
                        title: 'Test 5 (Qase Dataset: #0 (expected data))',
                        suite_title: 'Cypress tests'
                    }
                }
            ]

            await reporter.start();

            reporter.addTestResult(testData[0], ResultCreateStatusEnum.PASSED, [{ path: process.cwd() + '/screenshots/' + 'screenshot.png' }]);
            reporter.addTestResult(testData[1], ResultCreateStatusEnum.FAILED);
            reporter.addTestResult(testData[2], ResultCreateStatusEnum.FAILED);
            reporter.addTestResult(testData[3], ResultCreateStatusEnum.FAILED);
            reporter.addTestResult(testData[4], 'skipped-invalid' as any);
            reporter.addTestResult(testData[5], ResultCreateStatusEnum.SKIPPED);

            await reporter.end({ spawn: false });
            expect(reporter['resultsForPublishing'][0])
                .toEqual(expect.objectContaining(expectedResultsForPublishing[0]));
            expect(reporter['resultsForPublishing'][1])
                .toEqual(expect.objectContaining(expectedResultsForPublishing[1]));
            expect(reporter['resultsForPublishing'][2])
                .toEqual(expect.objectContaining(expectedResultsForPublishing[2]));
            expect(reporter['resultsForPublishing'][3])
                .toEqual(expect.objectContaining(expectedResultsForPublishing[3]));
            expect(reporter['resultsForPublishing'][4])
                .toEqual(expect.objectContaining(expectedResultsForPublishing[4]));
            expect(reporter['resultsForPublishing'][5])
                .toEqual(expect.objectContaining(expectedResultsForPublishing[5]));
            expect(reporter['isDisabled']).toBeFalsy();
        });

        const reporter = new QaseCoreReporter(
            {
                apiToken: '123',
                projectCode: 'TP',
                rootSuiteTitle: 'root',
                report: true,
            },
            {
                frameworkName: 'jest',
                reporterName: 'qase',
                uploadAttachments: false,
            }
        );

        it('no test results added', async () => {
            const reporter = new QaseCoreReporter(
                { apiToken: '123', projectCode: 'TP', report: true },
                { frameworkName: 'jest', reporterName: 'qase' }
            );

            await reporter.start();
            await reporter.end({ spawn: false });
            expect(reporter.resultsForPublishingCount).toEqual(0);
        });

        it('add test result with rootSuiteTitle', async () => {

            const testResult: TestResult = {
                title: 'test',
                suitePath: 'Describe 1\tDescribe 2',
                status: ResultCreateStatusEnum.PASSED,
            };

            await reporter.start();

            reporter.addTestResult(testResult, ResultCreateStatusEnum.PASSED, [{ path: 'file-1' }]);

            await reporter.end({ spawn: false });

            expect(reporter.resultsForPublishingCount).toEqual(1);
            expect(reporter['resultsForPublishing'][0]).toMatchObject(
                {
                    "attachments": undefined,
                    "case": {
                        "title": "test",
                        "suite_title": "root\tDescribe 1\tDescribe 2"
                    },
                    "comment": undefined,
                    "defect": false,
                    "param": undefined,
                    "stacktrace": undefined,
                    "status": "passed",
                    "time_ms": 0
                });
        });

        it('add test result with attachments', () => {
            const reporter = new QaseCoreReporter(
                { apiToken: '123', projectCode: 'TP' },
                { frameworkName: 'jest', reporterName: 'qase' }
            );

            const testResult: TestResult = {
                id: '123',
                title: 'test',
                caseIds: [1],
                status: ResultCreateStatusEnum.PASSED,
            };

            reporter.addTestResult(testResult, ResultCreateStatusEnum.PASSED, [{ path: 'file-1' }]);

            expect(reporter.resultsForPublishingCount).toEqual(1);
            expect(reporter['resultsForPublishing'][0]).toEqual(
                {
                    "attachments": undefined,
                    "case_id": 1,
                    "comment": undefined,
                    "defect": false,
                    "id": "123",
                    "param": undefined,
                    "stacktrace": undefined,
                    "status": "passed",
                    "time_ms": 0
                });
            expect(reporter['attachments']).toEqual({ 123: [{ path: 'file-1' }] });
        });

        it('add test result without Qase ID', () => {
            const reporter = new QaseCoreReporter(
                { apiToken: '123', projectCode: 'TP' },
                { frameworkName: 'jest', reporterName: 'qase' }
            );

            const testResult: TestResult = {
                title: 'test',
                suitePath: 'Describe 1\tDescribe 2',
                status: ResultCreateStatusEnum.PASSED,
            };

            reporter.addTestResult(testResult, ResultCreateStatusEnum.PASSED, [{ path: 'file-1' }]);

            expect(reporter.resultsForPublishingCount).toEqual(1);
            expect(reporter['resultsForPublishing'][0]).toMatchObject(
                {
                    "attachments": undefined,
                    "case": {
                        "title": "test",
                        "suite_title": "Describe 1\tDescribe 2"
                    },
                    "comment": undefined,
                    "defect": false,
                    "param": undefined,
                    "stacktrace": undefined,
                    "status": "passed",
                    "time_ms": 0
                });
        });

        it.skip('end report using spawn', async () => {

            const reporter = new QaseCoreReporter(
                { apiToken: '123', projectCode: 'TP', report: true },
                { frameworkName: 'jest', reporterName: 'qase' }
            );
            const endSpy = jest.spyOn(reporter, 'end');

            // start mock server in separate process
            await reporter.start();
            reporter.addTestResult({ title: 'test', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);
            await reporter.end({ spawn: true });

            // check on child process
            expect(endSpy).toHaveBeenCalled();
        });
    });


    it('createHeaders', () => {

        const coreReporterOptions = {
            frameworkName: 'jest',
            reporterName: 'qase-core-reporter',
        };

        const headers = QaseCoreReporter['createHeaders'](coreReporterOptions);

        expect(headers).toHaveProperty('X-Client');
        expect(headers).toHaveProperty('X-Platform');
        expect(headers['X-Client']).toMatch(/jest=\d+\.\d+\.\d+; qase-core-reporter=\d+\.\d+\.\d+; qaseapi=v\d+\.\d+\.\d+/);
        expect(headers['X-Platform']).toMatch(/node=v\d+\.\d+\.\d+; npm=\d+\.\d+\.\d+; os=\w+; arch=\w+/);
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

    describe('getFiles', () => {
        it('should return array with files when files are found', () => {
            const files = QaseCoreReporter['getFiles'](__dirname);
            expect(files.length).toEqual(4);
        });
        it('should return empty array when files are not found', () => {
            const files = QaseCoreReporter['getFiles'](__dirname + '/not-existing');
            expect(files).toEqual([]);
        });
        it('should traverse subdirectories', () => {
            const files = QaseCoreReporter['getFiles'](__dirname + '/../screenshots');
            expect(files).toEqual([
                "screenshot.png",
                "subDir/demo.gif",
                "withCaseId/screenshot (Qase ID: 2).png"]);
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
    });

    describe('getParameterizedData', () => {

        it('should return parameterized data', () => {
            const testTitle = 'test (Qase Dataset: #1 (a:1, b:2, expected:3))'
            const parameterizedData = QaseCoreReporter['getParameterizedData'](testTitle);
            expect(parameterizedData).toEqual({
                id: '#1',
                dataset: '(a:1, b:2, expected:3)'
            });
        });

        it('should return undefined when parameterized data is not found', () => {
            const testTitle = 'test'
            const parameterizedData = QaseCoreReporter['getParameterizedData'](testTitle);
            expect(parameterizedData).toEqual(undefined);
        });
    });

    describe('removeQaseDataset', () => {
        it('should remove qase dataset from test', () => {
            const testTitle = 'test (Qase Dataset: #1 (a:1, b:2, expected:3))';
            const newTest = QaseCoreReporter['removeQaseDataset'](testTitle);
            expect(newTest).toBe('test ');
        });
    });

    describe('getCaseIds', () => {
        it('should return case ids from test title', () => {
            const testTitle = 'test (Qase ID: 1,2,3)'
            const caseIds = QaseCoreReporter['getCaseIds'](testTitle);
            expect(caseIds).toEqual([1, 2, 3]);
        });

        it('should return empty array when case ids are not found', () => {
            const testTitle = 'test'
            const caseIds = QaseCoreReporter['getCaseIds'](testTitle);
            expect(caseIds).toEqual([]);
        });
    });

    describe('getPackageVersion', () => {
        it('should return package version', () => {
            const packageVersion = QaseCoreReporter['getPackageVersion']('jest');
            expect(packageVersion).toEqual(expect.stringMatching(/^\d+\.\d+\.\d+$/));
        });

        it('should return undefined when package is not found', () => {
            const packageVersion = QaseCoreReporter['getPackageVersion']('not-existing');
            expect(packageVersion).toBe("undefined");
        });
    });

    describe('addToAttachments', () => {
        const reporter = new QaseCoreReporter({ apiToken: '123', projectCode: 'TP' },
            { frameworkName: 'jest', reporterName: 'qase' });
        it('should add attachment to attachments', () => {
            const attachment = [{ path: 'screenshot', }];
            reporter['addToAttachments'](attachment, '1234');
            expect(reporter['attachments']).toEqual({ 1234: attachment });
        });
    });

    describe('formatComment', () => {
        const reporter = new QaseCoreReporter({ apiToken: '123', projectCode: 'TP' },
            { frameworkName: 'jest', reporterName: 'qase' });

        it('should format comment', () => {
            const comment = reporter['formatComment']('test',
                Error('test error'), undefined as any);
            expect(comment).toBe('test: test error');
        });

        it('should format comment with para data', () => {
            const comment = reporter['formatComment']('test',
                Error('test error'), { id: '#1', dataset: '(test data)' });
            expect(comment).toBe(`test::_using data set #1 (test data)_
            \n\n>test error`);
        });
    });
});
