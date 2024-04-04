import { createReadStream } from 'fs';

import chalk from 'chalk';
import {
  IdResponse,
  QaseApiInterface,
  ResultCreateV2,
  ResultExecution,
  ResultStep,
  ResultStepStatus,
  RunCreate,
} from 'qaseio';

import { AbstractReporter, LoggerInterface, ReporterOptionsType } from './abstract-reporter';

import { StepStatusEnum, TestResultType, TestStatusEnum, TestStepType, Attachment, TestExecution } from '../models';

import { QaseError } from '../utils/qase-error';

const defaultChunkSize = 200;

export type TestOpsRunType = {
  id?: number | undefined;
  title: string;
  description: string;
  complete?: boolean | undefined;
};

export type TestOpsPlanType = {
  id?: number | undefined;
};

export type TestOpsOptionsType = {
  project: string;
  uploadAttachments?: boolean | undefined;
  run: TestOpsRunType;
  plan: TestOpsPlanType;
  chunk?: number | undefined;
  defect?: boolean | undefined;
};

/**
 * @class TestOpsReporter
 * @extends AbstractReporter
 */
export class TestOpsReporter extends AbstractReporter {
  /**
   * @type {Record<TestStatusEnum, string>}
   */
  static statusMap: Record<TestStatusEnum, string> = {
    [TestStatusEnum.passed]: 'passed',
    [TestStatusEnum.failed]: 'failed',
    [TestStatusEnum.skipped]: 'skipped',
    [TestStatusEnum.disabled]: 'disabled',
    [TestStatusEnum.blocked]: 'blocked',
    [TestStatusEnum.invalid]: 'invalid',
  };

  /**
   * @type {Record<StepStatusEnum, ResultStepStatus>}
   */
  static stepStatusMap: Record<StepStatusEnum, ResultStepStatus> = {
    [StepStatusEnum.passed]: ResultStepStatus.PASSED,
    [StepStatusEnum.failed]: ResultStepStatus.FAILED,
    [StepStatusEnum.blocked]: ResultStepStatus.BLOCKED,
  };

  /**
   * @type {string}
   * @private
   */
  private readonly baseUrl: string;
  /**
   * @type {string}
   * @private
   */
  private readonly projectCode: string;
  /**
   * @type {boolean | undefined}
   * @private
   */
  private readonly isUploadAttachments: boolean | undefined;
  /**
   * @type {TestOpsRunType}
   * @private
   */
  private run: TestOpsRunType;
  /**
   * @type { number | undefined}
   * @private
   */
  private readonly environment: number | undefined;
  /**
   * @type {TestResultType[]}
   * @private
   */
  private readonly chunk: number;

  /**
   * @param {ReporterOptionsType & TestOpsOptionsType} options
   * @param {QaseApiInterface} api
   * @param {LoggerInterface} logger
   * @param {number} environment
   */
  constructor(
    options: ReporterOptionsType & TestOpsOptionsType,
    private api: QaseApiInterface,
    logger?: LoggerInterface,
    environment?: number,
  ) {
    const {
      project,
      uploadAttachments,
      run,

      ...restOptions
    } = options;

    super(restOptions, logger);

    const baseUrl = 'https://app.qase.io';

    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.projectCode = project;
    this.isUploadAttachments = uploadAttachments;
    this.run = { complete: true, ...run };
    this.environment = environment;
    this.chunk = options.chunk ?? defaultChunkSize;
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish(): Promise<void> {
    let runId: number;

    if (this.run.id !== undefined) {
      await this.checkRun(this.run.id);

      runId = this.run.id;
    } else {
      const { result } = await this.createRun(
        this.run.title,
        this.run.description,
        this.environment,
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

    const results: ResultCreateV2[] = [];

    for (const result of this.results) {
      const resultCreateV2 = await this.transformTestResult(result);
      results.push(resultCreateV2);
    }

    for (let i = 0; i < results.length; i += this.chunk) {
      await this.api.result.createResultsV2(this.projectCode, runId, {
        results: results.slice(i, i + this.chunk),
      });
    }

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
   * @returns Promise<ResultCreateV2>
   * @private
   */
  private async transformTestResult(result: TestResultType): Promise<ResultCreateV2> {
    const attachments = await this.uploadAttachments(result.attachments);
    const steps = await this.transformSteps(result.steps);

    return {
      title: result.title,
      execution: this.getExecution(result.execution),
      testops_id: Array.isArray(result.testops_id) ? null : result.testops_id,
      attachments: attachments,
      steps: steps,
      params: {},
      relations: {
        // suite: {
        //   data: result.suiteTitle ? this.getSuites(result.suiteTitle) : [],
        // },
      },
      message: result.message,
    };
  }

  /**
   * @returns {ResultExecution}
   * @private
   * @param {TestExecution} exec
   */
  private getExecution(exec: TestExecution): ResultExecution {
    return {
      status: TestOpsReporter.statusMap[exec.status],
      start_time: exec.start_time,
      end_time: exec.end_time,
      duration: exec.duration,
      stacktrace: exec.stacktrace,
      thread: exec.thread,
    };
  }

  /**
   * @param {TestStepType[]} steps
   * @returns Promise<ResultStep[]>
   * @private
   */
  private async transformSteps(steps: TestStepType[]): Promise<ResultStep[]> {
    const resultsSteps: ResultStep[] = [];

    for (const step of steps) {
      const attachmentHashes: string[] = await this.uploadAttachments(step.attachments);

      const resultStep: ResultStep = {
        data: {
          action: step.data.action,
          attachments: attachmentHashes,
        },
        execution: {
          status: TestOpsReporter.stepStatusMap[step.execution.status],
        },
      };

      if (step.steps.length > 0) {
        resultStep.steps = await this.transformSteps(step.steps);
      }

      resultsSteps.push(resultStep);
    }

    return resultsSteps;
  }

  /**
   * @param {number} runId
   * @returns {Promise<void>}
   * @private
   */
  private async checkRun(runId: number): Promise<void> {
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
   * @returns {Promise<IdResponse>}
   * @private
   */
  private async createRun(
    title: string,
    description: string,
    environment: number | undefined,
  ): Promise<IdResponse> {
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
  private async uploadAttachments(attachments: Attachment[]): Promise<string[]> {
    if (!this.isUploadAttachments) {
      return [];
    }

    const acc: string[] = [];
    for (const attachment of attachments) {
      try {
        let data: unknown;
        if (attachment.file_path) {
          data = createReadStream(attachment.file_path);
        } else {
          data = attachment.content;
        }

        const response = await this.api.attachments.uploadAttachment(
          this.projectCode,
          [data],
        );

        if (response.data.result?.[0]?.hash != undefined) {
          acc.push(response.data.result[0].hash);
        }

      } catch (error) {
        this.logError('Cannot upload attachment:', error);
      }
    }
    return acc;
  }
}
