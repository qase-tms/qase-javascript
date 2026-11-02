/* eslint-disable */
import { describe, it, expect, beforeEach } from '@jest/globals';

const composeOptionsMock = jest.fn();
jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    composeOptions: (...args: unknown[]) => composeOptionsMock(...args),
    ConfigLoader: jest.fn().mockImplementation(() => ({ load: jest.fn(() => null) })),
  };
});

import {
  profilerOptionsFrom,
  registerWorkerProfiler,
  resolveWorkerProfilerOptions,
} from '../src/modules/workerProfiler';

describe('profilerOptionsFrom', () => {
  it('maps the network profiler options of the reporter config', () => {
    expect(profilerOptionsFrom({
      profilers: ['network'],
      networkProfiler: { skip_domains: ['example.org'], track_on_fail: true },
    } as any)).toEqual({ skipDomains: ['example.org'], trackOnFail: true });
  });

  it('returns null when the network profiler is not enabled', () => {
    expect(profilerOptionsFrom({} as any)).toBeNull();
  });
});

describe('resolveWorkerProfilerOptions', () => {
  beforeEach(() => composeOptionsMock.mockReset());

  it('uses the options handed over by the reporter, including inline reporter options', () => {
    composeOptionsMock.mockReturnValue({});
    expect(resolveWorkerProfilerOptions({ skipDomains: ['a.com'] })).toEqual({ skipDomains: ['a.com'] });
    expect(resolveWorkerProfilerOptions(null)).toBeNull();
    expect(composeOptionsMock).not.toHaveBeenCalled();
  });

  it('falls back to qase.config.json and env when the reporter handed nothing over', () => {
    composeOptionsMock.mockReturnValue({ profilers: ['network'], networkProfiler: { skip_domains: ['b.com'] } });
    expect(resolveWorkerProfilerOptions(undefined)).toEqual({ skipDomains: ['b.com'], trackOnFail: undefined });
  });
});

describe('registerWorkerProfiler', () => {
  it('stores the requests made during a test on the task meta', () => {
    const hooks: Record<string, (ctx?: any) => void> = {};
    const steps: any[] = [];
    const profiler = { enable: jest.fn(), restore: jest.fn(), getAllSteps: () => steps };
    registerWorkerProfiler({
      beforeAll: (fn: any) => { hooks.beforeAll = fn; },
      afterAll: (fn: any) => { hooks.afterAll = fn; },
      beforeEach: (fn: any) => { hooks.beforeEach = fn; },
      afterEach: (fn: any) => { hooks.afterEach = fn; },
    }, profiler as any);

    hooks.beforeAll!();
    expect(profiler.enable).toHaveBeenCalled();
    steps.push({ id: 'old' });
    hooks.beforeEach!();
    steps.push({ id: 'new' });
    const ctx = { task: { meta: {} as any } };
    hooks.afterEach!(ctx);
    expect(JSON.parse(ctx.task.meta._qaseProfilerSteps)).toEqual([{ id: 'new' }]);
    hooks.afterAll!();
    expect(profiler.restore).toHaveBeenCalled();
  });
});
