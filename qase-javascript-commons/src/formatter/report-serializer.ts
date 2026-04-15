import { Attachment, TestResultType, TestStepType, StepType } from '../models';
import { StepTextData, StepGherkinData } from '../models/step-data';

export interface ReportSerializerInterface {
  serializeResult(result: TestResultType): Record<string, unknown>;
  serializeStep(step: TestStepType): Record<string, unknown>;
  serializeAttachment(att: Attachment): Record<string, unknown>;
}

/**
 * Transforms internal TestResultType / TestStepType into Qase Report
 * spec-compliant JSON (RSLT-01/02, STEP-01/02/03 rules).
 *
 * Pure: no I/O, no logger, no state. Suitable for golden-testing.
 */
export class ReportSerializer implements ReportSerializerInterface {
  serializeResult(result: TestResultType): Record<string, unknown> {
    const testopsIds = this.transformTestopsIds(result.testops_id);
    const paramGroups = this.transformGroupParams(result.group_params);

    return {
      id: result.id,
      title: result.title,
      signature: result.signature,
      execution: result.execution,
      fields: result.fields,
      attachments: result.attachments.map((a) => this.serializeAttachment(a)),
      steps: result.steps.map((s) => this.serializeStep(s)),
      params: result.params,
      param_groups: paramGroups,
      testops_ids: testopsIds,
      relations: result.relations,
      muted: result.muted,
      message: result.message,
      tags: result.tags,
    };
  }

  serializeStep(step: TestStepType): Record<string, unknown> {
    const data = this.serializeStepData(step);
    const attachments = step.attachments.map((a) => this.serializeAttachment(a));

    return {
      id: step.id,
      step_type: step.step_type,
      data,
      parent_id: step.parent_id,
      execution: { ...step.execution, attachments },
      steps: step.steps.map((s) => this.serializeStep(s)),
    };
  }

  serializeAttachment(att: Attachment): Record<string, unknown> {
    return {
      id: att.id,
      file_name: att.file_name,
      mime_type: att.mime_type,
      file_path: att.file_path,
    };
  }

  private transformTestopsIds(testopsId: unknown): number[] | null {
    if (testopsId === null) return null;
    return Array.isArray(testopsId)
      ? (testopsId as number[])
      : [testopsId as number];
  }

  private transformGroupParams(
    groupParams: Record<string, string>,
  ): string[][] {
    const keys = Object.keys(groupParams);
    return keys.length === 0 ? [] : [keys];
  }

  private serializeStepData(step: TestStepType): Record<string, unknown> {
    const data = { ...step.data } as unknown as Record<string, unknown>;

    if (step.step_type === StepType.TEXT && 'data' in data) {
      const textData = data as unknown as StepTextData;
      return {
        action: textData.action,
        expected_result: textData.expected_result,
        input_data: textData.data,
      };
    }

    if (
      step.step_type === StepType.GHERKIN &&
      'keyword' in data &&
      'name' in data
    ) {
      const gherkinData = data as unknown as StepGherkinData;
      return {
        action: `${gherkinData.keyword} ${gherkinData.name}`,
        expected_result: null,
        input_data: null,
      };
    }

    if (step.step_type === StepType.REQUEST && 'request_method' in data) {
      return data;
    }

    return data;
  }
}
