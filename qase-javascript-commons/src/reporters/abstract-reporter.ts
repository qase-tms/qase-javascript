import { Attachment, TestResultType } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { LoggerInterface } from '../utils/logger';

export interface InternalReporterInterface {
  addTestResult(result: TestResultType): Promise<void>;

  publish(): Promise<void>;

  startTestRun(): Promise<void>;

  getTestResults(): TestResultType[];

  setTestResults(results: TestResultType[]): void;

  sendResults(): Promise<void>;

  complete(): Promise<void>;

  uploadAttachment(attachments: Attachment): Promise<string>;
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
   * Every result id handed out so far. The id doubles as the idempotency key of the v2 results
   * API, so a framework that reuses its own identifiers (Newman replays the same item id on
   * every iteration) must not be allowed to collapse two distinct results into one.
   *
   * @type {Set<string>}
   * @private
   */
  private readonly seenResultIds = new Set<string>();

  /**
   * @returns {Promise<void>}
   */
  abstract publish(): Promise<void>;

  /**
   * @returns {Promise<void>}
   */
  abstract startTestRun(): Promise<void>;

  /**
   * @returns {Promise<void>}
   */
  abstract complete(): Promise<void>;

  /**
   * @returns {Promise<void>}
   */
  abstract sendResults(): Promise<void>;

  /**
   * @param {Attachment} attachment
   * @returns {Promise<string>}
   */
  abstract uploadAttachment(attachment: Attachment): Promise<string>;

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
    const results = this.results;

    this.results = [];

    return results;
  }

  /**
   * @param {TestResultType} result
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async addTestResult(result: TestResultType) {
    this.logger.logDebug(`Adding test result: ${JSON.stringify(result)}`);

    if (result.execution.stacktrace) {
      result.execution.stacktrace = this.removeAnsiEscapeCodes(result.execution.stacktrace);
    }

    if (result.message) {
      result.message = this.removeAnsiEscapeCodes(result.message);
    }

    if (result.testops_id === null || !Array.isArray(result.testops_id)) {
      this.ensureUniqueId(result);
      this.results.push(result);
      return;
    }

    // if we have multiple ids, we need to create multiple test results and set duration to 0 for all but the first one
    let firstCase = true;

    for (const id of result.testops_id) {
      const testResultCopy = { ...result, execution: { ...result.execution } } as TestResultType;
      testResultCopy.testops_id = id;
      testResultCopy.id = uuidv4();
      this.seenResultIds.add(testResultCopy.id);

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
    // Results built in another process (Cypress) already carry their own ids. Only fill in the
    // missing ones — reassigning an existing id would change the idempotency key of a result
    // that may already have reached Qase.
    for (const result of results) {
      if (!result.id) {
        result.id = uuidv4();
      }
      this.seenResultIds.add(result.id);
    }

    this.results = results;
  }

  /**
   * Guarantees `result.id` is set and unique within this reporter. A missing or reused id would
   * either let the backend invent a fresh idempotency key on every attempt (duplicates on
   * retry) or merge two distinct results into one (silent loss).
   *
   * @param {TestResultType} result
   * @private
   */
  private ensureUniqueId(result: TestResultType): void {
    if (!result.id || this.seenResultIds.has(result.id)) {
      result.id = uuidv4();
    }
    this.seenResultIds.add(result.id);
  }

  protected removeAnsiEscapeCodes(str: string): string {
    const ansiEscapeSequences = new RegExp([
      '\x1B[[(?);]{0,2}(;?\\d)*.',
    ].join('|'), 'g');

    return str.replace(ansiEscapeSequences, '');
  }
}
