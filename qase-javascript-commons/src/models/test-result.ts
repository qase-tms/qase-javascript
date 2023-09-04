import { TestStepType } from './test-step';

/**
 * @enum {string}
 */
export enum TestStatusEnum {
  passed = 'passed',
  failed = 'failed',
  skipped = 'skipped',
  disabled = 'disabled',
  blocked = 'blocked',
  invalid = 'invalid',
}

export type TestResultType = {
  id: string;
  testOpsId: number[];
  title: string;
  status: `${TestStatusEnum}`;
  suiteTitle?: string | string[] | undefined;
  error?: Error | undefined;
  startTime?: number | undefined;
  duration?: number | undefined;
  endTime?: number | undefined;
  steps?: TestStepType[] | undefined;
  attachments?: string[] | undefined;
};
