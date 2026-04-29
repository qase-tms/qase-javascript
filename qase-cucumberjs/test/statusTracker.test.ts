/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { Status } from '@cucumber/cucumber';
import { TestStatusEnum } from 'qase-javascript-commons';
import { TestStepFinished } from '@cucumber/messages';
import { StatusTracker } from '../src/modules/statusTracker';

function step(opts: { testCaseStartedId: string; status: any; message?: string }): TestStepFinished {
  return {
    testStepId: 'step-' + Math.random(),
    testCaseStartedId: opts.testCaseStartedId,
    testStepResult: {
      status: opts.status,
      message: opts.message,
      duration: { seconds: 0, nanos: 0 },
    },
  } as unknown as TestStepFinished;
}

describe('StatusTracker', () => {
  let tracker: StatusTracker;

  beforeEach(() => {
    tracker = new StatusTracker();
  });

  it('initial status is passed when no steps applied', () => {
    expect(tracker.getStatus('tcs1')).toBe(TestStatusEnum.passed);
  });

  it('applyStep with PASSED leaves status at passed', () => {
    tracker.onTestStarted('tcs1');
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.PASSED }));
    expect(tracker.getStatus('tcs1')).toBe(TestStatusEnum.passed);
  });

  it('applyStep with FAILED + assertion error promotes to failed', () => {
    tracker.onTestStarted('tcs1');
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.FAILED, message: 'expected 1 to equal 2' }));
    expect(tracker.getStatus('tcs1')).toBe(TestStatusEnum.failed);
  });

  it('failed status does NOT downgrade when later step is skipped', () => {
    tracker.onTestStarted('tcs1');
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.FAILED, message: 'expected 1 to equal 2' }));
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.SKIPPED }));
    expect(tracker.getStatus('tcs1')).toBe(TestStatusEnum.failed);
  });

  it('invalid status does NOT downgrade either', () => {
    tracker.onTestStarted('tcs1');
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.AMBIGUOUS, message: 'something' }));
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.SKIPPED }));
    expect(tracker.getStatus('tcs1')).toBe(TestStatusEnum.invalid);
  });

  it('getErrors collects all messages into a CompoundError', () => {
    tracker.onTestStarted('tcs1');
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.FAILED, message: 'first error' }));
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.FAILED, message: 'second error' }));
    const err = tracker.getErrors('tcs1');
    expect(err).toBeDefined();
    expect(err?.message).toContain('first error');
    expect(err?.message).toContain('second error');
  });

  it('getErrors returns undefined when no failing step has a message', () => {
    tracker.onTestStarted('tcs1');
    tracker.applyStep(step({ testCaseStartedId: 'tcs1', status: Status.PASSED }));
    expect(tracker.getErrors('tcs1')).toBeUndefined();
  });
});
