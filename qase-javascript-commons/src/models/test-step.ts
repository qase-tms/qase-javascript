import { StatusesEnum } from './status';

export type TestStepType = {
  title: string;
  status: `${StatusesEnum}`;
  duration?: number | undefined;
  error?: Error | undefined;
  steps?: TestStepType[] | undefined;
  attachments?: string[] | undefined;
};
