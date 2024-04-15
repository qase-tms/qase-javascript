import { createReadStream } from 'fs';

import chalk from 'chalk';
import {
  IdResponse,
  QaseApiInterface, ResultCreate,
  ResultCreateV2,
  ResultExecution,
  ResultRelations,
  ResultStep,
  ResultStepStatus,
  RunCreate, TestStepResultCreate, TestStepResultCreateStatusEnum,
} from 'qaseio';

import { AbstractReporter, LoggerInterface, ReporterOptionsType } from './abstract-reporter';

import {
  StepStatusEnum,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  Attachment,
  TestExecution,
  Relation,
  SuiteData,
} from '../models';

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
  useV2?: boolean | undefined;
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
   * @type {Record<StepStatusEnum, ResultStepStatus>}
   */
  static stepStatusMapV1: Record<StepStatusEnum, TestStepResultCreateStatusEnum> = {
    [StepStatusEnum.passed]: TestStepResultCreateStatusEnum.PASSED,
    [StepStatusEnum.failed]: TestStepResultCreateStatusEnum.FAILED,
    [StepStatusEnum.blocked]: TestStepResultCreateStatusEnum.BLOCKED,
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
   * @type {boolean | undefined}
   * @private
   */
  private readonly useV2: boolean;

  /**
   * @type {boolean | undefined}
   * @private
   */
  private readonly defect: boolean;

  /**
   * @type {number}
   * @private
   */
  private firstIndex = 0;

  /**
   * @type {boolean}
   * @private
   */
  private isTestRunReady = false;

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
    this.useV2 = options.useV2 ?? false;
    this.defect = options.defect ?? false;
  }

  /**
   * @returns {Promise<void>}
   */
  public async startTestRun(): Promise<void> {
    await this.checkOrCreateTestRun();
  }

  /**
   * @param {TestResultType} result
   * @returns {Promise<void>}
   */
  public override async addTestResult(result: TestResultType): Promise<void> {
    await super.addTestResult(result);

    if (!this.isTestRunReady) {
      return;
    }

    const countOfResults = this.chunk + this.firstIndex;

    if (this.results.length >= countOfResults) {
      await this.publishResults(this.results.slice(this.firstIndex, countOfResults));
      this.firstIndex = countOfResults;
    }
  }

  /**
   * @returns {Promise<void>}
   */
  private async checkOrCreateTestRun(): Promise<void> {
    if (this.run.id !== undefined) {
      await this.checkRun(this.run.id);

      this.isTestRunReady = true;
      return;
    }

    const { result } = await this.createRun(
      this.run.title,
      this.run.description,
      this.environment,
    );

    if (!result?.id) {
      throw new Error('Cannot create run.');
    }

    this.run.id = result.id;
    this.isTestRunReady = true;
  }

  /**
   * @returns {Promise<void>}
   * @param testResults
   * @private
   */
  private async publishResults(testResults: TestResultType[]): Promise<void> {
    if (this.useV2) {
      const results: ResultCreateV2[] = [];

      for (const result of testResults) {
        const resultCreateV2 = await this.transformTestResult(result);
        results.push(resultCreateV2);
      }

      await this.api.result.createResultsV2(this.projectCode, this.run.id!, {
        results: results,
      });

    } else {
      const results: ResultCreate[] = [];

      for (const result of testResults) {
        const resultCreate = await this.transformTestResultV1(result);
        results.push(resultCreate);
      }

      await this.api.results.createResultBulk(this.projectCode, this.run.id!, {
        results: results,
      });
    }
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish(): Promise<void> {
    if (this.results.length === 0) {
      this.log(chalk`{yellow No results to send to Qase}`);
      return;
    }

    if (this.firstIndex < this.results.length) {
      await this.publishResults(this.results.slice(this.firstIndex));
    }

    this.log(chalk`{green ${this.results.length} result(s) sent to Qase}`);

    if (!this.run.complete) {
      return;
    }

    try {
      await this.api.runs.completeRun(this.projectCode, this.run.id!);
      this.log(chalk`{green Run ${this.run.id!} completed}`);
    } catch (error) {
      throw new QaseError('Error on completing run', { cause: error });
    }

    const runUrl = `${this.baseUrl}/run/${this.projectCode}/dashboard/${this.run.id!}`;

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
      params: result.params,
      relations: this.getRelation(result.relations),
      message: result.message,
    };
  }

  /**
   * @param {TestResultType} result
   * @returns Promise<ResultCreate>
   * @private
   */
  private async transformTestResultV1(result: TestResultType): Promise<ResultCreate> {
    const attachments = await this.uploadAttachments(result.attachments);
    const steps = await this.transformStepsV1(result.steps);

    const resultCreate: ResultCreate = {
      attachments: attachments,
      comment: result.message,
      defect: this.defect,
      param: result.params,
      stacktrace: result.execution.stacktrace,
      start_time: result.execution.start_time ? result.execution.start_time | 0 : null,
      status: result.execution.status,
      steps: steps,
      time: result.execution.end_time,
      time_ms: result.execution.duration,
    };

    const id = Array.isArray(result.testops_id) ? null : result.testops_id;
    if (id) {
      resultCreate.case_id = id;
      return resultCreate;
    }

    resultCreate.case = {
      title: result.title,
      suite_title: result.relations?.suite ? result.relations?.suite?.data.map((suite) => suite.title).join('\t') : null,
    };

    return resultCreate;
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
   * @param {Relation | null} relation
   * @returns {ResultRelations}
   * @private
   */
  private getRelation(relation: Relation | null): ResultRelations {
    if (!relation || !relation.suite) {
      return {};
    }

    const suiteData: SuiteData[] = [];
    for (const data of relation.suite.data) {
      suiteData.push({
        public_id: null,
        title: data.title,
      });
    }

    return {
      suite: {
        data: suiteData,
      },
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
   * @param {TestStepType[]} steps
   * @returns Promise<TestStepResultCreate[]>
   * @private
   */
  private async transformStepsV1(steps: TestStepType[]): Promise<TestStepResultCreate[]> {
    const resultsSteps: TestStepResultCreate[] = [];

    for (const step of steps) {
      const attachmentHashes: string[] = await this.uploadAttachments(step.attachments);

      const resultStep: TestStepResultCreate = {
        status: TestOpsReporter.stepStatusMapV1[step.execution.status],
        action: step.data.action,
        attachments: attachmentHashes,
      };

      if (step.steps.length > 0) {
        resultStep.steps = await this.transformStepsV1(step.steps);
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
          data = { name: attachment.file_name, value: createReadStream(attachment.file_path) };
        } else {
          if (typeof attachment.content === 'string') {
            data = { name: attachment.file_name, value: Buffer.from(attachment.content) };
          } else {
            data = { name: attachment.file_name, value: attachment.content };
          }
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
