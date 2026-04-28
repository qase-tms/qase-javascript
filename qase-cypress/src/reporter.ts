import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { spawnSync } from 'child_process';

import { MochaOptions, reporters, Runner, Suite, Test } from 'mocha';

import {
  Attachment,
  composeOptions,
  ConfigLoader,
  generateSignature,
  QaseReporter,
  ReporterInterface,
  StepRequestData,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  determineTestStatus,
  parseProjectMappingFromTitle,
  parseProjectMappingFromTags,
} from 'qase-javascript-commons';
import {
  removeQaseIdsFromTitle,
  getFile as getFileFromNode,
  normalizeSuitePart,
  FileSuiteNode,
} from 'qase-javascript-commons/internal';

/**
 * Adapter around the shared `getFile` helper to bridge the Mocha `Suite`
 * type (whose `parent` is `Suite | undefined`) with `FileSuiteNode`
 * (whose `parent` is optional under `exactOptionalPropertyTypes`).
 */
const getFile = (suite: Suite): string | undefined =>
  getFileFromNode(suite as unknown as FileSuiteNode);

import { configSchema } from './configSchema';
import { ReporterOptionsType } from './options';
import { MetadataManager } from './metadata/manager';
import { StepEnd, StepStart } from './metadata/models';
import { FileSearcher } from './fileSearcher';
import { extractTags } from './utils/tagParser';
import { ResultsManager } from './metadata/resultsManager';
import { TestTracker } from './test-tracker';
import { StepConverter } from './step-converter';

const {
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_SUITE_END
} = Runner.constants;

type CypressState = 'failed' | 'passed' | 'pending';

export type CypressQaseOptionsType = Omit<MochaOptions, 'reporterOptions'> & {
  reporterOptions: ReporterOptionsType;
};

/**
 * @class CypressQaseReporter
 * @extends reporters.Base
 */
export class CypressQaseReporter extends reporters.Base {
  /**
   * @type {RegExp}
   */
  /** @deprecated Use parseProjectMappingFromTitle from qase-javascript-commons for multi-project support. */
  static qaseIdRegExp = /\(Qase ID:? ([\d,]+)\)/;

  /**
   * @type {Record<CypressState, TestStatusEnum>}
   */
  static statusMap: Record<CypressState, TestStatusEnum> = {
    failed: TestStatusEnum.failed,
    passed: TestStatusEnum.passed,
    pending: TestStatusEnum.skipped,
  };

  /**
   * @type {string | undefined}
   * @private
   */
  private screenshotsFolder: string | undefined;

  // /**
  //  * @type {string | undefined}
  //  * @private
  //  */
  // private videosFolder: string | undefined;

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  private testBeginTime: number = Date.now();

  /**
   * Tracks processed tests to identify ones skipped when beforeEach fails.
   * @type {TestTracker}
   * @private
   */
  private tracker: TestTracker = new TestTracker();

  private stepConverter: StepConverter = new StepConverter();

  // private options: Omit<(FrameworkOptionsType<'cypress', ReporterOptionsType> & ConfigType & ReporterOptionsType & NonNullable<unknown>) | (null & ReporterOptionsType & NonNullable<unknown>), 'framework'>;

