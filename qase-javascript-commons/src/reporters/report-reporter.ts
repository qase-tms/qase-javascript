import {
  AbstractReporter,
  ReporterOptionsType,
  LoggerInterface,
} from './abstract-reporter';

import { TestResultType } from '../models';
import { WriterInterface } from '../writer';

/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
export class ReportReporter extends AbstractReporter {
  /**
   * @type {TestResultType[]}
   * @private
   */
  private results: TestResultType[] = [];

  /**
   * @param {ReporterOptionsType} options
   * @param {WriterInterface} writer
   * @param {LoggerInterface} logger
   */
  constructor(
    options: ReporterOptionsType | undefined,
    private writer: WriterInterface,
    logger?: LoggerInterface,
  ) {
    super(options, logger);
  }

  /**
   * @param {TestResultType} result
   */
  public addTestResult(result: TestResultType) {
    this.results.push(result);
  }

  /**
   * @returns {Promise<void>}
   *
   * eslint-disable-next-line @typescript-eslint/require-await
   */
  public async publish() {
    const path = await this.writer.write(this.results);

    this.log(`Report saved to ${path}`);
  }
}
