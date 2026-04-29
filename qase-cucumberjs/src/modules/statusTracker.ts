import { TestStepFinished } from '@cucumber/messages';
import { CompoundError, TestStatusEnum, determineTestStatus } from 'qase-javascript-commons';
import { STATUS_MAP } from './statusMaps';

export class StatusTracker {
  private results: Record<string, TestStatusEnum> = {};
  private errors: Record<string, string[]> = {};

  onTestStarted(testCaseStartedId: string): void {
    this.results[testCaseStartedId] = TestStatusEnum.passed;
  }

  applyStep(step: TestStepFinished): void {
    const oldStatus = this.results[step.testCaseStartedId];

    let error: Error | null = null;
    if (step.testStepResult.message) {
      error = new Error(step.testStepResult.message);
    }

    const newStatus = determineTestStatus(error, STATUS_MAP[step.testStepResult.status]);

    if (newStatus !== TestStatusEnum.passed) {
      if (step.testStepResult.message) {
        if (!this.errors[step.testCaseStartedId]) {
          this.errors[step.testCaseStartedId] = [];
        }
        this.errors[step.testCaseStartedId]?.push(step.testStepResult.message);
      }

      if (oldStatus) {
        if (oldStatus !== TestStatusEnum.failed && oldStatus !== TestStatusEnum.invalid) {
          this.results[step.testCaseStartedId] = newStatus;
        }
      } else {
        this.results[step.testCaseStartedId] = newStatus;
      }
    }
  }

  getStatus(testCaseStartedId: string): TestStatusEnum {
    return this.results[testCaseStartedId] ?? TestStatusEnum.passed;
  }

  getErrors(testCaseStartedId: string): CompoundError | undefined {
    const messages = this.errors[testCaseStartedId];
    if (!messages) return undefined;

    const err = new CompoundError();
    messages.forEach((message) => {
      err.addMessage(message);
      err.addStacktrace(message);
    });
    return err;
  }
}
