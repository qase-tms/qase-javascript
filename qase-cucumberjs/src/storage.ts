import {
  Attachment as Attach,
  GherkinDocument,
  Pickle,
  TestCaseFinished,
  TestCaseStarted,
  TestStepFinished,
} from '@cucumber/messages';
import {
  generateSignature,
  Relation,
  StepStatusEnum,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { STATUS_MAP, STEP_STATUS_MAP, TestStepResultStatus } from './modules/statusMaps';
import { TagParser } from './modules/tagParser';
import { EventStorage } from './modules/eventStorage';
import { StatusTracker } from './modules/statusTracker';
import { StepConverter } from './modules/stepConverter';
import { ProfilerTracker } from './modules/profilerTracker';

export class Storage {
  /**
   * @type {ProfilerTracker}
   * @private
   */
  private profilerTracker: ProfilerTracker;

  constructor(profiler: NetworkProfiler | null = null) {
    this.profilerTracker = new ProfilerTracker(profiler);
  }

  /**
   * @type {EventStorage}
   * @private
   */
  private events: EventStorage = new EventStorage();

  /**
   * @type {StatusTracker}
   * @private
   */
  private statusTracker: StatusTracker = new StatusTracker();

  /**
   * Add pickle to storage
   * @param {Pickle} pickle
   */
  public addPickle(pickle: Pickle): void {
    this.events.addPickle(pickle);
  }

  /**
   * Add scenario to storage
   * @param {GherkinDocument} document
   */
  public addScenario(document: GherkinDocument): void {
    this.events.addScenario(document);
  }

  /**
   * Add attachment to storage
   * @param {Attach} attachment
   */
  public addAttachment(attachment: Attach): void {
    this.events.addAttachment(attachment);
  }

  /**
   * Add test case to storage
   * @param {TestCase} testCase
   */
  public addTestCase(testCase: TestCase): void {
    this.events.addTestCase(testCase);
  }

  /**
   * Get all test cases
   * @param {TestCaseStarted} testCaseStarted
   */
  public addTestCaseStarted(testCaseStarted: TestCaseStarted): void {
    this.events.addTestCaseStarted(testCaseStarted);
    this.statusTracker.onTestStarted(testCaseStarted.id);
    this.profilerTracker.onTestStart(testCaseStarted.id);
  }

  /**
   * Add test case step to storage
   * @param {TestStepFinished} testCaseStep
   */
  public addTestCaseStep(testCaseStep: TestStepFinished): void {
    this.events.addTestStepFinished(testCaseStep);
    this.statusTracker.applyStep(testCaseStep);
  }

  /**
   * Convert test case to test result
   * @param {TestCaseFinished} testCase
   * @returns {undefined | TestResultType}
   */
  public convertTestCase(testCase: TestCaseFinished): undefined | TestResultType {
    const tcs = this.events.getTestCaseStarted(testCase.testCaseStartedId);

    if (!tcs) {
      return undefined;
    }

    const tc = this.events.getTestCase(tcs.testCaseId);

    if (!tc) {
      return undefined;
    }

    const pickle = this.events.getPickle(tc.pickleId);

    if (!pickle) {
      return undefined;
    }

    const metadata = TagParser.parse(pickle.tags);

    if (metadata.isIgnore) {
      return undefined;
    }

    const error = this.statusTracker.getErrors(tcs.id);

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
    } else if (nodeId != undefined && this.events.getScenario(nodeId) != undefined) {
      // Otherwise, use feature name as suite
      relations = {
        suite: {
          data: [
            {
              title: this.events.getScenario(nodeId)?.name ?? '',
              public_id: null,
            },
          ],
        },
      };
    }

    // Extract parameters from Gherkin examples
    if (nodeId != undefined && this.events.getScenario(nodeId) != undefined) {
      for (const id of pickle.astNodeIds) {
        if (this.events.getScenario(nodeId)?.parameters[id] != undefined) {
          params = { ...params, ...this.events.getScenario(nodeId)?.parameters[id] };
        }
      }
    }

    // Merge parameters from tags with parameters from Gherkin examples
    // Parameters from tags take precedence over Gherkin examples
    params = { ...params, ...metadata.parameters };

    const steps = StepConverter.convert(
      pickle.steps,
      tc,
      this.events.getAllTestStepFinished(),
      (stepId) => this.events.getAttachments(stepId),
    );

    // Collect profiler steps since this test case started
    const profilerSteps: TestStepType[] = this.profilerTracker.getEvents(testCase.testCaseStartedId);
    this.profilerTracker.reset(testCase.testCaseStartedId);

    const hasProjectMapping = Object.keys(metadata.projectMapping).length > 0;
    const result = {
      attachments: this.events.getAttachments(testCase.testCaseStartedId),
      author: null,
      execution: {
        status: this.statusTracker.getStatus(testCase.testCaseStartedId),
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

  public restore(): void {
    this.profilerTracker.restore();
  }

}


