import { TestResultType } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { LoggerInterface } from '../utils/logger';

export interface InternalReporterInterface {
  addTestResult(result: TestResultType): Promise<void>;

  publish(): Promise<void>;

  startTestRun(): Promise<void>;

  getTestResults(): TestResultType[];

  setTestResults(results: TestResultType[]): void;
}

/**
 * @abstract
 * @class AbstractReporter
 * @implements InternalReporterInterface
 */
export abstract class AbstractReporter implements InternalReporterInterface {
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
   * @protected
   * @param {LoggerInterface} logger
   */
  protected constructor(logger: LoggerInterface) {
    this.logger = logger;
  }

  /**
   * @returns {TestResultType[]}
   */
  public getTestResults(): TestResultType[] {
    return this.results;
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
