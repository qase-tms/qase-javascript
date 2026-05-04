/* eslint-disable */
import { describe, it, expect } from '@jest/globals';
import { ProfilerTracker } from '../src/modules/profilerTracker';

describe('ProfilerTracker', () => {
  it('returns [] from getNewSteps when profiler is null', () => {
    const tracker = new ProfilerTracker(null);
    expect(tracker.getNewSteps()).toEqual([]);
  });

  it('enable and restore are no-ops when profiler is null', () => {
    const tracker = new ProfilerTracker(null);
    expect(() => tracker.enable()).not.toThrow();
    expect(() => tracker.restore()).not.toThrow();
  });

  it('enable delegates to profiler.enable', () => {
    const profiler: any = { enable: jest.fn(), getAllSteps: () => [], restore: jest.fn() };
    const tracker = new ProfilerTracker(profiler);
    tracker.enable();
    expect(profiler.enable).toHaveBeenCalledTimes(1);
  });

  it('restore delegates to profiler.restore', () => {
    const profiler: any = { enable: jest.fn(), getAllSteps: () => [], restore: jest.fn() };
    const tracker = new ProfilerTracker(profiler);
    tracker.restore();
    expect(profiler.restore).toHaveBeenCalledTimes(1);
  });

  it('getNewSteps returns only steps appended since last call', () => {
    const allSteps: any[] = [];
    const profiler: any = {
      enable: jest.fn(),
      restore: jest.fn(),
      getAllSteps: () => allSteps,
    };
    const tracker = new ProfilerTracker(profiler);

    expect(tracker.getNewSteps()).toEqual([]);
    allSteps.push({ id: 's1' }, { id: 's2' });
    expect(tracker.getNewSteps()).toEqual([{ id: 's1' }, { id: 's2' }]);
    allSteps.push({ id: 's3' });
    expect(tracker.getNewSteps()).toEqual([{ id: 's3' }]);
    expect(tracker.getNewSteps()).toEqual([]);
  });
});
