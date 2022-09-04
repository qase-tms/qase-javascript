/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable  sort-imports*/
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MochaOptions, Runner, Test, reporters } from 'mocha';
import { ResultCreateStatusEnum } from 'qaseio/dist/src';
import { QaseCoreReporter, QaseCoreReporterOptions, QaseOptions } from 'qase-core-reporter';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING, EVENT_RUN_END, EVENT_RUN_BEGIN } =
    Runner.constants;

class CypressQaseReporter extends reporters.Base {
    private reporter: QaseCoreReporter;
    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        QaseCoreReporter.reporterPrettyName = 'Cypress';

        this.reporter = new QaseCoreReporter(options.reporterOptions as QaseOptions, {
            frameworkName: 'cypress',
            reporterName: 'qase-cypress-reporter',
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

        runner.on(EVENT_TEST_PASS, (test: Test) => {
            test.suitePath = QaseCoreReporter.getSuitePath(test.parent);
            this.reporter.addTestResult(test, ResultCreateStatusEnum.PASSED);
        });

        runner.on(EVENT_TEST_PENDING, (test: Test) => {
            test.suitePath = QaseCoreReporter.getSuitePath(test.parent);
            this.reporter.addTestResult(test, ResultCreateStatusEnum.SKIPPED);
        });

        runner.on(EVENT_TEST_FAIL, (test: Test) => {
            test.error = test.err;
            test.suitePath = QaseCoreReporter.getSuitePath(test.parent);
            this.reporter.addTestResult(test, ResultCreateStatusEnum.FAILED);
        });

        // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        runner.addListener(EVENT_RUN_END, async () => {
            await this.reporter.end({ spawn: true });
        });
    }
}

export = CypressQaseReporter;
