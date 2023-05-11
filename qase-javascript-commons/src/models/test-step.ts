import { Attachment } from "./attachment";
import { Statuses } from "./status";

export interface TestStep {
    title: string;
    status: keyof typeof Statuses;
    duration?: number;
    error?: Error;
    stacktrace?: string;
    steps?: TestStep[];
    attachements?: Attachment[];
}