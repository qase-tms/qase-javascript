/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it } from '@jest/globals';
import { currentTestRunId } from '../src/modules/testRunContext';

// Mirrors how TestCafe wraps a test body (lib/api/test-run-tracker.js addTrackingMarkerToFunction).
const markAs = <T>(testRunId: string, fn: () => T): (() => T) =>
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('fn', `return function $$testcafe_test_run$$${testRunId}$$ () { return fn(); };`)(fn) as () => T;

describe('currentTestRunId', () => {
  it('returns null outside a test run', () => {
    expect(currentTestRunId()).toBeNull();
  });

  it('returns the id of the test run the caller runs in', () => {
    expect(markAs('runA1', () => currentTestRunId())()).toBe('runA1');
  });

  it('finds the marker below nested calls', () => {
    const deep = (n: number): string | null => (n === 0 ? currentTestRunId() : deep(n - 1));
    expect(markAs('runB2', () => deep(50))()).toBe('runB2');
  });

  it('leaves the stack trace settings as they were', () => {
    const prepareStackTrace = Error.prepareStackTrace;
    const stackTraceLimit = Error.stackTraceLimit;
    markAs('runC3', () => currentTestRunId())();
    expect(Error.prepareStackTrace).toBe(prepareStackTrace);
    expect(Error.stackTraceLimit).toBe(stackTraceLimit);
  });
});
