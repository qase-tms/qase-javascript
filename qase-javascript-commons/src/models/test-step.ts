import { AttachmentType } from "./attachment";
import { StatusesEnum } from "./status";

export type TestStepType = {
    title: string;
    status: keyof typeof StatusesEnum;
    duration?: number;
    error?: Error;
    stacktrace?: string;
    steps?: TestStepType[];
    attachements?: AttachmentType[];
}
