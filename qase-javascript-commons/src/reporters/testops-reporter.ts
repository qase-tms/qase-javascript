import { createReadStream } from 'fs';

import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import {
  QaseApiInterface,
  ResultCreate,
  ResultCreateStatusEnum,
  RunCreate,
  TestStepResultCreate,
  TestStepResultCreateStatusEnum,
} from 'qaseio';

import {
  AbstractReporter,
  LoggerInterface,
  ReporterOptionsType,
} from './abstract-reporter';

import {
  StepStatusEnum,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from '../models';

import { QaseError } from '../utils/qase-error';

export type TestOpsRunType = {
  id?: number | undefined;
  title: string;
  description: string;
  complete?: boolean | undefined;
  environment?: number | undefined;
};

export type TestOpsOptionsType = {
  projectCode: string;
  baseUrl?: string | undefined;
  uploadAttachments?: boolean | undefined;
  run: TestOpsRunType;
};

/**
 * @class TestOpsReporter
 * @extends AbstractReporter
 */
export class TestOpsReporter extends AbstractReporter {
  /**
   * @type {Record<TestStatusEnum, ResultCreateStatusEnum>}
   */
  static statusMap: Record<TestStatusEnum, ResultCreateStatusEnum> = {
    [TestStatusEnum.passed]: ResultCreateStatusEnum.PASSED,
    [TestStatusEnum.failed]: ResultCreateStatusEnum.FAILED,
    [TestStatusEnum.skipped]: ResultCreateStatusEnum.SKIPPED,
    [TestStatusEnum.disabled]: ResultCreateStatusEnum.SKIPPED,
    [TestStatusEnum.blocked]: ResultCreateStatusEnum.BLOCKED,
    [TestStatusEnum.invalid]: ResultCreateStatusEnum.INVALID,
  };

  /**
   * @type {Record<StepStatusEnum, TestStepResultCreateStatusEnum>}
   */
  static stepStatusMap: Record<StepStatusEnum, TestStepResultCreateStatusEnum> = {
    [StepStatusEnum.passed]: TestStepResultCreateStatusEnum.PASSED,
    [StepStatusEnum.failed]: TestStepResultCreateStatusEnum.FAILED,
    [StepStatusEnum.blocked]: TestStepResultCreateStatusEnum.BLOCKED,
  }

  /**
   * @type {string}
   * @private
   */
  private baseUrl: string;
  /**
   * @type {string}
   * @private
   */
  private projectCode: string;
  /**
   * @type {boolean | undefined}
   * @private
   */
  private uploadAttachments: boolean | undefined;
  /**
   * @type {TestOpsRunType}
   * @private
   */
  private run: TestOpsRunType;

  /**
   * @type {TestResultType[]}
   * @private
   */
  private results: TestResultType[] = [];
  /**
   * @type {Record<string, string[]>}
   * @private
   */
  private attachments: Record<string, string[]> = {};
  /**
   * @type {Record<string, string[]>}
   * @private
   */
  private attachmentsMap: Record<string, string[]> = {};

  /**
   * @param {ReporterOptionsType & TestOpsOptionsType} options
   * @param {QaseApiInterface} api
   * @param {LoggerInterface} logger
   */
  constructor(
    options: ReporterOptionsType & TestOpsOptionsType,
    private api: QaseApiInterface,
    logger?: LoggerInterface,
  ) {
    const {
      projectCode,
      baseUrl = 'https://app.qase.io',
      uploadAttachments,
      run,

      ...restOptions
    } = options;

    super(restOptions, logger);

    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.projectCode = projectCode;
    this.uploadAttachments = uploadAttachments;
    this.run = { complete: true, ...run };
  }

  /**
   * @param {TestResultType} result
   */
  public addTestResult(result: TestResultType) {
    this.results.push(result);

    if (result.attachments?.length) {
      this.attachments[result.id] = result.attachments;
    }
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish() {
    let runId: number;

    if (this.run.id !== undefined) {
      await this.checkRun(this.run.id);

      runId = this.run.id;
    } else {
      const { result } = await this.createRun(
        this.run.title,
        this.run.description,
        this.run.environment,
      );

      if (!result?.id) {
        throw new Error('Cannot create run.');
      }

      runId = result.id;
    }

    if (!this.results.length) {
      this.log(
        'No test cases were matched. Ensure that your tests are declared correctly.',
      );

      return;
    }

    if (this.uploadAttachments && Object.keys(this.attachments).length) {
      await this.prepareAttachments();
    }

    await this.api.results.createResultBulk(this.projectCode, runId, {
      results: this.results.map((result) =>
        this.transformTestToResultCreateObject(result),
      ),
    });

    this.log(chalk`{green ${this.results.length} result(s) sent to Qase}`);

    if (!this.run.complete) {
      return;
    }

    try {
      await this.api.runs.completeRun(this.projectCode, runId);
      this.log(chalk`{green Run ${runId} completed}`);
    } catch (error) {
      throw new QaseError('Error on completing run', { cause: error });
    }

    const runUrl = `${this.baseUrl}/run/${this.projectCode}/dashboard/${runId}`;

    this.log(chalk`{blue Test run link: ${runUrl}}`);
  }

  /**
   * @param {TestResultType} result
   * @returns {ResultCreate}
   * @private
   */
  private transformTestToResultCreateObject(
    result: TestResultType,
  ): ResultCreate {
    const run: ResultCreate = {
      status: TestOpsReporter.statusMap[result.status],
      time_ms: result.duration ?? 0,
      stacktrace: result.error ? stripAnsi(String(result.error.stack)) : null,
      attachments: this.attachmentsMap[result.id] ?? null,
      comment: result.error ? stripAnsi(result.error.message) : null,
      steps: result.steps ? TestOpsReporter.transformSteps(result.steps) : null,
      defect: result.status === TestStatusEnum.failed,
    };

    if (result.testOpsId[0]) {
      run.case_id = result.testOpsId[0];
    } else {
      run.case = {
        title: result.title,
        suite_title: Array.isArray(result.suiteTitle)
          ? result.suiteTitle.join('\t')
          : result.suiteTitle ?? null,
      };
    }

    return run;
  }

  /**
   * @param {TestStepType[]} steps
   * @returns {TestStepResultCreate[]}
   * @private
   */
  private static transformSteps(steps: TestStepType[]): TestStepResultCreate[] {
    return steps.map(({
      title,
      status,
      attachments,
      steps,
      error,
    }) => {
      const step: TestStepResultCreate = {
        action: title,
        status: TestOpsReporter.stepStatusMap[status],
        attachments: attachments ?? null,
        comment: error ? stripAnsi(error.message) : null,
      };

      if (steps) {
        step.steps = TestOpsReporter.transformSteps(steps);
      }

      return step;
    });
  }

  /**
   * @param {number} runId
   * @returns {Promise<void>}
   * @private
   */
  private async checkRun(runId: number) {
    try {
      const resp = await this.api.runs.getRun(this.projectCode, runId);

      this.log(
        `Get run result on checking run "${String(resp.data.result?.id)}"`,
      );
    } catch (error) {
      throw new QaseError('Error on checking run', { cause: error });
    }
  }

  /**
   * @param {string} title
   * @param {string} description
   * @param {number | undefined} environment
   * @returns {Promise<any>}
   * @private
   */
  private async createRun(
    title: string,
    description: string,
    environment: number | undefined,
  ) {
    try {
      const runObject: RunCreate = {
        title,
        description,
        is_autotest: true,
        cases: [],
      };

      if (environment !== undefined) {
        runObject.environment_id = environment;
      }

      const { data } = await this.api.runs.createRun(
        this.projectCode,
        runObject,
      );

      return data;
    } catch (error) {
      throw new QaseError('Cannot create run', { cause: error });
    }
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private async prepareAttachments() {
    this.log(chalk`{yellow Uploading attachments to Qase}`);

    const uploads = Object.keys(this.attachments).reduce<
      [string, Promise<Array<string | undefined>>][]
    >((acc, id) => {
      const attachment = this.attachments[id];

      if (attachment) {
        acc.push([id, this.doUploadAttachments(attachment)]);
      }

      return acc;
    }, []);

    this.attachmentsMap = Object.fromEntries((await Promise.all(
      uploads.map(async ([id, request]) => {
        return [id, await request] satisfies [string, Array<string | undefined>];
      }),
    )).filter((entry): entry is [string, string[]] => {
      const [, hashes] = entry;

      return hashes.every((hash): hash is string => hash !== undefined)
    }));
  }

  /**
   * @param {string[]} attachments
   * @returns {Promise<(string | undefined)[]>}
   * @private
   */
  private async doUploadAttachments(attachments: string[]) {
    return await Promise.all(
      attachments.map(async (attachment) => {
        try {
          const data = createReadStream(attachment);

          const response = await this.api.attachments.uploadAttachment(
            this.projectCode,
            [data],
          );

          return response.data.result?.[0]?.hash;
        } catch (error) {
          this.logError('Cannot upload attachment:', error);

          return undefined;
        }
      }),
    );
  }
}
