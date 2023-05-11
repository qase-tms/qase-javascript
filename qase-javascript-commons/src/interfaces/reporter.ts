import { TestResult } from "../models/test-result"

export interface Reporter {
    startRun(): void
    finishRun(): void
    addResult(result: TestResult): void
}