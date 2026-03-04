import chalk from 'chalk';

import { AbstractReporter } from './abstract-reporter';

import {
  Attachment,
  TestResultType,
  TestStatusEnum,
} from '../models';
import { LoggerInterface } from '../utils/logger';
import { StateManager } from '../state/state';
import { Mutex } from 'async-mutex';
import { IClient } from '../client/interface';

const defaultChunkSize = 200;

/**
 * @class TestOpsReporter
 * @extends AbstractReporter
 */
export class TestOpsReporter extends AbstractReporter {
  private readonly baseUrl: string;

  private readonly batchSize: number;

  private runId: number | undefined;

  private firstIndex = 0;

  private isTestRunReady = false;

  private mutex = new Mutex();

  /**
   * @param {LoggerInterface} logger
   * @param {IClient} api
   * @param {boolean} withState
   * @param {string} projectCode
   * @param {string | undefined} baseUrl
   * @param {number | undefined} batchSize
   */
  constructor(
    logger: LoggerInterface,
    private api: IClient,
    private withState: boolean,
    private projectCode: string,
    baseUrl?: string,
    batchSize?: number,
    runId?: number,
    private showPublicReportLink?: boolean,
  ) {
    super(logger);
    this.baseUrl = this.getBaseUrl(baseUrl);
    this.batchSize = batchSize ?? defaultChunkSize;
    this.runId = runId;
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

    const release = await this.mutex.acquire();
    try {

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
    } finally {
      release();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  private async checkOrCreateTestRun(): Promise<void> {

    const runId = await this.api.createRun();

    this.runId = runId;
    process.env['QASE_TESTOPS_RUN_ID'] = String(runId);

    if (this.withState) {
      StateManager.setRunId(runId);
    }

    this.isTestRunReady = true;
  }

  /**
   * @returns {Promise<void>}
   * @param testResults
   * @private
   */
  private async publishResults(testResults: TestResultType[]): Promise<void> {
    if (!this.runId) {
      throw new Error('Run ID is not set');
    }
    await this.api.uploadResults(this.runId, testResults);

    this.logger.logDebug(`Results sent to Qase: ${testResults.length}`);
  }

  /**
   * @returns {Promise<void>}
   */
  public async publish(): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      await this.sendResults();
    } finally {
      release();
    }
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
   * @param {Attachment} attachment
   * @returns {Promise<string>}
   */
  override async uploadAttachment(attachment: Attachment): Promise<string> {
    return await this.api.uploadAttachment(attachment);
  }

  /**
   * @returns {Promise<void>}
   */
  public async complete(): Promise<void> {
    if (!this.runId) {
      throw new Error('Run ID is not set');
    }
    await this.api.completeRun(this.runId);

    if (this.showPublicReportLink) {
      try {
        await this.api.enablePublicReport(this.runId);
      } catch (error) {
        // Error is already logged in enablePublicReport
      }
    }

    this.logger.log(chalk`{green Run ${this.runId} completed}`);
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
    if (!this.runId) {
      throw new Error('Run ID is not set');
    }
    const baseLink = `${this.baseUrl}/run/${this.projectCode}/dashboard/${this.runId}?source=logs&search=`;
    if (id) {
      return `${baseLink}${this.projectCode}-${id}`;
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
