import { AbstractReporter, LoggerInterface, ReporterOptionsType } from './abstract-reporter';
import { Report, TestResultType, TestStatusEnum, TestStepType } from '../models';
import { WriterInterface } from '../writer';

/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
export class ReportReporter extends AbstractReporter {

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
  public async publish(): Promise<void> {
    const report: Report = {
      title: 'Test report',
      execution: {
        start_time: 0,
        end_time: 0,
        duration: 0,
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
      environment: '',
      host_data: {
        system: '',
        node: '',
        release: '',
        version: '',
        machine: '',
        python: '',
        pip: '',
      },
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

      if (result.execution.thread && !report.threads.includes(result.execution.thread)) {
        report.threads.push(result.execution.thread);
      }

      report.execution.cumulative_duration += result.execution.duration ?? 0;

      report.results.push({
        duration: result.execution.duration ?? 0,
        id: result.id,
        status: result.execution.status,
        thread: result.execution.thread,
        title: result.title,
      });

      if (result.attachments.length > 0) {
        result.attachments = this.writer.writeAttachment(result.attachments);
      }

      result.steps = this.copyStepAttachments(result.steps);

      await this.writer.writeTestResult(result);
    }

    const path = await this.writer.writeReport(report);

    this.log(`Report saved to ${path}`);
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
