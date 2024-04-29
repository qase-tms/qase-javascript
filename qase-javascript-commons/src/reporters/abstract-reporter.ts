import { TestResultType } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';

export interface LoggerInterface {
  log(message: string): void;

  logError(message: string, error?: unknown): void;

  logDebug(message: string): void;
}

export interface ReporterOptionsType {
  debug?: boolean | undefined;
  captureLogs?: boolean | undefined;
}

export interface ReporterInterface {
  addTestResult(result: TestResultType): Promise<void>;

  publish(): Promise<void>;

  startTestRun(): Promise<void>;

  getTestResults(): TestResultType[];

  setTestResults(results: TestResultType[]): void;

  isCaptureLogs(): boolean;
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
  private readonly captureLogs: boolean | undefined;

  /**
   * @type {LoggerInterface}
   * @private
   */
  protected readonly logger: LoggerInterface;

  /**
   * @type {TestResultType[]}
   * @protected
   */
  protected results: TestResultType[] = [];

  /**
   * @returns {Promise<void>}
   */
  abstract publish(): Promise<void>;

  /**
   * @returns {Promise<void>}
   */
  abstract startTestRun(): Promise<void>;

  /**
   * @param {ReporterOptionsType} options
   * @protected
   */
  protected constructor(
    options: ReporterOptionsType | undefined,
  ) {
    const { debug, captureLogs } = options ?? {};

    this.captureLogs = captureLogs;
    this.logger = new Logger({ debug });
  }

  /**
   * @returns {TestResultType[]}
   */
  public getTestResults(): TestResultType[] {
    return this.results;
  }

  /**
   * @returns {boolean}
   */
  public isCaptureLogs(): boolean {
    return this.captureLogs ?? false;
  }

  /**
   * @param {TestResultType} result
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async addTestResult(result: TestResultType) {
    this.logger.logDebug(`Adding test result: ${JSON.stringify(result)}`);

    if (result.testops_id === null || !Array.isArray(result.testops_id)) {
      this.results.push(result);
      return;
    }

    // if we have multiple ids, we need to create multiple test results and set duration to 0 for all but the first one
    let firstCase = true;

    for (const id of result.testops_id) {
      const testResultCopy = { ...result };
      testResultCopy.testops_id = id;
      testResultCopy.id = uuidv4();

      if (!firstCase) {
        testResultCopy.execution.duration = 0;
      }

      firstCase = false;
      this.results.push(testResultCopy);
    }
  }

  /**
   * @param {TestResultType[]} results
   */
  public setTestResults(results: TestResultType[]): void {
    this.results = results;
  }
}
