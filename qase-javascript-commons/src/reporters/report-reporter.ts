import { AbstractReporter } from './abstract-reporter';
import { Attachment, Report, TestStatusEnum, TestStepType, StepType, TestResultType } from '../models';
import { StepTextData, StepGherkinData } from '../models/step-data';
import { WriterInterface } from '../writer';
import { LoggerInterface } from '../utils/logger';
import { getHostInfo } from '../utils/hostData';
import { HostData } from '../models/host-data';

/**
 * @class ReportReporter
 * @extends AbstractReporter
 */
export class ReportReporter extends AbstractReporter {

  private readonly environment: string | undefined;
  private readonly runId: number | undefined;
  private readonly rootSuite: string | undefined;
  private readonly hostData: HostData | undefined;
  private startTime: number = Date.now();

  /**
   * @param {LoggerInterface} logger
   * @param {WriterInterface} writer
   * @param {string} frameworkName
   * @param {string} reporterName
   * @param {string | undefined} environment
   * @param {string | undefined} rootSuite
   * @param {number | undefined} runId
   * @param {HostData | undefined} hostData
   */
  constructor(
    logger: LoggerInterface,
    private writer: WriterInterface,
    private frameworkName: string,
    private reporterName: string,
    environment?: string,
    rootSuite?: string,
    runId?: number,
    hostData?: HostData,
  ) {
    super(logger);
    this.environment = environment;
    this.runId = runId;
    this.rootSuite = rootSuite;
    this.hostData = hostData;
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

      // Serialize to spec-compliant format before writing
      const serialized = this.serializeResultForReport(result);
      await this.writer.writeTestResult(serialized as unknown as TestResultType);
    }
  }

  public async complete(): Promise<void> {
    const report: Report = {
      title: 'Test run',
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
        blocked: 0,
        invalid: 0,
        muted: 0,
      },
      results: [],
      threads: [],
      suites: [],
      environment: this.environment ?? '',
      host_data: this.hostData ?? getHostInfo(this.frameworkName, this.reporterName),
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
          report.stats.invalid++;
          break;
        case TestStatusEnum.blocked:
          report.stats.blocked++;
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

  override uploadAttachment(attachment: Attachment): Promise<string> {
    this.writer.writeAttachment([attachment]);
    return Promise.resolve('');
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
   * Serialize a test result to spec-compliant JSON format.
   * Transforms internal model fields to match the Qase Report specification.
   * @private
   */
  private serializeResultForReport(result: TestResultType): Record<string, unknown> {
    // Transform testops_id -> testops_ids (RSLT-01)
    let testopsIds: number[] | null = null;
    if (result.testops_id !== null) {
      testopsIds = Array.isArray(result.testops_id)
        ? result.testops_id
        : [result.testops_id];
    }

    // Transform group_params -> param_groups (RSLT-02)
    const paramGroups = this.transformGroupParams(result.group_params);

    // Serialize attachments (exclude size and content fields)
    const attachments = result.attachments.map(att => this.serializeAttachment(att));

    // Serialize steps (handle data.data -> data.input_data and attachments -> execution.attachments)
    const steps = this.serializeSteps(result.steps);

    // Build spec-compliant result object
    const serialized: Record<string, unknown> = {
      id: result.id,
      title: result.title,
      signature: result.signature,
      execution: result.execution,
      fields: result.fields,
      attachments: attachments,
      steps: steps,
      params: result.params,
      param_groups: paramGroups,
      testops_ids: testopsIds,
      relations: result.relations,
      muted: result.muted,
      message: result.message,
      tags: result.tags,
    };

    // Internal-only fields are excluded: testops_id, group_params, run_id, author, testops_project_mapping, preparedAttachments
    return serialized;
  }

  /**
   * Transform group_params Record to param_groups array of arrays.
   * Same logic as clientV2.ts transformGroupParams.
   * @private
   */
  private transformGroupParams(groupParams: Record<string, string>): string[][] {
    const keys = Object.keys(groupParams);
    if (keys.length === 0) {
      return [];
    }
    return [keys];
  }

  /**
   * Serialize attachment for report output (exclude size and content fields).
   * @private
   */
  private serializeAttachment(att: Attachment): Record<string, unknown> {
    return {
      id: att.id,
      file_name: att.file_name,
      mime_type: att.mime_type,
      file_path: att.file_path,
    };
  }

  /**
   * Serialize steps recursively, transforming:
   * - data.data -> data.input_data (STEP-01)
   * - attachments -> execution.attachments (STEP-02)
   * @private
   */
  private serializeSteps(steps: TestStepType[]): Record<string, unknown>[] {
    return steps.map(step => this.serializeStep(step));
  }

  /**
   * Serialize a single step to spec-compliant format.
   * @private
   */
  private serializeStep(step: TestStepType): Record<string, unknown> {
    // Transform step data (handle data.data -> data.input_data for text steps)
    const data = this.serializeStepData(step);

    // Serialize step attachments
    const attachments = step.attachments.map(att => this.serializeAttachment(att));

    // Move attachments into execution.attachments (STEP-02)
    const execution = {
      ...step.execution,
      attachments: attachments,
    };

    // Recursively serialize nested steps
    const nestedSteps = this.serializeSteps(step.steps);

    return {
      id: step.id,
      step_type: step.step_type,
      data: data,
      parent_id: step.parent_id,
      execution: execution,
      steps: nestedSteps,
      // Note: attachments field is NOT at top-level in serialized output
    };
  }

  /**
   * Serialize step data, transforming data.data -> data.input_data for text steps.
   * @private
   */
  private serializeStepData(step: TestStepType): Record<string, unknown> {
    const data = { ...step.data };

    // For text steps, rename data.data to data.input_data (STEP-01)
    if (step.step_type === StepType.TEXT && 'data' in data) {
      const textData = data as StepTextData;
      return {
        action: textData.action,
        expected_result: textData.expected_result,
        input_data: textData.data, // Rename: data -> input_data
      };
    }

    // For gherkin steps, convert to text format (STEP-03)
    if (step.step_type === StepType.GHERKIN && 'keyword' in data && 'name' in data) {
      const gherkinData = data as StepGherkinData;
      return {
        action: `${gherkinData.keyword} ${gherkinData.name}`,
        expected_result: null,
        input_data: null, // JS GherkinData has no data field
      };
    }

    // For request steps, pass raw fields through (all 7 StepRequestData fields are preserved)
    if (step.step_type === StepType.REQUEST && 'request_method' in data) {
      return data as Record<string, unknown>;
    }

    return data;
  }
}
