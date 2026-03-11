import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { ConfigLoader, composeOptions } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

let profiler: NetworkProfiler | null = null;
let stepSnapshot = 0;

const configLoader = new ConfigLoader();
const config = configLoader.load();
const options = composeOptions({}, config);

if (options.profilers?.includes('network')) {
  profiler = new NetworkProfiler({
    skipDomains: options.networkProfiler?.skip_domains,
    trackOnFail: options.networkProfiler?.track_on_fail,
  });

  beforeAll(() => {
    profiler!.enable();
  });

  afterAll(() => {
    profiler!.restore();
  });

  beforeEach(() => {
    stepSnapshot = profiler!.getAllSteps().length;
  });

  afterEach((context) => {
    if (!profiler) return;
    const allSteps = profiler.getAllSteps();
    const newSteps = allSteps.slice(stepSnapshot);
    if (newSteps.length > 0) {
      // Use task.meta for cross-worker communication (serialized automatically).
      // context.annotate() cannot be used in afterEach — Vitest considers the
      // test complete before hooks run for annotation purposes.
      (context.task.meta as Record<string, unknown>)._qaseProfilerSteps = JSON.stringify(newSteps);
    }
  });
}
