/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { TestStepType, StepType, StepStatusEnum } from 'qase-javascript-commons';
import { ProfilerTracker } from '../src/modules/profilerTracker';

class FakeProfiler {
  private steps: TestStepType[] = [];

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
}

describe('ProfilerTracker', () => {
  it('with a null profiler, getEvents() returns []', () => {
    const tracker = new ProfilerTracker(null);
    tracker.onTestStart();
    expect(tracker.getEvents()).toEqual([]);
  });

  it('with a profiler, returns only steps recorded since onTestStart()', () => {
    const profiler = new FakeProfiler();
    profiler.push('before-test-1');
    const tracker = new ProfilerTracker(profiler as any);
    tracker.onTestStart();

    profiler.push('during-test-1');
    profiler.push('during-test-2');

    const events = tracker.getEvents();
    expect(events.map((s) => s.id)).toEqual(['during-test-1', 'during-test-2']);
  });

  it('multiple test cycles isolate events', () => {
    const profiler = new FakeProfiler();
    const tracker = new ProfilerTracker(profiler as any);

    tracker.onTestStart();
    profiler.push('test-1-event');
    expect(tracker.getEvents().map((s) => s.id)).toEqual(['test-1-event']);

    tracker.onTestStart();
    profiler.push('test-2-event');
    expect(tracker.getEvents().map((s) => s.id)).toEqual(['test-2-event']);
  });

  it('reset() returns snapshot to zero', () => {
    const profiler = new FakeProfiler();
    profiler.push('a');
    profiler.push('b');
    const tracker = new ProfilerTracker(profiler as any);
    tracker.onTestStart();        // snapshot = 2

    tracker.reset();              // snapshot = 0

    expect(tracker.getEvents().map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('without onTestStart(), getEvents returns all known steps from index 0', () => {
    const profiler = new FakeProfiler();
    profiler.push('a');
    profiler.push('b');
    const tracker = new ProfilerTracker(profiler as any);
    expect(tracker.getEvents().map((s) => s.id)).toEqual(['a', 'b']);
  });
});
