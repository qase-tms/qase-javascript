import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { spawnSync } from 'child_process';

import { MochaOptions, reporters, Runner, Suite, Test } from 'mocha';

import {
  ConfigLoader,
  QaseReporter,
  ReporterInterface,
  TestStatusEnum,
  composeOptions,
  TestResultType,
  Attachment,
  FrameworkOptionsType,
  ConfigType,
  TestStepType,
  StepStatusEnum,
} from 'qase-javascript-commons';

import { traverseDir } from './utils/traverse-dir';
import { configSchema } from './configSchema';
import { ReporterOptionsType } from './options';
import { MetadataManager } from './metadata/manager';
import { StepEnd, StepStart } from './metadata/models';

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
   * @param {number[]} ids
   * @param {string} dir
   * @returns {Attachment[]}
   * @private
   */
  private static findAttachments(ids: number[], dir: string): Attachment[] {
    const idSet = new Set(ids);
    const attachments: Attachment[] = [];

    try {
      traverseDir(path.join(process.cwd(), dir), (filePath) => {
        if (
          CypressQaseReporter.getCaseId(filePath).some((item) =>
            idSet.has(item),
          )
        ) {
          attachments.push({
            content: '',
            id: uuidv4(),
            mime_type: '', size: 0,
            file_name: path.basename(filePath),
            file_path: filePath,
          });
        }
      });
    } catch (error) {/* ignore */
    }

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

  private options: Omit<(FrameworkOptionsType<'cypress', ReporterOptionsType> & ConfigType & ReporterOptionsType & NonNullable<unknown>) | (null & ReporterOptionsType & NonNullable<unknown>), 'framework'>;

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
    this.options = composedOptions;

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
    runner.on(EVENT_TEST_PASS, (test: Test) => this.addTestResult(test));
    runner.on(EVENT_TEST_PENDING, (test: Test) => this.addTestResult(test));
    runner.on(EVENT_TEST_FAIL, (test: Test) => this.addTestResult(test));

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    runner.once(EVENT_RUN_END, () => {
      const results = this.reporter.getResults();

      spawnSync('node', [`${__dirname}/child.js`], {
        stdio: 'inherit',
        env: Object.assign(process.env, {
          reporterConfig: JSON.stringify(this.options),
          results: JSON.stringify(results),
        }),
      });
    });
  }

  /**
   * @param {Test} test
   * @private
   */
  private addTestResult(test: Test) {
    const metadata = MetadataManager.getMetadata();

    if (metadata?.ignore) {
      MetadataManager.clear();
      return;
    }

    const ids = CypressQaseReporter.getCaseId(test.title);

    const attachments = this.screenshotsFolder
      ? CypressQaseReporter.findAttachments(ids, this.screenshotsFolder)
      : undefined;

    attachments?.push(...(metadata?.attachments ?? []));

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

    let message: string | null = null;
    if (metadata?.comment) {
      message = metadata.comment;
    }
    if (test.err?.message) {
      if (message) {
        message += '\n\n';
      }
      message += test.err.message;
    }

    const result: TestResultType = {
      attachments: attachments ?? [],
      author: null,
      fields: metadata?.fields ?? {},
      message: message,
      muted: false,
      params: metadata?.parameters ?? {},
      group_params: metadata?.groupParams ?? {},
      relations: relations,
      run_id: null,
      signature: this.getSignature(test, ids),
      steps: metadata?.steps ? this.getSteps(metadata.steps, metadata.stepAttachments ?? {}) : [],
      id: uuidv4(),
      execution: {
        status: test.state
          ? CypressQaseReporter.statusMap[test.state]
          : TestStatusEnum.invalid,
        start_time: null,
        end_time: null,
        duration: test.duration ?? 0,
        stacktrace: test.err?.stack ?? null,
        thread: null,
      },
      testops_id: ids.length > 0 ? ids : null,
      title: metadata?.title ?? this.removeQaseIdsFromTitle(test.title),
    };

    void this.reporter.addTestResult(result);

    MetadataManager.clear();
  }

  /**
   * @param {Test} test
   * @param {number[]} ids
   * @private
   */
  private getSignature(test: Test, ids: number[]) {
    let signature = '';
    const file = test.parent ? this.getFile(test.parent) : undefined;

    if (file) {
      signature = file.split('/').join('::');
    }

    if (test.parent) {
      for (const suite of test.parent.titlePath()) {
        signature += '::' + suite.toLowerCase().replace(/\s/g, '_');
      }
    }

    signature += '::' + test.title.toLowerCase().replace(/\s/g, '_');

    if (ids.length > 0) {
      signature += '::' + ids.join('::');
    }

    return signature;
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
