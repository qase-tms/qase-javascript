export enum StepStatusEnum {
  passed = 'passed',
  failed = 'failed',
  blocked = 'blocked',
  skipped = 'skipped',
}

export class StepExecution {
  start_time: number | null;
  status: StepStatusEnum;
  end_time: number | null;
  duration: number | null;

  constructor() {
    this.status = StepStatusEnum.passed;
    this.start_time = null;
    this.end_time = null;
    this.duration = null;
  }
}
