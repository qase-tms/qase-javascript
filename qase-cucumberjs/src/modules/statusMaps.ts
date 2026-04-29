import { Status } from '@cucumber/cucumber';
import { StepStatusEnum, TestStatusEnum } from 'qase-javascript-commons';

export type TestStepResultStatus = (typeof Status)[keyof typeof Status];

export const STATUS_MAP: Record<TestStepResultStatus, TestStatusEnum> = {
  [Status.PASSED]: TestStatusEnum.passed,
  [Status.FAILED]: TestStatusEnum.failed,
  [Status.SKIPPED]: TestStatusEnum.skipped,
  [Status.AMBIGUOUS]: TestStatusEnum.invalid,
  [Status.PENDING]: TestStatusEnum.skipped,
  [Status.UNDEFINED]: TestStatusEnum.skipped,
  [Status.UNKNOWN]: TestStatusEnum.skipped,
};

export const STEP_STATUS_MAP: Record<TestStepResultStatus, StepStatusEnum> = {
  [Status.PASSED]: StepStatusEnum.passed,
  [Status.FAILED]: StepStatusEnum.failed,
  [Status.SKIPPED]: StepStatusEnum.skipped,
  [Status.AMBIGUOUS]: StepStatusEnum.failed,
  [Status.PENDING]: StepStatusEnum.skipped,
  [Status.UNDEFINED]: StepStatusEnum.skipped,
  [Status.UNKNOWN]: StepStatusEnum.skipped,
};
