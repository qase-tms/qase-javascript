import { Attachment, StepType, TestStepType } from 'qase-javascript-commons';
import { extractAndCleanStep } from 'qase-javascript-commons/internal';
import { Metadata } from '../models';

export class MetadataApplier {
  private metadata: Metadata = MetadataApplier.empty();

  static empty(): Metadata {
    return {
      title: undefined,
      ignore: false,
      comment: undefined,
      suite: undefined,
      fields: {},
      parameters: {},
      groupParams: {},
      tags: [],
      steps: [],
      attachments: [],
    };
  }

  get(): Metadata {
    return this.metadata;
  }

  reset(): void {
    this.metadata = MetadataApplier.empty();
  }

  applyTitle(value: string): void {
    this.metadata.title = value;
  }

  applyComment(value: string): void {
    this.metadata.comment = value;
  }

  applySuite(value: string): void {
    this.metadata.suite = value;
  }

  applyFields(values: Record<string, string>): void {
    this.metadata.fields = values;
  }

  applyParameters(values: Record<string, string>): void {
    this.metadata.parameters = values;
  }

  applyGroupParams(values: Record<string, string>): void {
    this.metadata.groupParams = values;
  }

  applyTags(values: string[]): void {
    this.metadata.tags.push(...values);
  }

  applyIgnore(): void {
    this.metadata.ignore = true;
  }

  applyAttachment(attachment: Attachment): void {
    this.metadata.attachments.push(attachment);
  }

  applyStep(step: TestStepType): void {
    const isTextStep =
      step.step_type === StepType.TEXT ||
      (step.step_type as StepType | undefined) === undefined ||
      String(step.step_type) === 'text';

    if (isTextStep && 'action' in step.data) {
      const stepTextData = step.data as {
        action: string;
        expected_result: string | null;
        data: string | null;
      };
      const cleaned = extractAndCleanStep(stepTextData.action);
      stepTextData.action = cleaned.cleanedString;
      stepTextData.expected_result = cleaned.expectedResult;
      stepTextData.data = cleaned.data;
    }
    this.metadata.steps.push(step);
  }
}
