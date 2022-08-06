/* eslint-disable camelcase */
/* eslint-disable  sort-imports*/
import { ResultCreateStatusEnum } from 'qaseio/dist/src';
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { QaseCoreReporter, QaseOptions, Statuses, TestResult as QTestResult } from 'qase-core-reporter';

class QasePlaywrightReporter implements Reporter {

    private reporter: QaseCoreReporter;
    private uploadAttachments: boolean;
    public constructor(_options: QaseOptions & { uploadAttachments: boolean }) {
        QaseCoreReporter.reporterPrettyName = 'playwright';

        this.uploadAttachments = _options.uploadAttachments || false;
        this.reporter = new QaseCoreReporter(_options, {
            frameworkName: 'playwright',
            reporterName: 'qase-playwright-reporter',
            sendScreenshot: this.uploadAttachments,
        });
    }

    public async onBegin(): Promise<void> {
        await this.reporter.start();
    }

    public onTestEnd(
        test: TestCase,
        testResult: TestResult
    ): void {
        const status = Statuses[testResult.status] as ResultCreateStatusEnum;

        const testData = {
            title: test.title,
            status: status as keyof typeof Statuses,
            duration: testResult.duration,
            stacktrace: testResult.error?.stack?.replace(/\u001b\[.*?m/g, ''),
            error: testResult.error as Error,
            parent: test.parent as unknown as QTestResult,
        };

        this.reporter.addTestResult(testData, status, testResult.attachments);
    }

    public async onEnd(): Promise<void> {
        await this.reporter.end({ spawn: false });
    }
}

export = QasePlaywrightReporter;


