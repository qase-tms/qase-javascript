/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { TestResultType } from 'qase-javascript-commons';
import { CommandTracker } from '../src/command-tracker';
import { TestLifecycle } from '../src/lifecycle';
import { Storage } from '../src/storage';
import { QaseReporterOptions } from '../src/options';

function makeProfiler(initialStepCount = 0) {
  let allSteps: object[] = Array.from({ length: initialStepCount }, (_, i) => ({ id: `init-${i}` }));
  return {
    getAllSteps: jest.fn(() => allSteps),
    appendStep: (s: object) => { allSteps = [...allSteps, s]; },
    restore: jest.fn(),
  };
}

describe('CommandTracker', () => {
  let storage: Storage;
  let lifecycle: TestLifecycle;
  let options: QaseReporterOptions;
  let tracker: CommandTracker;

  beforeEach(() => {
    storage = new Storage();
    lifecycle = new TestLifecycle(storage);
    options = new QaseReporterOptions();
    tracker = new CommandTracker(lifecycle, storage, options, null);
  });

  it('onBeforeCommand is no-op when there is no active item', () => {
    const startStep = jest.spyOn(lifecycle, 'startStep');
    tracker.onBeforeCommand({ method: 'GET', endpoint: '/x', command: 'getUrl' } as any);
    expect(startStep).not.toHaveBeenCalled();
  });

  it('onBeforeCommand is no-op when disableWebdriverStepsReporting is true', () => {
    storage.push(new TestResultType('t'));
    options.disableWebdriverStepsReporting = true;
    const startStep = jest.spyOn(lifecycle, 'startStep');
    tracker.onBeforeCommand({ method: 'GET', endpoint: '/x' } as any);
    expect(startStep).not.toHaveBeenCalled();
  });

  it('onBeforeCommand is no-op when isMultiremote', () => {
    storage.push(new TestResultType('t'));
    tracker.setMultiremote(true);
    const startStep = jest.spyOn(lifecycle, 'startStep');
    tracker.onBeforeCommand({ method: 'GET', endpoint: '/x' } as any);
    expect(startStep).not.toHaveBeenCalled();
  });

  it('onBeforeCommand starts a step with command name and attaches payload as JSON', () => {
    storage.push(new TestResultType('t'));
    const attach = jest.spyOn(lifecycle, 'attachJSON');
    tracker.onBeforeCommand({ method: 'POST', endpoint: '/x', command: 'click', body: { selector: '#go' } } as any);
    expect(storage.getCurrentStep()?.data.action).toBe('click');
    expect(attach).toHaveBeenCalledWith('Request', { selector: '#go' });
  });

  it('onBeforeCommand falls back to "{method} {endpoint}" when command is missing', () => {
    storage.push(new TestResultType('t'));
    tracker.onBeforeCommand({ method: 'GET', endpoint: '/users' } as any);
    expect(storage.getCurrentStep()?.data.action).toBe('GET /users');
  });

  it('onAfterCommand attaches screenshot when isScreenshotCommand and command result present', () => {
    storage.push(new TestResultType('t'));
    lifecycle.startStep('takeScreenshot');
    const attachFile = jest.spyOn(lifecycle, 'attachFile');
    tracker.onAfterCommand({
      method: 'GET',
      endpoint: '/screenshot',
      command: 'takeScreenshot',
      result: { value: 'aGVsbG8=' },
    } as any);
    const calls = attachFile.mock.calls;
    expect(calls.find((c) => c[0] === 'Screenshot.png' && c[2] === 'image/png')).toBeDefined();
  });

  it('drainNewProfilerSteps returns slice since last takeProfilerSnapshot', () => {
    const profiler = makeProfiler(2) as any;
    tracker = new CommandTracker(lifecycle, storage, options, profiler);
    tracker.takeProfilerSnapshot();
    profiler.appendStep({ id: 'new-1' });
    profiler.appendStep({ id: 'new-2' });
    expect(tracker.drainNewProfilerSteps()).toEqual([{ id: 'new-1' }, { id: 'new-2' }]);
  });

  it('drainNewProfilerSteps resets the snapshot to 0', () => {
    const profiler = makeProfiler(2) as any;
    tracker = new CommandTracker(lifecycle, storage, options, profiler);
    tracker.takeProfilerSnapshot();
    profiler.appendStep({ id: 'x' });
    tracker.drainNewProfilerSteps();
    expect(tracker.drainNewProfilerSteps()).toEqual([{ id: 'init-0' }, { id: 'init-1' }, { id: 'x' }]);
  });
});
