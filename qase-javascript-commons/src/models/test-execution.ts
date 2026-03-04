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

export class TestExecution {
  start_time: number | null;
  status: TestStatusEnum;
  end_time: number | null;
  duration: number | null;
  stacktrace: string | null;
  thread: string | null;

  constructor() {
    this.status = TestStatusEnum.passed;
    this.start_time = null;
    this.end_time = null;
    this.duration = null;
    this.stacktrace = null;
    this.thread = null;
  }
}
