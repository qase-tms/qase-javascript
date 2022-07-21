import { describe, expect, it } from '@jest/globals';
import { IFormatterOptions } from "@cucumber/cucumber/lib/formatter";
import Index from '../src';

describe('Tests', () => {
    it('Init main class', () => {
        new Index({ parsedArgvOptions: {} } as unknown as IFormatterOptions);
    });

    describe('Auto Create Defect', () => {
        const qReporter = new Index({ parsedArgvOptions: {} } as unknown as IFormatterOptions);

        describe('known test cases', () => {
            const testData = [
                {
                    test: {
                        name: 'Test 1',
                        caseIds: [1],
                        status: 'failed',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-k1'
                        },
                    },
                    defect: true,
                },
                {
                    test: {
                        name: 'Test 2',
                        caseIds: [2],
                        status: 'passed',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-k2'
                        },
                    },
                    defect: false,
                },
                {
                    test: {
                        name: 'Test 3',
                        caseIds: [3],
                        status: 'pending',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-k3'
                        },
                    },
                    defect: false,
                },
                {
                    test: {
                        name: 'Test 4',
                        caseIds: [4],
                        status: null,
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-k4'
                        },
                    },
                    defect: false,
                },
                {
                    test: {
                        name: 'Test 5',
                        caseIds: [5],
                        status: 'skipped',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-k5'
                        },
                    },
                    defect: false,
                },
            ]

            testData.forEach(tD => {
                qReporter['addForSending'](tD.test as any, tD.test.status as any);
            })

            testData.map(tD => {
                return {
                    caseId: tD.test.finished.testCaseStartedId,
                    defectValue: tD.defect,
                    status: tD.test.status,
                }
            }).forEach(eTestData => {
                it(`should set defect=${eTestData.defectValue} when status=${eTestData.status}`, () => {
                    expect(qReporter['results'][eTestData.caseId].defect).toBe(eTestData.defectValue);
                });
            });
        });

        describe('unknown test cases', () => {
            const testData = [
                {
                    test: {
                        name: 'Test 1',
                        caseIds: [],
                        status: 'failed',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-u1'
                        },
                    },
                    defect: true,
                },
                {
                    test: {
                        name: 'Test 2',
                        caseIds: [],
                        status: 'passed',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-u2'
                        },
                    },
                    defect: false,
                },
                {
                    test: {
                        name: 'Test 3',
                        caseIds: [],
                        status: 'pending',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-u3'
                        },
                    },
                    defect: false,
                },
                {
                    test: {
                        name: 'Test 4',
                        caseIds: [],
                        status: null,
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-u4'
                        },
                    },
                    defect: false,
                },
                {
                    test: {
                        name: 'Test 5',
                        caseIds: [],
                        status: 'skipped',
                        duration: 1,
                        finished: {
                            testCaseStartedId: 'c6e6a2f8-245b12-u5'
                        },
                    },
                    defect: false,
                }
            ]

            testData.forEach(tD => {
                qReporter['addForSending'](tD.test as any, tD.test.status as any);
            })

            testData.map(tD => {
                return {
                    caseId: tD.test.finished.testCaseStartedId,
                    defectValue: tD.defect,
                    status: tD.test.status,
                }
            }).forEach(eTestData => {
                it(`should set defect=${eTestData.defectValue} when status=${eTestData.status}`, () => {
                    expect(qReporter['results'][eTestData.caseId].defect).toBe(eTestData.defectValue);
                });
            });
        });
    });
});
