import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Attachment, StepStatusEnum, TestStepType } from '../models';

export type StepFunction<T = unknown> = (
  this: QaseStep,
  step: QaseStep,
) => T | Promise<T>;

export class QaseStep {
  name = '';
  attachments: Attachment[] = [];
  steps: TestStepType[] = [];

  constructor(name: string) {
    this.name = name;
  }

  attach(attach: {
    name?: string;
    type?: string;
    content?: string;
    paths?: string[] | string;
  }): void {
    if (attach.paths) {
      const files = Array.isArray(attach.paths) ? attach.paths : [attach.paths];

      for (const file of files) {
        const attachmentName = path.basename(file);
        const contentType = 'application/octet-stream';
        this.attachments.push({
          id: uuidv4(),
          file_name: attachmentName,
          mime_type: contentType,
          content: '',
          file_path: file,
          size: 0,
        });
      }

      return;
    }

    if (attach.content) {
      const attachmentName = attach.name ?? 'attachment';
      const contentType = attach.type ?? 'application/octet-stream';

      this.attachments.push({
        id: uuidv4(),
        file_name: attachmentName,
        mime_type: contentType,
        content: attach.content,
        file_path: null,
        size: attach.content.length,
      });
    }
  }

  async step(name: string, body: StepFunction): Promise<void> {
    const childStep = new QaseStep(name);
    // eslint-disable-next-line @typescript-eslint/require-await
    await childStep.run(body, async (step: TestStepType) => {
      this.steps.push(step);
    });
  }

  async run(body: StepFunction, messageEmitter: (step: TestStepType) => Promise<void>): Promise<void> {
    const startMs = Date.now();
    const step = new TestStepType();
    step.data = {
      action: this.name,
      expected_result: null,
      data: null,
    };

    // Per Qase API spec: start_time / end_time are Unix epoch seconds (with
    // fractional ms); duration is milliseconds.
    const buildExecution = (status: StepStatusEnum, endMs: number) => ({
      start_time: startMs / 1000,
      end_time: endMs / 1000,
      status,
      duration: endMs - startMs,
    });

    try {
      await body.call(this, this);

      step.execution = buildExecution(StepStatusEnum.passed, Date.now());

      step.attachments = this.attachments;
      step.steps = this.steps;

      await messageEmitter(step);
    } catch (error: unknown) {
      step.execution = buildExecution(StepStatusEnum.failed, Date.now());

      step.attachments = this.attachments;
      step.steps = this.steps;

      await messageEmitter(step);

      throw error;
    }
  }
}
