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

export interface TestExecution {
  start_time: number | null;
  status: TestStatusEnum;
  end_time: number | null;
  duration: number | null;
  stacktrace: string | null;
  thread: string | null;
}