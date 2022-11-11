
/* eslint-disable  sort-imports*/
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ResultCreateStatusEnum } from 'qaseio/dist/src';
import { Envs, QaseCoreReporter, QaseOptions, Statuses, TestResult } from 'qase-core-reporter';
import { Formatter } from '@cucumber/cucumber';
import { IFormatterOptions } from '@cucumber/cucumber/lib/formatter';
import chalk from 'chalk';
import crypto from 'crypto';
import fs from 'fs';
import { io } from '@cucumber/messages/dist/src/messages';
import mime from 'mime-types';
import os from 'os';
import moment from 'moment';
import path from 'path';
import IEnvelope = io.cucumber.messages.IEnvelope;
import IGherkinDocument = io.cucumber.messages.IGherkinDocument;
import IPickle = io.cucumber.messages.IPickle;
import ITestCase = io.cucumber.messages.ITestCase;
import ITestCaseFinished = io.cucumber.messages.ITestCaseFinished;
import ITestCaseStarted = io.cucumber.messages.ITestCaseStarted;
import ITestStepFinished = io.cucumber.messages.ITestStepFinished;
import IAttachment = io.cucumber.messages.IAttachment;
import Status = io.cucumber.messages.TestStepFinished.TestStepResult.Status;


const prepareConfig = (options: QaseOptions = {} as QaseOptions, configFile = '.qaserc'): QaseOptions => {
    const loaded = QaseCoreReporter.loadConfig(path.join(process.cwd(), configFile || '.qaserc'));
    if (!loaded) {
        // eslint-disable-next-line no-throw-literal
        QaseCoreReporter.logger(chalk`{red Missing .qaserc file}`);
    }
    const config: QaseOptions = Object.assign(
        loaded || {},
        options,
    );

    return config;
};

const prepareReportName = (
    config: QaseOptions,
) => {
    const date = moment().format();
    return config.runName ? config.runName
        .replace('%DATE%', date) : `CucumberJS Automated Run ${date}`;
};

const StatusMapping: Record<Status, ResultCreateStatusEnum | null> = {
    [Status.PASSED]: ResultCreateStatusEnum.PASSED,
    [Status.FAILED]: ResultCreateStatusEnum.FAILED,
    [Status.SKIPPED]: ResultCreateStatusEnum.SKIPPED,
    [Status.AMBIGUOUS]: null,
    [Status.PENDING]: null,
    [Status.UNDEFINED]: null,
    [Status.UNKNOWN]: null,
};

class CucumberJSQaseReporter extends Formatter {
    private reporter: QaseCoreReporter;
    private pickleInfo: Record<string, { caseIds: string[]; name: string; lastAstNodeId: string | null }> = {};
    private testCaseStarts: Record<string, ITestCaseStarted> = {};
    private testCaseStartedResult: Record<string, ResultCreateStatusEnum> = {};
    private testCaseStartedAttachment: Record<string, Array<{ path: string }>> = {};
    private testCaseStartedErrors: Record<string, string[]> = {};
    private testCaseScenarioId: Record<string, string> = {};
    private scenarios: Record<string, string> = {};

    public constructor(options: IFormatterOptions) {
        super(options);
        QaseCoreReporter.reporterPrettyName = 'CucumberJS';
        options.eventBroadcaster.on('envelope', this.parseEnvelope.bind(this));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const qOptions: QaseOptions & { uploadAttachments: boolean; enabled: boolean } = prepareConfig(
            options.parsedArgvOptions as QaseOptions,
            options.parsedArgvOptions?.qaseConfig
        ) as any;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        qOptions.runName = prepareReportName(qOptions);
        qOptions.report = QaseCoreReporter.getEnv(Envs.enabled) as unknown as boolean
            || qOptions.enabled
            || qOptions.report
            || undefined;
        qOptions.projectCode = QaseCoreReporter.getEnv(Envs.project) as unknown as string
            || qOptions.projectCode
            || '';
        this.reporter = new QaseCoreReporter(qOptions, {
            frameworkName: '@cucumber/cucumber',
            reporterName: 'cucumberjs-qase-reporter',
            customFrameworkName: 'cucumberjs',
            customReporterName: 'qase-cucumberjs',
            uploadAttachments: qOptions.uploadAttachments,
            enabledSupport: true,
        });
    }

    private parseEnvelope(envelope: IEnvelope): void {
        if (envelope.gherkinDocument) {
            this.onGherkinDocument(envelope.gherkinDocument);
        } else if (envelope.pickle) {
            this.onPickle(envelope.pickle);
        } else if (envelope.testCase) {
            this.onTestCase(envelope.testCase);
        } else if (envelope.testRunStarted) {
            this.onTestRunStarted();
        } else if (envelope.testRunFinished) {
            this.onTestRunFinished();
        } else if (envelope.attachment) {
            this.onAttachment(envelope.attachment);
        } else if (envelope.testCaseStarted) {
            this.onTestCaseStarted(envelope.testCaseStarted);
        } else if (envelope.testCaseFinished) {
            this.onTestCaseFinished(envelope.testCaseFinished);
        } else if (envelope.testStepFinished) {
            this.onTestStepFinished(envelope.testStepFinished);
        } else if (envelope.parseError) {
            QaseCoreReporter.logger(`Error: ${envelope.parseError as string}`);
        }
    }

