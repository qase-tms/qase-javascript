import { describe, it, expect, vi } from 'vitest'
import { ResultCreateStatusEnum } from 'qaseio/dist/src'
import {
    QaseCoreReporter,
    TestResult,
} from '../../../src';

describe('end', () => {
    it('should not run end if disabled', async () => {
        const reporter = new QaseCoreReporter(
            { apiToken: '123', projectCode: 'TP-invalid', report: true, runComplete: true, logging: true },
            { frameworkName: 'jest', reporterName: 'qase' }
        );
        const spyOnLog = vi.spyOn(console, 'log');

        await reporter.start();
        await reporter.end({ spawn: false });
        expect(spyOnLog).toHaveBeenCalledWith(
            expect.not.stringContaining('No test cases were matched. Ensure that your tests are declared correctly.')
        );
    });

    it('should support sending results without completing run', async () => {
        const reporter = new QaseCoreReporter(
            { apiToken: '123', projectCode: 'TP', runId: '1', report: true, runComplete: false, logging: true },
            { frameworkName: 'jest', reporterName: 'qase' }
        );
        const spyOnLog = vi.spyOn(console, 'log');
        await reporter.start();

        reporter.addTestResult({ title: 'test', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);

        await reporter.end({ spawn: false });
        expect(spyOnLog).toHaveBeenCalledWith(
            expect.not.stringContaining('Run 1 completed')
        );
    });

    it('should display log for no test results added', async () => {
        const reporter = new QaseCoreReporter(
            { apiToken: '123', projectCode: 'TP', report: true, runComplete: true, logging: true },
            { frameworkName: 'jest', reporterName: 'qase' }
        );
        const spyOnLog = vi.spyOn(console, 'log');

        await reporter.start();
        await reporter.end({ spawn: false });
        expect(spyOnLog)
            .toHaveBeenCalledWith(
                expect.stringContaining('No test cases were matched. Ensure that your tests are declared correctly.')
            );
        expect(reporter.resultsForPublishingCount).toEqual(0);
    });

    it('should log error if there is an issue completing run', async () => {
        const reporter = new QaseCoreReporter(
            {
                apiToken: '123',
                projectCode: 'run-incomplete',
                runId: '1',
                report: true,
                runComplete: true,
                logging: true
            },
            { frameworkName: 'jest', reporterName: 'qase' }
        );
        const spyOnLog = vi.spyOn(console, 'log');
        await reporter.start();

        reporter.addTestResult({ title: 'incomplete run test', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);

        await reporter.end({ spawn: false });
        expect(spyOnLog).toHaveBeenCalledWith(
            expect.stringContaining('Error on completing run')
        );
    });

    it('should add test result with attachments', async () => {
        process.env.QASE_RUN_ID = '1';
        const reporter = new QaseCoreReporter(
            { apiToken: '123', projectCode: 'TP', runComplete: true, report: true, logging: true },
            { frameworkName: 'jest', reporterName: 'qase', uploadAttachments: true }
        );

        const testResult: TestResult = {
            id: '123',
            title: 'test',
            caseIds: [1],
            status: ResultCreateStatusEnum.PASSED,
        };

        const attachmentPath = process.cwd() + '/screenshots/screenshot.png';
        await reporter.start();
        reporter.addTestResult(testResult, ResultCreateStatusEnum.PASSED, [{ path: attachmentPath }]);
        await reporter.end({ spawn: false });

        expect(reporter.resultsForPublishingCount).toEqual(1);
        expect(reporter['resultsForPublishing'][0]).toEqual(
            {
                "attachments": ['6a8544c6384de9cdc7a27cc00e6538e90b9e69c5'],
                "case_id": 1,
                "comment": undefined,
                "defect": false,
                "id": "123",
                "param": undefined,
                "stacktrace": undefined,
                "status": "passed",
                "time_ms": 0
            });
        expect(reporter['attachments']).toEqual({ 123: [{ path: attachmentPath }] });
    });

});