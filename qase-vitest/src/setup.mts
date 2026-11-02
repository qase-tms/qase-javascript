// ESM on purpose: Vitest refuses `require('vitest')`, so a CommonJS setup file cannot load.
import { afterAll, afterEach, beforeAll, beforeEach, inject } from 'vitest';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import type { NetworkProfilerOptions } from 'qase-javascript-commons/profilers';
import {
  PROFILER_OPTIONS_KEY,
  registerWorkerProfiler,
  resolveWorkerProfilerOptions,
} from './modules/workerProfiler.js';

/**
 * Vitest setupFile that runs in the worker: records the network requests each test makes
 * and hands them to the reporter. Add `setupFiles: ['vitest-qase-reporter/setup']`.
 *
 * Sequential tests within a worker only; `test.concurrent()` mixes up which test a request belongs to.
 */
const provided = (inject as (key: string) => NetworkProfilerOptions | null | undefined)(PROFILER_OPTIONS_KEY);
const options = resolveWorkerProfilerOptions(provided);

if (options) {
  registerWorkerProfiler({ beforeAll, afterAll, beforeEach, afterEach }, new NetworkProfiler(options));
}
