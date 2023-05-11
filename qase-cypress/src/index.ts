/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable  sort-imports*/
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MochaOptions, Runner, Test, reporters, Suite } from 'mocha';
import { QaseBaseReporter, TestOpsReporter, ReportReporter } from 'qase-javascript-commons';
// import { Envs, QaseCoreReporter, QaseCoreReporterOptions, QaseOptions, Suite, TestResult } from 'qase-core-reporter';
// import fs from 'fs';
// import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING, EVENT_RUN_END, EVENT_RUN_BEGIN,
    EVENT_SUITE_END, EVENT_SUITE_BEGIN } =
    Runner.constants;

/* const readdirSync = (p: string, a: string[] = []) => {
    if (fs.statSync(p).isDirectory()) {
        fs.readdirSync(p).map((f) => readdirSync(a[a.push(path.join(p, f)) - 1], a));
    }
    return a;
};*/

class CypressQaseReporter extends reporters.Base {
    private reporter: QaseBaseReporter;

    public count = 0;

    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        console.log('Qase reporter has started');

        switch (options.reporterOptions.mode) {
        case 'testops':
            console.log('testops');
            // this.reporter = new TestOpsReporter(options.reporterOptions as QaseOptions, {});
            break;
        case 'report':
            console.log('report');
            // this.reporter = new ReportReporter(options.reporterOptions as QaseOptions, {});
            break;
        default:
            break;
        }

        /* this.reporter = new QaseCoreReporter(options.reporterOptions as QaseOptions, {
            frameworkName: 'cypress',
            reporterName: 'cypress-qase-reporter',
            customReporterName: 'qase-cypress',
            screenshotFolder: options.reporterOptions.screenshotFolder as string || '',
            videoFolder: options.reporterOptions.videoFolder as string || '',
            uploadAttachments: !!QaseCoreReporter.getEnv(Envs.sendScreenshot)
                || options.reporterOptions.sendScreenshot as boolean
                || options.reporterOptions.uploadAttachments as boolean
                || false,
        } as QaseCoreReporterOptions);*/

        this.addRunnerListeners(runner);
    }

    private addRunnerListeners(runner: Runner) {

        // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        runner.once(EVENT_RUN_BEGIN, () => {
            console.log('EVENT_RUN_BEGIN');
            // await this.reporter.startRun();
        });

        runner.on(EVENT_TEST_PASS, (test: Test) => {
            console.log('EVENT_TEST_PASS');
            /* let suitePath = QaseCoreReporter.getSuitePath(test.parent as Suite);*/
            this.reporter.addResult(test, 'passed');
        });

        runner.on(EVENT_SUITE_BEGIN, (suite: Suite) => {
            console.log('EVENT_SUITE_BEGIN');
        });

        runner.on(EVENT_SUITE_END, (suite: Suite) => {
            console.log('EVENT_SUITE_END');
        });

        runner.on(EVENT_TEST_PENDING, (test: Test) => {
            console.log('EVENT_TEST_PENDING');
            /* let suitePath = QaseCoreReporter.getSuitePath(test.parent as Suite);
            this.reporter.addResult(test, ResultCreateStatusEnum.SKIPPED);*/
            Singleton.getInstance().increaseCount();
            console.log(Singleton.getInstance().getCount());
        });

        runner.on(EVENT_TEST_FAIL, (test: Test) => {
            console.log('EVENT_TEST_FAIL');
            Singleton.getInstance().increaseCount();
            console.log(Singleton.getInstance().getCount());
            /* let error = test.err;
            let suitePath = QaseCoreReporter.getSuitePath(test.parent as Suite);
            const cOptions = this.reporter.options.qaseCoreReporterOptions;

            let attachmentPaths: Array<{ path: string }> = [];
            // find screenshots and check if any of them is related to the failed test
            if (cOptions?.uploadAttachments && !test.title.includes('Qase ID')) {
                const fileName = `${test.title} (failed).png`;
                let files = readdirSync(cOptions.screenshotFolder as string);

                files = files.filter((f) => f.includes(fileName));
                attachmentPaths = files.map((f) => ({ path: `./${f}` }));
            }

            this.reporter.addTestResult(test, ResultCreateStatusEnum.FAILED, attachmentPaths);*/
        });

        // eslint-disable-next-line  @typescript-eslint/no-misused-promises
        runner.once(EVENT_RUN_END, () => {
            console.log('EVENT_RUN_END');
            // await this.reporter.startRun();
        });
    }
}

export = CypressQaseReporter;
