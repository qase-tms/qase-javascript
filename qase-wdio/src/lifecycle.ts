import {
  Attachment,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from './storage';

export class TestLifecycle {
  constructor(private readonly storage: Storage) {}

  startTest(title: string, cid: string, startTime: number = Date.now() / 1000): void {
    const result = new TestResultType(title);
    result.execution.thread = cid;
    result.execution.start_time = startTime;
    result.id = uuidv4();
    this.storage.push(result);
  }

  startStep(title: string): void {
    const step = new TestStepType(StepType.TEXT);
    step.id = uuidv4();
    step.data = {
      action: title,
      expected_result: null,
      data: null,
    };
    step.parent_id = this.storage.getLastItem()?.id ?? null;
    step.execution.start_time = Date.now() / 1000;
    step.execution.end_time = null;
    step.execution.status = StepStatusEnum.passed;
    step.execution.duration = null;

    this.storage.getLastItem()?.steps.push(step);
    this.storage.push(step);
  }

  endStep(status: TestStatusEnum = TestStatusEnum.passed): void {
    if (!this.storage.getLastItem()) {
      return;
    }
    const step = this.storage.pop();
    if (!step) {
      return;
    }
    const endTimeSec = Date.now() / 1000;
    step.execution.end_time = endTimeSec;
    step.execution.status = status;
    // start_time/end_time are in seconds; duration must be in ms per Qase API spec.
    if (step.execution.start_time !== null) {
      step.execution.duration = Math.round((endTimeSec - step.execution.start_time) * 1000);
    }
  }

  attachJSON(name: string, json: unknown): void {
    const isStr = typeof json === 'string';
    const content = isStr ? json : JSON.stringify(json, null, 2);
    this.attachFile(name, String(content), isStr ? 'application/json' : 'text/plain');
  }

  attachFile(name: string, content: string | Buffer, contentType: string): void {
    if (!this.storage.getLastItem()) {
      throw new Error("There isn't any active test!");
    }
    const attach: Attachment = {
      file_path: null,
      size: content.length,
      id: uuidv4(),
      file_name: name,
      mime_type: contentType,
      content,
    };
    this.storage.getLastItem()?.attachments.push(attach);
  }
}
