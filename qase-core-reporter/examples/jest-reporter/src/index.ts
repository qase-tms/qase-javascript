/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable  sort-imports*/
import { ResultCreateStatusEnum } from 'qaseio/dist/src';
import { QaseCoreReporter, QaseOptions, Statuses } from 'qase-core-reporter';
import { Reporter, Test, TestResult } from '@jest/reporters';


class JestQaseReporter implements Reporter {
    private reporter: QaseCoreReporter;

    public constructor(_: Record<string, unknown>, _options: QaseOptions) {
        QaseCoreReporter.reporterPrettyName = 'jest';
        this.reporter = new QaseCoreReporter(_options, {
            frameworkName: 'jest',
            reporterName: 'jest-qase-reporter',
        });
    }

    public async onRunStart(): Promise<void> {
        await this.reporter.start();
    }

    public onTestResult(_test: Test, testResult: TestResult): void {
        for (const currentTestResult of testResult.testResults) {

            const status = Statuses[currentTestResult.status] as ResultCreateStatusEnum;

            const failureMessages = currentTestResult.failureMessages.map((value) =>
                value.replace(/\u001b\[.*?m/g, ''));

            const test = {
                title: currentTestResult.title,
                status: status as keyof typeof Statuses,
                duration: currentTestResult.duration
                    ? currentTestResult.duration
                    : undefined,
                suitePath: currentTestResult.ancestorTitles.join('\t'),
                stacktrack: failureMessages.join('\n'),
                error: failureMessages.length > 0 ? new Error(failureMessages.map(
                    (value) => value.split('\n')[0]).join('\n')) : undefined,
            };

            this.reporter.addTestResult(test, status);
        }
    }

    public async onRunComplete(): Promise<void> {
        await this.reporter.end({ spawn: false });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public getLastError(): void { }
}

export = JestQaseReporter;

