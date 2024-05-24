export enum StepStatusEnum {
  passed = 'passed',
  failed = 'failed',
  blocked = 'blocked',
  skipped = 'skipped',
}

export interface StepExecution {
  start_time: number | null;
  status: StepStatusEnum;
  end_time: number | null;
  duration: number | null;
}
