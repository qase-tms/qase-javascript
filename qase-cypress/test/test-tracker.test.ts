/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import type { Suite, Test } from 'mocha';
import { TestTracker } from '../src/test-tracker';

function makeTest(opts: { fullTitle: string; parentSuites?: string[]; file?: string }): Test {
  const parent = opts.parentSuites
    ? ({
        titlePath: () => opts.parentSuites!,
        file: opts.file,
        parent: undefined,
      } as unknown as Suite)
    : undefined;
  return {
    fullTitle: () => opts.fullTitle,
    parent,
  } as unknown as Test;
}

describe('TestTracker', () => {
  let tracker: TestTracker;

  beforeEach(() => {
    tracker = new TestTracker();
  });

  it('starts with no processed tests', () => {
    const t = makeTest({ fullTitle: 'login flow' });
    expect(tracker.isProcessed(t)).toBe(false);
  });

  it('marks a test processed and reports it', () => {
    const t = makeTest({ fullTitle: 'login flow' });
    tracker.markProcessed(t);
    expect(tracker.isProcessed(t)).toBe(true);
  });

  it('strips "before each" hook prefix from full title in identifier', () => {
    const t = makeTest({ fullTitle: '"before each" hook for "click button"' });
    expect(tracker.getTestIdentifier(t)).toContain('click button');
    expect(tracker.getTestIdentifier(t)).not.toContain('before each');
  });

  it('marking is idempotent — second call does not change state', () => {
    const t = makeTest({ fullTitle: 'login flow' });
    tracker.markProcessed(t);
    tracker.markProcessed(t);
    expect(tracker.isProcessed(t)).toBe(true);
  });

  it('two trackers do not share state', () => {
    const a = new TestTracker();
    const b = new TestTracker();
    const t = makeTest({ fullTitle: 'login flow' });
    a.markProcessed(t);
    expect(b.isProcessed(t)).toBe(false);
  });
});
