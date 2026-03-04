import http from 'node:http';
import https from 'node:https';
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuidv4 } from 'uuid';

import { TestStepType, StepType } from '../models/test-step';
import { StepStatusEnum } from '../models/step-execution';
import { StepRequestData } from '../models/step-data';

// Forward-declare the profiler interface we need to avoid circular imports
interface ProfilerRef {
  shouldSkip(url: string): boolean;
  trackOnFail: boolean;
  fallbackSteps: TestStepType[];
}

// ─── Type aliases for wrapped function signatures ─────────────────────────────

type HttpRequestFn = typeof http.request;
type HttpGetFn = typeof http.get;
type HttpsRequestFn = typeof https.request;
type HttpsGetFn = typeof https.get;

// ─── Utility: extractRequestInfo ─────────────────────────────────────────────

export interface RequestInfo {
  method: string;
  url: string;
}

/**
 * Handles the 3 `http.request()` call signatures:
 *  - (url: string, options?, callback?)
 *  - (url: URL, options?, callback?)
 *  - (options: RequestOptions, callback?)
 *
 * Returns `{ method, url }`. Default method is 'GET'.
 */
export function extractRequestInfo(
  args: [
    string | URL | http.RequestOptions,
    (http.RequestOptions | ((res: http.IncomingMessage) => void))?,
    ((res: http.IncomingMessage) => void)?,
  ],
): RequestInfo {
  const first = args[0];

  if (typeof first === 'string') {
    // Signature: (url: string, options?, callback?)
    const options = args[1];
    const method =
      options && typeof options === 'object' && !('emit' in options) && 'method' in options && typeof options.method === 'string'
        ? options.method
        : 'GET';
    return { method, url: first };
  }

  if (first instanceof URL) {
    // Signature: (url: URL, options?, callback?)
    const options = args[1];
    const method =
      options && typeof options === 'object' && !('emit' in options) && 'method' in options && typeof options.method === 'string'
        ? options.method
        : 'GET';
    return { method, url: first.toString() };
  }

  // Signature: (options: RequestOptions, callback?)
  const opts = first;
  const method = opts.method ?? 'GET';
  const protocol = opts.protocol ?? 'http:';
  const hostname = opts.hostname ?? opts.host ?? 'localhost';
  const port = opts.port !== undefined ? `:${String(opts.port)}` : '';
  const path = opts.path ?? '/';
  const url = `${protocol}//${hostname}${port}${path}`;

  return { method, url };
}

// ─── Utility: headersToRecord ─────────────────────────────────────────────────

/**
 * Converts `http.IncomingHttpHeaders` (which has `string | string[] | undefined` values)
 * to `Record<string, string>`. Multi-value headers joined with `', '`. Undefined values skipped.
 */
