import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { NetworkProfiler } from '../../src/profilers/network-profiler';
import { AbstractProfiler } from '../../src/profilers/abstract-profiler';
import { StepRequestData } from '../../src/models/step-data';
import { StepType } from '../../src/models/test-step';

// ─── Local test HTTP server ───────────────────────────────────────────────────

let server: http.Server;
let serverPort: number;

beforeAll((done) => {
  server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
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

function makeRequest(port: number, path = '/ok'): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path, method: 'GET' },
      (res) => {
        res.resume();
        res.on('end', resolve);
      },
    );
    req.on('error', reject);
    req.end();
  });
}

// ─── Existing tests (must stay green) ────────────────────────────────────────

describe('NetworkProfiler', () => {
  describe('construction', () => {
    it('should instantiate with no arguments (defaults)', () => {
      const profiler = new NetworkProfiler();
      expect(profiler).toBeInstanceOf(NetworkProfiler);
      expect(profiler).toBeInstanceOf(AbstractProfiler);
    });

    it('should instantiate with custom options', () => {
      const profiler = new NetworkProfiler({
        skipDomains: ['example.com'],
        trackOnFail: false,
      });
      expect(profiler).toBeInstanceOf(NetworkProfiler);
    });
  });

  describe('shouldSkip', () => {
    it('should return true for Qase API URL (api.qase.io)', () => {
      const profiler = new NetworkProfiler();
      expect(profiler.shouldSkip('https://api.qase.io/v1/run')).toBe(true);
    });

    it('should return true for any qase.io subdomain (app.qase.io)', () => {
      const profiler = new NetworkProfiler();
      expect(profiler.shouldSkip('https://app.qase.io/projects')).toBe(true);
    });

    it('should return false for external URLs', () => {
      const profiler = new NetworkProfiler();
      expect(profiler.shouldSkip('https://jsonplaceholder.typicode.com/posts')).toBe(false);
    });

    it('should return true for user-configured skipDomains', () => {
      const profiler = new NetworkProfiler({ skipDomains: ['internal.company.com'] });
      expect(profiler.shouldSkip('https://internal.company.com/api')).toBe(true);
    });

    it('should return false for non-matching URL when skipDomains is empty', () => {
      const profiler = new NetworkProfiler({ skipDomains: [] });
      expect(profiler.shouldSkip('https://internal.company.com/api')).toBe(false);
    });

    it('should return false for unrelated external URL', () => {
      const profiler = new NetworkProfiler({ skipDomains: ['example.com'] });
      expect(profiler.shouldSkip('https://other.com/api')).toBe(false);
    });

    it('should match any qase.io URL regardless of path', () => {
      const profiler = new NetworkProfiler();
      expect(profiler.shouldSkip('https://qase.io/')).toBe(true);
    });
  });

  describe('lifecycle methods', () => {
    it('should call enable() without throwing', () => {
      const profiler = new NetworkProfiler();
      expect(() => profiler.enable()).not.toThrow();
      profiler.restore(); // cleanup
    });

    it('should call disable() without throwing', () => {
      const profiler = new NetworkProfiler();
      expect(() => profiler.disable()).not.toThrow();
    });

    it('should call restore() without throwing', () => {
      const profiler = new NetworkProfiler();
      expect(() => profiler.restore()).not.toThrow();
    });
  });

  // ─── New lifecycle tests with HTTP interception ─────────────────────────────

  describe('lifecycle with http interception', () => {
    it('enable() activates http interception and run() returns steps', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      const { result, steps } = await profiler.run(async () => {
        await makeRequest(serverPort);
        return 'done';
      });
      profiler.restore();
      expect(result).toBe('done');
      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps[0]!.step_type).toBe(StepType.REQUEST);
    });

    it('run() returns { result, steps } with correct types', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      const { result, steps } = await profiler.run(async () => {
        await makeRequest(serverPort);
        return 42;
      });
      profiler.restore();
      expect(typeof result).toBe('number');
      expect(result).toBe(42);
      expect(Array.isArray(steps)).toBe(true);
    });

    it('run() captures REQUEST step with correct method and url', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      const { steps } = await profiler.run(async () => {
        await makeRequest(serverPort, '/mypath');
      });
      profiler.restore();
      expect(steps.length).toBeGreaterThanOrEqual(1);
      const data = steps[0]!.data as StepRequestData;
      expect(data.request_method).toBe('GET');
      expect(data.request_url).toContain('/mypath');
    });

    it('restore() deactivates interception — no steps after restore()', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      profiler.restore();
      const { steps } = await profiler.run(async () => {
        await makeRequest(serverPort);
      });
      expect(steps).toHaveLength(0);
    });

    it('disable() does not throw and does not break subsequent run() calls', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      expect(() => profiler.disable()).not.toThrow();
      const { steps } = await profiler.run(async () => {
        await makeRequest(serverPort);
      });
      profiler.restore();
      // After disable() (no-op), run() should still work
      expect(Array.isArray(steps)).toBe(true);
    });
  });

  describe('run() ALS isolation', () => {
    it('two concurrent run() calls each get their own isolated step arrays', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();

      // Run two concurrent operations
      const [res1, res2] = await Promise.all([
        profiler.run(async () => {
          await makeRequest(serverPort, '/path1');
          await makeRequest(serverPort, '/path2');
        }),
        profiler.run(async () => {
          await makeRequest(serverPort, '/path3');
        }),
      ]);

      profiler.restore();

      // Each run has its own isolated step arrays
      expect(res1.steps.length).toBeGreaterThanOrEqual(1);
      expect(res2.steps.length).toBeGreaterThanOrEqual(1);

      // Verify steps are NOT shared (no cross-attribution)
      // res1 should not contain res2's steps and vice-versa
      const res1Urls = res1.steps.map((s) => (s.data as StepRequestData).request_url);
      const res2Urls = res2.steps.map((s) => (s.data as StepRequestData).request_url);

      // Make sure no URL from res2 is in res1's steps (ALS isolation)
      for (const url of res2Urls) {
        expect(res1Urls).not.toContain(url);
      }
    });
  });

  describe('getSteps()', () => {
    it('returns current ALS store when inside run()', async () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      let stepsInsideRun: ReturnType<typeof profiler.getSteps> = [];
      await profiler.run(async () => {
        await makeRequest(serverPort);
        stepsInsideRun = profiler.getSteps();
      });
      profiler.restore();
      expect(stepsInsideRun.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array outside run()', () => {
      const profiler = new NetworkProfiler();
      profiler.enable();
      const steps = profiler.getSteps();
      profiler.restore();
      expect(steps).toEqual([]);
    });
  });

  // ─── Combined http + fetch interception ──────────────────────────────────────

  describe('combined http + fetch interception', () => {
    const hasFetch = typeof globalThis.fetch === 'function';

    it('enable() activates fetch interception — fetch() produces a REQUEST step', async function () {
      if (!hasFetch) {
        console.log('Skipping: no global fetch (Node < 18)');
        return;
      }
      const profiler = new NetworkProfiler();
      profiler.enable();
      const { steps } = await profiler.run(async () => {
        await fetch(`http://127.0.0.1:${serverPort}/ok`);
      });
      profiler.restore();
      expect(steps.length).toBeGreaterThanOrEqual(1);
      expect(steps[0]!.step_type).toBe(StepType.REQUEST);
    });

    it('after enable(), both http.request and fetch() produce steps in the same run()', async function () {
      if (!hasFetch) {
        console.log('Skipping: no global fetch (Node < 18)');
        return;
      }
      const profiler = new NetworkProfiler();
      profiler.enable();
      const { steps } = await profiler.run(async () => {
        await makeRequest(serverPort);
        await fetch(`http://127.0.0.1:${serverPort}/ok`);
      });
      profiler.restore();
      // Should have at least 2 steps: one from http.request, one from fetch()
      expect(steps.length).toBeGreaterThanOrEqual(2);
      const requestTypes = steps.map((s) => s.step_type);
      expect(requestTypes.every((t) => t === StepType.REQUEST)).toBe(true);
    });

    it('after restore(), neither http.request nor fetch() produce steps', async function () {
      if (!hasFetch) {
        console.log('Skipping: no global fetch (Node < 18)');
        return;
      }
      const profiler = new NetworkProfiler();
      profiler.enable();
      profiler.restore();
      const { steps } = await profiler.run(async () => {
        await makeRequest(serverPort);
        await fetch(`http://127.0.0.1:${serverPort}/ok`);
      });
      expect(steps).toHaveLength(0);
    });

    it('mixed concurrent run() — http.request and fetch() steps isolated correctly', async function () {
      if (!hasFetch) {
        console.log('Skipping: no global fetch (Node < 18)');
        return;
      }
      const profiler = new NetworkProfiler();
      profiler.enable();

      const [httpResult, fetchResult] = await Promise.all([
        profiler.run(async () => {
          await makeRequest(serverPort, '/path-http');
        }),
        profiler.run(async () => {
          await fetch(`http://127.0.0.1:${serverPort}/path-fetch`);
        }),
      ]);

      profiler.restore();

      // Each run should have its own isolated steps
      expect(httpResult.steps.length).toBeGreaterThanOrEqual(1);
      expect(fetchResult.steps.length).toBeGreaterThanOrEqual(1);

      // Verify cross-attribution does not occur
      const httpUrls = httpResult.steps.map((s) => (s.data as StepRequestData).request_url);
      const fetchUrls = fetchResult.steps.map((s) => (s.data as StepRequestData).request_url);

      for (const url of fetchUrls) {
        expect(httpUrls).not.toContain(url);
      }
    });
  });
});
