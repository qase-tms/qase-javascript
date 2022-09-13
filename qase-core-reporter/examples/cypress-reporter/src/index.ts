/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable  sort-imports*/
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MochaOptions, Runner, Test, reporters } from 'mocha';
import { ResultCreateStatusEnum } from 'qaseio/dist/src';
import { QaseCoreReporter, QaseCoreReporterOptions, QaseOptions, Suite, TestResult } from 'qase-core-reporter';
import fs from 'fs';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING, EVENT_RUN_END, EVENT_RUN_BEGIN } =
    Runner.constants;

const readdirSync = (p: string, a: string[] = []) => {
    if (fs.statSync(p).isDirectory()) {
        fs.readdirSync(p).map((f) => readdirSync(a[a.push(path.join(p, f)) - 1], a));
    }
    return a;
};

type CombinedTestResult = TestResult & Test;

class CypressQaseReporter extends reporters.Base {
    private reporter: QaseCoreReporter;
    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        QaseCoreReporter.reporterPrettyName = 'Cypress';

        this.reporter = new QaseCoreReporter(options.reporterOptions as QaseOptions, {
            frameworkName: 'cypress',
            reporterName: 'cypress-qase-reporter',
            customReporterName: 'qase-cypress',
            screenshotFolder: options.reporterOptions.screenshotFolder as string || '',
            videoFolder: options.reporterOptions.videoFolder as string || '',
            uploadAttachments: options.reporterOptions.uploadAttachments as boolean || false,
        } as QaseCoreReporterOptions);

        this.addRunnerListeners(runner);
    }

    private addRunnerListeners(runner: Runner) {

        // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        runner.on(EVENT_RUN_BEGIN, async () => {
            await this.reporter.start();
        });

        runner.on(EVENT_TEST_PASS, (test: CombinedTestResult) => {
            test.suitePath = QaseCoreReporter.getSuitePath(test.parent as Suite);
            this.reporter.addTestResult(test, ResultCreateStatusEnum.PASSED);
        });

        runner.on(EVENT_TEST_PENDING, (test: CombinedTestResult) => {
            test.suitePath = QaseCoreReporter.getSuitePath(test.parent as Suite);
            this.reporter.addTestResult(test, ResultCreateStatusEnum.SKIPPED);
        });

        runner.on(EVENT_TEST_FAIL, (test: CombinedTestResult) => {
            test.error = test.err;
            test.suitePath = QaseCoreReporter.getSuitePath(test.parent as Suite);
            const cOptions = this.reporter.options.qaseCoreReporterOptions;

            let attachmentPaths: Array<{ path: string }> = [];
            // find screenshots and check if any of them is related to the failed test
            if (cOptions?.uploadAttachments && !test.title.includes('Qase ID')) {
                const fileName = `${test.title} (failed).png`;
                let files = readdirSync(cOptions.screenshotFolder as string);

                files = files.filter((f) => f.includes(fileName));
                attachmentPaths = files.map((f) => ({ path: `./${f}` }));
            }

            this.reporter.addTestResult(test, ResultCreateStatusEnum.FAILED, attachmentPaths);
        });

        // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        runner.addListener(EVENT_RUN_END, async () => {
            await this.reporter.end({ spawn: true });
        });
    }
}

export = CypressQaseReporter;
