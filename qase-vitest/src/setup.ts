import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { ConfigLoader, composeOptions } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

/**
 * Vitest setupFile that runs in the WORKER thread (same process as tests).
 * Uses beforeAll/afterAll for profiler lifecycle and beforeEach/afterEach with
 * the fallback accumulator for per-test step collection.
 *
 * Steps are sent to the reporter via Vitest's annotate() API — the established
 * cross-worker communication channel used by all other Qase metadata.
 *
 * Usage: set `setupFiles: ['vitest-qase-reporter/setup']` in vitest.config.ts
 *
 * v1.3 limitation: sequential tests within a worker only.
 * test.concurrent() or parallel test execution will produce incorrect step attribution.
 */

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
      // context.annotate() cannot be used here — Vitest considers the test
      // complete before afterEach runs for annotation purposes.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (context.task.meta as any)._qaseProfilerSteps = JSON.stringify(newSteps);
    }
  });
}
