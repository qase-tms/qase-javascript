import { describe, expect, it } from '@jest/globals';
import mocha from 'mocha';
import QaseCypressReporter from '../src';

describe('Client', () => {
    it('Init client', () => {
        const runner = new mocha.Runner(new mocha.Suite('new'), false)
        const options = { reporterOptions: { apiToken: "" } };
        new QaseCypressReporter(runner, options);
    });

    describe('Auto add defect', () => {
        let qReporter;
        const testData = [{
            test: {
                title: 'Test (Qase ID: 1)',
                duration: 1,
                err: {
                    message: 'Error message',
                    stack: 'Error stack',
                    name: 'Error name'
                }
            },
            status: 'failed',
            defect: true
        }, {
            test: {
                title: 'Test (Qase ID: 2)',
                duration: 1,
                err: null,
            },
            status: 'passed',
            defect: false
        }, {
            test: {
                title: 'Test (Qase ID: 3)',
                duration: 0,
                err: null,
            },
            status: 'skipped',
            defect: false
        },
        {
            test: {
                title: 'Test (Qase ID: 4)',
                duration: 1,
                err: null,
            },
            status: 'in_progress',
            defect: false
        },
        {
            test: {
                title: 'Test (Qase ID: 5)',
                duration: 1,
                err: null,
            },
            status: 'invalid',
            defect: false
        },
        {
            test: {
                title: 'Test (Qase ID: 6)',
                duration: 1,
                err: null,
            },
            status: 'blocked',
            defect: false
        }
        ];

        const runner = new mocha.Runner(new mocha.Suite('new'), false)
        const options = { reporterOptions: { apiToken: "", autoAddDefect: true } };
        qReporter = new QaseCypressReporter(runner, options);

        testData.forEach(test => {
            // add test data
            qReporter['transformCaseResultToBulkObject'](test.test, test.status);
        });

        for (const index in testData) {
            // check test data in bulk object
            it(`should set defect=${testData[index].defect} when status=${testData[index].status}`, () => {
                expect(qReporter['resultsForPublishing'][index].defect).toBe(testData[index].defect);
            });
        }
    })
});
