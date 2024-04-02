import { AbstractReporter, LoggerInterface, ReporterOptionsType } from './abstract-reporter';
import { Report, TestResultType, TestStatusEnum, TestStepType } from '../models';
import { WriterInterface } from '../writer';
import { HostData } from '../models/host-data';
import * as os from 'os';
import * as cp from 'child_process';
import * as process from 'process';

/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
export class ReportReporter extends AbstractReporter {
  private readonly environment: string | undefined;
  private readonly runId: number | undefined;
  private readonly startTime: number = Date.now();

  /**
   * @param {ReporterOptionsType} options
   * @param {WriterInterface} writer
   * @param {LoggerInterface} logger
   * @param {string | undefined} environment
   * @param {number | undefined} runId
   */
  constructor(
    options: ReporterOptionsType | undefined,
    private writer: WriterInterface,
    logger?: LoggerInterface,
    environment?: string,
    runId?: number,
  ) {
    super(options, logger);
    this.environment = environment;
    this.runId = runId;
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
      host_data: this.getHostInfo(),
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
      result.run_id = this.runId ?? null;
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

  /**
   * @returns {HostData}
   */
  private getHostInfo(): HostData {
    return {
      system: process.platform,
      node: this.getComputerName(),
      release: os.release(),
      version: this.getDetailedOSInfo(),
      machine: os.arch(),
      python: '',
      pip: '',
      node_version: cp.execSync('node --version').toString().trim(),
      npm: cp.execSync('npm --version').toString().trim(),
    };
  }

  /**
   * @returns {string}
   */
  private getComputerName(): string {
    switch (process.platform) {
      case 'win32':
        return process.env['COMPUTERNAME'] ?? '';
      case 'darwin':
        return cp.execSync('scutil --get ComputerName').toString().trim();
      case 'linux': {
        const prettyname = cp.execSync('hostnamectl --pretty').toString().trim();
        return prettyname === '' ? os.hostname() : prettyname;
      }
      default:
        return os.hostname();
    }
  }

  /**
   * @returns {string}
   */
  private getDetailedOSInfo(): string {
    if (process.platform === 'darwin') {
      return cp.execSync('uname -a').toString().trim();
    } else {
      return `${os.type()} ${os.release()} ${os.arch()}`;
    }
  }
}