  /**
   * @param {Runner} runner
   * @param {CypressQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    runner: Runner,
    options: CypressQaseOptionsType,
    configLoader = new ConfigLoader(configSchema),
  ) {
    super(runner, options);

    const { reporterOptions } = options;
    const config = configLoader.load();
    const { framework, ...composedOptions } = composeOptions(reporterOptions, config);

    this.screenshotsFolder = framework?.cypress?.screenshotsFolder;
    // this.videosFolder = framework?.cypress?.videosFolder;
    // this.options = composedOptions;

    this.reporter = QaseReporter.getInstance({
      ...composedOptions,
      frameworkPackage: 'cypress',
      frameworkName: 'cypress',
      reporterName: 'cypress-qase-reporter',
    });

    this.addRunnerListeners(runner);
  }

  /**
   * @param {Runner} runner
   * @private
   */
  private addRunnerListeners(runner: Runner) {
    runner.on(EVENT_TEST_PASS, (test: Test) => {
      this.markTestAsProcessed(test);
      this.addTestResult(test);
    });
    runner.on(EVENT_TEST_PENDING, (test: Test) => {
      this.markTestAsProcessed(test);
      this.addTestResult(test);
    });
    runner.on(EVENT_TEST_FAIL, (test: Test) => {
      this.markTestAsProcessed(test);
      this.addTestResult(test);
    });
    runner.on(EVENT_TEST_BEGIN, () => {
      this.testBeginTime = Date.now();
      MetadataManager.clear();
    });
    runner.on(EVENT_SUITE_END, (suite: Suite) => {
      this.handleSkippedTestsInSuite(suite);
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    runner.once(EVENT_RUN_END, () => {
      const results = this.reporter.getResults();
      ResultsManager.setResults(results);
    });
  }

  /**
   * Mark a test as processed
   * @param {Test} test
   * @private
   */
  private markTestAsProcessed(test: Test): void {
    this.tracker.markProcessed(test);
  }

  /**
   * Check if a test was processed
   * @param {Test} test
   * @returns {boolean}
   * @private
   */
  private isTestProcessed(test: Test): boolean {
    return this.tracker.isProcessed(test);
  }

  /**
   * Handle skipped tests in a suite when beforeEach hook fails
   * @param {Suite} suite
   * @private
   */
  /**
   * Recursively collect all tests from a suite and its nested suites
   * @param {Suite} suite
   * @param {Test[]} tests
   * @private
   */
  private collectAllTestsFromSuite(suite: Suite, tests: Test[]): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suiteTests = suite.tests ?? [];
    tests.push(...suiteTests);

    // Recursively process nested suites
    const nestedSuites = suite.suites ?? [];
    for (const nestedSuite of nestedSuites) {
      this.collectAllTestsFromSuite(nestedSuite, tests);
    }
  }

  private handleSkippedTestsInSuite(suite: Suite): void {
    // Collect all tests from this suite and nested suites recursively
    const allTests: Test[] = [];
    this.collectAllTestsFromSuite(suite, allTests);

    // Find tests that were not processed (skipped due to beforeEach failure)
    for (const test of allTests) {     
      // Skip if test was already processed (e.g., first test that got EVENT_TEST_FAIL)
      if (!this.isTestProcessed(test)) {
        // Test was skipped due to beforeEach failure, report it as skipped
        this.addSkippedTestResult(test);
      }
    }
  }

  /**
     * Add a test result for a skipped test (due to beforeEach failure)
     * @param {Test} test
     * @private
     */
  private addSkippedTestResult(test: Test): void {
    const end_time = Date.now();
    const duration = 0; // Skipped tests have no duration

    const start_time = this.testBeginTime || Date.now();

    const fromTitle = parseProjectMappingFromTitle(test.title);
    const legacyIds = [...fromTitle.legacyIds];
    const projectMapping: Record<string, number[]> = { ...fromTitle.projectMapping };
    const testFileName = this.getTestFileName(test);
    const files = this.screenshotsFolder ?
      FileSearcher.findFilesBeforeTime(this.screenshotsFolder, testFileName, new Date(start_time))
      : [];

    const attachments = files.map((file) => ({
      content: '',
      id: uuidv4(),
      mime_type: 'image/png',
      size: 0,
      file_name: path.basename(file),
      file_path: file,
    } as Attachment));

    let relations = {};
    if (test.parent !== undefined) {
      const data = [];
      for (const suite of test.parent.titlePath()) {
        data.push({
          title: suite,
          public_id: null,
        });
      }

      relations = {
        suite: {
          data: data,
        },
      };
    }

    // For skipped tests, we don't have metadata since the test never ran
    // But we can still check for cucumber tags if the test has a parent with a file
    if (test.parent) {
      const file = getFile(test.parent);
      if (file) {
        const tags = extractTags(file, test.title);
        const fromTags = parseProjectMappingFromTags(tags);
        legacyIds.push(...fromTags.legacyIds);
        for (const [code, idsFromTag] of Object.entries(fromTags.projectMapping)) {
          projectMapping[code] = [...(projectMapping[code] ?? []), ...idsFromTag];
        }
      }
    }

    const hasProjectMapping = Object.keys(projectMapping).length > 0;
    const result: TestResultType = {
      attachments: attachments,
      author: null,
      fields: {},
      message: null,
      muted: false,
      params: {},
      group_params: {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(test, hasProjectMapping ? [] : legacyIds, {}),
      steps: [],
      id: uuidv4(),
      execution: {
        status: TestStatusEnum.skipped,
        start_time: this.testBeginTime / 1000,
        end_time: end_time / 1000,
        duration: duration,
        stacktrace: null,
        thread: null,
      },
      testops_id: !hasProjectMapping && legacyIds.length > 0
        ? (legacyIds.length === 1 ? legacyIds[0]! : legacyIds)
        : null,
      testops_project_mapping: hasProjectMapping ? projectMapping : null,
      title: fromTitle.cleanedTitle || removeQaseIdsFromTitle(test.title),
      preparedAttachments: [],
    } as unknown as TestResultType;

    void this.reporter.addTestResult(result);

    // Mark as processed to avoid duplicate reporting
    this.markTestAsProcessed(test);
  }

  /**
   * @param {Test} test
   * @private
   */
  private addTestResult(test: Test) {
    const end_time = Date.now();
    const duration = end_time - this.testBeginTime;

    const metadata = MetadataManager.getMetadata();

    if (metadata?.ignore) {
      // Mark as processed even if ignored to avoid duplicate reporting
      this.markTestAsProcessed(test);
      MetadataManager.clear();
      return;
    }

    const fromTitle = parseProjectMappingFromTitle(test.title);
    const legacyIds = [...fromTitle.legacyIds];
    const projectMapping: Record<string, number[]> = { ...fromTitle.projectMapping };

    const testFileName = this.getTestFileName(test);
    const files = this.screenshotsFolder ?
      FileSearcher.findFilesBeforeTime(this.screenshotsFolder, testFileName, new Date(this.testBeginTime))
      : [];

    // const videos = this.videosFolder ?
    //   FileSearcher.findVideoFiles(this.videosFolder, testFileName)
    //   : [];

    const attachments = files.map((file) => ({
      content: '',
      id: uuidv4(),
      mime_type: 'image/png',
      size: 0,
      file_name: path.basename(file),
      file_path: file,
    } as Attachment));

    // const videoAttachments = videos.map((file) => ({
    //   content: '',
    //   id: uuidv4(),
    //   mime_type: 'video/mp4',
    //   size: 0,
    //   file_name: path.basename(file),
    //   file_path: file,
    // } as Attachment));

    attachments.push(...(metadata?.attachments ?? []));

    let relations = {};
    if (test.parent !== undefined) {
      const data = [];
      for (const suite of test.parent.titlePath()) {
        data.push({
          title: suite,
          public_id: null,
        });
      }

      relations = {
        suite: {
          data: data,
        },
      };
    }

    if (metadata?.suite) {
      relations = {
        suite: {
          data: [
            {
              title: metadata.suite,
              public_id: null,
            },
          ],
        },
      };
    }

    let message = metadata?.comment ?? '';
    if (test.err?.message) {
      message += message ? `\n\n${test.err.message}` : test.err.message;
    }

    const steps = metadata?.steps ? this.getSteps(metadata.steps, metadata.stepAttachments ?? {}) : [];

    // support for cucumber steps and metadata
    if (metadata?.cucumberSteps && metadata.cucumberSteps.length > 0) {
      steps.push(...this.convertCypressMessages(metadata.cucumberSteps, test.state ?? 'failed'));

      if (test.parent) {
        const file = getFile(test.parent);

        if (file) {
          const tags = extractTags(file, test.title);
          const fromTags = parseProjectMappingFromTags(tags);
          legacyIds.push(...fromTags.legacyIds);
          for (const [code, idsFromTag] of Object.entries(fromTags.projectMapping)) {
            projectMapping[code] = [...(projectMapping[code] ?? []), ...idsFromTag];
          }
        }
      }
    }

    // Convert network profiler requests to REQUEST steps
    if (metadata?.networkRequests && metadata.networkRequests.length > 0) {
      for (const req of metadata.networkRequests) {
        const step = new TestStepType(StepType.REQUEST);
        step.id = uuidv4();
        const data = step.data as StepRequestData;
        data.request_method = req.method;
        data.request_url = req.url;
        data.request_headers = null;
        data.request_body = null;
        data.status_code = req.statusCode;
        data.response_body = req.responseBody;
        data.response_headers = null;
        step.execution.status = req.statusCode !== null && req.statusCode >= 400
          ? StepStatusEnum.failed
          : StepStatusEnum.passed;
        step.execution.start_time = req.startTime / 1000;
        step.execution.duration = req.duration;
        steps.push(step);
      }
    }

    const hasProjectMapping = Object.keys(projectMapping).length > 0;
    const result: TestResultType = {
      attachments: attachments,
      author: null,
      fields: metadata?.fields ?? {},
      tags: metadata?.tags ?? [],
      message: message,
      muted: false,
      params: metadata?.parameters ?? {},
      group_params: metadata?.groupParams ?? {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(test, hasProjectMapping ? [] : legacyIds, metadata?.parameters ?? {}),
      steps: steps,
      id: uuidv4(),
      execution: {
        status: determineTestStatus(test.err ?? null, test.state ?? 'failed'),
        start_time: this.testBeginTime / 1000,
        end_time: end_time / 1000,
        duration: duration,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: !hasProjectMapping && legacyIds.length > 0
        ? (legacyIds.length === 1 ? legacyIds[0]! : legacyIds)
        : null,
      testops_project_mapping: hasProjectMapping ? projectMapping : null,
      title: metadata?.title ?? (fromTitle.cleanedTitle || removeQaseIdsFromTitle(test.title)),
      preparedAttachments: [],
    } as unknown as TestResultType;

    void this.reporter.addTestResult(result);

    MetadataManager.clear();
  }

  /**
   * @param {Test} test
   * @param {number[]} ids
   * @private
   */
  private getSignature(test: Test, ids: number[], params: Record<string, string>) {
    const suites = [];
    const file = test.parent ? getFile(test.parent) : undefined;

    if (file) {
      suites.push(file.split(path.sep).join('::'));
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        suites.push(normalizeSuitePart(suite));
      }
    }

    suites.push(normalizeSuitePart(test.title));

    return generateSignature(ids, suites, params);
  }

  private getTestFileName(test: Test): string {
    if (!test.parent) {
      return '';
    }

    const file = getFile(test.parent);
    if (!file) {
      return '';
    }

    const pathParts = file.split(path.sep);
    const fileName = pathParts[pathParts.length - 1];

    return fileName ? fileName : '';
  }

  private convertCypressMessages(messages: StepStart[], testStatus: string): TestStepType[] {
    return this.stepConverter.convertCypressMessages(messages, testStatus);
  }

  private getSteps(steps: (StepStart | StepEnd)[], attachments: Record<string, Attachment[]>): TestStepType[] {
    return this.stepConverter.getSteps(steps, attachments);
  }
}
