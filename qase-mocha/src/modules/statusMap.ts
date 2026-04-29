import { TestStatusEnum } from 'qase-javascript-commons';

export type MochaState = 'failed' | 'passed' | 'pending';

export const STATUS_MAP: Record<MochaState, TestStatusEnum> = {
  failed: TestStatusEnum.failed,
  passed: TestStatusEnum.passed,
  pending: TestStatusEnum.skipped,
};
