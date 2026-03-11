import { ConfigLoader, composeOptions } from 'qase-javascript-commons';
import { NetworkProfiler } from 'qase-javascript-commons/profilers';
import { events } from './events';

/**
 * QaseWdioService — WDIO service for network request profiling.
 *
 * Runs in the SAME process as tests (worker). Uses before/after hooks for profiler
 * lifecycle and beforeTest/afterTest for per-test step collection.
 * Steps are sent to the reporter via process.emit(events.addProfilerSteps, steps).
 *
 * Usage: add `services: [['qase-wdio-reporter', { /* options *\/ }], QaseWdioService]`
 * or `services: [[QaseWdioService]]` in your wdio.conf.js.
 *
 * IMPORTANT: The process.emit IPC only works in same-process WDIO configurations
 * (e.g., maxInstances: 1 with local runner). In multi-worker WDIO mode, process.emit
 * fires events in the current process only — they don't cross process boundaries.
 * v1.3: profiling works correctly ONLY in same-process WDIO configs.
 * Multi-worker WDIO profiling is out of scope for v1.3.
 */
export class QaseWdioService {
  private profiler: NetworkProfiler | null = null;
  private stepSnapshot = 0;

  constructor() {
    const configLoader = new ConfigLoader();
    const config = configLoader.load();
    const options = composeOptions({}, config);

    if (options.profilers?.includes('network')) {
      this.profiler = new NetworkProfiler({
        skipDomains: options.networkProfiler?.skip_domains,
        trackOnFail: options.networkProfiler?.track_on_fail,
      });
    }
  }

  before(): void {
    if (this.profiler) {
      this.profiler.enable();
    }
  }

  beforeTest(): void {
    if (this.profiler) {
      this.stepSnapshot = this.profiler.getAllSteps().length;
    }
  }

  afterTest(): void {
    if (!this.profiler) return;
    const allSteps = this.profiler.getAllSteps();
    const newSteps = allSteps.slice(this.stepSnapshot);
    this.stepSnapshot = allSteps.length;
    if (newSteps.length > 0) {
      // Send steps to reporter via established IPC channel
      // NOTE: This only works in same-process WDIO configs (maxInstances: 1 with local runner)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      (process as any).emit(events.addProfilerSteps, JSON.stringify(newSteps));
    }
  }

  after(): void {
    if (this.profiler) {
      this.profiler.restore();
    }
  }
}