    private onGherkinDocument(gherkinDocument: IGherkinDocument): void {
        gherkinDocument.feature?.children?.forEach((featureChild) => {
            if (gherkinDocument?.feature?.name != null
                && featureChild.scenario?.id !== undefined
                && featureChild.scenario?.id !== null) {
                this.scenarios[featureChild.scenario?.id] = gherkinDocument?.feature?.name;
            }
        });
    }

    private onPickle(pickle: IPickle): void {
        this.pickleInfo[pickle.id!] = {
            caseIds: this.extractIds(pickle.tags!),
            name: pickle.name!,
            lastAstNodeId: pickle.astNodeIds ? pickle.astNodeIds[pickle.astNodeIds.length - 1] : null,
        };
    }

    private onTestCase(testCase: ITestCase): void {
        this.testCaseScenarioId[testCase.id!] = testCase.pickleId!;
    }

    private onTestCaseStarted(testCaseStarted: ITestCaseStarted): void {
        this.testCaseStarts[testCaseStarted.id!] = testCaseStarted;
        this.testCaseStartedResult[testCaseStarted.id!] = ResultCreateStatusEnum.PASSED;
    }

    private onTestCaseFinished(testCaseFinished: ITestCaseFinished): void {
        const tcs = this.testCaseStarts[testCaseFinished.testCaseStartedId!];
        const pickleId = this.testCaseScenarioId[tcs.testCaseId!];
        const info = this.pickleInfo[pickleId];
        const status = this.testCaseStartedResult[testCaseFinished.testCaseStartedId!] as keyof typeof Statuses;
        const suiteTitle: string[] = [info.lastAstNodeId ? this.scenarios[info.lastAstNodeId] : ''];
        const hasErrors = this.testCaseStartedErrors[testCaseFinished.testCaseStartedId!]?.length > 0;
        const test: TestResult = {
            id: tcs.id!,
            title: info.name,
            caseIds: info.caseIds?.length > 0
                ? info.caseIds.map((id) => parseInt(id, 10))
                : undefined,
            status,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            duration: Math.abs((testCaseFinished.timestamp!.seconds! as number - (tcs.timestamp!.seconds! as number))),
            error: hasErrors
                ? new Error(this.testCaseStartedErrors[testCaseFinished.testCaseStartedId!][0].split('\n')[0])
                : undefined,
            suitePath: suiteTitle.join('\t'),
            stacktrace: hasErrors
                ? this.testCaseStartedErrors[testCaseFinished.testCaseStartedId!].join('\n\n')
                : undefined,
        };

        const attachments = this.testCaseStartedAttachment[tcs.id!] || [];
        this.reporter.addTestResult(test, status as ResultCreateStatusEnum, attachments);
    }

    private onTestStepFinished(testStepFinished: ITestStepFinished): void {
        const stepFin = testStepFinished;
        const stepStatus = stepFin.testStepResult!.status!;
        const stepMessage = stepFin.testStepResult!.message!;
        const oldStatus = this.testCaseStartedResult[stepFin.testCaseStartedId!];
        const newStatus = this.getNormalizedTestStatus(stepStatus);
        if (newStatus === null) {
            QaseCoreReporter.logger(
                chalk`{redBright Unexpected finish status ${stepStatus} received for step ${stepMessage}}`
            );
            return;
        }
        if (newStatus !== ResultCreateStatusEnum.PASSED) {
            this.addErrorMessage(stepFin.testCaseStartedId!, stepFin.testStepResult?.message);
            if (oldStatus) {
                if (oldStatus !== ResultCreateStatusEnum.FAILED && newStatus) {
                    this.testCaseStartedResult[stepFin.testCaseStartedId!] = newStatus;
                }
            } else {
                if (newStatus) {
                    this.testCaseStartedResult[stepFin.testCaseStartedId!] = newStatus;
                }
            }
        }
    }

    private onTestRunStarted(): void {
        void this.reporter.start();
    }

    private onTestRunFinished(): void {
        void this.reporter.end({ spawn: false });
    }

    private onAttachment(attachment: IAttachment): void {
        const randomString = crypto.randomBytes(20).toString('hex');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        const tmpFilePath = os.tmpdir().concat(randomString, '.', mime.extension(attachment.mediaType));

        fs.writeFile(tmpFilePath, attachment.body as string, 'base64', (err) => {
            if (err !== null) {
                QaseCoreReporter.logger(err.message);
            }
        });

        if (this.testCaseStartedAttachment[attachment.testCaseStartedId!]) {
            this.testCaseStartedAttachment[attachment.testCaseStartedId!].push({ path: tmpFilePath });
        } else {
            this.testCaseStartedAttachment[attachment.testCaseStartedId!] = [{ path: tmpFilePath }];
        }
    }

    private extractIds(tagsList: io.cucumber.messages.Pickle.IPickleTag[]): string[] {
        const regex = /[Qq]-*(\d+)/;
        return tagsList.filter((tagInfo) => regex.test(tagInfo.name!)).map((tagInfo) => regex.exec(tagInfo.name!)![1]);
    }

    private addErrorMessage(tcsid: string, error: string | null | undefined) {
        if (error) {
            if (tcsid in this.testCaseStartedErrors) {
                this.testCaseStartedErrors[tcsid].push(error);
            } else {
                this.testCaseStartedErrors[tcsid] = [error];
            }
        }
    }

    private getNormalizedTestStatus(status: Status): ResultCreateStatusEnum {
        if (typeof status === 'number') {
            return StatusMapping[status] as ResultCreateStatusEnum;
        } else {
            return String(status).toLowerCase() as ResultCreateStatusEnum;
        }
    }
}

export = CucumberJSQaseReporter;
