import { test as base } from '@playwright/test';
import {
  ConfigLoader,
  composeOptions,
} from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';

export const PROFILER_ATTACHMENT_NAME = 'qase-profiler-steps.json';
export const PROFILER_CONTENT_TYPE = 'application/qase.profiler-steps+json';

// Extend the base test with a qaseProfiler fixture that:
// 1. Reads config to check if network profiling is enabled
// 2. Uses snapshot/delta pattern on fallback accumulator (diagnostics_channel
//    handlers do not inherit AsyncLocalStorage context)
// 3. Serializes captured steps as a JSON attachment
export const test = base.extend<{ qaseProfiler: void }>({
  // eslint-disable-next-line no-empty-pattern
  qaseProfiler: [async ({}, use, testInfo) => {
    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    const options = composeOptions({}, config);

    if (!options.profilers?.includes('network')) {
      await use();
      return;
    }

    const profiler = new NetworkProfiler({
      skipDomains: options.networkProfiler?.skip_domains,
      trackOnFail: options.networkProfiler?.track_on_fail,
    });
    profiler.enable();

    // Use snapshot/delta pattern with fallback accumulator because
    // diagnostics_channel handlers do not inherit AsyncLocalStorage context.
    const snapshot = profiler.getAllSteps().length;

    try {
      await use();

      const allSteps = profiler.getAllSteps();
      const steps = allSteps.slice(snapshot);

      // Serialize steps as attachment for reporter to pick up
      if (steps.length > 0) {
        await testInfo.attach(PROFILER_ATTACHMENT_NAME, {
          contentType: PROFILER_CONTENT_TYPE,
          body: Buffer.from(JSON.stringify(steps), 'utf8'),
        });
      }
    } finally {
      profiler.restore();
    }
  }, { auto: true, scope: 'test' }],
});
