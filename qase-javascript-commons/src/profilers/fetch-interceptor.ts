import { AsyncLocalStorage } from 'node:async_hooks';

import { TestStepType } from '../models/test-step';
import { StepRequestData } from '../models/step-data';
import { buildRequestStep } from './http-interceptor';

// Forward-declare the profiler interface to avoid circular imports
interface ProfilerRef {
  shouldSkip(url: string): boolean;
  trackOnFail: boolean;
  fallbackSteps: TestStepType[];
}

// ─── Type for pending request info keyed on undici request object ─────────────

interface PendingRequestInfo {
  /** Method extracted from undici request object */
  method: string;
  /** Full URL: origin + path */
  url: string;
  /** Millisecond timestamp when undici:request:create fired */
  startTime: number;
  /** The ALS context captured at create time (critical: connection pooling breaks getStore() in headers event). Null when outside ALS context (fallback mode). */
  alsContext: TestStepType[] | null;
}

// ─── FetchInterceptor ─────────────────────────────────────────────────────────

/**
 * FetchInterceptor subscribes to undici diagnostics_channel events to capture
 * outgoing fetch() calls as REQUEST-type steps in the AsyncLocalStorage store.
 *
 * Works with Node.js 18+ global fetch (which uses undici internally).
 * Gracefully skips subscription on Node < 18 (no global fetch).
 *
 * Key design decisions:
 *  - WeakMap keyed on undici request objects (same reference across all events)
 *  - ALS context captured at undici:request:create time, NOT at headers time.
 *    This is critical because undici connection pooling can break AsyncLocalStorage
 *    propagation between the create and headers events when connections are reused.
 *  - globalThis.fetch wrapping intercepts error response bodies (undici:request:bodyChunkReceived
 *    is not available in Node 22's built-in undici)
 *  - All handlers wrapped in try/catch (INTC-06: silent failure)
 *
 * Event flow:
 *  undici:request:create   → capture method, URL, start time, ALS context → WeakMap
 *  undici:request:headers  → build step using WeakMap data, push to ALS accumulator
 *  undici:request:trailers → cleanup WeakMap entry
 *  fetch wrapper           → update response_body for error responses (>= 400)
 */
export class FetchInterceptor {
  private readonly store: AsyncLocalStorage<TestStepType[]>;
  private readonly profiler: ProfilerRef;

  // WeakMap keyed on undici request objects (same reference across create/headers/trailers events)
  private readonly pendingRequests = new WeakMap<object, PendingRequestInfo>();

  // Map from step to body-update callback (for error response body capture)
  private readonly bodyHandlers = new WeakMap<TestStepType, (body: string) => void>();

  // Bound handler references (needed for subscribe/unsubscribe identity)
  private readonly createHandler: (msg: unknown) => void;
  private readonly headersHandler: (msg: unknown) => void;
  private readonly trailersHandler: (msg: unknown) => void;

  // Saved original fetch for wrapping/unwrapping
  private origFetch: typeof globalThis.fetch | null = null;

  constructor(store: AsyncLocalStorage<TestStepType[]>, profiler: ProfilerRef) {
    this.store = store;
    this.profiler = profiler;

    // Bind handlers as arrow functions for subscribe/unsubscribe reference identity
    this.createHandler = (msg: unknown) => {
      try {
        this.handleCreate(msg);
      } catch {
        // INTC-06: silent failure
      }
    };

    this.headersHandler = (msg: unknown) => {
      try {
        this.handleHeaders(msg);
      } catch {
        // INTC-06: silent failure
      }
    };

    this.trailersHandler = (msg: unknown) => {
      try {
        this.handleTrailers(msg);
      } catch {
        // INTC-06: silent failure
      }
    };
  }

  /**
   * Subscribe to undici diagnostics_channel events and wrap global fetch for
   * error response body capture.
   *
   * No-op on Node < 18 (no global fetch) or if diagnostics_channel unavailable.
   */
  subscribe(): void {
    // Guard: require global fetch (Node 18+)
    if (typeof globalThis.fetch !== 'function') {
      return;
    }

    let dc: typeof import('node:diagnostics_channel') | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      dc = require('node:diagnostics_channel') as typeof import('node:diagnostics_channel');
    } catch {
      return; // diagnostics_channel unavailable — skip entirely
    }

    if (typeof dc.subscribe !== 'function') {
      return;
    }

    dc.subscribe('undici:request:create', this.createHandler);
    dc.subscribe('undici:request:headers', this.headersHandler);
    dc.subscribe('undici:request:trailers', this.trailersHandler);

