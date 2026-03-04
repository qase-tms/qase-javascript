import { AsyncLocalStorage } from 'node:async_hooks';

import { AbstractProfiler } from './abstract-profiler';
import { HttpInterceptor } from './http-interceptor';
import { FetchInterceptor } from './fetch-interceptor';
import { TestStepType } from '../models';

export interface NetworkProfilerOptions {
  skipDomains?: string[] | undefined;
  trackOnFail?: boolean | undefined;
}

const QASE_API_HOST = 'qase.io';

// Module-level ALS store — shared across all NetworkProfiler instances to
// allow nested run() calls to see the same context.
const store = new AsyncLocalStorage<TestStepType[]>();

export class NetworkProfiler extends AbstractProfiler {
  private readonly skipDomains: string[];
  // Stored for Phase 13 use (controls whether to capture network steps on test failure)
  private readonly _trackOnFail: boolean;

  /**
   * Fallback accumulator for steps captured outside any run() context.
   * Used by frameworks where test bodies cannot be wrapped in run() (Jest, Vitest, WDIO).
   * Public so interceptors can push to it via ProfilerRef.
   */
  public readonly fallbackSteps: TestStepType[] = [];

  private httpInterceptor: HttpInterceptor | null = null;
  private fetchInterceptor: FetchInterceptor | null = null;

  constructor(options: NetworkProfilerOptions = {}) {
    super();
    this.skipDomains = options.skipDomains ?? [];
    this._trackOnFail = options.trackOnFail ?? true;
  }

  get trackOnFail(): boolean {
    return this._trackOnFail;
  }

  shouldSkip(url: string): boolean {
    if (url.includes(QASE_API_HOST)) {
      return true;
    }
    return this.skipDomains.some((domain) => url.includes(domain));
  }

  /**
   * Install HTTP/HTTPS monkey-patches and subscribe to undici diagnostics_channel
   * so that outgoing requests inside a `run()` context are captured as REQUEST steps.
   */
  enable(): void {
    this.httpInterceptor = new HttpInterceptor(store, this);
    this.httpInterceptor.install();
    this.fetchInterceptor = new FetchInterceptor(store, this);
    this.fetchInterceptor.subscribe();
  }

  /**
   * No-op per v1.3 design decision (flag-based activation model).
   * Satisfies the AbstractProfiler contract.
   */
  disable(): void {
    // Intentional no-op
  }

  /**
   * Uninstall HTTP/HTTPS monkey-patches and unsubscribe from undici diagnostics_channel —
   * permanently removes interception.
   */
  restore(): void {
    this.fetchInterceptor?.unsubscribe();
    this.fetchInterceptor = null;
    this.httpInterceptor?.uninstall();
    this.httpInterceptor = null;
  }

  /**
   * Wraps `fn` in an AsyncLocalStorage context so that any HTTP requests
   * made inside `fn` are attributed to the step accumulator for this call.
   *
   * Returns `{ result, steps }` where `result` is the return value of `fn`
   * and `steps` is the array of REQUEST steps captured during execution.
   */
  async run<T>(fn: () => Promise<T>): Promise<{ result: T; steps: TestStepType[] }> {
    const accumulator: TestStepType[] = [];
    const result = await store.run(accumulator, fn);
    return { result, steps: accumulator };
  }

  /**
   * Returns the current ALS store when called inside a `run()` context.
   * Returns an empty array when called outside (no active context).
   */
  getSteps(): TestStepType[] {
    return store.getStore() ?? [];
  }

  /**
   * Returns a copy of steps accumulated outside any run() context (fallback accumulator).
   * Used by frameworks where test bodies cannot be wrapped in run() (Jest, Vitest, WDIO).
   */
  getAllSteps(): TestStepType[] {
    return [...this.fallbackSteps];
  }

  /**
   * Clears the fallback step accumulator. Call after collecting steps per test.
   */
  clearSteps(): void {
    this.fallbackSteps.length = 0;
  }
}
