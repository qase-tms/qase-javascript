import { describe, expect, it } from '@jest/globals';
import { QaseCoreReporter } from '../src';


describe('QaseCoreReporter', () => {
    it('Init client', async () => {
        process.env.QASE_REPORT = '1';
        const options = {
            apiToken: '123',
            projectCode: 'TP',
            logging: true,
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
});