export function headersToRecord(
  headers: http.IncomingHttpHeaders,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value.join(', ');
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── Utility: buildRequestStep ───────────────────────────────────────────────

export function buildRequestStep(params: {
  method: string;
  url: string;
  statusCode: number;
  responseBody: string | null;
  responseHeaders: Record<string, string> | null;
  startTime: number;
  endTime: number;
}): TestStepType {
  const step = new TestStepType(StepType.REQUEST);
  step.id = uuidv4();

  const data = step.data as StepRequestData;
  data.request_method = params.method;
  data.request_url = params.url;
  data.request_headers = null;
  data.request_body = null;
  data.status_code = params.statusCode;
  data.response_body = params.responseBody;
  data.response_headers = params.responseHeaders;

  step.execution.start_time = params.startTime;
  step.execution.end_time = params.endTime;
  step.execution.duration = params.endTime - params.startTime;
  step.execution.status = params.statusCode >= 400 ? StepStatusEnum.failed : StepStatusEnum.passed;

  return step;
}

// ─── HttpInterceptor ─────────────────────────────────────────────────────────

/**
 * HttpInterceptor monkey-patches Node.js http/https module functions to capture
 * outgoing requests as REQUEST-type steps in the AsyncLocalStorage store.
 *
 * Pattern:
 *  1. `install()` — saves originals, replaces with wrappers
 *  2. `uninstall()` — restores originals
 */
export class HttpInterceptor {
  private readonly store: AsyncLocalStorage<TestStepType[]>;
  private readonly profiler: ProfilerRef;

  private origHttpRequest: HttpRequestFn | null = null;
  private origHttpGet: HttpGetFn | null = null;
  private origHttpsRequest: HttpsRequestFn | null = null;
  private origHttpsGet: HttpsGetFn | null = null;

  constructor(store: AsyncLocalStorage<TestStepType[]>, profiler: ProfilerRef) {
    this.store = store;
    this.profiler = profiler;
  }

  install(): void {
    this.origHttpRequest = http.request;
    this.origHttpGet = http.get;
    this.origHttpsRequest = https.request;
    this.origHttpsGet = https.get;

    const wrappedHttpRequest = this.wrapRequestFn(this.origHttpRequest);
    const wrappedHttpGet = this.wrapRequestFn(this.origHttpGet) as HttpGetFn;
    const wrappedHttpsRequest = this.wrapRequestFn(this.origHttpsRequest) as HttpsRequestFn;
    const wrappedHttpsGet = this.wrapRequestFn(this.origHttpsGet) as HttpsGetFn;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (http as any).request = wrappedHttpRequest;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (http as any).get = wrappedHttpGet;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (https as any).request = wrappedHttpsRequest;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (https as any).get = wrappedHttpsGet;
  }

  uninstall(): void {
    if (this.origHttpRequest !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (http as any).request = this.origHttpRequest;
      this.origHttpRequest = null;
    }
    if (this.origHttpGet !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (http as any).get = this.origHttpGet;
      this.origHttpGet = null;
    }
    if (this.origHttpsRequest !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (https as any).request = this.origHttpsRequest;
      this.origHttpsRequest = null;
    }
    if (this.origHttpsGet !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (https as any).get = this.origHttpsGet;
      this.origHttpsGet = null;
    }
  }

  /**
   * Creates a wrapper around a http.request-like function.
   * The wrapper:
   *  1. Calls the original function to get the ClientRequest
   *  2. Checks if there's an active ALS context — if not, returns unchanged
   *  3. Checks shouldSkip — if true, returns unchanged
   *  4. Intercepts the 'response' event via req.emit override
   *  5. Builds a TestStepType on response end and pushes to accumulator
   */
  private wrapRequestFn(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    origFn: (...args: any[]) => http.ClientRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): (...args: any[]) => http.ClientRequest {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: unknown, ...args: any[]): http.ClientRequest {
      // Call original first to get the ClientRequest
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const req: http.ClientRequest = origFn.apply(this, args);

      // Extract request info
      let reqInfo: RequestInfo;
      try {
        reqInfo = extractRequestInfo(
          args as [
            string | URL | http.RequestOptions,
            (http.RequestOptions | ((res: http.IncomingMessage) => void))?,
            ((res: http.IncomingMessage) => void)?,
          ],
        );
      } catch {
        return req;
      }

      // Check if this domain should be skipped
      if (self.profiler.shouldSkip(reqInfo.url)) {
        return req;
      }

      const startTime = Date.now();
      const origEmit = req.emit.bind(req);

      // Override req.emit to intercept the 'response' event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.emit = function (event: string, ...emitArgs: any[]): boolean {
        if (event === 'response') {
          const res = emitArgs[0] as http.IncomingMessage;
          try {
            const chunks: Buffer[] = [];
            const isError = (res.statusCode ?? 0) >= 400;

            // Register data listener BEFORE calling original emit (Pitfall 2: stream consumption race)
            if (isError && self.profiler.trackOnFail) {
              res.on('data', (chunk: Buffer | string) => {
                try {
                  chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                } catch {
                  // silent failure
                }
              });
            }

            res.on('end', () => {
              try {
                const endTime = Date.now();
                const statusCode = res.statusCode ?? 0;
                const captureBody = statusCode >= 400 && self.profiler.trackOnFail;
                const responseBody = captureBody ? Buffer.concat(chunks).toString('utf8') : null;
                const responseHeaders =
                  statusCode >= 400 ? headersToRecord(res.headers) : null;

                const step = buildRequestStep({
                  method: reqInfo.method,
                  url: reqInfo.url,
                  statusCode,
                  responseBody,
                  responseHeaders,
                  startTime,
                  endTime,
                });

                // Push to accumulator — re-fetch in case context is still active
                const acc = self.store.getStore();
                if (acc !== undefined && acc !== null) {
                  acc.push(step);
                } else {
                  // No ALS context — push to fallback accumulator (for Jest/Vitest/WDIO workers)
                  self.profiler.fallbackSteps.push(step);
                }
              } catch {
                // INTC-06: silent failure — do not propagate to test
              }
            });
          } catch {
            // INTC-06: silent failure in setup — do not propagate
          }

          // CRITICAL: Call original emit LAST (after registering data listeners)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return origEmit(event, ...emitArgs);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return origEmit(event, ...emitArgs);
      };

      return req;
    };
  }
}