    // Wrap global fetch to intercept error response bodies
    // (undici:request:bodyChunkReceived not available in Node 22 built-in undici)
    this.origFetch = globalThis.fetch;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (globalThis as any).fetch = async function wrappedFetch(
      input: Parameters<typeof globalThis.fetch>[0],
      init?: Parameters<typeof globalThis.fetch>[1],
    ): Promise<Response> {
      const origFetch = self.origFetch;
      if (!origFetch) {
        throw new Error('fetch not available');
      }
      const response = await origFetch.call(globalThis, input, init);

      // Intercept error responses to capture body
      if (response.status >= 400 && self.profiler.trackOnFail) {
        try {
          // Clone to read body without consuming the original response
          const cloned = response.clone();
          void cloned.text().then((bodyText) => {
            try {
              self.applyResponseBody(input, response.status, bodyText);
            } catch {
              // INTC-06: silent failure
            }
          });
        } catch {
          // INTC-06: silent failure
        }
      }

      return response;
    };
  }

  /**
   * Unsubscribe from diagnostics_channel events and restore original global fetch.
   */
  unsubscribe(): void {
    // Restore original fetch
    if (this.origFetch !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (globalThis as any).fetch = this.origFetch;
      this.origFetch = null;
    }

    let dc: typeof import('node:diagnostics_channel') | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      dc = require('node:diagnostics_channel') as typeof import('node:diagnostics_channel');
    } catch {
      return;
    }

    // Feature-detect unsubscribe (Pitfall 5: not available in all Node versions)
    if (typeof dc.unsubscribe !== 'function') {
      return;
    }

    try {
      dc.unsubscribe('undici:request:create', this.createHandler);
    } catch {
      // silent
    }
    try {
      dc.unsubscribe('undici:request:headers', this.headersHandler);
    } catch {
      // silent
    }
    try {
      dc.unsubscribe('undici:request:trailers', this.trailersHandler);
    } catch {
      // silent
    }
  }

  // ─── Private event handlers ─────────────────────────────────────────────────

  private handleCreate(msg: unknown): void {
    const message = msg as { request?: Record<string, unknown> };
    const req = message.request;
    if (!req) return;

    // CRITICAL: Capture ALS context HERE (at create time), not in headersHandler.
    // Due to undici connection pooling, store.getStore() may return undefined in
    // the headers event when connections are reused across test runs.
    const acc = this.store.getStore();
    // acc may be null/undefined when outside a run() context — use fallback accumulator in that case

    const method = typeof req['method'] === 'string' ? req['method'] : 'GET';
    const origin = typeof req['origin'] === 'string' ? req['origin'] : '';
    const path = typeof req['path'] === 'string' ? req['path'] : '/';
    const url = `${origin}${path}`;

    // Check shouldSkip
    if (this.profiler.shouldSkip(url)) {
      return;
    }

    this.pendingRequests.set(req, {
      method,
      url,
      startTime: Date.now(),
      alsContext: acc ?? null,
    });
  }

  private handleHeaders(msg: unknown): void {
    const message = msg as {
      request?: Record<string, unknown>;
      response?: { statusCode?: number };
    };
    const req = message.request;
    if (!req) return;

    const pending = this.pendingRequests.get(req);
    if (!pending) return;

    // Use the ALS context captured at create time — do NOT call store.getStore() here.
    // Connection pooling in undici can break ALS propagation between events.
    const acc = pending.alsContext;

    const endTime = Date.now();
    const statusCode = message.response?.statusCode ?? 0;

    const step = buildRequestStep({
      method: pending.method,
      url: pending.url,
      statusCode,
      responseBody: null, // filled in later for errors via fetch wrapper
      responseHeaders: null,
      startTime: pending.startTime,
      endTime,
    });

    if (acc !== null) {
      acc.push(step);
    } else {
      // No ALS context — push to fallback accumulator (for Jest/Vitest/WDIO workers)
      this.profiler.fallbackSteps.push(step);
    }

    // Register body handler for error responses
    if (statusCode >= 400 && this.profiler.trackOnFail) {
      this.bodyHandlers.set(step, (bodyText: string) => {
        (step.data as StepRequestData).response_body = bodyText;
      });
    }
  }

  private handleTrailers(msg: unknown): void {
    const message = msg as { request?: Record<string, unknown> };
    const req = message.request;
    if (!req) return;

    // Clean up pending state
    this.pendingRequests.delete(req);
  }

  /**
   * Called by the fetch wrapper when an error response body is available.
   * Finds the most recently added step for this URL/status and updates its response_body.
   */
  private applyResponseBody(
    input: Parameters<typeof globalThis.fetch>[0],
    statusCode: number,
    bodyText: string,
  ): void {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // Get all accumulated steps — use ALS context if available, fallback accumulator otherwise
    const searchArray = this.store.getStore() ?? this.profiler.fallbackSteps;
    if (searchArray.length === 0) return;

    // Find the last step that matches this response and has null body
    for (let i = searchArray.length - 1; i >= 0; i--) {
      const step = searchArray[i];
      if (!step) continue;
      const data = step.data as StepRequestData;
      if (data.status_code !== statusCode) continue;
      if (data.response_body !== null) continue;

      // Check if URL matches (handle query strings, trailing slashes)
      const stepUrl = data.request_url ?? '';
      const inputUrlBase = url.split('?')[0] ?? url;
      if (url.includes(stepUrl) || stepUrl.includes(inputUrlBase) || stepUrl === inputUrlBase) {
        const handler = this.bodyHandlers.get(step);
        if (handler) {
          handler(bodyText);
          this.bodyHandlers.delete(step);
          return;
        }
      }
    }
  }
}
