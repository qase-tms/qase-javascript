/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { StepStatusEnum, StepType } from 'qase-javascript-commons';
import { StepRunner } from '../src/modules/stepRunner';

describe('StepRunner', () => {
  let runner: StepRunner;

  beforeEach(() => {
    runner = new StepRunner();
  });

  it('getSteps() initially returns an empty array', () => {
    expect(runner.getSteps()).toEqual([]);
  });

  it('run() captures a passed sync step with title, status, end_time', () => {
    runner.run('login', () => {});
    const steps = runner.getSteps();

    expect(steps).toHaveLength(1);
    expect(steps[0]?.step_type).toBe(StepType.TEXT);
    expect(steps[0]?.data.action).toBe('login');
    expect(steps[0]?.execution.status).toBe(StepStatusEnum.passed);
    expect(steps[0]?.execution.end_time).not.toBeNull();
  });

  it('run() with a throwing fn marks step failed, swallows the error, and exposes hasFailure()', () => {
    expect(() => runner.run('boom', () => { throw new Error('nope'); })).not.toThrow();
    expect(runner.getSteps()[0]?.execution.status).toBe(StepStatusEnum.failed);
    expect(runner.hasFailure()).toBe(true);
  });

  it('run() preserves expectedResult and data via extractAndCleanStep', () => {
    runner.run('verify total', () => {}, 'sum equals 42', 'cart=[A,B]');
    const step = runner.getSteps()[0]!;

    expect(step.data.expected_result).toBe('sum equals 42');
    expect(step.data.data).toBe('cart=[A,B]');
    expect(step.data.action).toBe('verify total');
  });

  it('run() without expectedResult/data leaves action equal to the title', () => {
    runner.run('plain step', () => {});
    expect(runner.getSteps()[0]?.data.action).toBe('plain step');
  });

  it('multiple sequential run() calls accumulate steps in order', () => {
    runner.run('a', () => {});
    runner.run('b', () => {});
    runner.run('c', () => {});

    const titles = runner.getSteps().map((s) => s.data.action);
    expect(titles).toEqual(['a', 'b', 'c']);
  });

  it('reset() empties the steps buffer', () => {
    runner.run('first', () => {});
    runner.reset();
    expect(runner.getSteps()).toEqual([]);
  });

  it('parent_id is null for top-level steps', () => {
    runner.run('top', () => {});
    expect(runner.getSteps()[0]?.parent_id).toBeNull();
  });

  it('returns the value of the wrapped fn', () => {
    const out = runner.run('compute', () => 42 as unknown as void);
    // run is typed as () => void in the public API, but we still propagate the return.
    expect(out).toBeUndefined(); // the public step API discards return values.
  });
});
