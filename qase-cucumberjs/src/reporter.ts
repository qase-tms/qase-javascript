import { Formatter, IFormatterOptions, Status } from '@cucumber/cucumber';
import { Envelope, PickleTag, TestCaseStarted } from '@cucumber/messages';
import {
  ConfigType,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { EventEmitter } from 'events';

type PickleInfoType = {
  caseIds: number[];
  name: string;
  lastAstNodeId: string | undefined;
};

type TestStepResultStatus = (typeof Status)[keyof typeof Status];

export type CucumberQaseOptionsType = IFormatterOptions & {
  qase?: ConfigType;
};

/**
 * @class CucumberQaseReporter
 * @extends Formatter
 */
export class CucumberQaseReporter extends Formatter {
  /**
   * @type {Record<TestStepResultStatus, TestStatusEnum | null>}
   */
  static statusMap: Record<TestStepResultStatus, TestStatusEnum | null> = {
    [Status.PASSED]: TestStatusEnum.passed,
    [Status.FAILED]: TestStatusEnum.failed,
    [Status.SKIPPED]: TestStatusEnum.skipped,
    [Status.AMBIGUOUS]: null,
    [Status.PENDING]: TestStatusEnum.blocked,
    [Status.UNDEFINED]: null,
    [Status.UNKNOWN]: null,
  };

  /**
   * @type {RegExp}
   */
  static qaseIdRegExp = /^@[Qq]-?(\d+)$/g;

  /**
   * @param {readonly PickleTag[]} tagsList
   * @returns {number[]}
   * @private
   */
  private static getCaseIds(tagsList: readonly PickleTag[]) {
    return tagsList.reduce<number[]>((acc, tagInfo) => {
      const ids = Array.from(tagInfo.name.matchAll(CucumberQaseReporter.qaseIdRegExp))
        .map(([, id]) => Number(id))
        .filter((id): id is number => id !== undefined);

      acc.push(...ids);

      return acc;
    }, []);
  }

  /**
   * @type {Record<string, PickleInfoType>}
   * @private
   */
  private pickleInfo: Record<string, PickleInfoType> = {};
  /**
   * @type {Record<string, TestCaseStarted>}
   * @private
   */
  private testCaseStarts: Record<string, TestCaseStarted> = {};
  /**
   * @type {Record<string, >}
   * @private
   */
  private testCaseStartedResult: Record<string, TestStatusEnum> = {};
  /**
   * @type {Record<string, string[]>}
   * @private
   */
  private testCaseStartedErrors: Record<string, string[]> = {};
  /**
   * @type {Record<string, string>}
   * @private
   */
  private testCaseScenarioId: Record<string, string> = {};
  /**
   * @type {Record<string, string>}
   * @private
   */
  private scenarios: Record<string, string> = {};
  /**
   * @type {Record<string, string>}
   * @private
   */
  private attachments: Record<string, string> = {};

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;
  /**
   * @type {EventEmitter}
   * @private
   */
  private eventBroadcaster: EventEmitter;

  /**
   * @param {CucumberQaseOptionsType} options
   */
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

  /**
   * @private
   */
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
          TestStatusEnum.passed;
      } else if (envelope.testStepFinished) {
        const stepFin = envelope.testStepFinished;
        const oldStatus = this.testCaseStartedResult[stepFin.testCaseStartedId];
        const newStatus =
          CucumberQaseReporter.statusMap[stepFin.testStepResult.status];

        if (newStatus === null) {
          return;
        }

        if (newStatus !== TestStatusEnum.passed) {
          if (stepFin.testStepResult.message) {
            const errors =
              this.testCaseStartedErrors[stepFin.testCaseStartedId] ?? [];

            if (!this.testCaseStartedErrors[stepFin.testCaseStartedId]) {
              this.testCaseStartedErrors[stepFin.testCaseStartedId] = errors;
            }

            errors.push(stepFin.testStepResult.message);
          }

          if (oldStatus) {
            if (oldStatus !== TestStatusEnum.failed) {
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

        this.reporter.addTestResult({
          id: tcs.id,
          testOpsId: info.caseIds,
          title: info.name,
          suiteTitle: info.lastAstNodeId && this.scenarios[info.lastAstNodeId],
          status:
            this.testCaseStartedResult[
              envelope.testCaseFinished.testCaseStartedId
            ] ?? TestStatusEnum.passed,
          duration: Math.abs(
            envelope.testCaseFinished.timestamp.seconds - tcs.timestamp.seconds,
          ),
          error,
        });
      }
    });
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private async publishResults() {
    await this.reporter.publish();
  }
}
