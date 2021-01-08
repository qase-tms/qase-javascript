/* eslint-disable no-console,@typescript-eslint/require-await */
import { ResultCreate, ResultCreated, ResultStatus, RunCreated } from 'qaseio/dist/src/models';
import { QaseApi } from 'qaseio';
import { Response } from 'node-fetch';
import fs from 'fs';
import moment from 'moment';
import path from 'path';

interface Config<T = number> {
    enabled: boolean;
    host: string;
    user: string;
    apiKey: string;
    projectId: string;
    runId: T;
    runName: string;
    runDescription?: string;
    reference?: string;
    branchEnv: string;
    buildNoEnv: string;
    dateFormat: string;
    caseMeta: string;
    runCloseAfterDays?: number;
    uploadScreenshots: boolean;
    updateRunTestCases: boolean;
}

interface Meta {
    [key: string]: string;
}

interface TaskResult {
    passedCount: number;
    failedCount: number;
    skippedCount: number;
}

interface Screenshot {
    screenshotPath: string;
    thumbnailPath: string;
    userAgent: string;
    quarantineAttempt: number;
    takenOnFail: boolean;
}

interface TestRunInfo {
    errs: Array<Record<string, unknown>>;
    warnings: string[];
    durationMs: number;
    unstable: boolean;
    screenshotPath: string;
    screenshots: Screenshot[];
    quarantine: { [key: string]: { passed: boolean } };
    skipped: boolean;
}

const Status = {
    Passed: {
        value: ResultStatus.PASSED,
        text: 'PASSED',
        color: 'yellow',
    },
    Blocked: {
        value: ResultStatus.SKIPPED,
        text: 'SKIPPED',
        color: 'green',
    },
    Failed: {
        value: ResultStatus.FAILED,
        text: 'FAILED',
        color: 'red',
    },
};

const loadJSON = (file: string): Config<string> | undefined => {
    try {
        const data = fs.readFileSync(file, { encoding: 'utf8' });

        if (data) {
            return JSON.parse(data) as Config<string>;
        }
    } catch (error) {
        // Ignore error when file does not exist or it's malformed
    }

    return undefined;
};

const prepareConfig = (options: Config = {} as Config): Config => {
    const loaded = loadJSON(path.join(process.cwd(), '.testrailrc'));
    const config: Config<string> = Object.assign(
        loaded,
        options
    );

    return {
        enabled: process.env.QASE_ENABLED === 'true' || config.enabled || false,
        host: process.env.QASE_HOST || config.host,
        user: process.env.QASE_USER || config.user,
        apiKey: process.env.QASE_API_KEY || config.apiKey,
        projectId:
            (process.env.QASE_PROJECT_ID || config.projectId || '')
                .replace('P', '')
                .trim()
        ,
        runId: Number(
            (process.env.QASE_RUN_ID || config.runId || '')
                .replace('R', '')
                .trim()
        ),
        runName:
            process.env.QASE_RUN_NAME ||
            config.runName ||
            '%BRANCH%#%BUILD% - %DATE%',
        runDescription:
            process.env.QASE_RUN_DESCRIPTION || config.runDescription,
        reference: process.env.QASE_REFERENCE || config.reference,
        branchEnv: process.env.QASE_BRANCH_ENV || config.branchEnv || 'BRANCH',
        buildNoEnv:
            process.env.QASE_BUILD_NO_ENV || config.buildNoEnv || 'BUILD_NUMBER',
        dateFormat:
            process.env.QASE_DATE_FORMAT ||
            config.dateFormat ||
            'YYYY-MM-DD HH:mm:ss',
        caseMeta: process.env.QASE_CASE_META || config.caseMeta || 'CID',
        runCloseAfterDays:
            Number(
                process.env.QASE_RUN_CLOSE_AFTER_DAYS || config.runCloseAfterDays
            ) || 0,
        uploadScreenshots:
            process.env.QASE_UPLOAD_SCREENSHOTS === 'true' ||
            config.uploadScreenshots ||
            false,
        updateRunTestCases:
            process.env.QASE_UPDATE_RUN_TEST_CASES === 'true' ||
            config.updateRunTestCases !== false,
    };
};

