import path from 'path';
import { writeFileSync, mkdirSync } from 'fs';

import { AbstractReporter, ReporterOptionsType, LoggerInterface } from './reporter';

import { TestResultType } from '../models';
import stripAnsi from "strip-ansi";

export type FileReporterOptionsType = {
    path: string;
};

export class FileReporter extends AbstractReporter {
    private path: string;
    private results: TestResultType[] = [];

    // TODO: reporter should take writer and formatter instances
    constructor(
        options: ReporterOptionsType & FileReporterOptionsType,
        logger?: LoggerInterface,
    ) {
        const { path, ...restOptions } = options;

        super(restOptions, logger);

        this.path = path;
    }

    public addTestResult(result: TestResultType) {
        this.results.push(result);
    }

    public publish() {
        try {
            mkdirSync(this.path, { recursive: true });
        } catch (error) {/* ignore */}

        const filePath = path.join(this.path, `results-${Date.now()}.json`);
        const json = JSON.stringify(this.results, (key, value: unknown) => {
            if (key === 'error' && value instanceof Error) {
                return stripAnsi(String(value));
            }

            return value;
        }, 4)

        writeFileSync(filePath, json);

        this.log(`Report saved to ${filePath}`);
    }
}
