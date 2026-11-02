import { TestcafeQaseReporter } from './reporter';
import { Attachment, TestStepType } from 'qase-javascript-commons';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      Qase: Qase;
    }
  }
}

export class Qase {
  private reporter: TestcafeQaseReporter;

  constructor(reporter: TestcafeQaseReporter) {
    this.reporter = reporter;
  }

  step(step: TestStepType, testRunId?: string | null): void {
    this.reporter.addStep(step, testRunId);
  }

  attachment(attachment: Attachment, testRunId?: string | null): void {
    this.reporter.addAttachment(attachment, testRunId);
  }
}

export {};
