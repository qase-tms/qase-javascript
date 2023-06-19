import { TestResultType } from '../models';

export interface LoggerInterface {
  log(message: string): void;
}

export type ReporterOptionsType = {
  debug?: boolean | undefined;
};

export interface ReporterInterface {
  addTestResult(result: TestResultType): void;
  publish(): Promise<void>;
}

/**
 * @abstract
 * @class AbstractReporter
 * @implements ReporterInterface
 */
export abstract class AbstractReporter implements ReporterInterface {
  /**
   * @type {boolean | undefined}
   * @private
   */
  private debug: boolean | undefined;

  /**
   * @param {TestResultType} result
   */
  abstract addTestResult(result: TestResultType): void;

  /**
   * @returns {Promise<void>}
   */
  abstract publish(): Promise<void>;

  /**
   * @param {ReporterOptionsType} options
   * @param {LoggerInterface} logger
   * @protected
   */
  protected constructor(
    options: ReporterOptionsType | undefined,
    private logger: LoggerInterface = console,
  ) {
    const { debug } = options ?? {};

    this.debug = debug;
  }

  /**
   * @param {string} message
   * @protected
   */
  protected log(message: string) {
    if (this.debug) {
      this.logger.log(`qase: ${message}`);
    }
  }
}
