import { Formatter, IFormatterOptions, Status } from '@cucumber/cucumber';
import { Envelope, PickleTag, TestCaseStarted } from '@cucumber/messages';
import {
  OptionsType,
  QaseReporter,
  ReporterInterface,
  StatusesEnum,
} from 'qase-javascript-commons';
import { EventEmitter } from 'events';

const StatusMapping = {
  [Status.PASSED]: StatusesEnum.passed,
  [Status.FAILED]: StatusesEnum.failed,
  [Status.SKIPPED]: StatusesEnum.skipped,
  [Status.AMBIGUOUS]: null,
  [Status.PENDING]: StatusesEnum.blocked,
  [Status.UNDEFINED]: null,
  [Status.UNKNOWN]: null,
};

const qaseIdRegExp = /[Qq]-(\d+)/g;

type PickleInfoType = {
  caseIds: number[];
  name: string;
  lastAstNodeId: string | undefined;
};

export type CucumberQaseOptionsType = IFormatterOptions & {
  qase?: Omit<OptionsType, 'frameworkName' | 'reporterName'>;
};

export class CucumberQaseReporter extends Formatter {
  private static getCaseIds(tagsList: readonly PickleTag[]) {
    return tagsList.reduce<number[]>((acc, tagInfo) => {
      const ids = Array.from(tagInfo.name.matchAll(qaseIdRegExp))
        .map(([, id]) => Number(id))
        .filter((id): id is number => id !== undefined);

      acc.push(...ids);

      return acc;
    }, []);
    // .filter((id): id is string => id !== undefined);
  }

  private pickleInfo: Record<string, PickleInfoType> = {};
  private testCaseStarts: Record<string, TestCaseStarted> = {};
  private testCaseStartedResult: Record<string, StatusesEnum> = {};
  private testCaseStartedErrors: Record<string, string[]> = {};
  private testCaseScenarioId: Record<string, string> = {};
  private scenarios: Record<string, string> = {};
  private attachments: Record<string, string> = {};

  private reporter: ReporterInterface;
  private eventBroadcaster: EventEmitter;

  public constructor(options: CucumberQaseOptionsType) {
    const { qase, ...formatterOptions } = options;

    super(formatterOptions);

    this.reporter = new QaseReporter({
      ...qase,
      frameworkName: 'cucumberjs',
      reporterName: 'cucumberjs-qase-reporter',
    });

    this.eventBroadcaster = formatterOptions.eventBroadcaster;

    this.bindEventListeners();
  }

  private bindEventListeners() {
    this.eventBroadcaster.on('envelope', (envelope: Envelope) => {
      if (envelope.gherkinDocument) {
        if (envelope.gherkinDocument.feature) {
          const { children, name } = envelope.gherkinDocument.feature;

          children.forEach(({ scenario }) => {
            if (scenario) {
              this.scenarios[scenario.id] = name;
            }
          });
        }
      } else if (envelope.pickle) {
        this.pickleInfo[envelope.pickle.id] = {
          caseIds: CucumberQaseReporter.getCaseIds(envelope.pickle.tags),
          name: envelope.pickle.name,
          lastAstNodeId:
            envelope.pickle.astNodeIds[envelope.pickle.astNodeIds.length - 1],
        };
      } else if (envelope.attachment) {
        if (
          envelope.attachment.testCaseStartedId &&
          envelope.attachment.fileName
        ) {
          this.attachments[envelope.attachment.testCaseStartedId] =
            envelope.attachment.fileName;
        }
      } else if (envelope.testRunFinished) {
        void this.publishResults();
      } else if (envelope.testCase) {
        this.testCaseScenarioId[envelope.testCase.id] =
          envelope.testCase.pickleId;
      } else if (envelope.testCaseStarted) {
        this.testCaseStarts[envelope.testCaseStarted.id] =
          envelope.testCaseStarted;
        this.testCaseStartedResult[envelope.testCaseStarted.id] =
          StatusesEnum.passed;
      } else if (envelope.testStepFinished) {
        const stepFin = envelope.testStepFinished;
        const oldStatus = this.testCaseStartedResult[stepFin.testCaseStartedId];
        const newStatus = StatusMapping[stepFin.testStepResult.status];

        if (newStatus === null) {
          return;
        }

        if (newStatus !== StatusesEnum.passed) {
          if (stepFin.testStepResult.message) {
            const errors =
              this.testCaseStartedErrors[stepFin.testCaseStartedId] || [];

            if (!this.testCaseStartedErrors[stepFin.testCaseStartedId]) {
              this.testCaseStartedErrors[stepFin.testCaseStartedId] = errors;
            }

            errors.push(stepFin.testStepResult.message);
          }

          if (oldStatus) {
            if (oldStatus !== StatusesEnum.failed) {
              this.testCaseStartedResult[stepFin.testCaseStartedId] = newStatus;
            }
          } else {
            this.testCaseStartedResult[stepFin.testCaseStartedId] = newStatus;
          }
        }
      } else if (envelope.testCaseFinished) {
        const tcs =
          this.testCaseStarts[envelope.testCaseFinished.testCaseStartedId];

        if (!tcs) {
          return;
        }

        const pickleId = this.testCaseScenarioId[tcs.testCaseId];

        if (!pickleId) {
          return;
        }

        const info = this.pickleInfo[pickleId];

        if (!info) {
          return;
        }

        let error: Error | undefined;

        if (this.testCaseStartedErrors[tcs.id]?.length) {
          error = new Error(this.testCaseStartedErrors[tcs.id]?.join('\n\n'));
        }

        const [id, ...restIds] = info.caseIds;

        if (id) {
          this.reporter.addTestResult({
            id: tcs.id,
            testOpsId: [id, ...restIds],
            title: info.name,
            status:
              this.testCaseStartedResult[
                envelope.testCaseFinished.testCaseStartedId
              ] ?? StatusesEnum.passed,
            duration: Math.abs(
              envelope.testCaseFinished.timestamp.seconds -
                tcs.timestamp.seconds,
            ),
            error,
          });
        }
      }
    });
  }

  private async publishResults() {
    await this.reporter.publish();
  }
}
