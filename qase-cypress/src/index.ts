/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/unbound-method */
import { IdResponse, ResultCreate, ResultCreateStatusEnum } from 'qaseio/dist/src';
import { MochaOptions, Runner, Test, reporters } from 'mocha';
import { execSync, spawnSync } from 'child_process';
import { QaseApi } from 'qaseio';
import chalk from 'chalk';
import { readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING, EVENT_RUN_END } =
    Runner.constants;

enum Envs {
    report = 'QASE_REPORT',
    apiToken = 'QASE_API_TOKEN',
    basePath = 'QASE_API_BASE_URL',
    runId = 'QASE_RUN_ID',
    runName = 'QASE_RUN_NAME',
    runDescription = 'QASE_RUN_DESCRIPTION',
    environmentId = 'QASE_ENVIRONMENT_ID',
    screenshotFolder = 'QASE_SCREENSHOT_FOLDER',
    sendScreenshot = 'QASE_SCREENSHOT_SENDING',
    runComplete = 'QASE_RUN_COMPLETE',
    rootSuiteTitle = 'QASE_ROOT_SUITE_TITLE',
}

interface QaseOptions {
    apiToken: string;
    basePath?: string;
    projectCode: string;
    runId?: string;
    runPrefix?: string;
    logging?: boolean;
    environmentId?: number;
    screenshotFolder?: string;
    sendScreenshot?: boolean;
    runComplete?: boolean;
    rootSuiteTitle?: string;
}

class CypressQaseReporter extends reporters.Base {
    public testCasesForPublishingCount = 0;
    private api: QaseApi;
    private pending: Array<(runId: string | number) => void> = [];
    private shouldPublish: Array<{ test: Test; status: ResultCreateStatusEnum }> =
    [];
    private results: Array<{
        test: Test;
        result: any;
    }> = [];
    private options: QaseOptions;
    private runId?: number | string;
    private isDisabled = false;
    private resultsForPublishing: ResultCreate[] = [];

    public constructor(runner: Runner, options: MochaOptions) {
        super(runner, options);

        this.options = options.reporterOptions as QaseOptions;
        this.options.rootSuiteTitle = CypressQaseReporter.getEnv(Envs.rootSuiteTitle) ||
            options.reporterOptions.rootSuiteTitle
            || '';
        this.api = new QaseApi(
            this.options.apiToken || CypressQaseReporter.getEnv(Envs.apiToken) || '',
            CypressQaseReporter.getEnv(Envs.basePath) || this.options.basePath,
            CypressQaseReporter.createHeaders()
        );

        if (!CypressQaseReporter.getEnv(Envs.report)) {
            return;
        }

        this.log(chalk`{yellow Current PID: ${process.pid}}`);

        this.addRunnerListeners(runner);

        void this.checkProject(this.options.projectCode, async (prjExists) => {
            if (prjExists) {
                this.log(chalk`{green Project ${this.options.projectCode} exists}`);
                if (CypressQaseReporter.getEnv(Envs.runId) || this.options.runId) {
                    this.saveRunId(
                        CypressQaseReporter.getEnv(Envs.runId) || this.options.runId
                    );
                    await this.checkRun(this.runId, (runExists: boolean) => {
                        const run = this.runId as unknown as string;
                        if (runExists) {
                            this.log(chalk`{green Using run ${run} to publish test results}`);
                        } else {
                            this.log(chalk`{red Run ${run} does not exist}`);
                        }
                    });
                } else if (!this.runId) {
                    await this.createRun(
                        CypressQaseReporter.getEnv(Envs.runName),
                        CypressQaseReporter.getEnv(Envs.runDescription),
                        (created) => {
                            if (created) {
                                this.runId = created.result?.id;
                                process.env.QASE_RUN_ID = String(this?.runId);
                                this.log(
                                    chalk`{green Using run ${this.runId} to publish test results}`
                                );
                            } else {
                                this.log(
                                    chalk`{red Could not create run in project ${this.options.projectCode}}`
                                );
                                this.isDisabled = true;
                            }
                        }
                    );
                }
            } else {
                this.log(
                    chalk`{red Project ${this.options.projectCode} does not exist}`
                );
            }
        });
    }

