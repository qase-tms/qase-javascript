/* eslint-disable no-console */
import { MochaOptions, Runner, Test, reporters } from 'mocha';
import { QaseApi } from 'qaseio';

interface QaseOptions {
    apiToken: string;
    projectCode?: string;
    runId?: string;
    runPrefix?: string;
}

export class QaseCypressReporter extends reporters.Base {
    private api: QaseApi;
    private results: any[] = [];
    private runId?: number | string;

    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        const reporterOptions = options.reporterOptions as QaseOptions;
        this.api = new QaseApi(reporterOptions.apiToken);

        if (!this.getEnv('QASE_REPORT')) {
            return;
        }

        runner.on('start', () => {
            if (this.getEnv('QASE_RUN_ID')) {
                this.runId = this.getEnv('QASE_RUN_ID');
                return;
            }
            const executionDateTime = new Date().toLocaleString();
            const name = `${reporterOptions.runPrefix || 'Automated test run'} ${executionDateTime}`;
            const description = 'Cypress Qase Reporter run';
            console.log('Run will be created: %s, desc: %s', name, description);
        });

        runner.on('pass', (test: Test) => {
            console.log('Test passed: %s', test);
        });

        runner.on('pending', (test: Test) => {
            console.log('Test skipped: %s', test);
        });

        runner.on('fail', (test: Test) => {
            console.log('Test failed: %s', test);
        });

        runner.on('end', () => {
            if (this.results.length === 0) {
                console.warn(
                    `\n(TestRail Reporter)
                    \nNo testcases were matched.
                    Ensure that your tests are declared correctly.\n`
                );
                return;
            }
        });
    }

    private getEnv(name: string) {
        return process.env[name];
    }
}
