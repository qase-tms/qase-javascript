import { describe, expect, it } from '@jest/globals';
import QaseReporter from '../src';

describe('Client', () => {
    it('Init client', () => {
        const options = { apiToken: "", projectCode: "" };
        new QaseReporter({}, options);
    });

    describe('Auto Create Defect', () => {
        const options = { apiToken: "", projectCode: "" };
        describe('known test cases', () => {
            const qReporter = new QaseReporter({}, options);
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
            ]
            qReporter['preparedTestCases'] = qReporter['createPreparedForPublishTestsArray'](testData.map(td => td.test) as any);
            const testResultsForPublishing = qReporter['createResultCasesArray']();

            for (const index in testData) {
                const status = testData[index].test.status;
                const defect = testData[index].defect;
                it(`should set defect=${defect} when status=${status}`, () => {
                    expect(testResultsForPublishing[index].defect).toBe(defect);
                });
            };
        });

        describe('unknown test cases', () => {
            const qReporter = new QaseReporter({}, options);
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
            qReporter['preparedTestCases'] = qReporter['createPreparedForPublishTestsArray'](testData.map(td => td.test) as any);
            const testResultsForPublishing = qReporter['createResultCasesArray']();

            for (const index in testData) {
                const status = testData[index].test.status;
                const defect = testData[index].defect;
                it(`should set defect=${defect} when status=${status}`, () => {
                    expect(testResultsForPublishing[index].defect).toBe(defect);
                });
            };
        });
    });
});
