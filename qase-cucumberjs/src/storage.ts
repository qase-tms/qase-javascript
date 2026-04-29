import {
  Attachment as Attach,
  GherkinDocument,
  Pickle,
  TestCaseFinished,
  TestCaseStarted,
  TestStepFinished,
} from '@cucumber/messages';
import {
  StepStatusEnum,
  TestResultType,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { STATUS_MAP, STEP_STATUS_MAP, TestStepResultStatus } from './modules/statusMaps';
import { TagParser } from './modules/tagParser';
import { EventStorage } from './modules/eventStorage';
import { StatusTracker } from './modules/statusTracker';
import { StepConverter } from './modules/stepConverter';
import { ProfilerTracker } from './modules/profilerTracker';
import { ResultBuilder } from './modules/resultBuilder';

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
    if (!tcs) return undefined;

    const tc = this.events.getTestCase(tcs.testCaseId);
    if (!tc) return undefined;

    const pickle = this.events.getPickle(tc.pickleId);
    if (!pickle) return undefined;

    const metadata = TagParser.parse(pickle.tags);
    if (metadata.isIgnore) return undefined;

    const error = this.statusTracker.getErrors(tcs.id);
    const status = this.statusTracker.getStatus(testCase.testCaseStartedId);

    const nodeId = pickle.astNodeIds[0];
    const scenario = nodeId !== undefined ? this.events.getScenario(nodeId) : undefined;

    // Extract parameters from gherkin examples
    let scenarioParameters: Record<string, string> = {};
    if (scenario) {
      for (const id of pickle.astNodeIds) {
        const params = scenario.parameters[id];
        if (params) {
          scenarioParameters = { ...scenarioParameters, ...params };
        }
      }
    }

    const steps = StepConverter.convert(
      pickle.steps,
      tc,
      this.events.getAllTestStepFinished(),
      (stepId) => this.events.getAttachments(stepId),
    );

    const profilerSteps = this.profilerTracker.getEvents(testCase.testCaseStartedId);
    this.profilerTracker.reset(testCase.testCaseStartedId);

    return ResultBuilder.build({
      testCaseFinished: testCase,
      testCaseStarted: tcs,
      testCase: tc,
      pickle,
      metadata,
      status,
      error,
      steps,
      profilerSteps,
      attachments: this.events.getAttachments(testCase.testCaseStartedId),
      scenarioName: scenario?.name,
      scenarioParameters,
    });
  }

  static statusMap: Record<TestStepResultStatus, TestStatusEnum> = STATUS_MAP;

  static stepStatusMap: Record<TestStepResultStatus, StepStatusEnum> = STEP_STATUS_MAP;

  public restore(): void {
    this.profilerTracker.restore();
  }

}


