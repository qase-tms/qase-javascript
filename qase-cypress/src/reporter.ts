import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { spawnSync } from 'child_process';

import { MochaOptions, reporters, Runner, Suite, Test } from 'mocha';

import {
  Attachment,
  composeOptions,
  ConfigLoader,
  // ConfigType,
  // FrameworkOptionsType,
  generateSignature,
  QaseReporter,
  ReporterInterface,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  determineTestStatus,
} from 'qase-javascript-commons';

import { configSchema } from './configSchema';
import { ReporterOptionsType } from './options';
import { MetadataManager } from './metadata/manager';
import { StepEnd, StepStart } from './metadata/models';
import { FileSearcher } from './fileSearcher';
import { extractTags } from './utils/tagParser';
import { ResultsManager } from './metadata/resultsManager';

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
   * @param {string} title
   * @returns {number[]}
   * @private
   */
  private static getCaseId(title: string) {
    const [, ids] = title.match(CypressQaseReporter.qaseIdRegExp) ?? [];

    return ids ? ids.split(',').map((id) => Number(id)) : [];
  }

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
   * Set to track processed tests to identify skipped tests when beforeEach fails
   * @type {Set<string>}
   * @private
   */
  private processedTests: Set<string> = new Set();

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
      this.processedTests.clear();
    });
  }

  /**
   * Generate a unique identifier for a test
   * @param {Test} test
   * @returns {string}
   * @private
   */
  private getTestIdentifier(test: Test): string {
    const file = test.parent ? this.getFile(test.parent) ?? '' : '';
    const suitePath = test.parent ? test.parent.titlePath().join(' > ') : '';
    let testTitle = test.fullTitle();
    // Remove "before each" hook prefix and quotes if present (can be anywhere in the string)
    testTitle = testTitle.replace(/"before each" hook for "/g, '');
    // Remove trailing quote if present
    if (testTitle.endsWith('"')) {
      testTitle = testTitle.slice(0, -1);
    }
    return `${file}::${suitePath}::${testTitle}`;
  }

  /**
   * Mark a test as processed
   * @param {Test} test
   * @private
   */
  private markTestAsProcessed(test: Test): void {
    const identifier = this.getTestIdentifier(test);
    this.processedTests.add(identifier);
  }

  /**
   * Check if a test was processed
   * @param {Test} test
   * @returns {boolean}
   * @private
   */
  private isTestProcessed(test: Test): boolean {
    const identifier = this.getTestIdentifier(test);
    return this.processedTests.has(identifier);
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

    const ids = CypressQaseReporter.getCaseId(test.title);

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
      const file = this.getFile(test.parent);
      if (file) {
        const tags = extractTags(file, test.title);
        ids.push(...this.extractQaseIds(tags));
      }
    }

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
      signature: this.getSignature(test, ids, {}),
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
      testops_id: ids.length > 0 ? ids : null,
      title: this.removeQaseIdsFromTitle(test.title),
      preparedAttachments: [],
    };

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

    const ids = CypressQaseReporter.getCaseId(test.title);

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
        const file = this.getFile(test.parent);

        if (file) {
          const tags = extractTags(file, test.title);
          ids.push(...this.extractQaseIds(tags));
        }
      }
    }

    const result: TestResultType = {
      attachments: attachments,
      author: null,
      fields: metadata?.fields ?? {},
      message: message,
      muted: false,
      params: metadata?.parameters ?? {},
      group_params: metadata?.groupParams ?? {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(test, ids, metadata?.parameters ?? {}),
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
      testops_id: ids.length > 0 ? ids : null,
      title: metadata?.title ?? this.removeQaseIdsFromTitle(test.title),
      preparedAttachments: [],
    };

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
    const file = test.parent ? this.getFile(test.parent) : undefined;

    if (file) {
      suites.push(file.split(path.sep).join('::'));
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        suites.push(suite.toLowerCase().replace(/\s/g, '_'));
      }
    }

    suites.push(test.title.toLowerCase().replace(/\s/g, '_'));

    return generateSignature(ids, suites, params);
  }

  private getTestFileName(test: Test): string {
    if (!test.parent) {
      return '';
    }

    const file = this.getFile(test.parent);
    if (!file) {
      return '';
    }

    const pathParts = file.split(path.sep);
    const fileName = pathParts[pathParts.length - 1];

    return fileName ? fileName : '';
  }

  /**
   * @param {Suite} suite
   * @private
   */
  private getFile(suite: Suite): string | undefined {
    if (suite.file) {
      return suite.file;
    }

    if (suite.parent) {
      return this.getFile(suite.parent);
    }

    return undefined;
  }

  /**
   * @param {string} title
   * @returns {string}
   * @private
   */
  private removeQaseIdsFromTitle(title: string): string {
    const matches = title.match(/\(Qase ID: ([0-9,]+)\)$/i);
    if (matches) {
      return title.replace(matches[0], '').trimEnd();
    }
    return title;
  }

  /**
   * Extracts numbers from @qaseid tags, regardless of case.
   * @param tags - An array of tags to process.
   * @returns An array of numbers extracted from the tags.
   */
  private extractQaseIds(tags: string[]): number[] {
    const qaseIdRegex = /@qaseid\((\d+(?:,\d+)*)\)/i;
    const qaseIds: number[] = [];

    for (const tag of tags) {
      const match = qaseIdRegex.exec(tag);
      if (match) {
        const ids = match[1]?.split(',').map(id => parseInt(id, 10));
        if (ids) {
          qaseIds.push(...ids);
        }
      }
    }

    return qaseIds;
  }

  private convertCypressMessages(messages: StepStart[], testStatus: string): TestStepType[] {
    const result: TestStepType[] = [];

    const lastIndex = messages.length - 1;
    for (const message of messages) {
      const step = new TestStepType(StepType.TEXT);
      step.id = message.id;
      step.execution.status = StepStatusEnum.passed;
      step.execution.start_time = message.timestamp;
      step.data = {
        action: message.name,
        expected_result: null,
        data: null,
      };

      if (lastIndex === messages.indexOf(message) && testStatus !== 'passed') {
        step.execution.status = StepStatusEnum.failed;
      }

      result.push(step);
    }

    return result;
  }

  private getSteps(steps: (StepStart | StepEnd)[], attachments: Record<string, Attachment[]>): TestStepType[] {
    const result: TestStepType[] = [];
    const stepMap = new Map<string, TestStepType>();

    for (const step of steps.sort((a, b) => a.timestamp - b.timestamp)) {
      if (!('status' in step)) {
        const newStep = new TestStepType();
        newStep.id = step.id;
        newStep.execution.status = StepStatusEnum.failed;
        newStep.execution.start_time = step.timestamp;
        newStep.execution.end_time = Date.now();
        newStep.data = {
          action: step.name,
          expected_result: null,
          data: null,
        };

        if (attachments[step.id]) {
          newStep.attachments = attachments[step.id] ?? [];
        }

        const parentId = step.parentId;
        if (parentId) {
          newStep.parent_id = parentId;
          const parent = stepMap.get(parentId);
          if (parent) {
            parent.steps.push(newStep);
          }
        } else {
          result.push(newStep);
        }

        stepMap.set(step.id, newStep);
      } else {
        const stepType = stepMap.get(step.id);
        if (stepType) {
          stepType.execution.status = step.status as StepStatusEnum;
          stepType.execution.end_time = step.timestamp;
        }
      }
    }

    return result;
  }
}
