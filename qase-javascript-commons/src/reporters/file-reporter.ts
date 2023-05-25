import { writeFileSync } from 'fs';

import { AbstractReporter, ReporterOptionsType, LoggerInterface } from './reporter';

import { TestResultType } from '../models';

export type FileReporterOptionsType = {
    path: string;
};

export class FileReporter extends AbstractReporter {
    private path: string;
    private results: TestResultType[] = [];

    constructor(options: ReporterOptionsType & FileReporterOptionsType, logger?: LoggerInterface) {
        const { path, ...restOptions } = options;

        super(restOptions, logger);

        this.path = path;
    }

    public addTestResult(result: TestResultType) {
        this.results.push(result);
    }

    public publish() {
        writeFileSync(this.path, JSON.stringify(this.results));
    }
}
