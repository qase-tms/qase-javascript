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
  /**
   * Free-form failure context captured by the framework — for Playwright, the contents of
   * error-context.md. Optional so the reporters that don't produce one keep building `execution`
   * object literals unchanged.
   */
  error_context?: string | null;
  thread: string | null;

  constructor() {
    this.status = TestStatusEnum.passed;
    this.start_time = null;
    this.end_time = null;
    this.duration = null;
    this.stacktrace = null;
    this.error_context = null;
    this.thread = null;
  }
}
