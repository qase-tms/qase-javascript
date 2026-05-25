import { TestStep } from '@playwright/test/reporter';
import {
  StepStatusEnum,
  StepType,
  TestStepType,
} from 'qase-javascript-commons';
import { extractAndCleanStep } from 'qase-javascript-commons/internal';
import { v4 as uuidv4 } from 'uuid';
import { StepIndex } from './step-index';

const stepAttachRegexp = /^step_attach_(body|file)_(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})_/i;
const defaultSteps: string[] = ['Before Hooks', 'After Hooks', 'Worker Cleanup'];

export class StepConverter {
  constructor(private readonly stepIndex: StepIndex) {}

  transform(testSteps: TestStep[], parentId: string | null): TestStepType[] {
    const steps: TestStepType[] = [];

    for (const testStep of testSteps) {
      if ((testStep.category !== 'test.step' && testStep.category !== 'hook')
        || testStep.title.match(stepAttachRegexp)) {
        continue;
      }

      if (defaultSteps.includes(testStep.title) && this.hasOnlyLeafCategories(testStep.steps)) {
        continue;
      }

      const attachments = this.stepIndex.getStepAttachments(testStep);
      const stepData = extractAndCleanStep(testStep.title);

      const id = uuidv4();
      const step: TestStepType = {
        id,
        step_type: StepType.TEXT,
        data: {
          action: stepData.cleanedString,
          expected_result: stepData.expectedResult,
          data: stepData.data,
        },
        parent_id: parentId,
        execution: {
          status: testStep.error ? StepStatusEnum.failed : StepStatusEnum.passed,
          start_time: testStep.startTime.valueOf() / 1000,
          duration: testStep.duration,
          end_time: (testStep.startTime.valueOf() + testStep.duration) / 1000,
        },
        attachments: attachments ? attachments : [],
        steps: this.transform(testStep.steps, id),
      };

      steps.push(step);
    }

    return steps;
  }

  hasOnlyLeafCategories(steps: TestStep[]): boolean {
    if (steps.length === 0) {
      return true;
    }
    for (const step of steps) {
      if (step.category === 'test.step' || step.category === 'hook') {
        return false;
      }
    }
    return true;
  }
}
