import { ConfigLoader, ConfigType, composeOptions } from 'qase-javascript-commons';
import type { NetworkProfiler, NetworkProfilerOptions } from 'qase-javascript-commons/profilers';

/** Key under which the reporter hands the network profiler options to the workers via `provide`/`inject`. */
export const PROFILER_OPTIONS_KEY = 'qaseNetworkProfiler';

type Hook = (fn: (context: { task: { meta: object } }) => void) => void;

export interface WorkerHooks {
  beforeAll: (fn: () => void) => void;
  afterAll: (fn: () => void) => void;
  beforeEach: (fn: () => void) => void;
  afterEach: Hook;
}

export const profilerOptionsFrom = (options: ConfigType): NetworkProfilerOptions | null => {
  if (!options.profilers?.includes('network')) return null;
  return {
    skipDomains: options.networkProfiler?.skip_domains,
    trackOnFail: options.networkProfiler?.track_on_fail,
  };
};

/**
 * `provided` is what the reporter handed over (`null` = profiler off). It is `undefined`
 * when the Qase reporter is not in `reporters`; then only the config file and env apply.
 */
export const resolveWorkerProfilerOptions = (
  provided: NetworkProfilerOptions | null | undefined,
): NetworkProfilerOptions | null => {
  if (provided !== undefined) return provided;
  return profilerOptionsFrom(composeOptions({}, new ConfigLoader().load()));
};

export const registerWorkerProfiler = (
  hooks: WorkerHooks,
  profiler: Pick<NetworkProfiler, 'enable' | 'restore' | 'getAllSteps'>,
): void => {
  let stepSnapshot = 0;

  hooks.beforeAll(() => {
    profiler.enable();
  });

  hooks.afterAll(() => {
    profiler.restore();
  });

  hooks.beforeEach(() => {
    stepSnapshot = profiler.getAllSteps().length;
  });

  hooks.afterEach((context) => {
    const newSteps = profiler.getAllSteps().slice(stepSnapshot);
    if (newSteps.length > 0) {
      // context.annotate() is not accepted in afterEach; task.meta is serialized to the reporter.
      (context.task.meta as Record<string, unknown>)['_qaseProfilerSteps'] = JSON.stringify(newSteps);
    }
  });
};
