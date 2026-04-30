/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { TestStepType, StepType, StepStatusEnum } from 'qase-javascript-commons';
import { ProfilerTracker } from '../src/modules/profilerTracker';

class FakeProfiler {
  private steps: TestStepType[] = [];
  private restored = false;

  push(action: string): void {
    this.steps.push({
      step_type: StepType.TEXT,
      data: { action, expected_result: null, data: null },
      execution: { start_time: 0, status: StepStatusEnum.passed, end_time: 0, duration: 0 },
      id: action,
      parent_id: null,
      attachments: [],
      steps: [],
    });
  }

  getAllSteps(): TestStepType[] {
    return this.steps;
  }

  restore(): void {
    this.restored = true;
  }

  isRestored(): boolean {
    return this.restored;
  }
}

describe('ProfilerTracker', () => {
  it('null profiler returns empty events array', () => {
    const tracker = new ProfilerTracker(null);
    tracker.onTestStart('tcs1');
    expect(tracker.getEvents('tcs1')).toEqual([]);
  });

  it('per-case isolation: each testCaseStartedId snapshots independently', () => {
    const profiler = new FakeProfiler();
    profiler.push('initial-1');
    profiler.push('initial-2');

    const tracker = new ProfilerTracker(profiler as any);
    tracker.onTestStart('tcs1');

    profiler.push('during-1');
    tracker.onTestStart('tcs2');
    profiler.push('during-2');

    expect(tracker.getEvents('tcs1').map((s) => s.id)).toEqual(['during-1', 'during-2']);
    expect(tracker.getEvents('tcs2').map((s) => s.id)).toEqual(['during-2']);
  });

  it('reset(testCaseStartedId) deletes snapshot for that id', () => {
    const profiler = new FakeProfiler();
    profiler.push('a');
    const tracker = new ProfilerTracker(profiler as any);
    tracker.onTestStart('tcs1');
    profiler.push('b');

    tracker.reset('tcs1');
    profiler.push('c');

    expect(tracker.getEvents('tcs1').map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('restore() proxies to underlying profiler', () => {
    const profiler = new FakeProfiler();
    const tracker = new ProfilerTracker(profiler as any);
    tracker.restore();
    expect(profiler.isRestored()).toBe(true);
  });
});
