import { AbstractReporter } from './abstract-reporter';
import { Report, TestStatusEnum, TestStepType } from '../models';
import { WriterInterface } from '../writer';
import { LoggerInterface } from '../utils/logger';
import { getHostInfo } from '../utils/hostData';

/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
export class ReportReporter extends AbstractReporter {
  private readonly environment: string | undefined;
  private readonly runId: number | undefined;
  private readonly rootSuite: string | undefined;
  private startTime: number = Date.now();

  /**
   * @param {LoggerInterface} logger
   * @param {WriterInterface} writer
   * @param {string} frameworkName
   * @param {string} reporterName
   * @param {string | undefined} environment
   * @param {string | undefined} rootSuite
   * @param {number | undefined} runId
   */
  constructor(
    logger: LoggerInterface,
    private writer: WriterInterface,
    private frameworkName: string,
    private reporterName: string,
    environment?: string,
    rootSuite?: string,
    runId?: number,
  ) {
    super(logger);
    this.environment = environment;
    this.runId = runId;
    this.rootSuite = rootSuite;
  }

  /**
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async startTestRun(): Promise<void> {
    this.startTime = Date.now();
  }

  /**
   * @returns {Promise<void>}
   *
   */
  public async publish(): Promise<void> {
    await this.sendResults();
    await this.complete();
  }

  public async sendResults(): Promise<void> {
    this.writer.clearPreviousResults();

    for (const result of this.results) {
      if (result.attachments.length > 0) {
        result.attachments = this.writer.writeAttachment(result.attachments);
      }

      result.steps = this.copyStepAttachments(result.steps);
      result.run_id = this.runId ?? null;
      if (result.relations != null && this.rootSuite != null) {
        const data = {
          title: this.rootSuite,
          public_id: null,
        };

        result.relations.suite?.data.unshift(data);
      } else if (this.rootSuite != null) {
        result.relations = {
          suite: {
            data: [
              {
                title: this.rootSuite,
                public_id: null,
              },
            ],
          },
        };
      }

      await this.writer.writeTestResult(result);
    }
  }

  public async complete(): Promise<void> {
    this.writer.clearPreviousResults();

    const report: Report = {
      title: 'Test report',
      execution: {
        start_time: this.startTime,
        end_time: Date.now(),
        duration: Date.now() - this.startTime,
        cumulative_duration: 0,
      },
      stats: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        broken: 0,
        muted: 0,
      },
      results: [],
      threads: [],
      suites: [],
      environment: this.environment ?? '',
      host_data: getHostInfo(this.frameworkName, this.reporterName),
    };

    for (const result of this.results) {
      report.stats.total++;
      switch (result.execution.status) {
        case TestStatusEnum.passed:
          report.stats.passed++;
          break;
        case TestStatusEnum.failed:
          report.stats.failed++;
          break;
        case TestStatusEnum.skipped:
          report.stats.skipped++;
          break;
        case TestStatusEnum.invalid:
          report.stats.broken++;
          break;
        case TestStatusEnum.blocked:
          report.stats.muted++;
          break;
      }

      report.execution.cumulative_duration += result.execution.duration ?? 0;

      report.results.push({
        duration: result.execution.duration ?? 0,
        id: result.id,
        status: result.execution.status,
        thread: result.execution.thread,
        title: result.title,
      });
    }

    const path = await this.writer.writeReport(report);

    this.logger.log(`Report saved to ${path}`);
  }

  /**
   * @param {TestStepType[]} steps
   * @returns {TestStepType[]}
   */
  private copyStepAttachments(steps: TestStepType[]): TestStepType[] {
    for (const step of steps) {
      if (step.attachments.length > 0) {
        step.attachments = this.writer.writeAttachment(step.attachments);
      }

      if (step.steps.length > 0) {
        step.steps = this.copyStepAttachments(step.steps);
      }
    }

    return steps;
  }
}
