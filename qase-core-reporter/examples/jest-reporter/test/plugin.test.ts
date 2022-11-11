import { describe, expect, it } from '@jest/globals';
import JestQaseReporter from '../src';
import { QaseCoreReporter } from 'qase-core-reporter';
import { Test, TestResult } from '@jest/reporters';

describe('Client', () => {
    it('Init client', () => {
        const options = { apiToken: "", projectCode: "" };
        const qReporter = new JestQaseReporter({}, options);
        expect(qReporter['reporter']).toBeDefined();
    });

    it('should have reporter pretty name set to "jest"', () => {
        const options = { apiToken: "", projectCode: "" };
        const _ = new JestQaseReporter({}, options);
        expect(QaseCoreReporter.reporterPrettyName).toBe('jest');
    });

    describe('auto create defect', () => {
        const options = { apiToken: "", projectCode: "" };
        describe('known test cases', () => {
            const qReporter = new JestQaseReporter({}, options);
            const testData = [
                {
                    test: {
                        duration: 0,
                        status: 'failed',
                        title: 'Test (Qase ID: 1)',
                        failureMessages: ['failure message'],
                        ancestorTitles: ['some ancestor', "path"]
                    },
                    defect: true,
                },
                {
                    test: {
                        duration: 0,
                        status: 'passed',
                        title: 'Test (Qase ID: 2)',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 2', "path"]
                    },
                    defect: false,
                },
                {
                    test: {
                        duration: 0,
                        status: 'skipped',
                        title: 'Test (Qase ID: 3)',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 3', "path"]
                    },
                    defect: false,
                },
                {
                    test: {
                        duration: 0,
                        status: 'pending',
                        title: 'Test (Qase ID: 4)',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 4', "path"]
                    },
                    defect: false,
                },
                {
                    test: {
                        duration: 0,
                        status: 'disabled',
                        title: 'Test (Qase ID: 5)',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 5', "path"]
                    },
                    defect: false,
                },
            ];

            qReporter.onTestResult({} as Test, { testResults: testData.map(data => data.test) } as TestResult);
            for (const index in testData) {
                const status = testData[index].test.status;
                const defect = testData[index].defect;
                it(`should set defect=${defect} when status=${status}`, () => {
                    expect(qReporter['reporter']['resultsForPublishing'][index].defect).toBe(defect);
                });
            };
        });

        describe('unknown test cases', () => {
            const qReporter = new JestQaseReporter({}, options);
            const testData = [
                {
                    test: {
                        duration: 0,
                        status: 'failed',
                        title: 'Test 1',
                        failureMessages: ['failure message'],
                        ancestorTitles: ['some ancestor', "path"]
                    },
                    defect: true,
                },
                {
                    test: {
                        duration: 0,
                        status: 'passed',
                        title: 'Test 2',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 2', "path"]
                    },
                    defect: false,
                },
                {
                    test: {
                        duration: 0,
                        status: 'skipped',
                        title: 'Test 3',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 3', "path"]
                    },
                    defect: false,
                },
                {
                    test: {
                        duration: 0,
                        status: 'pending',
                        title: 'Test 4',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 4', "path"]
                    },
                    defect: false,
                },
                {
                    test: {
                        duration: 0,
                        status: 'disabled',
                        title: 'Test 5',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor 5', "path"]
                    },
                    defect: false,
                },
            ]

            qReporter.onTestResult({} as Test, { testResults: testData.map(data => data.test) } as TestResult);

            for (const index in testData) {
                const status = testData[index].test.status;
                const defect = testData[index].defect;
                it(`should set defect=${defect} when status=${status}`, () => {
                    expect(qReporter['reporter']['resultsForPublishing'][index].defect).toBe(defect);
                });
            };
        });
    });

    describe('onRunStart', () => {
        const options = {
            apiToken: "123",
            projectCode: "TP",
            logging: true,
            runName: "Test run",
            runDescription: "Test run description",
            runId: "1",
            environmentId: 1,
            basePath: 'https://api.qase.io/v1',
            rootSuiteTitle: 'Jest tests',
            runComplete: true,
        };

        it('should create expected reporter options', async () => {
            const qReporter = new JestQaseReporter({}, options);

            await qReporter.onRunStart();

            const expectedOptions = {
                ...options,
                qaseCoreReporterOptions: {
                    frameworkName: 'jest',
                    reporterName: 'jest-qase-reporter',
                    customReporterName: 'qase-jest',
                    uploadAttachments: false,
                    enabledSupport: false
                },
            };

            expect(qReporter['reporter'].options).toEqual(expectedOptions);
        });
    });

    describe('onTestResult', () => {
        const options = {
            apiToken: "123",
            projectCode: "TP",
            logging: true,
            runName: "Test run",
            runDescription: "Test run description",
            runId: "1",
            environmentId: 1,
            basePath: 'https://api.qase.io/v1',
            rootSuiteTitle: 'Jest tests',
            runComplete: true,
        };

        it('should be able to add pass test result', async () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {
                duration: 2
            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'passed',
                        title: 'Test 1',
                        failureMessages: [],
                        duration: 2,
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(1);
            expect(qReporter['reporter']['resultsForPublishing']).toMatchObject([
                {
                    status: testData.testResults[0].status,
                    time_ms: testData.testResults[0].duration,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: false,
                    param: undefined,
                    attachments: undefined,
                    case: {
                        title: testData.testResults[0].title,
                        suite_title: 'Jest tests\tsome ancestor\tpath'
                    }
                }
            ]);
        });

        it('should be able to add fail test result', async () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {
                duration: 2
            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'failed',
                        title: 'Test 1',
                        failureMessages: ['failure message'],
                        duration: 2,
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(1);
            expect(qReporter['reporter']['resultsForPublishing']).toMatchObject([
                {
                    status: testData.testResults[0].status,
                    time_ms: testData.testResults[0].duration,
                    stacktrace: expect.stringMatching(/Error: failure message/),
                    comment: 'Test 1: failure message',
                    defect: true,
                    param: undefined,
                    attachments: undefined,
                    case: {
                        title: testData.testResults[0].title,
                        suite_title: 'Jest tests\tsome ancestor\tpath'
                    }
                }
            ]);
        });

        it('should be able to add skipped test result', async () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {

            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'skipped',
                        title: 'Test 1',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(1);
            expect(qReporter['reporter']['resultsForPublishing']).toMatchObject([
                {
                    status: testData.testResults[0].status,
                }
            ]);
        });

        it('should be able to add pending test result', () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {

            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'pending',
                        title: 'Test 1',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(1);
            expect(qReporter['reporter']['resultsForPublishing']).toMatchObject([
                {
                    status: 'skipped',
                    time_ms: 0,
                    stacktrace: undefined,
                    comment: undefined,
                    defect: false,
                    param: undefined,
                    attachments: undefined,
                    case: { title: 'Test 1', suite_title: 'Jest tests\tsome ancestor\tpath' }
                }
            ]);
        });

        it('should be able to add disabled test result', () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {

            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'disabled',
                        title: 'Test 1',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(1);
            expect(qReporter['reporter']['resultsForPublishing']).toMatchObject([
                {
                    status: 'failed',
                }
            ]);
        });

        it('should be able to add known test case', () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {

            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'passed',
                        title: 'Test (Qase ID: 5)',
                        failureMessages: [],
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(1);
            expect(qReporter['reporter']['resultsForPublishing']).toMatchObject([
                {
                    case_id: 5,
                }
            ]);
        });
    });

    describe('onRunComplete', () => {
        const options = {
            apiToken: "123",
            projectCode: "TP",
            logging: true,
            runName: "Test run",
            runDescription: "Test run description",
            runId: "1",
            environmentId: 1,
            basePath: 'https://api.qase.io/v1',
            rootSuiteTitle: 'Jest tests',
            runComplete: true,
        };

        it('should be able to publish results', async () => {
            const qReporter = new JestQaseReporter({}, options);

            const test = {
                duration: 2
            } as Test;

            const testData = {
                testResults: [
                    {
                        status: 'passed',
                        title: 'Test 1',
                        failureMessages: [],
                        duration: 2,
                        ancestorTitles: ['some ancestor', "path"]
                    },
                    {
                        status: 'failed',
                        title: 'Test 1',
                        failureMessages: ['failure message'],
                        duration: 2,
                        ancestorTitles: ['some ancestor', "path"]
                    }
                ] as unknown
            } as TestResult;

            qReporter.onTestResult(test, testData);

            await qReporter.onRunComplete();

            expect(qReporter['reporter'].resultsForPublishingCount).toBe(2);
        });
    });

    describe('getLastError', () => {
        const options = { apiToken: "", projectCode: "" };
        const qReporter = new JestQaseReporter({}, options);
        expect(qReporter.getLastError()).toBeUndefined();
    });
});
