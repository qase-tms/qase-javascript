import { AxiosError } from 'axios';
import get from 'lodash.get';

import { TestResultType } from '../models';

import { QaseError } from '../utils/qase-error';
import { isAxiosError } from '../utils/is-axios-error';

export interface LoggerInterface {
  log(message: string): void;
  group(): void;
  groupEnd(): void;
}

export type ReporterOptionsType = {
  debug?: boolean | undefined;
};

export interface ReporterInterface {
  addTestResult(result: TestResultType): void;
  publish(): Promise<void>;
  getTestResults(): TestResultType[];
  setTestResults(results: TestResultType[]): void;
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

  protected results: TestResultType[] = [];

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
   * @returns {TestResultType[]}
   */
  public getTestResults(): TestResultType[] {
    return this.results;
  }

  /**
   * @param {TestResultType[]} results
   */
  public setTestResults(results: TestResultType[]): void {
    this.results = results;
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

  /**
   * @param {string} message
   * @param error
   * @protected
   */
  protected logError(message: string, error?: unknown): void {
    this.doLogError(`qase: ${message}`, error);
  }

  /**
   * @param {string} message
   * @param error
   * @private
   */
  private doLogError(message: string, error?: unknown): void {
    this.logger.log(message);
    this.logger.group();

    if (error instanceof Error) {
      if (isAxiosError(error)) {
        this.logApiError(error);
      } else if (error instanceof QaseError && error.cause) {
        this.doLogError('Caused by:', error.cause);
      }

      this.logger.log(`${error.stack || `${error.name}: ${error.message}`}`);
    } else {
      this.logger.log(String(error));
    }

    this.logger.groupEnd();
  }

  /**
   * @param {AxiosError} error
   * @private
   */
  private logApiError(error: AxiosError) {
    const errorMessage: unknown = get(error, 'response.data.errorMessage')
      ?? get(error, 'response.data.error')
      ?? get(error, 'response.statusText')
      ?? 'Unknown error';

    const errorFields = this.formatErrorFields(
      get(error, 'response.data.errorFields'),
    );

    this.logger.log(`Message: ${String(errorMessage)}`);

    if (errorFields) {
      this.logger.group();
      this.logger.log(errorFields);
      this.logger.groupEnd();
    }
  }

  /**
   * @param errorFields
   * @returns {string | undefined}
   * @private
   */
  private formatErrorFields(errorFields: unknown): string | undefined {
    if (Array.isArray(errorFields)) {
      return errorFields.reduce<string>((acc, item: unknown) => {
        const field: unknown = get(item, 'field');
        const error: unknown = get(item, 'error');

        if (field && error) {
          return acc + `${String(field)}: ${String(error)}\n`;
        }

        return acc;
      }, '');
    }

    return undefined;
  }
}
