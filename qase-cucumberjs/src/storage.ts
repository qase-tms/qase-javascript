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
  CompoundError,
  generateSignature,
  Relation,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  determineTestStatus,
} from 'qase-javascript-commons';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { Status } from '@cucumber/cucumber';
import { v4 as uuidv4 } from 'uuid';
import { ScenarioData, TestMetadata } from './models';

type TestStepResultStatus = (typeof Status)[keyof typeof Status];

const qaseIdRegExp = /^@[Qq]-?(\d+)$/;
const newQaseIdRegExp = /^@[Qq]ase[Ii][Dd]=(\d+(?:,\s*\d+)*)$/;
const qaseTitleRegExp = /^@[Qq]ase[Tt]itle=(.+)$/;
const qaseFieldsRegExp = /^@[Qq]ase[Ff]ields=(.+)$/;
const qaseIgnoreRegExp = /^@[Qq]ase[Ii][Gg][Nn][Oo][Rr][Ee]$/;

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
  private scenarios: Record<string, ScenarioData> = {};

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
          const parameters: Record<string, Record<string, string>> = {};
          
          scenario.examples?.forEach((example) => {
            if (example.tableHeader && example.tableBody) {
              const columnNames = example.tableHeader.cells.map(cell => cell.value);
              
              example.tableBody.forEach((row) => {
                const rowParams: Record<string, string> = {};
                
                row.cells.forEach((cell, index) => {
                  const columnName = columnNames[index];
                  if (columnName) {
                    rowParams[columnName] = cell.value;
                  }
                });
                
                parameters[row.id] = rowParams;
              });
            }
          });

          this.scenarios[scenario.id] = {
            name: name,
            parameters: parameters,
          };
        }
      });
    }
  }

  /**
   * Add attachment to storage
   * @param {Attach} attachment
   */
  public addAttachment(attachment: Attach): void {
    if (attachment.testStepId) {
      if (!this.attachments[attachment.testStepId]) {
        this.attachments[attachment.testStepId] = [];
      }

      this.attachments[attachment.testStepId]?.push({
        file_name: this.getFileNameFromMediaType(attachment.mediaType),
        mime_type: attachment.mediaType,
        file_path: null,
        content: attachment.body,
        size: 0,
        id: uuidv4(),
      });
    }

    if (attachment.testCaseStartedId) {
      if (!this.attachments[attachment.testCaseStartedId]) {
        this.attachments[attachment.testCaseStartedId] = [];
      }

      this.attachments[attachment.testCaseStartedId]?.push({
        file_name: this.getFileNameFromMediaType(attachment.mediaType),
        mime_type: attachment.mediaType,
        file_path: null,
        content: attachment.body,
        size: 0,
        id: uuidv4(),
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
    
    // Create error object for status determination
    let error: Error | null = null;
    if (testCaseStep.testStepResult.message) {
      error = new Error(testCaseStep.testStepResult.message);
    }
    
    // Determine status based on error type
    const newStatus = determineTestStatus(error, Storage.statusMap[testCaseStep.testStepResult.status]);

    this.testCaseSteps[testCaseStep.testStepId] = testCaseStep;

    if (newStatus !== TestStatusEnum.passed) {
      if (testCaseStep.testStepResult.message) {

        if (!this.testCaseStartedErrors[testCaseStep.testCaseStartedId]) {
          this.testCaseStartedErrors[testCaseStep.testCaseStartedId] = [];
        }

        this.testCaseStartedErrors[testCaseStep.testCaseStartedId]?.push(testCaseStep.testStepResult.message);
      }

      if (oldStatus) {
        if (oldStatus !== TestStatusEnum.failed && oldStatus !== TestStatusEnum.invalid) {
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

    const metadata = this.parseTags(pickle.tags);

    if (metadata.isIgnore) {
      return undefined;
    }

    const error = this.getError(tcs.id);

    let relations: Relation | null = null;
    let params: Record<string, string> = {};
    const nodeId = pickle.astNodeIds[0];
    if (nodeId != undefined && this.scenarios[nodeId] != undefined) {
      relations = {
        suite: {
          data: [
            {
              title: this.scenarios[nodeId]?.name ?? '',
              public_id: null,
            },
          ],
        },
      };

      for (const id of pickle.astNodeIds) {
        if (this.scenarios[nodeId]?.parameters[id] != undefined) {
          params = { ...params, ...this.scenarios[nodeId]?.parameters[id] };
        }
      }
    }

    const steps = this.convertSteps(pickle.steps, tc);

    return {
      attachments: this.attachments[testCase.testCaseStartedId] ?? [],
      author: null,
      execution: {
        status: this.testCaseStartedResult[testCase.testCaseStartedId] ?? TestStatusEnum.passed,
        start_time: tcs.timestamp.seconds,
        end_time: testCase.timestamp.seconds,
        duration: Math.abs(testCase.timestamp.seconds - tcs.timestamp.seconds) * 1000,
        stacktrace: error?.stacktrace ?? null,
        thread: null,
      },
      fields: metadata.fields,
      message: error?.message ?? null,
      muted: false,
      params: params,
      group_params: {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(pickle, metadata.ids),
      steps: steps,
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
            duration: finished.testStepResult.duration.seconds * 1000,
          },
          attachments: this.attachments[s.id] ?? [],
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
    [Status.AMBIGUOUS]: TestStatusEnum.invalid,
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
      isIgnore: false,
    };

    for (const tag of tags) {
      if (qaseIdRegExp.test(tag.name)) {
        metadata.ids.push(Number(tag.name.replace(/^@[Qq]-?/, '')));
        continue;
      }

      if (newQaseIdRegExp.test(tag.name)) {
        metadata.ids.push(...(tag.name.replace(/^@[Qq]ase[Ii][Dd]=/, '')).split(',').map(Number));
        continue;
      }

      if (qaseTitleRegExp.test(tag.name)) {
        metadata.title = tag.name.replace(/^@[Qq]ase[Tt]itle=/, '');
        continue;
      }

      if (qaseFieldsRegExp.test(tag.name)) {
        const value = tag.name.replace(/^@[Qq]ase[Ff]ields=/, '');
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const record: Record<string, string> = JSON.parse(value);
          metadata.fields = { ...metadata.fields, ...record };
        } catch (e) {
          // do nothing
        }
      }

      if (qaseIgnoreRegExp.test(tag.name)) {
        metadata.isIgnore = true;
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
    return generateSignature(ids, [...pickle.uri.split('/'), pickle.name], {});
  }

  private getError(testCaseId: string): CompoundError | undefined {
    const testErrors = this.testCaseStartedErrors[testCaseId];

    if (!testErrors) {
      return undefined;
    }

    const error = new CompoundError();
    testErrors.forEach((message) => {
      error.addMessage(message);
      error.addStacktrace(message);
    });

    return error;
  }

  private getFileNameFromMediaType(mediaType: string): string {
    const extensions: Record<string, string> = {
      'text/plain': 'txt',
      'application/json': 'json',
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/gif': 'gif',
      'text/html': 'html',
      'application/pdf': 'pdf',
      'application/xml': 'xml',
      'application/zip': 'zip',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };

    const extension = extensions[mediaType];

    if (extension) {
      return `file.${extension}`;
    } else {
      return 'file';
    }
  }
}
