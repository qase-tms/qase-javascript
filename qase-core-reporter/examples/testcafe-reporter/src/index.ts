/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable space-before-function-paren */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/dot-notation */
import { QaseCoreReporter, QaseCoreReporterOptions, QaseOptions, TestResult } from 'qase-core-reporter';
import { ResultCreateStatusEnum } from 'qaseio/dist/src';

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

interface Meta {
    [key: string]: string;
}

class TestcafeRepoter extends QaseCoreReporter {
    public fixtureName: string | undefined;
    public userAgents!: string[];
    public constructor(options: QaseOptions, coreOptions: QaseCoreReporterOptions) {
        super(options, coreOptions);
    }

    public static getCaseIdFromMeta(meta: Meta): number[] | undefined {
        if (!meta.CID) {
            return undefined;
        }
        return meta.CID as unknown as number[];
    }

    public static formatAttachments(attachments: Screenshot[]): Array<{ path: string }> {
        return attachments.map((attachment) => ({
            path: attachment.screenshotPath,
        }));
    }

    // eslint-disable-next-line  max-len
    public getTestData(name: string, testRunInfo: TestRunInfo, meta: Meta, formatError: (x: Record<string, unknown>) => string) {
        const hasErr = testRunInfo.errs.length;
        let testStatus: ResultCreateStatusEnum;

        if (testRunInfo.skipped) {
            testStatus = ResultCreateStatusEnum.SKIPPED;
        } else if (hasErr > 0) {
            testStatus = ResultCreateStatusEnum.FAILED;
        } else {
            testStatus = ResultCreateStatusEnum.PASSED;
        }

        const errorLog = testRunInfo.errs
            .map((x: Record<string, unknown>) => formatError(x).replace(
                /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                ''
            ))
            .join('\n');

        // pull out the screenshot path from the meta data
        let attachmentsArray: any[] = [];
        if (testRunInfo.screenshots.length > 0) {
            attachmentsArray = TestcafeRepoter.formatAttachments(testRunInfo.screenshots);
        }

        const testResult: TestResult = {
            title: name,
            status: testStatus,
            duration: testRunInfo.durationMs,
            stacktrace: errorLog ? errorLog : undefined,
            caseIds: TestcafeRepoter.getCaseIdFromMeta(meta),
            error: errorLog ? new Error(errorLog.split('\n')[0]) : undefined,
            suitePath: this.fixtureName,
        };

        return {
            testResult,
            testStatus,
            attachmentsArray,
        };
    }
}

export = function () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const options: QaseOptions & { uploadAttachments: boolean } = QaseCoreReporter
        .loadConfig(process.cwd() + '/.qaserc') as any;
    const reporter = new TestcafeRepoter(options, {
        frameworkName: 'testcafe',
        reporterName: 'testcafe-reporter-qase',
        uploadAttachments: options.uploadAttachments,
    } as QaseCoreReporterOptions);

    return {

        async reportTaskStart(_, userAgents: string[]) {

            reporter.userAgents = userAgents;

            reporter.options.runName = reporter.options.runName!
                .replace('%DATE%', new Date().toISOString())
                .replace('%AGENTS%', userAgents.join(', '));

            await reporter.start();
        },

        reportFixtureStart(name) {
            reporter.fixtureName = name ? String(name) : undefined;
        },

        reportTestDone(
            name: string,
            testRunInfo: TestRunInfo,
            meta: Meta
        ) {

            const { testResult, testStatus, attachmentsArray } = reporter.getTestData(name, testRunInfo, meta,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error Inject testrail error formatting method with bound context
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                this.formatError.bind(this)
            );

            reporter.addTestResult(testResult, testStatus, attachmentsArray);
        },

        async reportTaskDone() {
            await reporter.end({ spawn: false });
        },
    };
};
