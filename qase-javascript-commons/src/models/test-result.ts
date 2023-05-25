import { StatusesEnum } from './status';
import { TestStepType } from './test-step';
import { AttachmentType } from './attachment';
import { ParamType } from './param';

export type TestResultType = {
    id: string;
    testOpsId?: number[];
    title: string;
    status: keyof typeof StatusesEnum;
    error?: Error;
    stacktrace?: string;
    duration?: number;
    suitePath?: string;
    comment?: string;
    steps?: TestStepType[];
    attachments?: AttachmentType[];
    param?: ParamType;
}
