import { describe, expect, it } from '@jest/globals';
import { EventEmitter } from 'events';
import NewmanQaseReporter from '../src';

describe('Tests', () => {
    it('Init main class', () => {
        new NewmanQaseReporter(new EventEmitter(), { apiToken: "", projectCode: "" }, { collection: "" });
    });

    describe('runComplete option', () => {
        it('should have runComplete option false by default', () => {
            const reporter = new NewmanQaseReporter(new EventEmitter(), { apiToken: "", projectCode: "" }, { collection: "" });
            expect(reporter['options'].runComplete).toBe(false);
        });

        it('should set runComplete from reporter options', () => {
            const reporter = new NewmanQaseReporter(new EventEmitter(), { apiToken: "", projectCode: "", runComplete: true }, { collection: "" });
            expect(reporter['options'].runComplete).toBe(true);
        });

        it('should set runComplete from environmental variable [QASE_RUN_COMPLETE=true]', () => {
            process.env.QASE_RUN_COMPLETE = 'true';
            const reporter = new NewmanQaseReporter(new EventEmitter(), { apiToken: "", projectCode: "" }, { collection: "" });
            expect(reporter['options'].runComplete).toBe(true);
        });
    });

    describe('Auto Create Defect', () => {
        describe('known test cases', () => {
            const reporter = new NewmanQaseReporter(new EventEmitter(), { apiToken: "", projectCode: "" }, { collection: "" });
            const tests = [
                {
                    data:
                    {
                        name: 'test k1',
                        result: 'failed',
                        duration: 1,
                        ids: [1]
                    },
                    defect: true
                },
                {
                    data:
                    {
                        name: 'test k2',
                        result: 'passed',
                        duration: 1,
                        ids: [2]
                    },
                    defect: false
                },
                {
                    data:
                    {
                        name: 'test k3',
                        result: 'pending',
                        duration: 1,
                        ids: [3]
                    },
                    defect: false
                }
            ];

            tests.forEach(test => {
                reporter['prePending'][test.data.name] = test.data as any;
            });

            const resultsToPublishData = reporter['createBulkResultsBodyObject']();

            for (const index in tests) {
                const test = tests[index];
                const status = test.data.result;
                const defectValue = test.defect;
                it(`should set defect=${defectValue} when status=${status}`, () => {
                    expect(resultsToPublishData[index].defect).toBe(defectValue);
                });
            }
        });
        describe('unknown test cases', () => {
            const reporter = new NewmanQaseReporter(new EventEmitter(), { apiToken: "", projectCode: "" }, { collection: "" });
            const tests = [
                {
                    data:
                    {
                        name: 'test 1',
                        result: 'failed',
                        duration: 1,
                        ids: []
                    },
                    defect: true
                },
                {
                    data:
                    {
                        name: 'test 2',
                        result: 'passed',
                        duration: 1,
                        ids: []
                    },
                    defect: false
                },
                {
                    data:
                    {
                        name: 'test 3',
                        result: 'pending',
                        duration: 1,
                        ids: []
                    },
                    defect: false
                }
            ];

            tests.forEach(test => {
                reporter['prePending'][test.data.name] = test.data as any;
            });

            const resultsToPublishData = reporter['createBulkResultsBodyObject']();

            for (const index in tests) {
                const test = tests[index];
                const status = test.data.result;
                const defectValue = test.defect;
                it(`should set defect=${defectValue} when status=${status}`, () => {
                    expect(resultsToPublishData[index].defect).toBe(defectValue);
                });
            }
        });
    });
});