    private static getEnv(name: Envs) {
        return process.env[name];
    }

    private static getCaseId(test: Test): number[] {
        const regexp = /(\(Qase ID: ([\d,]+)\))/;
        const results = regexp.exec(test.title);
        if (results && results.length === 3) {
            return results[2].split(',').map((value) => Number.parseInt(value, 10));
        }
        return [];
    }

    private static createRunObject(
        name: string,
        cases: number[],
        args?: {
            description?: string;
            environment_id: number | undefined;
            is_autotest: boolean;
        }
    ) {
        return {
            title: name,
            cases,
            ...args,
        };
    }

    private static createHeaders() {
        const { version: nodeVersion, platform: os, arch } = process;
        const npmVersion = execSync('npm -v', { encoding: 'utf8' }).replace(
            /['"\n]+/g,
            ''
        );
        const qaseapiVersion = CypressQaseReporter.getPackageVersion('qaseio');
        const cypressVersion = CypressQaseReporter.getPackageVersion('cypress');
        const cypressCaseReporterVersion = this.getPackageVersion(
            'cypress-qase-reporter'
        );
        const xPlatformHeader = `node=${nodeVersion}; npm=${npmVersion}; os=${os}; arch=${arch}`;
        const xClientHeader = `cypress=${cypressVersion as string}; qase-cypress=${cypressCaseReporterVersion as string
        }; qaseapi=${qaseapiVersion as string}`;

        return {
            'X-Client': xClientHeader,
            'X-Platform': xPlatformHeader,
        };
    }

    private static getSuitePath(suite): string {
        if (suite.parent) {
            const parentSuite = String(CypressQaseReporter.getSuitePath(suite.parent));
            if (parentSuite) {
                return parentSuite + '\t' + String(suite?.title);
            } else {
                return String(suite?.title);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return suite.title;
    }

    private static getPackageVersion(name: string) {
        const UNDEFINED = 'undefined';
        try {
            const pathToPackageJson = require.resolve(`${name}/package.json`, {
                paths: [process.cwd()],
            });
            if (pathToPackageJson) {
                try {
                    const packageString = readFileSync(pathToPackageJson, {
                        encoding: 'utf8',
                    });
                    if (packageString) {
                        const packageObject = JSON.parse(packageString) as {
                            version: string;
                        };
                        return packageObject.version;
                    }
                    return UNDEFINED;
                } catch (error) {
                    return UNDEFINED;
                }
            }
        } catch (error) {
            return UNDEFINED;
        }
    }

    private log(message?: any, ...optionalParams: any[]) {
        if (this.options.logging) {
            console.log(chalk`{bold {blue qase:}} ${message}`, ...optionalParams);
        }
    }

    private addRunnerListeners(runner: Runner) {
        runner.on(EVENT_TEST_PASS, (test: Test) => {
            this.transformCaseResultToBulkObject(test, ResultCreateStatusEnum.PASSED);
        });

        runner.on(EVENT_TEST_PENDING, (test: Test) => {
            this.transformCaseResultToBulkObject(test, ResultCreateStatusEnum.SKIPPED);
        });

        runner.on(EVENT_TEST_FAIL, (test: Test) => {
            this.transformCaseResultToBulkObject(test, ResultCreateStatusEnum.FAILED);
        });

        runner.addListener(EVENT_RUN_END, () => {
            if (this.resultsForPublishing.length === 0) {
                this.log('Nothing to send.');
            } else if (this.runId) {
                const config = {
                    apiToken: CypressQaseReporter.getEnv(Envs.apiToken) || this.options.apiToken || '',
                    basePath: CypressQaseReporter.getEnv(Envs.basePath) || this.options.basePath,
                    headers: CypressQaseReporter.createHeaders(),
                    code: this.options.projectCode,
                    runId: Number(this.runId),
                    body: {
                        results: this.resultsForPublishing,
                    },
                    runComplete: CypressQaseReporter.getEnv(Envs.runComplete) || this.options.runComplete || false,
                };

                const screenshotsConfig = {
                    screenshotFolder: CypressQaseReporter.getEnv(Envs.screenshotFolder)
                        || this.options.screenshotFolder
                        || 'screenshots',
                    sendScreenshot: CypressQaseReporter.getEnv(Envs.screenshotFolder)
                        || this.options.sendScreenshot
                        || false,
                };

                spawnSync('node', [`${__dirname}/reportBulk.js`], {
                    stdio: 'inherit',
                    env: Object.assign(process.env, {
                        reporting_config: JSON.stringify(config),
                        screenshots_config: JSON.stringify(screenshotsConfig),
                    }),
                });
            }
        });
    }

    private async checkProject(
        projectCode: string,
        cb: (exists: boolean) => Promise<void>
    ): Promise<void> {
        try {
            const resp = await this.api.projects.getProject(projectCode);

            await cb(Boolean(resp.data.result?.code));
        } catch (err) {
            this.log(err);
            this.isDisabled = true;
        }
    }

    private async createRun(
        name: string | undefined,
        description: string | undefined,
        cb: (created: IdResponse | undefined) => void
    ): Promise<void> {
        try {
            const environmentId =
                Number(CypressQaseReporter.getEnv(Envs.environmentId)) ||
                this.options.environmentId;

            const runObject = CypressQaseReporter.createRunObject(
                name || `Automated run ${new Date().toISOString()}`,
                [],
                {
                    description: description || 'Cypress automated run',
                    environment_id: environmentId,
                    is_autotest: true,
                }
            );
            const res = await this.api.runs.createRun(
                this.options.projectCode,
                runObject
            );
            cb(res.data);
        } catch (err) {
            this.log(`Error on creating run ${err as string}`);
            this.isDisabled = true;
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    private async checkRun(
        runId: string | number | undefined,
        cb: (exists: boolean) => void
    ): Promise<void> {
        if (runId === undefined) {
            cb(false);
            return;
        }

        return this.api.runs
            .getRun(this.options.projectCode, Number(runId))
            .then((resp) => {
                this.log(
                    `Get run result on checking run ${resp.data.result?.id as unknown as string
                    }`
                );
                cb(Boolean(resp.data.result?.id));
            })
            .catch((err) => {
                this.log(`Error on checking run ${err as string}`);
                this.isDisabled = true;
            });
    }

    private saveRunId(runId?: string | number) {
        this.runId = runId;
        if (this.runId) {
            while (this.pending.length) {
                this.log(`Number of pending: ${this.pending.length}`);
                const cb = this.pending.shift();
                if (cb) {
                    cb(this.runId);
                }
            }
        }
    }

    private logTestItem(test: Test) {
        const map = {
            failed: chalk`{red Test ${test.title} ${test.state}}`,
            passed: chalk`{green Test ${test.title} ${test.state}}`,
            pending: chalk`{blueBright Test ${test.title} ${test.state}}`,
        };
        if (test.state) {
            this.log(map[test.state]);
        }
    }

    private transformCaseResultToBulkObject(test: Test, status: ResultCreateStatusEnum) {
        this.logTestItem(test);
        const caseIds = CypressQaseReporter.getCaseId(test);

        const caseObject: ResultCreate = {
            status,
            time_ms: test.duration || 0,
            stacktrace: test.err?.stack,
            comment: test.err ? `${test.err.name}: ${test.err.message}` : '',
            defect: status === ResultCreateStatusEnum.FAILED,
        };

        if (caseIds.length === 0) {
            caseObject.case = {
                title: test.title,
                suite_title: this.options.rootSuiteTitle
                    ? `${this.options.rootSuiteTitle}\t${CypressQaseReporter.getSuitePath(test.parent)}`
                    : CypressQaseReporter.getSuitePath(test.parent),
            };
            this.resultsForPublishing.push(caseObject);
            this.log(
                chalk`{gray Result prepared for publish: ${test.title} }`
            );
        } else {
            caseIds.forEach((caseId) => {
                const caseObjectWithId = { case_id: caseId, ...caseObject };
                this.resultsForPublishing.push(caseObjectWithId);
            });
        }


    }
}

export = CypressQaseReporter;
