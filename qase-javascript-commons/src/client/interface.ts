import { Attachment, TestResultType } from "../models";

export interface IClient {
    createRun(): Promise<number>;
    completeRun(runId: number): Promise<boolean>;
    uploadResults(runId: number, results: TestResultType[]): Promise<void>;
    uploadAttachment(attachment: Attachment): Promise<string>;
    enablePublicReport(runId: number): Promise<void>;
}
