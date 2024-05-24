import {
  Attachment as Attach,
  GherkinDocument,
  Pickle,
  PickleStep,
  PickleTag,
  TestCaseFinished,
  TestCaseStarted,
  TestStepFinished,
} from '@cucumber/messages';
import {
  Attachment,
  Relation,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { Status } from '@cucumber/cucumber';

type TestStepResultStatus = (typeof Status)[keyof typeof Status];

const qaseIdRegExp = /^@[Qq]-?(\d+)$/g;

export class Storage {
  /**
   * @type {Record<string, Pickle>}
   * @private
   */
  private pickles: Record<string, Pickle> = {};

  /**
   * @type {Record<string, TestCaseStarted>}
   * @private
   */
  private testCaseStarts: Record<string, TestCaseStarted> = {};

  /**
   * @type {Record<string, TestStepFinished>}
   * @private
   */
  private testCaseSteps: Record<string, TestStepFinished> = {};

  /**
   * @type {Record<string, TestStatusEnum>}
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
  private testCases: Record<string, TestCase> = {};

  /**
   * @type {Record<string, string>}
   * @private
   */
  private scenarios: Record<string, string> = {};

  /**
   * @type {Record<string, string>}
   * @private
   */
  private attachments: Record<string, Attachment[]> = {};

  /**
   * Add pickle to storage
   * @param {Pickle} pickle
   */
  public addPickle(pickle: Pickle): void {
    this.pickles[pickle.id] = pickle;
  }

  /**
   * Add scenario to storage
   * @param {GherkinDocument} document
   */
  public addScenario(document: GherkinDocument): void {
    if (document.feature) {
      const { children, name } = document.feature;

      children.forEach(({ scenario }) => {
        if (scenario) {
          this.scenarios[scenario.id] = name;
        }
      });
    }
  }

  /**
   * Add attachment to storage
   * @param {Attach} attachment
   */
  public addAttachment(attachment: Attach): void {
    if (attachment.testCaseStartedId && attachment.fileName) {
      if (!this.attachments[attachment.testCaseStartedId]) {
        this.attachments[attachment.testCaseStartedId] = [];
      }

      this.attachments[attachment.testCaseStartedId]?.push({
        file_name: attachment.fileName,
        mime_type: attachment.mediaType,
        file_path: null,
        content: attachment.body,
        size: 0,
        id: attachment.fileName,
      });
    }
  }

  /**
   * Add test case to storage
   * @param {TestCase} testCase
   */
  public addTestCase(testCase: TestCase): void {
    this.testCases[testCase.id] = testCase;
  }

  /**
   * Get all test cases
   * @param {TestCaseStarted} testCaseStarted
   */
  public addTestCaseStarted(testCaseStarted: TestCaseStarted): void {
    this.testCaseStarts[testCaseStarted.id] =
      testCaseStarted;
    this.testCaseStartedResult[testCaseStarted.id] =
      TestStatusEnum.passed;
  }

  /**
   * Add test case step to storage
   * @param {TestStepFinished} testCaseStep
   */
  public addTestCaseStep(testCaseStep: TestStepFinished): void {
    const stepFin = testCaseStep;
    const oldStatus = this.testCaseStartedResult[stepFin.testCaseStartedId];
    const newStatus =
      Storage.statusMap[stepFin.testStepResult.status];

    if (newStatus === null) {
      return;
    }

    this.testCaseSteps[stepFin.testStepId] = stepFin;

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
  }

  /**
   * Convert test case to test result
   * @param {TestCaseFinished} testCase
   * @returns {undefined | TestResultType}
   */
  public convertTestCase(testCase: TestCaseFinished): undefined | TestResultType {
    const tcs =
      this.testCaseStarts[testCase.testCaseStartedId];

    if (!tcs) {
      return undefined;
    }

    const tc = this.testCases[tcs.testCaseId];

    if (!tc) {
      return undefined;
    }

    const pickle = this.pickles[tc.pickleId];

    if (!pickle) {
      return undefined;
    }

    let error: Error | undefined;

    if (this.testCaseStartedErrors[tcs.id]?.length) {
      error = new Error(this.testCaseStartedErrors[tcs.id]?.join('\n\n'));
    }
    let relations: Relation | null = null;
    const nodeId = pickle.astNodeIds[pickle.astNodeIds.length - 1];
    if (nodeId != undefined && this.scenarios[nodeId] != undefined) {
      relations = {
        suite: {
          data: [
            {
              title: this.scenarios[nodeId] ?? '',
              public_id: null,
            },
          ],
        },
      };
    }

    const testOpsId = this.getCaseIds(pickle.tags);

    return {
      attachments: [],
      author: null,
      execution: {
        status: this.testCaseStartedResult[testCase.testCaseStartedId] ?? TestStatusEnum.passed,
        start_time: null,
        end_time: null,
        duration: Math.abs(testCase.timestamp.seconds - tcs.timestamp.seconds),
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
      steps: this.convertSteps(pickle.steps, tc),
      testops_id: testOpsId.length > 0 ? testOpsId : null,
      id: tcs.id,
      title: pickle.name,
    };
  }

  /**
   * Convert test steps to test result steps
   * @param {readonly PickleStep[]} steps
   * @param {TestCase} testCase
   * @returns {TestStepType[]}
   * @private
   */
  private convertSteps(steps: readonly PickleStep[], testCase: TestCase): TestStepType[] {
    const results: TestStepType[] = [];

    for (const s of testCase.testSteps) {
      const finished = this.testCaseSteps[s.id];
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
            status: Storage.stepStatusMap[finished.testStepResult.status],
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
   * @param {readonly PickleTag[]} tagsList
   * @returns {number[]}
   * @private
   */
  private getCaseIds(tagsList: readonly PickleTag[]): number[] {
    return tagsList.reduce<number[]>((acc, tagInfo) => {
      const ids = Array.from(tagInfo.name.matchAll(qaseIdRegExp))
        .map(([, id]) => Number(id))
        .filter((id): id is number => id !== undefined);

      acc.push(...ids);

      return acc;
    }, []);
  }

  /**
   * @type {Record<TestStepResultStatus, TestStatusEnum | null>}
   */
  static statusMap: Record<TestStepResultStatus, TestStatusEnum | null> = {
    [Status.PASSED]: TestStatusEnum.passed,
    [Status.FAILED]: TestStatusEnum.failed,
    [Status.SKIPPED]: TestStatusEnum.skipped,
    [Status.AMBIGUOUS]: TestStatusEnum.blocked,
    [Status.PENDING]: TestStatusEnum.blocked,
    [Status.UNDEFINED]: TestStatusEnum.blocked,
    [Status.UNKNOWN]: TestStatusEnum.blocked,
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
}
