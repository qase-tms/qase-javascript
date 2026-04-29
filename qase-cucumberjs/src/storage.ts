import {
  Attachment as Attach,
  GherkinDocument,
  Pickle,
  PickleStep,
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
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { v4 as uuidv4 } from 'uuid';
import { ScenarioData } from './models';
import { STATUS_MAP, STEP_STATUS_MAP, TestStepResultStatus } from './modules/statusMaps';
import { TagParser } from './modules/tagParser';

export class Storage {
  /**
   * @type {NetworkProfiler | null}
   * @private
   */
  private profiler: NetworkProfiler | null;

  /**
   * @type {Record<string, number>}
   * @private
   */
  private profilerStepSnapshots: Record<string, number> = {};

  constructor(profiler: NetworkProfiler | null = null) {
    this.profiler = profiler;
  }

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
    if (this.profiler) {
      this.profilerStepSnapshots[testCaseStarted.id] = this.profiler.getAllSteps().length;
    }
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

    const metadata = TagParser.parse(pickle.tags);

    if (metadata.isIgnore) {
      return undefined;
    }

    const error = this.getError(tcs.id);

    let relations: Relation | null = null;
    let params: Record<string, string> = {};
    const nodeId = pickle.astNodeIds[0];
    
    // If suite is specified in metadata, use it (split by tab for sub-suites)
    if (metadata.suite) {
      const suiteParts = metadata.suite.split('\t').filter(part => part.trim().length > 0);
      relations = {
        suite: {
          data: suiteParts.map((suite) => ({
            title: suite.trim(),
            public_id: null,
          })),
        },
      };
    } else if (nodeId != undefined && this.scenarios[nodeId] != undefined) {
      // Otherwise, use feature name as suite
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
    }

    // Extract parameters from Gherkin examples
    if (nodeId != undefined && this.scenarios[nodeId] != undefined) {
      for (const id of pickle.astNodeIds) {
        if (this.scenarios[nodeId]?.parameters[id] != undefined) {
          params = { ...params, ...this.scenarios[nodeId]?.parameters[id] };
        }
      }
    }

    // Merge parameters from tags with parameters from Gherkin examples
    // Parameters from tags take precedence over Gherkin examples
    params = { ...params, ...metadata.parameters };

    const steps = this.convertSteps(pickle.steps, tc);

    // Collect profiler steps since this test case started
    let profilerSteps: TestStepType[] = [];
    if (this.profiler) {
      const snapshot = this.profilerStepSnapshots[testCase.testCaseStartedId] ?? 0;
      const allSteps = this.profiler.getAllSteps();
      profilerSteps = allSteps.slice(snapshot);
      delete this.profilerStepSnapshots[testCase.testCaseStartedId];
    }

    const hasProjectMapping = Object.keys(metadata.projectMapping).length > 0;
    const result = {
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
      group_params: metadata.group_params,
      relations: relations,
      run_id: null,
      signature: this.getSignature(pickle, metadata.ids, params),
      steps: [...steps, ...profilerSteps],
      testops_id: metadata.ids.length > 0 ? metadata.ids : null,
      testops_project_mapping: hasProjectMapping ? metadata.projectMapping : null,
      id: tcs.id,
      title: metadata.title ?? pickle.name,
      tags: metadata.tags,
    } as unknown as TestResultType;
    return result;
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

  static statusMap: Record<TestStepResultStatus, TestStatusEnum> = STATUS_MAP;

  static stepStatusMap: Record<TestStepResultStatus, StepStatusEnum> = STEP_STATUS_MAP;

  /**
   * @param {Pickle} pickle
   * @param {number[]} ids
   * @param {Record<string, string>} parameters
   * @private
   */
  private getSignature(pickle: Pickle, ids: number[], parameters: Record<string, string> = {}): string {
    return generateSignature(ids, [...pickle.uri.split('/'), pickle.name], parameters);
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