const prepareReportName = (
    config: Config,
    branch: string,
    buildNo: string,
    userAgents: string[]
) => {
    const date = moment().format(config.dateFormat);
    return config.runName
        .replace('%BRANCH%', branch)
        .replace('%BUILD%', buildNo)
        .replace('%DATE%', date)
        .replace('%AGENTS%', `(${userAgents.join(', ')})`);
};

const prepareReference = (config: Config, branch: string, buildNo: string) => config.reference
    ? config.reference.replace('%BRANCH%', branch).replace('%BUILD%', buildNo)
    : '';

const verifyConfig = (config: Config) => {
    const { enabled, host, user, apiKey, projectId } = config;
    if (enabled) {
        if (!host) {
            console.log('[TestRail] Hostname was not provided.');
        }

        if (!user || !apiKey) {
            console.log('[TestRail] Username or api key was not provided.');
        }

        if (!projectId) {
            console.log('[TestRail] Project id was not provided.');
        }

        if (host && user && apiKey && projectId) {
            return true;
        }
    }

    return false;
};

class TestcafeQaseReporter {
    private noColors: boolean;
    private formatError: unknown;

    private config: Config;
    private branch: string;
    private buildNo: string;

    private userAgents!: string[];
    private results: ResultCreate[];
    private screenshots: {
        [key: string]: Screenshot[];
    };

    public constructor() {
        this.config = prepareConfig();
        this.branch = process.env[this.config.branchEnv] || 'master';
        this.buildNo = process.env[this.config.buildNoEnv] || 'unknown';

        this.noColors = false;
        this.results = [];
        this.screenshots = {};
    }

    public reportTaskStart = async (_startTime: number, userAgents: string[]) => {
        this.userAgents = userAgents;
    };

    public reportFixtureStart = async () => {
        // Not needed
    };

    public reportTestDone = async (
        name: string,
        testRunInfo: TestRunInfo,
        meta: Meta,
        formatError: (x: Record<string, unknown>) => string
    ) => {
        const hasErr = testRunInfo.errs.length;

        let testStatus: ResultStatus | null = null;

        if (testRunInfo.skipped) {
            testStatus = ResultStatus.SKIPPED;
        } else if (hasErr === 0) {
            testStatus = ResultStatus.PASSED;
        } else {
            testStatus = ResultStatus.FAILED;
        }

        let caseId = 0;
        if (meta[this.config.caseMeta]) {
            caseId = Number(meta[this.config.caseMeta].replace('C', '').trim());
        }

        if (caseId > 0) {
            const errorLog = testRunInfo.errs
                .map((x: Record<string, unknown>) => {
                    const formatted = formatError(x).replace(
                        // eslint-disable-next-line no-control-regex
                        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                        ''
                    );

                    return formatted;
                })
                .join('\n');

            this.results.push(
                new ResultCreate(caseId, testStatus, { comment: `Test ${testStatus}\n${errorLog}`})
            );

            if (testRunInfo.screenshots.length) {
                this.screenshots[caseId] = testRunInfo.screenshots;
            }
        } else {
            console.log(
                `[TestRail] Test missing the TestRail Case ID in test metadata: ${name}`
            );
        }
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    public reportTaskDone = async (
        _endTime: number,
        _passed: number,
        _warnings: string[],
        _result: TaskResult
    ) => {
        // Not implemented
    };
}

/// This weird setup is required due to TestCafe prototype injection method.
export = () => {
    const reporter = new TestcafeQaseReporter();
    return {
        reportTaskStart: reporter.reportTaskStart,
        reportFixtureStart: reporter.reportFixtureStart,
        async reportTestDone(
            name: string,
            testRunInfo: TestRunInfo,
            meta: Meta
        ): Promise<void> {
            return reporter.reportTestDone(
                name,
                testRunInfo,
                meta,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error Inject testrail error formatting method with bound context
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                this.formatError.bind(this)
            );
        },
        reportTaskDone: reporter.reportTaskDone,
        reporter,
    };
};
