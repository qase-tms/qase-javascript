import { createReadStream } from 'fs';

import chalk from 'chalk';
import {
  IdResponse,
  QaseApiInterface,
  ResultCreate,
  ResultCreateV2,
  ResultExecution,
  ResultRelations,
  ResultStep,
  ResultStepStatus,
  RunCreate,
  TestStepResultCreate,
  TestStepResultCreateStatusEnum,
} from 'qaseio';

import { AbstractReporter } from './abstract-reporter';

import {
  StepStatusEnum,
  TestResultType,
  TestStatusEnum,
  TestStepType,
  Attachment,
  TestExecution,
  Relation,
  SuiteData,
  StepType,
} from '../models';

import { QaseError } from '../utils/qase-error';
import { LoggerInterface } from '../utils/logger';
import axios from 'axios';
import { StateManager } from '../state/state';

const defaultChunkSize = 200;

export interface TestOpsRunType {
  id?: number | undefined;
  title: string;
  description: string;
  complete?: boolean | undefined;
}

export interface TestOpsPlanType {
  id?: number | undefined;
}

export interface TestOpsBatchType {
  size?: number | undefined;
}

export interface TestOpsOptionsType {
  project: string;
  uploadAttachments?: boolean | undefined;
  run: TestOpsRunType;
  plan: TestOpsPlanType;
  batch?: TestOpsBatchType;
  defect?: boolean | undefined;
  useV2?: boolean | undefined;
}

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
    [StepStatusEnum.skipped]: ResultStepStatus.SKIPPED,
  };

  /**
   * @type {Record<StepStatusEnum, ResultStepStatus>}
   */
  static stepStatusMapV1: Record<StepStatusEnum, TestStepResultCreateStatusEnum> = {
    [StepStatusEnum.passed]: TestStepResultCreateStatusEnum.PASSED,
    [StepStatusEnum.failed]: TestStepResultCreateStatusEnum.FAILED,
    [StepStatusEnum.blocked]: TestStepResultCreateStatusEnum.BLOCKED,
    [StepStatusEnum.skipped]: TestStepResultCreateStatusEnum.BLOCKED,
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
   * @type { string | undefined}
   * @private
   */
  private readonly environment: string | undefined;
  /**
   * @type { number | undefined}
   * @private
   */
  private readonly planId: number | undefined;
  /**
   * @type {TestResultType[]}
   * @private
   */
  private readonly batchSize: number;

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
   * @type {string | undefined}
   * @private
   */
  private readonly rootSuite: string | undefined;

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
   * @param {LoggerInterface} logger
   * @param {ReporterOptionsType & TestOpsOptionsType} options
   * @param {QaseApiInterface} api
   * @param {boolean} withState
   * @param {string | undefined} environment
   * @param {string | undefined} rootSuite
   * @param {string | undefined} baseUrl
   */
  constructor(
    logger: LoggerInterface,
    options: TestOpsOptionsType,
    private api: QaseApiInterface,
    private withState: boolean,
    environment?: string,
    rootSuite?: string,
    baseUrl?: string,
  ) {
    const {
      project,
      uploadAttachments,
      run,
      plan,
    } = options;

    super(logger);

    this.baseUrl = this.getBaseUrl(baseUrl);
    this.projectCode = project;
    this.isUploadAttachments = uploadAttachments;
    this.run = { complete: true, ...run };
    this.environment = environment;
    this.planId = plan.id;
    this.batchSize = options.batch?.size ?? defaultChunkSize;
    this.useV2 = options.useV2 ?? true;
    this.defect = options.defect ?? false;
    this.rootSuite = rootSuite;
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
    if (result.execution.status === TestStatusEnum.failed) {

      const testOpsIds = Array.isArray(result.testops_id) ? result.testops_id : [result.testops_id];

      for (const id of testOpsIds) {
        this.showLink(id, result.title);
      }
    }

    await super.addTestResult(result);

    if (!this.isTestRunReady) {
      return;
    }

    const countOfResults = this.batchSize + this.firstIndex;

    if (this.results.length >= countOfResults) {
      const firstIndex = this.firstIndex;
      this.firstIndex = countOfResults;
      await this.publishResults(this.results.slice(firstIndex, countOfResults));
    }
  }

  /**
   * @returns {Promise<void>}
   */
  private async checkOrCreateTestRun(): Promise<void> {
    if (this.run.id !== undefined) {
      this.isTestRunReady = true;

      return;
    }

    this.logger.logDebug('Creating test run');

    let environmentId: number | undefined;
    if (this.environment != undefined) {
      try {
        const { data } = await this.api.environment.getEnvironments(this.projectCode, undefined, this.environment, 100);
        const env = data.result?.entities?.find((env) => env.slug === this.environment);
        if (env) {
          environmentId = env.id;
        }
      } catch (error) {
        throw this.processError(error, 'Error on getting environments');
      }
    }
    const { result } = await this.createRun(
      this.run.title,
      this.run.description,
      environmentId,
    );

    if (!result?.id) {
      throw new Error('Cannot create run.');
    }

    this.logger.logDebug(`Test run created: ${result.id}`);

    this.run.id = result.id;
    process.env['QASE_TESTOPS_RUN_ID'] = String(result.id);
    if (this.withState) {
      StateManager.setRunId(result.id);
    }
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
      try {
        await this.api.result.createResultsV2(this.projectCode, this.run.id!, {
          results: results,
        });
      } catch (error) {
        throw this.processError(error, 'Error on uploading results', results);
      }

    } else {
      const results: ResultCreate[] = [];

      for (const result of testResults) {
        const resultCreate = await this.transformTestResultV1(result);
        results.push(resultCreate);
      }

      try {
        await this.api.results.createResultBulk(this.projectCode, this.run.id!, {
          results: results,
        });
      } catch (error) {
        throw this.processError(error, 'Error on uploading results', results);
      }
    }

    this.logger.logDebug(`Results sent to Qase: ${testResults.length}`);
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish(): Promise<void> {
    await this.sendResults();
    await this.complete();
  }

  /**
   * @returns {Promise<void>}
   */
  public async sendResults(): Promise<void> {
    if (this.results.length === 0) {
      this.logger.log(chalk`{yellow No results to send to Qase}`);
      return;
    }

    const remainingResults = this.results.slice(this.firstIndex);

    if (this.firstIndex < this.results.length) {
      if (remainingResults.length <= defaultChunkSize) {
        await this.publishResults(remainingResults);
        return;
      }

      for (let i = 0; i < remainingResults.length; i += defaultChunkSize) {
        await this.publishResults(remainingResults.slice(i, i + defaultChunkSize));
      }
    }

    // Clear results because we don't need to send them again then we use Cypress reporter
    this.results.length = 0;
  }

  /**
   * @returns {Promise<void>}
   */
  public async complete(): Promise<void> {
    if (!this.run.complete) {
      return;
    }

    try {
      await this.api.runs.completeRun(this.projectCode, this.run.id!);
      this.logger.log(chalk`{green Run ${this.run.id!} completed}`);
    } catch (error) {
      throw this.processError(error, 'Error on completing run');
    }

    const runUrl = `${this.baseUrl}/run/${this.projectCode}/dashboard/${this.run.id!}`;

    this.logger.log(chalk`{blue Test run link: ${runUrl}}`);
  }

  /**
   * @param {TestResultType} result
   * @returns Promise<ResultCreateV2>
   * @private
   */
  private async transformTestResult(result: TestResultType): Promise<ResultCreateV2> {
    const attachments = await this.uploadAttachments(result.attachments);
    const steps = await this.transformSteps(result.steps, result.title);

    const param: Record<string, string> = {};

    for (const key in result.params) {
      const value = result.params[key];
      if (!value) {
        continue;
      }
      param[key] = value;
    }

    const group_params: string[][] = [];

    const keys = Object.keys(result.group_params);
    if (keys.length > 0) {
      group_params.push(keys);
    }

    for (const key in result.group_params) {
      const value = result.group_params[key];
      if (!value) {
        continue;
      }
      param[key] = value;
    }

    const model = {
      title: result.title,
      execution: this.getExecution(result.execution),
      testops_id: Array.isArray(result.testops_id) ? null : result.testops_id,
      attachments: attachments,
      steps: steps,
      params: param,
      param_groups: group_params,
      relations: this.getRelation(result.relations),
      message: result.message,
      fields: result.fields,
      defect: this.defect,
    };

    this.logger.logDebug(`Transformed result: ${JSON.stringify(model)}`);

    return model;
  }

  /**
   * @param {TestResultType} result
   * @returns Promise<ResultCreate>
   * @private
   */
  private async transformTestResultV1(result: TestResultType): Promise<ResultCreate> {
    const attachments = await this.uploadAttachments(result.attachments);
    const steps = await this.transformStepsV1(result.steps, result.title);

    const param: Record<string, string> = {};

    for (const key in result.params) {
      const value = result.params[key];
      if (!value) {
        continue;
      }
      param[key] = value;
    }

    const group_params: string[][] = [];

    const keys = Object.keys(result.group_params);
    if (keys.length > 0) {
      group_params.push(keys);
    }

    for (const key in result.group_params) {
      const value = result.group_params[key];
      if (!value) {
        continue;
      }
      param[key] = value;
    }


    const resultCreate: ResultCreate = {
      attachments: attachments,
      comment: result.message,
      defect: this.defect,
      param: param,
      param_groups: group_params,
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
    }

    const rootSuite = this.rootSuite ? `${this.rootSuite}\t` : '';
    resultCreate.case = {
      title: result.title,
      suite_title: result.relations?.suite ? `${rootSuite}${result.relations.suite.data.map((suite) => suite.title).join('\t')}` : rootSuite,
      description: result.fields['description'] ?? null,
      postconditions: result.fields['postconditions'] ?? null,
      preconditions: result.fields['preconditions'] ?? null,
    };

    if (result.fields['severity']) {
      resultCreate.case.severity = result.fields['severity'];
    }

    if (result.fields['priority']) {
      resultCreate.case.priority = result.fields['priority'];
    }

    if (result.fields['layer']) {
      resultCreate.case.layer = result.fields['layer'];
    }

    if (result.fields['author']) {
      const resp = await this.api.authors.getAuthors(result.fields['author']);
      if (resp.data.result?.entities && resp.data.result.entities.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        resultCreate.author_id = resp.data.result.entities[0]?.author_id ?? null;
      }
    }

    this.logger.logDebug(`Transformed result: ${JSON.stringify(resultCreate)}`);

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
    if (!relation?.suite) {
      if (this.rootSuite == undefined) {
        return {};
      }

      return {
        suite: {
          data: [
            {
              public_id: null,
              title: this.rootSuite,
            },
          ],
        },
      };
    }

    const suiteData: SuiteData[] = [];
    if (this.rootSuite != undefined) {
      suiteData.push({
        public_id: null,
        title: this.rootSuite,
      });
    }

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
   * @param testTitle
   * @returns Promise<ResultStep[]>
   * @private
   */
  private async transformSteps(steps: TestStepType[], testTitle: string): Promise<ResultStep[]> {
    const resultsSteps: ResultStep[] = [];

    for (const step of steps) {
      const attachmentHashes: string[] = await this.uploadAttachments(step.attachments);

      const resultStep: ResultStep = {
        data: {
          action: '',
        },
        execution: {
          status: TestOpsReporter.stepStatusMap[step.execution.status],
          attachments: attachmentHashes,
        },
      };

      if (step.step_type === StepType.TEXT) {
        if ('action' in step.data && resultStep.data != undefined) {
          if (step.data.action === '') {
            this.logEmptyStep(testTitle);
            resultStep.data.action = 'Unnamed step';
          } else {
            resultStep.data.action = step.data.action;
          }
        }
      }

      if (step.step_type === StepType.GHERKIN) {
        if ('keyword' in step.data && resultStep.data != undefined) {
          resultStep.data.action = step.data.keyword;
        }
      }

      if (step.steps.length > 0) {
        resultStep.steps = await this.transformSteps(step.steps, testTitle);
      }

      resultsSteps.push(resultStep);
    }

    return resultsSteps;
  }

  /**
   * @param {TestStepType[]} steps
   * @param testTitle
   * @returns Promise<TestStepResultCreate[]>
   * @private
   */
  private async transformStepsV1(steps: TestStepType[], testTitle: string): Promise<TestStepResultCreate[]> {
    const resultsSteps: TestStepResultCreate[] = [];

    for (const step of steps) {
      const attachmentHashes: string[] = await this.uploadAttachments(step.attachments);

      const resultStep: TestStepResultCreate = {
        status: TestOpsReporter.stepStatusMapV1[step.execution.status],
        attachments: attachmentHashes,
      };

      if (step.step_type === StepType.TEXT) {
        if ('action' in step.data) {
          if (step.data.action === '') {
            this.logEmptyStep(testTitle);
            resultStep.action = 'Unnamed step';
          } else {
            resultStep.action = step.data.action;
          }
        }
      }

      if (step.step_type === StepType.GHERKIN) {
        if ('keyword' in step.data) {
          resultStep.action = step.data.keyword;
        }
      }

      if (step.steps.length > 0) {
        resultStep.steps = await this.transformStepsV1(step.steps, testTitle);
      }

      resultsSteps.push(resultStep);
    }

    return resultsSteps;
  }

  private logEmptyStep(testTitle: string): void {
    this.logger.log(chalk`{magenta Test '${testTitle}' has empty action in step. The reporter will mark this step as unnamed step.}`);
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
        start_time: this.getDate(),
      };

      if (environment !== undefined) {
        runObject.environment_id = environment;
      }

      if (this.planId) {
        runObject.plan_id = this.planId;
      }

      const { data } = await this.api.runs.createRun(
        this.projectCode,
        runObject,
      );

      return data;
    } catch (error) {
      throw this.processError(error, 'Error on creating run');
    }
  }

  /**
   * @returns {string}
   * @private
   */
  private getDate(): string {
    const date = new Date();
    date.setSeconds(-10);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1).toString()).slice(-2); // Months are zero indexed, so we add 1
    const day = ('0' + date.getUTCDate().toString()).slice(-2);
    const hours = ('0' + date.getUTCHours().toString()).slice(-2);
    const minutes = ('0' + date.getUTCMinutes().toString()).slice(-2);
    const seconds = ('0' + date.getUTCSeconds().toString()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
      this.logger.logDebug(`Uploading attachment: ${attachment.file_path ?? attachment.file_name}`);

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
        this.logger.logError('Cannot upload attachment:', error);
      }
    }
    return acc;
  }

  /**
   * Process error and throw QaseError
   * @param {Error | AxiosError} error
   * @param {string} message
   * @param {object} model
   * @private
   */
  private processError(error: unknown, message: string, model?: object): QaseError {
    if (!axios.isAxiosError(error)) {
      return new QaseError(message, { cause: error });
    }

    if (error.response?.status === 401) {
      return new QaseError(message + ': \n Unauthorized. Please check your API token. Maybe it is expired or invalid.');
    }

    if (error.response?.status === 404) {
      return new QaseError(message + ': Not found.');
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      return new QaseError(message + ': Bad request. Body: \n ' + JSON.stringify(model));
    }

    return new QaseError(message, { cause: error });
  }

  /**
   * @param {string | undefined} url
   * @return string
   * @private
   */
  private getBaseUrl(url: string | undefined): string {
    if (!url || url === 'qase.io') {
      return 'https://app.qase.io';
    }

    return `https://${url.replace('api', 'app')}`;
  }

  /**
   * @param {number | null} id
   * @param {string} title
   * @return string
   * @private
   */
  private prepareFailedTestLink(id: number | null, title: string): string {
    const baseLink = `${this.baseUrl}/run/${this.projectCode}/dashboard/${this.run.id!}?source=logs&status=%5B2%5D&search=`;
    if (id) {
      return `${baseLink}${id}`;
    }

    return `${baseLink}${encodeURI(title)}`;
  }

  /**
   * Show link to failed test
   * @param {number | null} id
   * @param {string} title
   * @private
   */
  private showLink(id: number | null, title: string): void {
    const link = this.prepareFailedTestLink(id, title);
    this.logger.log(chalk`{blue See why this test failed: ${link}}`);
  }
}
