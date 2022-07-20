import PlaywrightReporter from '../src';
import { test, expect } from '@playwright/test';

test.describe('Client', () => {
    test('Init client', () => {
        const options = { apiToken: '', projectCode: '' };
        new PlaywrightReporter(options);
    });

    test.describe('Auto Create Defect', () => {
        const options = { apiToken: '', projectCode: '' };
        const pReporter = new PlaywrightReporter(options);

        const testData = [
            {
                testCase: { title: 'Test (Qase ID: 1)' },
                testResult: { status: 'failed' },
                attachments: [],
                defect: true
            },
            {
                testCase: { title: 'Test (Qase ID: 2)' },
                testResult: { status: 'passed' },
                attachments: [],
                defect: false
            },
            {
                testCase: { title: 'Test (Qase ID: 3)' },
                testResult: { status: 'skipped' },
                attachments: [],
                defect: false
            },
            {
                testCase: { title: 'Test (Qase ID: 4)' },
                testResult: { status: 'disabled' },
                attachments: [],
                defect: false
            },
            {
                testCase: { title: 'Test (Qase ID: 5)' },
                testResult: { status: 'pending' },
                attachments: [],
                defect: false
            }
        ];

        testData.forEach(data => {
            pReporter['prepareCaseResult'](data.testCase as any, data.testResult as any, data.attachments);
        });

        for (const index in testData) {
            let status = testData[index].testResult.status;
            let expectedDefect = testData[index].defect;

            test(`should set defect=${expectedDefect} when status=${status}`, async () => {
                expect(pReporter['resultsToBePublished'][index].defect).toBe(expectedDefect);
            });
        };
    });
});
