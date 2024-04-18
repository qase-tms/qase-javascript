import { TestResultType, Attachment, Report } from '../models';

export interface WriterInterface {
  writeReport(results: Report): Promise<string>;
  writeTestResult(result: TestResultType): Promise<void>;
  writeAttachment(attachments: Attachment[]): Attachment[];
  clearPreviousResults(): void;
}
