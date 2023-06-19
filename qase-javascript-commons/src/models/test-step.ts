export enum StepStatusEnum {
  passed = 'passed',
  failed = 'failed',
  blocked = 'blocked',
}

export type TestStepType = {
  title: string;
  status: `${StepStatusEnum}`;
  duration?: number | undefined;
  error?: Error | undefined;
  steps?: TestStepType[] | undefined;
  attachments?: string[] | undefined;
};
