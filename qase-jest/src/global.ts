import { JestQaseReporter } from './reporter';
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
  private reporter: JestQaseReporter;

  constructor(reporter: JestQaseReporter) {
    this.reporter = reporter;
  }

  title(title: string): void {
    this.reporter.addTitle(title);
  }

  ignore(): void {
    this.reporter.addIgnore();
  }

  comment(value: string): void {
    this.reporter.addComment(value);
  }

  suite(value: string): void {
    this.reporter.addSuite(value);
  }

  fields(values: Record<string, string>): void {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      stringRecord[String(key)] = String(value);
    }
    this.reporter.addFields(stringRecord);
  }

  parameters(values: Record<string, string>): void {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      stringRecord[String(key)] = String(value);
    }
    this.reporter.addParameters(stringRecord);
  }

  groupParams(values: Record<string, string>): void {
    const stringRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      stringRecord[String(key)] = String(value);
    }
    this.reporter.addGroupParams(stringRecord);
  }

  step(step: TestStepType): void {
    this.reporter.addStep(step);
  }

  attachment(attachment: Attachment): void {
    this.reporter.addAttachment(attachment);
  }
}

export {};
