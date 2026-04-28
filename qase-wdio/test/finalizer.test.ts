/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import {
  CompoundError,
  ReporterInterface,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { ResultFinalizer } from '../src/finalizer';
import { CommandTracker } from '../src/command-tracker';
import { IpcBridge } from '../src/ipc';
import { TestLifecycle } from '../src/lifecycle';
import { MetadataApplier } from '../src/metadata';
import { Storage } from '../src/storage';
import { QaseReporterOptions } from '../src/options';

function makeUpstream(): jest.Mocked<ReporterInterface> {
  return {
    addTestResult: jest.fn(async () => undefined),
    sendResults: jest.fn(async () => undefined),
  } as any;
}

describe('ResultFinalizer', () => {
  let storage: Storage;
  let upstream: jest.Mocked<ReporterInterface>;
  let metadata: MetadataApplier;
  let lifecycle: TestLifecycle;
  let commandTracker: CommandTracker;
  let ipc: IpcBridge;
  let finalizer: ResultFinalizer;

  beforeEach(() => {
    storage = new Storage();
    upstream = makeUpstream();
    metadata = new MetadataApplier(storage);
    lifecycle = new TestLifecycle(storage);
    commandTracker = new CommandTracker(lifecycle, storage, new QaseReporterOptions(), null);
    ipc = new IpcBridge(metadata);
    finalizer = new ResultFinalizer(storage, upstream, commandTracker, ipc);
  });

  function startTest(title: string, startTime = 1700000000): TestResultType {
    lifecycle.startTest(title, 'cid', startTime);
    return storage.getCurrentTest()!;
  }

  it('is a no-op when there is no current test', async () => {
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(upstream.addTestResult).not.toHaveBeenCalled();
  });

  it('is a no-op when storage.ignore is true', async () => {
    startTest('t');
    storage.ignore = true;
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(upstream.addTestResult).not.toHaveBeenCalled();
  });

  it('builds relations from storage.suites when relations is null', async () => {
    const t = startTest('t');
    storage.suites.push('Outer');
    storage.suites.push('Inner');
    await finalizer.finalize(TestStatusEnum.passed, null, 1700000010);
    expect(t.relations?.suite?.data).toEqual([
      { title: 'Outer', public_id: null },
      { title: 'Inner', public_id: null },
    ]);
  });

  it('keeps an existing relations object untouched', async () => {
    const t = startTest('t');
    t.relations = { suite: { data: [{ title: 'Pre', public_id: null }] } };
    storage.suites.push('Should not appear');
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(t.relations.suite?.data).toEqual([{ title: 'Pre', public_id: null }]);
  });

  it('computes duration from start_time and endTime (rounded seconds)', async () => {
    const t = startTest('t', 100);
    await finalizer.finalize(TestStatusEnum.passed, null, 100.7);
    expect(t.execution.duration).toBe(1);
  });

  it('forwards stacktrace from CompoundError', async () => {
    const t = startTest('t');
    const err = new CompoundError();
    err.addStacktrace('Error: boom\n  at x');
    await finalizer.finalize(TestStatusEnum.failed, err);
    expect(t.execution.stacktrace).toContain('Error: boom');
  });

  it('combines storage.comment with error message into testResult.message', async () => {
    const t = startTest('t');
    storage.comment = 'note';
    const err = new CompoundError();
    err.addMessage('boom');
    await finalizer.finalize(TestStatusEnum.failed, err);
    expect(t.message).toMatch(/^note\n\n/);
    expect(t.message).toContain('boom');
  });

  it('uses storage.comment alone when there is no error', async () => {
    const t = startTest('t');
    storage.comment = 'note only';
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(t.message).toBe('note only');
  });

  it('cleans (Qase ID: …) from title via removeQaseIdsFromTitle', async () => {
    const t = startTest('login (Qase ID: 1)');
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(t.title).toBe('login');
  });

  it('merges profiler steps in order: in-process first, IPC after', async () => {
    const t = startTest('t');
    const inProc: TestStepType = { id: 'in-1' } as unknown as TestStepType;
    const ipcStep: TestStepType = { id: 'ipc-1' } as unknown as TestStepType;
    jest.spyOn(commandTracker, 'drainNewProfilerSteps').mockReturnValue([inProc]);
    jest.spyOn(ipc, 'drainProfilerSteps').mockReturnValue([ipcStep]);
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(t.steps[t.steps.length - 2]).toBe(inProc);
    expect(t.steps[t.steps.length - 1]).toBe(ipcStep);
  });

  it('publishes via upstream.addTestResult', async () => {
    const t = startTest('t');
    await finalizer.finalize(TestStatusEnum.passed, null);
    expect(upstream.addTestResult).toHaveBeenCalledWith(t);
  });
});
