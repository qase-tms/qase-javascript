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
        const options = { reporterOptions: { apiToken: "" } };
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
    });

    describe('Auto create test case', () => {
        const runner = new mocha.Runner(new mocha.Suite('new'), false)
        let qReporter = new QaseCypressReporter(runner, { reporterOptions: { apiToken: "" } });
        it('should use parent as root suite title', () => {
            const test = {
                parent: {
                    title: 'Test Suite'
                },
                title: 'test 1',
                status: 'passed',
                duration: 1,
                err: null,
            };
            qReporter['transformCaseResultToBulkObject'](test as any, test.status as any);
            expect(qReporter['resultsForPublishing'][0]).toMatchObject({
                case: {
                    title: test.title,
                    suite_title: 'Test Suite'
                }
            });
        });

        it('should account for nested test', () => {
            const test = {
                parent: {
                    title: 'Level 1',
                    parent: {
                        title: 'Main Suite'
                    }
                },
                title: 'test 1',
                status: 'passed',
                duration: 1,
                err: null,
            };
            qReporter['transformCaseResultToBulkObject'](test as any, test.status as any);
            expect(qReporter['resultsForPublishing'][1]).toMatchObject({
                case: {
                    title: test.title,
                    suite_title: 'Main Suite\tLevel 1'
                }
            });
        });

        it('should use reporter rootSuiteTitle as top parent', () => {
            qReporter = new QaseCypressReporter(runner, { reporterOptions: { apiToken: "", rootSuiteTitle: 'Top Parent' } });
            const test = {
                parent: {
                    title: 'Level 1',
                    parent: {
                        title: 'Main Suite'
                    }
                },
                title: 'test 1',
                status: 'passed',
                duration: 1,
                err: null,
            };
            qReporter['transformCaseResultToBulkObject'](test as any, test.status as any);
            expect(qReporter['resultsForPublishing'][0]).toMatchObject({
                case: {
                    title: test.title,
                    suite_title: 'Top Parent\tMain Suite\tLevel 1'
                }
            });
        });
    });

    describe('Options', () => {
        describe('support for rootSuiteTitle', () => {
            it('should set Root Suite Title to "" by default', () => {
                const runner = new mocha.Runner(new mocha.Suite('new'), false)
                const qReporter = new QaseCypressReporter(runner, { reporterOptions: { apiToken: "" } });
                expect(qReporter['options'].rootSuiteTitle).toBe('');
            });

            it('should set Root Suite Title by reporter option - rootSuiteTitle', () => {
                const runner = new mocha.Runner(new mocha.Suite('new'), false)
                const qReporter = new QaseCypressReporter(runner, { reporterOptions: { apiToken: "", rootSuiteTitle: 'CY Test' } });
                expect(qReporter['options'].rootSuiteTitle).toBe('CY Test');
            });

            it('should set Root Suite Title by environmental variable - QASE_ROOT_SUITE_TITLE', () => {
                process.env.QASE_ROOT_SUITE_TITLE = 'CY Test ENV';
                const runner = new mocha.Runner(new mocha.Suite('new'), false)
                const qReporter = new QaseCypressReporter(runner, { reporterOptions: { apiToken: "" } });
                expect(qReporter['options'].rootSuiteTitle).toBe('CY Test ENV');
            });
        });
    });
});
