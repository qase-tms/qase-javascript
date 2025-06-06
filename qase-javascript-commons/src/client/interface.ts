import { TestResultType } from "../models";

export interface IClient {
    createRun(): Promise<number>;
    completeRun(runId: number): Promise<void>;
    uploadResults(runId: number, results: TestResultType[]): Promise<void>;
}
