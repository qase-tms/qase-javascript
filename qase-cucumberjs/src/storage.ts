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
const newQaseIdRegExp = /^@[Qq]ase[Ii][Dd]=(\d+)$/g;
const qaseTitleRegExp = /^@[Qq]ase[Tt]itle=(.+)$/g;
const qaseFieldsRegExp = /^@[Qq]ase[Ff]ields:(.+?)=(.+)$/g;

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
    const oldStatus = this.testCaseStartedResult[testCaseStep.testCaseStartedId];
    const newStatus = Storage.statusMap[testCaseStep.testStepResult.status];

    this.testCaseSteps[testCaseStep.testStepId] = testCaseStep;

    if (newStatus !== TestStatusEnum.passed) {
      if (testCaseStep.testStepResult.message) {

        if (!this.testCaseStartedErrors[testCaseStep.testCaseStartedId]) {
          this.testCaseStartedErrors[testCaseStep.testCaseStartedId] = [];
        }

        this.testCaseStartedErrors[testCaseStep.testCaseStartedId]?.push(testCaseStep.testStepResult.message);
      }

      if (oldStatus) {
        if (oldStatus !== TestStatusEnum.failed) {
          this.testCaseStartedResult[testCaseStep.testCaseStartedId] = newStatus;
        }
      } else {
        this.testCaseStartedResult[testCaseStep.testCaseStartedId] = newStatus;
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

    const metadata = this.parseTags(pickle.tags);

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
      fields: metadata.fields,
      message: null,
      muted: false,
      params: {},
      group_params: {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(pickle, metadata.ids),
      steps: this.convertSteps(pickle.steps, tc),
      testops_id: metadata.ids.length > 0 ? metadata.ids : null,
      id: tcs.id,
      title: metadata.title ?? pickle.name,
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
   * @type {Record<TestStepResultStatus, TestStatusEnum>}
   */
  static statusMap: Record<TestStepResultStatus, TestStatusEnum> = {
    [Status.PASSED]: TestStatusEnum.passed,
    [Status.FAILED]: TestStatusEnum.failed,
    [Status.SKIPPED]: TestStatusEnum.skipped,
    [Status.AMBIGUOUS]: TestStatusEnum.failed,
    [Status.PENDING]: TestStatusEnum.skipped,
    [Status.UNDEFINED]: TestStatusEnum.skipped,
    [Status.UNKNOWN]: TestStatusEnum.skipped,
  };

  /**
   * @type {Record<TestStepResultStatus, StepStatusEnum>}
   */
  static stepStatusMap: Record<TestStepResultStatus, StepStatusEnum> = {
    [Status.PASSED]: StepStatusEnum.passed,
    [Status.FAILED]: StepStatusEnum.failed,
    [Status.SKIPPED]: StepStatusEnum.skipped,
    [Status.AMBIGUOUS]: StepStatusEnum.failed,
    [Status.PENDING]: StepStatusEnum.skipped,
    [Status.UNDEFINED]: StepStatusEnum.skipped,
    [Status.UNKNOWN]: StepStatusEnum.skipped,
  };

  private parseTags(tags: readonly PickleTag[]): TestMetadata {
    const metadata: TestMetadata = {
      ids: [],
      fields: {},
      title: null,
    };

    for (const tag of tags) {
      if (qaseIdRegExp.test(tag.name)) {
        metadata.ids.push(Number(tag.name.replace(/^@[Qq]-?/, '')));
        continue;
      }

      if (newQaseIdRegExp.test(tag.name)) {
        metadata.ids.push(Number(tag.name.replace(/^@[Qq]ase[Ii][Dd]=/, '')));
        continue;
      }

      if (qaseTitleRegExp.test(tag.name)) {
        metadata.title = tag.name.replace(/^@[Qq]ase[Tt]itle=/, '');
        continue;
      }

      if (qaseFieldsRegExp.test(tag.name)) {
        const value = tag.name.replace(/^@[Qq]ase[Ff]ields:/, '');
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const record: Record<string, string> = JSON.parse(value);
          metadata.fields = { ...metadata.fields, ...record };
        } catch (e) {
          // do nothing
        }
      }
    }

    return metadata;
  }

  /**
   * @param {Pickle} pickle
   * @param {number[]} ids
   * @private
   */
  private getSignature(pickle: Pickle, ids: number[]): string {
    let signature = pickle.uri.split('/').join('::')
      + '::'
      + pickle.name.toLowerCase().replace(/\s/g, '_');

    if (ids.length > 0) {
      signature += '::' + ids.join('::');
    }

    return signature;
  }
}
