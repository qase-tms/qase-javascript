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
      step.execution.start_time = message.timestamp;
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

    for (const step of steps.sort((a, b) => a.timestamp - b.timestamp)) {
      if (!('status' in step)) {
        const newStep = new TestStepType();
        newStep.id = step.id;
        newStep.execution.status = StepStatusEnum.failed;
        newStep.execution.start_time = step.timestamp;
        newStep.execution.end_time = Date.now();
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
      } else {
        const stepType = stepMap.get(step.id);
        if (stepType) {
          stepType.execution.status = step.status as StepStatusEnum;
          stepType.execution.end_time = step.timestamp;
        }
      }
    }

    return result;
  }
}
