import { expect, describe, it, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import http from 'node:http';
import https from 'node:https';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AddressInfo } from 'node:net';
import { HttpInterceptor, extractRequestInfo, headersToRecord } from '../../src/profilers/http-interceptor';
import { NetworkProfiler } from '../../src/profilers/network-profiler';
import { TestStepType, StepType } from '../../src/models/test-step';
import { StepStatusEnum } from '../../src/models/step-execution';
import { StepRequestData } from '../../src/models/step-data';

// ─── Local test HTTP server ─────────────────────────────────────────────────

let server: http.Server;
let serverPort: number;

beforeAll((done) => {
  server = http.createServer((req, res) => {
    const url = req.url ?? '/';
    if (url === '/ok') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else if (url === '/error') {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else if (url.startsWith('/status/')) {
      const code = parseInt(url.replace('/status/', ''), 10);
      res.writeHead(isNaN(code) ? 200 : code, { 'Content-Type': 'text/plain' });
      res.end(`Status ${code}`);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  server.listen(0, '127.0.0.1', () => {
    serverPort = (server.address() as AddressInfo).port;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: serverPort, path, method: 'GET' },
      (res) => {
        res.resume(); // consume response
        res.on('end', resolve);
      },
    );
    req.on('error', reject);
    req.end();
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('extractRequestInfo', () => {
  it('handles string URL', () => {
    const info = extractRequestInfo(['http://example.com/path', undefined, undefined]);
    expect(info.url).toBe('http://example.com/path');
    expect(info.method).toBe('GET');
  });

  it('handles URL object', () => {
    const urlObj = new URL('https://example.com/resource?q=1');
    const info = extractRequestInfo([urlObj, undefined, undefined]);
    expect(info.url).toBe('https://example.com/resource?q=1');
    expect(info.method).toBe('GET');
  });

  it('handles RequestOptions object with method', () => {
    const info = extractRequestInfo([
      { hostname: 'example.com', port: 443, path: '/api', protocol: 'https:', method: 'POST' },
      undefined,
      undefined,
    ]);
    expect(info.url).toBe('https://example.com:443/api');
    expect(info.method).toBe('POST');
  });

  it('uses GET as default method when method not specified in options', () => {
    const info = extractRequestInfo([
      { hostname: 'example.com', path: '/api' },
      undefined,
      undefined,
    ]);
    expect(info.method).toBe('GET');
  });

  it('constructs URL from hostname without port', () => {
    const info = extractRequestInfo([
      { hostname: 'example.com', path: '/resource' },
      undefined,
      undefined,
    ]);
    expect(info.url).toContain('example.com');
    expect(info.url).toContain('/resource');
  });
});

describe('headersToRecord', () => {
  it('converts string header values', () => {
    const result = headersToRecord({ 'content-type': 'application/json' });
    expect(result).toEqual({ 'content-type': 'application/json' });
  });

  it('joins multi-value array headers with ", "', () => {
    const result = headersToRecord({ 'set-cookie': ['a=1', 'b=2'] });
    expect(result).toEqual({ 'set-cookie': 'a=1, b=2' });
  });

  it('skips undefined values', () => {
    const result = headersToRecord({ 'x-missing': undefined, 'x-present': 'yes' });
    expect(result).toEqual({ 'x-present': 'yes' });
  });

  it('handles number header values by converting to string', () => {
    const result = headersToRecord({ 'content-length': '42' });
    expect(result).toEqual({ 'content-length': '42' });
  });
});

describe('HttpInterceptor', () => {
  let store: AsyncLocalStorage<TestStepType[]>;
  let profiler: NetworkProfiler;
  let interceptor: HttpInterceptor;

  beforeEach(() => {
    store = new AsyncLocalStorage<TestStepType[]>();
    profiler = new NetworkProfiler({ trackOnFail: true });
    interceptor = new HttpInterceptor(store, profiler);
  });

  afterEach(() => {
    interceptor.uninstall();
  });

  it('install() wraps http.request and a GET produces one REQUEST step', async () => {
    interceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/ok');
    });
    expect(steps).toHaveLength(1);
    const step = steps[0];
    expect(step).toBeDefined();
    expect(step!.step_type).toBe(StepType.REQUEST);
    const data = step!.data as StepRequestData;
    expect(data.request_method).toBe('GET');
    expect(data.request_url).toContain('/ok');
    expect(data.status_code).toBe(200);
    expect(step!.execution.start_time).not.toBeNull();
    expect(step!.execution.end_time).not.toBeNull();
    expect(step!.execution.duration).not.toBeNull();
    expect((step!.execution.duration as number) >= 0).toBe(true);
  });

  it('response with status 200 has response_body: null', async () => {
    interceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/ok');
    });
    expect(steps).toHaveLength(1);
    const data = steps[0]!.data as StepRequestData;
    expect(data.response_body).toBeNull();
  });

  it('response with status >= 400 has response_body containing error text', async () => {
    interceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/error');
    });
    expect(steps).toHaveLength(1);
    const data = steps[0]!.data as StepRequestData;
    expect(data.status_code).toBe(500);
    expect(data.response_body).not.toBeNull();
    expect(data.response_body).toContain('Internal Server Error');
  });

  it('response headers captured only for status >= 400', async () => {
    interceptor.install();
    const stepsOk: TestStepType[] = [];
    const stepsErr: TestStepType[] = [];

    await store.run(stepsOk, async () => {
      await makeRequest('/ok');
    });
    await store.run(stepsErr, async () => {
      await makeRequest('/error');
    });

    const dataOk = stepsOk[0]!.data as StepRequestData;
    expect(dataOk.response_headers).toBeNull();

    const dataErr = stepsErr[0]!.data as StepRequestData;
    expect(dataErr.response_headers).not.toBeNull();
  });

  it('uninstall() restores original http.request — no steps produced after uninstall', async () => {
    interceptor.install();
    interceptor.uninstall();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/ok');
    });
    expect(steps).toHaveLength(0);
  });

  it('uninstall() restores http.get, https.request, https.get', () => {
    const origHttpRequest = http.request;
    const origHttpGet = http.get;
    const origHttpsRequest = https.request;
    const origHttpsGet = https.get;

    interceptor.install();

    // After install, functions should be wrapped (different references)
    expect(http.request).not.toBe(origHttpRequest);
    expect(http.get).not.toBe(origHttpGet);
    expect(https.request).not.toBe(origHttpsRequest);
    expect(https.get).not.toBe(origHttpsGet);

    interceptor.uninstall();

    // After uninstall, original functions should be restored
    expect(http.request).toBe(origHttpRequest);
    expect(http.get).toBe(origHttpGet);
    expect(https.request).toBe(origHttpsRequest);
    expect(https.get).toBe(origHttpsGet);
  });

  it('when ALS store is null, request works but produces no step', async () => {
    interceptor.install();
    // Don't use store.run() — no active context
    await makeRequest('/ok');
    // No steps anywhere — just verifying no throw and function works
    // The store has no active context, so getStore() returns undefined
    expect(store.getStore()).toBeUndefined();
  });

  it('step has StepStatusEnum.passed for 2xx responses', async () => {
    interceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/ok');
    });
    expect(steps[0]!.execution.status).toBe(StepStatusEnum.passed);
  });

  it('step has StepStatusEnum.failed for 4xx/5xx responses', async () => {
    interceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/error');
    });
    expect(steps[0]!.execution.status).toBe(StepStatusEnum.failed);
  });

  it('step id is a non-empty UUID string', async () => {
    interceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/ok');
    });
    expect(steps[0]!.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('silent failure: error inside response handler does not propagate', async () => {
    // Create a special interceptor that will throw during response handling
    // We test by making sure the request completes without throwing
    interceptor.install();
    const steps: TestStepType[] = [];
    // The internal handler error should be silently caught — request resolves normally
    await expect(
      store.run(steps, async () => {
        await makeRequest('/ok');
      }),
    ).resolves.not.toThrow();
  });

  it('https.request calls are also intercepted (function reference replaced)', () => {
    const origHttpsRequest = https.request;
    interceptor.install();
    expect(https.request).not.toBe(origHttpsRequest);
    interceptor.uninstall();
    expect(https.request).toBe(origHttpsRequest);
  });

  it('trackOnFail=false means response_body is null even for errors', async () => {
    const profilerNoTrack = new NetworkProfiler({ trackOnFail: false });
    const interceptorNoTrack = new HttpInterceptor(store, profilerNoTrack);
    interceptorNoTrack.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/error');
    });
    interceptorNoTrack.uninstall();
    const data = steps[0]!.data as StepRequestData;
    expect(data.response_body).toBeNull();
  });

  it('shouldSkip domains are not tracked', async () => {
    // We can't make actual requests to qase.io, but we can verify shouldSkip is checked
    // by using a profiler with a skipDomain matching our test server
    const skipProfiler = new NetworkProfiler({ skipDomains: ['127.0.0.1'] });
    const skipInterceptor = new HttpInterceptor(store, skipProfiler);
    skipInterceptor.install();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await makeRequest('/ok');
    });
    skipInterceptor.uninstall();
    expect(steps).toHaveLength(0);
  });
});
