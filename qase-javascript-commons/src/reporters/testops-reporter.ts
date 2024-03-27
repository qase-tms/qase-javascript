import { createReadStream } from 'fs';

import chalk from 'chalk';
import stripAnsi from 'strip-ansi';
import {
  QaseApiInterface,
  ResultCreateV2,
  RunCreate,
  ResultStepStatus,
  AttachmentGet,
  ResultExecution,
  ResultStep,
  RelationSuiteItem,
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
    [TestStatusEnum.passed]: "passed",
    [TestStatusEnum.failed]: "failed",
    [TestStatusEnum.skipped]: "skipped",
    [TestStatusEnum.disabled]: "disabled",
    [TestStatusEnum.blocked]: "blocked",
    [TestStatusEnum.invalid]: "invalid",
  };

  /**
   * @type {Record<StepStatusEnum, ResultStepStatus>}
   */
  static stepStatusMap: Record<StepStatusEnum, ResultStepStatus> = {
    [StepStatusEnum.passed]: ResultStepStatus.PASSED,
    [StepStatusEnum.failed]: ResultStepStatus.FAILED,
    [StepStatusEnum.blocked]: ResultStepStatus.BLOCKED,
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
   * @type { number | undefined}
   * @private
   */
  private environment: number | undefined;
  /**
   * @type {TestResultType[]}
   * @private
   */
  private chunk: number;
  /**
   * @type {Record<string, string[]>}
   * @private
   */
  private attachments: Record<string, string[]> = {};
  /**
   * @type {Record<string, string[]>}
   * @private
   */
  private attachmentsMap: Record<string, AttachmentGet[]> = {};

  /**
   * @param {ReporterOptionsType & TestOpsOptionsType} options
   * @param {QaseApiInterface} api
   * @param {LoggerInterface} logger
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
    this.uploadAttachments = uploadAttachments;
    this.run = { complete: true, ...run };
    this.environment = environment;
    this.chunk = options.chunk || defaultChunkSize;
  }

  /**
   * @param {TestResultType} result
   */
  public addTestResult(result: TestResultType) {
    this.results.push(result);
    this.addAttachments(result);
  }

  private addAttachments(resultOrStep: TestResultType | TestStepType) {
    if (resultOrStep.attachments) {
      this.attachments[resultOrStep.id] = resultOrStep.attachments;
    }

    if (resultOrStep.steps) {
      for (const step of resultOrStep.steps) {
        this.addAttachments(step);
      }
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

    if (this.uploadAttachments && Object.keys(this.attachments).length) {
      await this.prepareAttachments();
    }

    const results = this.results.map((result) => this.transformTestResult(result));

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
   * @returns {ResultCreateV2}
   * @private
   */
  private transformTestResult(result: TestResultType): ResultCreateV2 {

    const resultObject: ResultCreateV2 = {
      title: result.title,
      execution: this.getExecution(result),
      testops_id: result.testOpsId[0] || null,
      attachments: this.getAttachmentsFor(result.id),
      steps: this.transformSteps(result.steps ?? []),
      params: {},
      relations: {
        suite: {
          data: result.suiteTitle ? this.getSuites(result.suiteTitle) : [],
        },
      },
      message: result.error ? stripAnsi(result.error.message) : null,
    };

    return resultObject;
  }

  /**
   * @param {string | string[]} suiteTitle
   * @returns {RelationSuiteItem[]}
   * @private
   */
  private getSuites(suiteTitle: string | string[]): RelationSuiteItem[] {
    const suiteTitles = Array.isArray(suiteTitle) ? suiteTitle : suiteTitle.split('\t');

    return suiteTitles.map((title) => ({ title }));
  }

  /**
   * @param {TestResultType} result
   * @returns {ResultExecution}
   * @private
   */
  private getExecution(result: TestResultType): ResultExecution {
    const execution: ResultExecution = {
      status: TestOpsReporter.statusMap[result.status],
      start_time: result.startTime ? result.startTime : null,
      end_time: result.endTime ? result.endTime : null,
      duration: result.duration ? result.duration : null,
    };

    if (result.startTime) {
      execution.start_time = result.startTime;
    }

    if (result.duration) {
      execution.duration = result.duration;
    }

    if (result.endTime) {
      execution.end_time = result.endTime;
    }

    if (result.error) {
      execution.stacktrace = stripAnsi(String(result.error.stack));
    }

    return execution;
  }

  /**
   * @param {string} id
   * @returns {string[]}
   * @private
   */
  private getAttachmentsFor(id: string): string[] {
    const attachments = this.attachmentsMap[id];

    if (!attachments) {
      return [];
    }

    return attachments.reduce((acc: string[], attachment: AttachmentGet) => {
      if (attachment.hash) {
        acc.push(attachment.hash);
      }

      return acc;
    }, []);
  }

  /**
   * @param {TestStepType[]} steps
   * @returns {ResultStep[]}
   * @private
   */
  private transformSteps(steps: TestStepType[]): ResultStep[] {
    return steps.map(({
      title,
      status,
      steps,
      attachments,
    }) => {
      const step: ResultStep = {
        data: {
          action: title,
          attachments: attachments ? this.getAttachmentsFor(title) : [],
        },

        execution: {
          status: TestOpsReporter.stepStatusMap[status],
        },
      };

      if (steps) {
        step.steps = this.transformSteps(steps);
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
      [string, Promise<AttachmentGet[]>][]
    >((acc, id) => {
      const attachment = this.attachments[id];

      if (attachment) {
        acc.push([id, this.doUploadAttachments(attachment)]);
      }

      return acc;
    }, []);

    this.attachmentsMap = Object.fromEntries(await Promise.all(
      uploads.map(async ([id, request]) => {
        return [id, await request] satisfies [string, AttachmentGet[]];
      }),
    ));
  }

  /**
   * @param {string[]} attachments
   * @returns {Promise<AttachmentGet[]>}
   * @private
   */
  private async doUploadAttachments(attachments: string[]) {
    return (await Promise.all(
      attachments.map(async (attachment) => {
        try {
          const data = createReadStream(attachment);

          const response = await this.api.attachments.uploadAttachment(
            this.projectCode,
            [data],
          );

          return response.data.result?.[0];
        } catch (error) {
          this.logError('Cannot upload attachment:', error);

          return undefined;
        }
      }),
    )).filter((attachments): attachments is AttachmentGet => Boolean(attachments));
  }
}
