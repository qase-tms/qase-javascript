import { EventEmitter } from 'events';

import { Formatter, IFormatterOptions, Status } from '@cucumber/cucumber';
import {
  Envelope,
  PickleStep,
  PickleTag,
  TestCaseStarted,
  TestStepFinished,
} from '@cucumber/messages';

import {
  composeOptions,
  ConfigLoader,
  ConfigType,
  QaseReporter,
  Relation,
  ReporterInterface,
  StepStatusEnum,
  StepType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';

interface PickleInfoType {
  caseIds: number[];
  name: string;
  lastAstNodeId: string | undefined;
  steps: readonly PickleStep[];
}

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
   * @type {Record<TestStepResultStatus, StepStatusEnum>}
   */
  static stepStatusMap: Record<TestStepResultStatus, StepStatusEnum> = {
    [Status.PASSED]: StepStatusEnum.passed,
    [Status.FAILED]: StepStatusEnum.failed,
    [Status.SKIPPED]: StepStatusEnum.blocked,
    [Status.AMBIGUOUS]: StepStatusEnum.blocked,
    [Status.PENDING]: StepStatusEnum.blocked,
    [Status.UNDEFINED]: StepStatusEnum.blocked,
    [Status.UNKNOWN]: StepStatusEnum.blocked,
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
  private static getCaseIds(tagsList: readonly PickleTag[]): number[] {
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

  /**
   * @type {Record<string, TestStepFinished>}
   * @private
   */
  private testCaseStepsFinished: Record<string, TestStepFinished> = {};

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
  private testCaseScenarioId: Record<string, TestCase> = {};
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
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    options: CucumberQaseOptionsType,
    configLoader = new ConfigLoader(),
  ) {
    const { qase, ...formatterOptions } = options;
    const config = configLoader.load();

    super(formatterOptions);

    this.reporter = QaseReporter.getInstance({
      ...composeOptions(qase, config),
      frameworkPackage: '@cucumber/cucumber',
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
          steps: envelope.pickle.steps,
        };
      } else if (envelope.attachment) {
        if (
          envelope.attachment.testCaseStartedId &&
          envelope.attachment.fileName
        ) {
          this.attachments[envelope.attachment.testCaseStartedId] =
            envelope.attachment.fileName;
        }
      } else if (envelope.testRunStarted) {
        this.startTestRun();
      } else if (envelope.testRunFinished) {
        void this.publishResults();
      } else if (envelope.testCase) {
        this.testCaseScenarioId[envelope.testCase.id] =
          envelope.testCase;
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

        this.testCaseStepsFinished[stepFin.testStepId] = stepFin;

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

        const testCase = this.testCaseScenarioId[tcs.testCaseId];

        if (!testCase) {
          return;
        }

        const info = this.pickleInfo[testCase.pickleId];

        if (!info) {
          return;
        }

        let error: Error | undefined;

        if (this.testCaseStartedErrors[tcs.id]?.length) {
          error = new Error(this.testCaseStartedErrors[tcs.id]?.join('\n\n'));
        }
        let relations: Relation | null = null;
        if (info.lastAstNodeId != undefined && this.scenarios[info.lastAstNodeId] != undefined) {
          relations = {
            suite: {
              data: [
                {
                  title: this.scenarios[info.lastAstNodeId] ?? '',
                  public_id: null,
                },
              ],
            },
          };
        }

        void this.reporter.addTestResult({
          attachments: [],
          author: null,
          execution: {
            status: this.testCaseStartedResult[
              envelope.testCaseFinished.testCaseStartedId
              ] ?? TestStatusEnum.passed,
            start_time: null,
            end_time: null,
            duration: Math.abs(
              envelope.testCaseFinished.timestamp.seconds - tcs.timestamp.seconds,
            ),
            stacktrace: error?.stack ?? null,
            thread: null,
          },
          fields: {},
          message: null,
          muted: false,
          params: {},
          relations: relations,
          run_id: null,
          signature: '',
          steps: this.convertSteps(info.steps, testCase),
          testops_id: info.caseIds.length > 0 ? info.caseIds : null,
          id: tcs.id,
          title: info.name,
          // suiteTitle: info.lastAstNodeId && this.scenarios[info.lastAstNodeId],
        });
      }
    });
  }

  private convertSteps(steps: readonly PickleStep[], testCase: TestCase): TestStepType[] {
    const results: TestStepType[] = [];

    for (const s of testCase.testSteps) {
      const finished = this.testCaseStepsFinished[s.id];
      if (!finished) {
        continue;
      }

      const step = steps.find((step) => step.id === s.pickleStepId);

      if (!step) {
        continue;
      }

      const result: TestStepType = {
          id: s.id,
          step_type: StepType.GHERKIN,
          data: {
            keyword: step.text,
            name: step.text,
            line: 0,
          },
          execution: {
            status: CucumberQaseReporter.stepStatusMap[finished.testStepResult.status],
            start_time: null,
            end_time: null,
            duration: finished.testStepResult.duration.seconds,
          },
          attachments: [],
          steps: [],
          parent_id: null,
        }
      ;

      results.push(result);
    }

    return results;
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private async publishResults(): Promise<void> {
    await this.reporter.publish();
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private startTestRun(): void {
    this.reporter.startTestRun();
  }
}
