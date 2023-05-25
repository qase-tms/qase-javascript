import { TestResultType } from '../models';

export interface LoggerInterface {
    log(message: string): void;
}

export type ReporterOptionsType = {
    logging?: boolean | undefined;
}

export interface ReporterInterface {
    addTestResult(result: TestResultType): void;
    publish(): void;
}

export abstract class AbstractReporter implements ReporterInterface {
    private logging?: boolean;

    abstract addTestResult(result: TestResultType): void;
    abstract publish(): void;

    protected constructor(
        options: ReporterOptionsType,
        private logger: LoggerInterface = console,
    ) {
        const { logging = true } = options;

        this.logging = logging;
    }

    protected log(message: string) {
        if (this.logging) {
            this.logger.log(`qase: ${message}`);
        }
    }
}
