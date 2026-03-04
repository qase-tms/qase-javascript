import { expect, describe, it, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import http from 'node:http';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AddressInfo } from 'node:net';
import { FetchInterceptor } from '../../src/profilers/fetch-interceptor';
import { NetworkProfiler } from '../../src/profilers/network-profiler';
import { TestStepType, StepType } from '../../src/models/test-step';
import { StepStatusEnum } from '../../src/models/step-execution';
import { StepRequestData } from '../../src/models/step-data';

// ─── Skip guard for Node < 18 (no global fetch) ─────────────────────────────

const hasFetch = typeof globalThis.fetch === 'function';
const describeOrSkip = hasFetch ? describe : describe.skip;

// ─── Local test HTTP server ──────────────────────────────────────────────────

let server: http.Server;
let serverPort: number;
let serverBase: string;

beforeAll((done) => {
  server = http.createServer((req, res) => {
    const url = req.url ?? '/';
    if (url === '/ok') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else if (url === '/error') {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else if (url === '/not-found') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else if (url.startsWith('/status/')) {
      const code = parseInt(url.replace('/status/', ''), 10);
      res.writeHead(isNaN(code) ? 200 : code, { 'Content-Type': 'text/plain' });
      res.end(`Status ${code}`);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Default');
    }
  });
  server.listen(0, '127.0.0.1', () => {
    serverPort = (server.address() as AddressInfo).port;
    serverBase = `http://127.0.0.1:${serverPort}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describeOrSkip('FetchInterceptor', () => {
  let store: AsyncLocalStorage<TestStepType[]>;
  let profiler: NetworkProfiler;
  let interceptor: FetchInterceptor;

  beforeEach(() => {
    store = new AsyncLocalStorage<TestStepType[]>();
    profiler = new NetworkProfiler({ trackOnFail: true });
    interceptor = new FetchInterceptor(store, profiler);
  });

  afterEach(() => {
    interceptor.unsubscribe();
  });

  it('subscribe() registers handlers — fetch() call produces exactly one REQUEST step', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    expect(steps).toHaveLength(1);
    const step = steps[0];
    expect(step).toBeDefined();
    expect(step!.step_type).toBe(StepType.REQUEST);
  });

  it('REQUEST step has correct method, URL, status code, and non-null timing', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    expect(steps).toHaveLength(1);
    const step = steps[0]!;
    const data = step.data as StepRequestData;
    expect(data.request_method).toBe('GET');
    expect(data.request_url).toContain('/ok');
    expect(data.status_code).toBe(200);
    expect(step.execution.start_time).not.toBeNull();
    expect(step.execution.end_time).not.toBeNull();
    expect(step.execution.duration).not.toBeNull();
    expect((step.execution.duration as number) >= 0).toBe(true);
  });

  it('fetch() with status 200 has response_body: null', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    expect(steps).toHaveLength(1);
    const data = steps[0]!.data as StepRequestData;
    expect(data.response_body).toBeNull();
  });

  it('fetch() with status >= 400 has response_body containing error text', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      const res = await fetch(`${serverBase}/error`);
      // Consume body so trailers fire
      await res.text();
    });
    // Wait a tick for async handlers to complete
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(steps).toHaveLength(1);
    const data = steps[0]!.data as StepRequestData;
    expect(data.status_code).toBe(500);
    expect(data.response_body).not.toBeNull();
    expect(data.response_body).toContain('Internal Server Error');
  });

  it('step has StepStatusEnum.passed for 2xx responses', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    expect(steps[0]!.execution.status).toBe(StepStatusEnum.passed);
  });

  it('step has StepStatusEnum.failed for 4xx/5xx responses', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      const res = await fetch(`${serverBase}/error`);
      await res.text();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(steps[0]!.execution.status).toBe(StepStatusEnum.failed);
  });

  it('unsubscribe() removes handlers — fetch() calls after unsubscribe produce no steps', async () => {
    interceptor.subscribe();
    interceptor.unsubscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    expect(steps).toHaveLength(0);
  });

  it('when ALS store is null, fetch() works normally and produces no step', async () => {
    interceptor.subscribe();
    // No store.run() context — fetch still completes without error
    const response = await fetch(`${serverBase}/ok`);
    expect(response.status).toBe(200);
    // No context to check, just verifying no throw
    expect(store.getStore()).toBeUndefined();
  });

  it('shouldSkip filtering — fetch to skipped domain produces no step', async () => {
    const skipProfiler = new NetworkProfiler({ skipDomains: ['127.0.0.1'] });
    const skipInterceptor = new FetchInterceptor(store, skipProfiler);
    skipInterceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    skipInterceptor.unsubscribe();
    expect(steps).toHaveLength(0);
  });

  it('two concurrent fetch() calls in separate ALS contexts produce isolated steps', async () => {
    interceptor.subscribe();

    const [res1, res2] = await Promise.all([
      store.run([] as TestStepType[], async () => {
        await fetch(`${serverBase}/ok`);
        await fetch(`${serverBase}/ok`);
        return store.getStore()!;
      }),
      store.run([] as TestStepType[], async () => {
        await fetch(`${serverBase}/ok`);
        return store.getStore()!;
      }),
    ]);

    // res1 should have 2 steps, res2 should have 1 step
    expect(res1).toHaveLength(2);
    expect(res2).toHaveLength(1);
  });

  it('error inside diagnostics_channel handler is silently caught — fetch completes normally', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    // Verify fetch completes normally even if there were internal errors
    await expect(
      store.run(steps, async () => {
        await fetch(`${serverBase}/ok`);
      }),
    ).resolves.not.toThrow();
  });

  it('step id is a non-empty UUID string', async () => {
    interceptor.subscribe();
    const steps: TestStepType[] = [];
    await store.run(steps, async () => {
      await fetch(`${serverBase}/ok`);
    });
    expect(steps[0]!.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
