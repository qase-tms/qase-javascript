import { describe, it, expect, vi, beforeAll } from 'vitest'
import * as resultBulkDetached from '../src/result-bulk-detached';
import { QaseCoreReporter } from '../src';
import { ResultCreateStatusEnum } from 'qaseio/dist/src'

// shell objects for testing
let reporting_config = {
    apiToken: '',
    basePath: '',
    headers: '',
    code: '',
    runId: 0,
    runUrl: '',
    body: {
        results: {}
    },
    runComplete: true,
    qaseCoreReporterOptions: {},
    isDisabled: false,
} as any;

let attachments_config = {
    screenshotFolder: '',
    videoFolder: '',
    uploadAttachments: true,
    attachmentsMap: {},
} as any;
let reporter;

beforeAll(async () => {

    reporter = new QaseCoreReporter(
        {
            apiToken: '123',
            projectCode: 'TP',
            report: true,
            runComplete: true,
            logging: true,
            basePath: 'https://api.qase.io/v1'
        },
        {
            frameworkName: 'vitest', reporterName: 'qase-core-reporter',
            uploadAttachments: true,
            screenshotFolder: 'screenshots',
            videoFolder: 'videos'
        }
    );

    await reporter.start();

    reporting_config.runComplete = reporter.options.runComplete;
    reporting_config.qaseCoreReporterOptions = reporter.options.qaseCoreReporterOptions;
    reporting_config.code = reporter.options.projectCode;
    reporting_config.runId = reporter['runId'];
    reporting_config.runUrl = `https://app.qase.io/run/${reporting_config.code}/dashboard/${reporting_config.runId}`;
    reporting_config.apiToken = reporter.options.apiToken;
    reporting_config.basePath = reporter.options.basePath;
    reporting_config.headers = reporter['headers'];

    attachments_config.screenshotFolder = reporting_config.qaseCoreReporterOptions.screenshotFolder;
    attachments_config.videoFolder = reporting_config.qaseCoreReporterOptions.videoFolder;
    attachments_config.uploadAttachments = reporting_config.qaseCoreReporterOptions.uploadAttachments;
});

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

describe('ResultBulkDetached', () => {

    it('should be defined', () => {
        expect(resultBulkDetached.publishBulkResult).toBeDefined()
    });

    it('should end report using spawn', async () => {
        // this will be disabled because of projectCode: 'TP-invalid'
        // but the spawn will be executed
        const reporter = new QaseCoreReporter(
            {
                apiToken: '123',
                projectCode: 'TP-invalid',
                report: true,
                runComplete: true,
            },
            {
                frameworkName: 'jest', reporterName: 'qase',
                uploadAttachments: true,
                screenshotFolder: 'screenshots',
                videoFolder: 'videos'
            }
        );
        const endSpy = vi.spyOn(reporter, 'end');

        await reporter.start();

        reporter.addTestResult({ title: 'test', status: ResultCreateStatusEnum.PASSED },
            ResultCreateStatusEnum.PASSED,
            [{ path: process.cwd() + '/screenshots/screenshot.png' }]);

        await reporter.end({ spawn: true });

        // check on child process
        expect(endSpy).toHaveBeenCalled();
    });

    it('should not run end if disabled', async () => {
        process.env.QASE_LOGGING = 'true';

        const spyOnLog = vi.spyOn(console, 'log');

        const config = deepCopy(reporting_config);
        config.isDisabled = true;
        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments_config);
        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledTimes(0);
    });

    it('should display log for no test results added', async () => {
        const spyOnLog = vi.spyOn(console, 'log');

        const config = deepCopy(reporting_config);
        config.body.results = [];
        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments_config);
        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledWith(
            expect.stringContaining('No test cases were matched. Ensure that your tests are declared correctly.')
        );
        expect(spyOnLog).toHaveBeenCalledTimes(1);
    });

    it('should support sending results without completing run', async () => {
        const spyOnLog = vi.spyOn(console, 'log');

        const config = deepCopy(reporting_config);
        config.runCompleted = false;

        reporter.addTestResult({ title: 'incomplete run test', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);
        config.body.results = reporter['resultsForPublishing'];

        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments_config);

        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledWith(
            expect.not.stringContaining('Run 1 completed')
        );
    });

    it('should log error if there is an issue completing run', async () => {
        const spyOnLog = vi.spyOn(console, 'log');

        const config = deepCopy(reporting_config);
        config.code = 'run-incomplete';
        reporter.addTestResult({ title: 'incomplete run test', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);
        config.body.results = reporter['resultsForPublishing'];

        attachments_config.uploadAttachments = true;
        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments_config);

        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledWith(
            expect.stringContaining('Error on completing run')
        );
    });

    it('should log error if there is an error while publishing', async () => {
        const spyOnLog = vi.spyOn(console, 'log');

        const config = deepCopy(reporting_config);
        config.code = 'TP-error-publish';
        reporter.addTestResult({ title: 'error while publishing results', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);
        config.body.results = reporter['resultsForPublishing'];

        attachments_config.uploadAttachments = true;
        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments_config);

        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledWith(
            expect.stringContaining('Error while publishing')
        );
    });

    it('should log error if there is an issue while uploading mapped attachments', async () => {
        const spyOnLog = vi.spyOn(console, 'log');

        reporter.addTestResult({ title: 'test', status: ResultCreateStatusEnum.PASSED },
            ResultCreateStatusEnum.PASSED,
            [{ path: process.cwd() + '/screenshots/screenshot.png' }]);

        const config = deepCopy(reporting_config);
        const attachments = deepCopy(attachments_config);

        config.code = 'TP-error-mapped-attachments';
        reporter.addTestResult({ title: 'error while uploading mapped attachments', status: ResultCreateStatusEnum.PASSED }, ResultCreateStatusEnum.PASSED);
        config.body.results = reporter['resultsForPublishing'];
        attachments.attachmentsMap = reporter['attachments'];

        attachments_config.uploadAttachments = true;
        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments);

        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledWith(
            expect.stringContaining('Error during sending mapped attachments')
        );
    });

    it('should upload bulk results', async () => {
        const spyOnLog = vi.spyOn(console, 'log');

        const reporter = new QaseCoreReporter(
            {
                apiToken: '123',
                projectCode: 'TP',
                report: true,
                runComplete: true,
            },
            {
                frameworkName: 'jest', reporterName: 'qase',
                uploadAttachments: true,
                screenshotFolder: 'screenshots',
                videoFolder: 'videos'
            }
        );

        await reporter.start();

        reporter.addTestResult({ title: 'test', status: ResultCreateStatusEnum.PASSED },
            ResultCreateStatusEnum.PASSED,
            [{ path: process.cwd() + '/screenshots/screenshot.png' }]);

        reporter.addTestResult({ title: 'test 2', status: ResultCreateStatusEnum.PASSED, caseIds: [2] },
            ResultCreateStatusEnum.PASSED,
            [{ path: process.cwd() + '/screenshots/screenshot.png' }]);


        const config = deepCopy(reporting_config);
        const attachments = deepCopy(attachments_config);

        config.body.results = reporter['resultsForPublishing'];
        attachments.uploadAttachments = true;
        attachments.attachmentsMap = reporter['attachments'];

        process.env.reporting_config = JSON.stringify(config);
        process.env.attachments_config = JSON.stringify(attachments);

        await resultBulkDetached.publishBulkResult();

        expect(spyOnLog).toHaveBeenCalledWith(
            expect.stringContaining('Uploading mapped attachments to Qase')
        );
    });
});
