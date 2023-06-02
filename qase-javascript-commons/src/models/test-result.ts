import { StatusesEnum } from './status';
import { TestStepType } from './test-step';
import { ParamType } from './param';

export type TestResultType = {
  id: string;
  testOpsId: [number, ...number[]];
  title: string;
  status: `${StatusesEnum}`;
  error?: Error | undefined;
  duration?: number | undefined;
  steps?: TestStepType[] | undefined;
  attachments?: string[] | undefined;
  param?: ParamType | undefined;
};
