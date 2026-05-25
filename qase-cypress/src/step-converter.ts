import {
  Attachment,
  StepStatusEnum,
  StepType,
  TestStepType,
} from 'qase-javascript-commons';
import type { StepEnd, StepStart } from './metadata/models';

export class StepConverter {
  convertCypressMessages(messages: StepStart[], testStatus: string): TestStepType[] {
    const result: TestStepType[] = [];

    const lastIndex = messages.length - 1;
    for (const message of messages) {
      const step = new TestStepType(StepType.TEXT);
      step.id = message.id;
      step.execution.status = StepStatusEnum.passed;
      // timestamps from cypress metadata are ms-since-epoch; Qase API expects
      // start_time/end_time in Unix seconds (with fractional ms).
      step.execution.start_time = message.timestamp / 1000;
      step.data = {
        action: message.name,
        expected_result: null,
        data: null,
      };

      if (lastIndex === messages.indexOf(message) && testStatus !== 'passed') {
        step.execution.status = StepStatusEnum.failed;
      }

      result.push(step);
    }

    return result;
  }

  getSteps(steps: (StepStart | StepEnd)[], attachments: Record<string, Attachment[]>): TestStepType[] {
    const result: TestStepType[] = [];
    const stepMap = new Map<string, TestStepType>();
    const startMsById = new Map<string, number>();

    for (const step of steps.sort((a, b) => a.timestamp - b.timestamp)) {
      if (!('status' in step)) {
        const newStep = new TestStepType();
        newStep.id = step.id;
        // Status starts as `failed` and is overwritten when the matching END
        // event arrives. If no END is ever received (timeout/crash), the step
        // remains failed which preserves the original intent.
        newStep.execution.status = StepStatusEnum.failed;
        // timestamps are ms-since-epoch; API expects Unix seconds.
        newStep.execution.start_time = step.timestamp / 1000;
        // end_time stays null until the matching END event arrives — do NOT
        // pre-fill with Date.now(), that produces a fake end time that sticks
        // around if the step never finishes.
        newStep.execution.end_time = null;
        newStep.data = {
          action: step.name,
          expected_result: null,
          data: null,
        };

        if (attachments[step.id]) {
          newStep.attachments = attachments[step.id] ?? [];
        }

        const parentId = step.parentId;
        if (parentId) {
          newStep.parent_id = parentId;
          const parent = stepMap.get(parentId);
          if (parent) {
            parent.steps.push(newStep);
          } else {
            result.push(newStep);
          }
        } else {
          result.push(newStep);
        }

        stepMap.set(step.id, newStep);
        startMsById.set(step.id, step.timestamp);
      } else {
        const stepType = stepMap.get(step.id);
        if (stepType) {
          stepType.execution.status = step.status as StepStatusEnum;
          stepType.execution.end_time = step.timestamp / 1000;
          const startMs = startMsById.get(step.id);
          if (startMs !== undefined) {
            stepType.execution.duration = step.timestamp - startMs;
          }
        }
      }
    }

    return result;
  }
}
