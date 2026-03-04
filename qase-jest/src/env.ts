// eslint-disable-next-line import/no-extraneous-dependencies
import NodeEnvironment from 'jest-environment-node';
import type { JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';
import { ConfigLoader, composeOptions, NetworkProfiler } from 'qase-javascript-commons';

/**
 * Custom Jest testEnvironment that runs in the same process as tests (worker process).
 * Uses the fallback accumulator from NetworkProfiler to capture HTTP steps per test.
 *
 * Since Jest runs one test file per worker and tests within a file are serial
 * (jest-circus default), the snapshot/delta approach correctly attributes steps per test.
 *
 * Usage: set `testEnvironment: 'jest-qase-reporter/environment'` in jest.config.js
 *
 * v1.3 limitation: --runInBand is the primary supported mode for profiling. In multi-worker
 * mode, step data stays in the worker process and cannot be reliably merged back to the
 * reporter in the main process. Full multi-worker profiling support is deferred to a future version.
 */
export default class QaseJestEnvironment extends NodeEnvironment {
  private profiler: NetworkProfiler | null = null;
  private _stepSnapshot = 0;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    const configLoader = new ConfigLoader();
    const qaseConfig = configLoader.load();
    const options = composeOptions({}, qaseConfig);

    if (options.profilers?.includes('network')) {
      this.profiler = new NetworkProfiler({
        skipDomains: options.networkProfiler?.skip_domains,
        trackOnFail: options.networkProfiler?.track_on_fail,
      });
    }
  }

  override async setup(): Promise<void> {
    await super.setup();
    if (this.profiler) {
      this.profiler.enable();
    }
  }

  override async teardown(): Promise<void> {
    if (this.profiler) {
      this.profiler.restore();
    }
    await super.teardown();
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handleTestEvent(event: { name: string; test?: { name: string; parent?: { name: string } } }): Promise<void> {
    if (!this.profiler) return;

    if (event.name === 'test_start') {
      // Snapshot before each test — tests run serially within a file
      this._stepSnapshot = this.profiler.getAllSteps().length;
    }

    if (event.name === 'test_done' || event.name === 'test_fn_failure') {
      // Collect delta after each test — reset snapshot for next test
      this._stepSnapshot = this.profiler.getAllSteps().length;
    }
  }
}

export { QaseJestEnvironment };
