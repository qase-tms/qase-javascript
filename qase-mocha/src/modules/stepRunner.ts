import { StepStatusEnum, StepType, TestStepType } from 'qase-javascript-commons';
import { extractAndCleanStep } from 'qase-javascript-commons/internal';

export class StepRunner {
  private steps: TestStepType[] = [];
  private failureFlag = false;

  reset(): void {
    this.steps = [];
    this.failureFlag = false;
  }

  getSteps(): TestStepType[] {
    return this.steps;
  }

  hasFailure(): boolean {
    return this.failureFlag;
  }

  run(title: string, func: () => void, expectedResult?: string, data?: string): void {
    const stepTitle = expectedResult || data
      ? `${title} QaseExpRes:${expectedResult ? `: ${expectedResult}` : ''} QaseData:${data ? `: ${data}` : ''}`
      : title;

    const stepData = extractAndCleanStep(stepTitle);

    const step: TestStepType = {
      step_type: StepType.TEXT,
      data: {
        action: stepData.cleanedString,
        expected_result: stepData.expectedResult,
        data: stepData.data,
      },
      execution: {
        start_time: Date.now(),
        status: StepStatusEnum.passed,
        end_time: null,
        duration: null,
      },
      id: '',
      parent_id: null,
      attachments: [],
      steps: [],
    };

    try {
      func();
    } catch {
      step.execution.status = StepStatusEnum.failed;
      this.failureFlag = true;
    }

    step.execution.end_time = Date.now();
    this.steps.push(step);
  }
}
