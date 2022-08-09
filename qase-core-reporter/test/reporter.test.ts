import { describe, expect, it, jest } from '@jest/globals';
import { QaseCoreReporter, qase, qaseTitle } from '../src';


describe('QaseCoreReporter', () => {
    it('Init client', async () => {
        const options = {
            apiToken: '123',
            projectCode: 'TP',
            logging: false,
            basePath: 'https://api.qase.io/v1',
            screenshotFolder: 'screenshots',
            sendScreenshot: false,
            runComplete: true,
            environmentId: 1,
            rootSuiteTitle: 'Cypress tests',
        };
        const qaseCoreOptions = {
            frameworkName: 'jest',
            reporterName: 'qase-core-reporter',
            sendScreenshot: options.sendScreenshot,
            screenshotFolder: options.screenshotFolder,
        }
        const reporter = new QaseCoreReporter(options, qaseCoreOptions);

        QaseCoreReporter.reporterPrettyName = 'Cypress Reporter';


        const sampleResults = [
            {
                "case_id": 1,
                "status": "passed",
                "time_ms": 580,
                "defect": false
            },
            {
                "case_id": 2,
                "status": "failed",
                "time_ms": 0,
                "stacktrace": "AssertionError: Timed out retrying after 4000ms: expected '<input#email1.form-control.action-email>' to have value 'unexpected@email.com', but the value was 'fake@email.com'\n    at Context.eval (https://example.cypress.io/__cypress/tests?p=cypress/e2e/second.cy.js:114:52)",
                "comment": "Gets, types and asserts (Qase ID: 2): Timed out retrying after 4000ms: expected '<input#email1.form-control.action-email>' to have value 'unexpected@email.com', but the value was 'fake@email.com'",
                "defect": true
            },
            {
                "case_id": 3,
                "status": "skipped",
                "time_ms": 0,
                "defect": false
            },
            {
                "status": "passed",
                "time_ms": 259,
                "defect": false,
                "case": {
                    "title": "Go to utilities",
                    "suite_title": "Cypress tests\tMy First Test"
                }
            },
            {
                "status": "passed",
                "time_ms": 222,
                "defect": false,
                "case": {
                    "title": "Go to Cypress API",
                    "suite_title": "Cypress tests\tMy First Test\tTest Suite - Level 2"
                }
            }
        ];

        await reporter.start();
        reporter['resultsForPublishing'] = sampleResults as unknown as any;
        await reporter.end({ spawn: false });
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

    describe('Logging', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        it('disabled - ENV', () => {
            process.env.QASE_LOGGING = 'false';
            const _ = new QaseCoreReporter(
                {
                    apiToken: '123',
                    projectCode: 'TP'
                },
                {
                    frameworkName: 'jest',
                    reporterName: 'qase-core-reporter'
                });
            expect(consoleSpy).not.toHaveBeenCalled();
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
            expect(consoleSpy).not.toHaveBeenCalled();
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
            expect(consoleSpy).not.toHaveBeenCalled();
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
            expect(consoleSpy).toHaveBeenCalled();
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
            expect(consoleSpy).toHaveBeenCalledTimes(4);
        });
    });

    describe('qase exports', () => {
        describe('qase', () => {
            const test = {
                title: 'test',
            };

            it('should return test when test is undefined', () => {
                const testData = undefined;
                const result = qase([1], testData);
                expect(result).toBe(undefined);
            });

            it('should return test object with Qase ID when string is used', () => {
                const newTest = qase('1', test);
                expect(newTest.title).toBe('test (Qase ID: 1)');
            });

            it('should return test object with Qase ID when number is used', () => {
                const newTest = qase(1, test);
                expect(newTest.title).toBe('test (Qase ID: 1)');
            });

            it('should return test object with Qase ID when array is used', () => {
                const newTest = qase([1, 2], test);
                expect(newTest.title).toBe('test (Qase ID: 1,2)');
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
});