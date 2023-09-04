import path from 'path';

import { MochaOptions, reporters, Runner, Test } from 'mocha';

import {
  ConfigLoader,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  composeOptions,
} from 'qase-javascript-commons';

import { traverseDir } from './utils/traverse-dir';
import { configSchema } from './configSchema'
import { ReporterOptionsType } from './options';

const {
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING,
  EVENT_RUN_END,
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
    pending: TestStatusEnum.blocked,
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
   * @param {number[]} ids
   * @param {string} dir
   * @returns {string[]}
   * @private
   */
  private static findAttachments(ids: number[], dir: string) {
    const idSet = new Set(ids);
    const attachments: string[] = [];

    try {
      traverseDir(path.join(process.cwd(), dir), (filePath) => {
        if (
          CypressQaseReporter.getCaseId(filePath).some((item) =>
            idSet.has(item),
          )
        ) {
          attachments.push(filePath);
        }
      });
    } catch (error) {/* ignore */}

    return attachments;
  }

  /**
   * @type {string | undefined}
   * @private
   */
  private screenshotsFolder: string | undefined;

  /**
   * @type {ReporterInterface}
   * @private
   */
  private reporter: ReporterInterface;

  /**
   * @param {Runner} runner
   * @param {CypressQaseOptionsType} options
   * @param {ConfigLoaderInterface} configLoader
   */
  public constructor(
    runner: Runner,
    options: CypressQaseOptionsType,
    configLoader = new ConfigLoader(configSchema)
  ) {
    super(runner, options);

    const { reporterOptions } = options;
    const config = configLoader.load();
    const { framework, ...composedOptions } = composeOptions(reporterOptions, config)

    this.screenshotsFolder = framework?.cypress?.screenshotsFolder;

    this.reporter = new QaseReporter({
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
    runner.on(EVENT_TEST_PASS, (test: Test) => this.addTestResult(test));
    runner.on(EVENT_TEST_PENDING, (test: Test) => this.addTestResult(test));
    runner.on(EVENT_TEST_FAIL, (test: Test) => this.addTestResult(test));

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    runner.once(EVENT_RUN_END, async () => {
      this.preventExit();
      await this.reporter.publish();

      if (process.exitCode !== undefined) {
        process.exit(process.exitCode);
      }
    });
  }

  /**
   * @param {Test} test
   * @private
   */
  private addTestResult(test: Test) {
    const ids = CypressQaseReporter.getCaseId(test.title);

    const attachments = this.screenshotsFolder
      ? CypressQaseReporter.findAttachments(ids, this.screenshotsFolder)
      : undefined;

    const result = {
      id: test.id,
      testOpsId: ids,
      title: test.title,
      suiteTitle: test.parent?.titlePath(),
      status: test.state
        ? CypressQaseReporter.statusMap[test.state]
        : TestStatusEnum.invalid,
      duration: test.duration ?? 0,
      error: test.err,
      attachments,
    };

    this.reporter.addTestResult(result);
  }

  /**
   * @private
   */
  private preventExit() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const _exit = process.exit;

    const mutableProcess: Record<'exit', (code: number) => void> = process;

    mutableProcess.exit = (code: number) => {
      process.exitCode = code || 0;
      process.exit = _exit;
    };
  }
}
