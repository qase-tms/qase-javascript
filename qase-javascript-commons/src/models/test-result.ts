import { Attachment } from './attachment';
import { Statuses } from './status';
import { TestStep } from './test-step';

export interface TestResult {
    id?: string;
    testOpsId?: number[];
    title: string;
    status: keyof typeof Statuses;
    error?: Error;
    stacktrace?: string;
    duration?: number;
    suitePath?: string;
    comment?: string;
    steps?: TestStep[];
    attachments?: Attachment[];
    param?: {};
}