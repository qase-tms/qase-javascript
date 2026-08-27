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
import { DEFAULT_BATCH_SIZE } from './shared/testops-constants';
import { resolveTestOpsBaseUrl } from './shared/testops-url';

/**
 * @class TestOpsReporter
 * @extends AbstractReporter
 */
export class TestOpsReporter extends AbstractReporter {
  private readonly baseUrl: string;

  private readonly batchSize: number;

  private runId: number | undefined;

  /** First result that has not been confirmed as accepted by Qase. */
  private firstIndex = 0;

  /**
   * First result that no sender has taken responsibility for yet. Kept apart from
   * `firstIndex` so a batch is claimed before the request and only marked sent after the
   * response: a concurrent `sendResults()` cannot ship the same batch twice, and a batch
   * that failed is released back for the next attempt instead of being skipped.
   */
  private claimedIndex = 0;

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
    this.baseUrl = resolveTestOpsBaseUrl(baseUrl);
    this.batchSize = batchSize ?? DEFAULT_BATCH_SIZE;
    this.runId = runId;
  }

  /**
   * @returns {Promise<void>}
   */
  public async startTestRun(): Promise<void> {
    this.runId = undefined;
    this.isTestRunReady = false;
    this.firstIndex = 0;
    this.claimedIndex = 0;
    this.results = [];

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

      const countOfResults = this.batchSize + this.claimedIndex;

      if (this.results.length >= countOfResults) {
        await this.publishClaimed(this.claimedIndex, countOfResults);
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

    while (this.claimedIndex < this.results.length) {
      const from = this.claimedIndex;
      const to = Math.min(from + DEFAULT_BATCH_SIZE, this.results.length);
      await this.publishClaimed(from, to);
    }

    // Clear results because we don't need to send them again then we use Cypress reporter.
    // Only once every result is confirmed — a batch still in flight (claimed but not yet
    // acknowledged) must stay in the array so a failure can release it back for another try.
    if (this.firstIndex >= this.results.length) {
      this.results.length = 0;
      this.firstIndex = 0;
      this.claimedIndex = 0;
    }
  }

  /**
   * Sends `results[from, to)`, claiming the range up front so no other sender picks it up and
   * releasing the claim if the upload fails, so the next `sendResults()` retries it.
   *
   * @param {number} from
   * @param {number} to
   * @returns {Promise<void>}
   * @private
   */
  private async publishClaimed(from: number, to: number): Promise<void> {
    this.claimedIndex = to;

    try {
      await this.publishResults(this.results.slice(from, to));
      this.firstIndex = to;
    } catch (error) {
      this.claimedIndex = from;
      this.reportUnrecoverableBatch(to - from);
      throw error;
    }
  }

  /**
   * @param {number} count
   * @private
   */
  private reportUnrecoverableBatch(count: number): void {
    this.logger.logError(
      chalk`{red Unable to send ${count} result(s) to Qase after retries. ` +
      `${this.unsentResultsCount()} result(s) are still missing from run ${this.runId ?? 'unknown'}.}`,
    );
  }

  /**
   * Results accumulated but never confirmed as accepted by Qase.
   *
   * @returns {number}
   * @private
   */
  private unsentResultsCount(): number {
    return Math.max(0, this.results.length - this.firstIndex);
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

    const unsent = this.unsentResultsCount();
    if (unsent > 0) {
      // A completed run over partial data looks trustworthy and is not. Leave it open so the
      // gap is visible in Qase instead of being signed off automatically.
      this.logger.log(
        chalk`{yellow Run ${this.runId} is left incomplete: ${unsent} result(s) could not be sent to Qase}`,
      );
      return;
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
