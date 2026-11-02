/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import Mocha from 'mocha';

// Runs real Mocha suites through the reporter; only the Qase upstream is replaced.
const upstream = {
  startTestRunAsync: jest.fn(async () => undefined),
  publish: jest.fn(async () => undefined),
  sendResults: jest.fn(async () => undefined),
  complete: jest.fn(async () => undefined),
  setTestResults: jest.fn((_results: any[]) => undefined),
  addTestResult: jest.fn(async (_result: any) => undefined),
  isCaptureLogs: jest.fn(() => false),
};

// deasync's native binding does not load under Jest; the mocked upstream needs no waiting.
jest.mock('deasync-promise', () => () => undefined);

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    QaseReporter: { getInstance: jest.fn(() => upstream) },
    ConfigLoader: jest.fn().mockImplementation(() => ({ load: () => ({}) })),
  };
});

import { MochaQaseReporter } from '../src/reporter';
const QaseParallelReporter = require('../src/parallel');

type Body = (this: any) => void;

const run = (build: (suite: Mocha.Suite) => void): Promise<any[]> =>
  new Promise((resolve) => {
    const mocha = new Mocha({ reporter: MochaQaseReporter as any });
    build(mocha.suite);
    mocha.run(() => resolve(upstream.addTestResult.mock.calls.map((c) => c[0])));
  });

const test = (title: string, fn: Body) => new Mocha.Test(title, fn);
const suite = (parent: Mocha.Suite, title: string) => Mocha.Suite.create(parent, title);

describe('MochaQaseReporter with real Mocha', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    upstream.isCaptureLogs.mockReturnValue(false);
  });

  it('reports a test whose beforeEach hook fails, with the hook error', async () => {
    const results = await run((root) => {
      const s = suite(root, 'S');
      let n = 0;
      s.beforeEach(function (this: any) {
        n++;
        if (n === 2) throw new Error('hook broke');
      });
      s.addTest(test('first', () => {}));
      s.addTest(test('second', () => {}));
    });

    const second = results.find((r) => r.title === 'second');
    expect(second).toBeDefined();
    expect(second.execution.status).not.toBe('passed');
    expect(second.message).toContain('hook broke');
  });

  it('does not carry metadata from a failed beforeEach over to the next test', async () => {
    const results = await run((root) => {
      const a = suite(root, 'A');
      let n = 0;
      a.beforeEach(function (this: any) {
        n++;
        if (n === 1) {
          this.comment('from the failing hook');
          throw new Error('hook broke');
        }
      });
      a.addTest(test('a1', () => {}));
      const b = suite(root, 'B');
      b.addTest(test('b1', () => {}));
    });

    const b1 = results.find((r) => r.title === 'b1');
    expect(b1.message).toBeNull();
    expect(results.find((r) => r.title === 'a1').message).toContain('from the failing hook');
  });

  it('applies metadata set in beforeEach to its test', async () => {
    const results = await run((root) => {
      const s = suite(root, 'S');
      s.beforeEach(function (this: any) {
        this.fields({ from: 'beforeEach' });
      });
      s.addTest(test('t', () => {}));
    });
    expect(results[0].fields).toEqual({ from: 'beforeEach' });
  });

  it('reports each test once', async () => {
    const results = await run((root) => {
      const s = suite(root, 'S');
      s.addTest(test('a', () => {}));
      s.addTest(test('b', () => {}));
    });
    expect(results.map((r) => r.title)).toEqual(['a', 'b']);
  });

  it('leaves stdout alone when captureLogs is off', async () => {
    const write = process.stdout.write;
    let seen: any;
    await run((root) => {
      root.addTest(test('t', () => {
        seen = process.stdout.write;
      }));
    });
    expect(seen).toBe(write);
  });

  it('records the test output when captureLogs is on, without the spec reporter lines', async () => {
    upstream.isCaptureLogs.mockReturnValue(true);
    const results = await run((root) => {
      root.addTest(test('t', () => {
        process.stdout.write('from the test\n');
      }));
    });
    const stdout = results[0].attachments.find((a: any) => a.file_name === 'stdout.txt');
    expect(stdout.content).toBe('from the test\n');
    expect(stdout.id).not.toBe('');
  });
  it('keeps only the last attempt\'s tags and comment when a test is retried', async () => {
    const results = await run((root) => {
      const s = suite(root, 'S');
      s.retries(2);
      let attempt = 0;
      s.addTest(test('flaky', function (this: any) {
        attempt++;
        this.tags('smoke');
        this.comment(`attempt ${attempt}`);
        if (attempt < 3) throw new Error('not yet');
      }));
    });
    expect(results).toHaveLength(1);
    expect(results[0].tags).toEqual(['smoke']);
    expect(results[0].message).toBe('attempt 3');
  });

  it('gives a skipped test its own start time', async () => {
    const results = await run((root) => {
      const s = suite(root, 'S');
      s.addTest(test('slow', () => {
        const until = Date.now() + 50;
        while (Date.now() < until) { /* busy wait */ }
      }));
      s.addTest(new Mocha.Test('skipped'));
    });
    const slow = results.find((r) => r.title === 'slow');
    const skipped = results.find((r) => r.title === 'skipped');
    expect(skipped.execution.status).toBe('skipped');
    expect(skipped.execution.start_time).toBeGreaterThanOrEqual(slow.execution.end_time);
  });
});

describe('MochaQaseReporter in parallel mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    upstream.isCaptureLogs.mockReturnValue(false);
  });

  const Events = Mocha.Runner.constants;
  const mainRunner = () => {
    const runner: any = new Mocha.Runner(new Mocha.Suite('root'));
    runner.workerReporter = jest.fn();
    return runner;
  };

  it('starts the run before the workers and completes it once at the end', async () => {
    const runner = mainRunner();
    const options: any = { parallel: true, globalSetup: [], globalTeardown: [] };
    new MochaQaseReporter(runner, options);

    // Mocha awaits these around the parallel run; workers are forked after the setup.
    for (const fn of options.globalSetup) await fn();
    expect(upstream.startTestRunAsync).toHaveBeenCalledTimes(1);

    runner.emit(Events.EVENT_RUN_BEGIN);
    runner.emit(Events.EVENT_RUN_END);
    for (const fn of options.globalTeardown) await fn();
    expect(upstream.startTestRunAsync).toHaveBeenCalledTimes(1);
    expect(upstream.complete).toHaveBeenCalledTimes(1);
    expect(upstream.publish).not.toHaveBeenCalled();
  });

  it('runs extra reporters in the main process', () => {
    const runner = mainRunner();
    const log = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    new MochaQaseReporter(runner, { parallel: true, reporterOptions: { extraReporters: 'json' } } as any);
    runner.emit(Events.EVENT_RUN_BEGIN);
    runner.emit(Events.EVENT_RUN_END);
    const printed = log.mock.calls.map((c) => String(c[0])).join('\n');
    log.mockRestore();
    expect(printed).toContain('"passes"');
  });

  it('in a worker, sends its results without starting or completing the run', async () => {
    await new Promise<void>((resolve) => {
      const mocha = new Mocha({ reporter: QaseParallelReporter as any });
      mocha.suite.addTest(test('in worker', () => {}));
      mocha.run(() => resolve());
    });
    expect(upstream.addTestResult).toHaveBeenCalledTimes(1);
    expect(upstream.startTestRunAsync).not.toHaveBeenCalled();
    expect(upstream.publish).not.toHaveBeenCalled();
    expect(upstream.sendResults).toHaveBeenCalledTimes(1);
    // The worker's reporter instance is reused for its next file.
    expect(upstream.setTestResults).toHaveBeenCalledWith([]);
  });

  it('in a worker, does not run extra reporters', async () => {
    const log = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    await new Promise<void>((resolve) => {
      const mocha = new Mocha({
        reporter: QaseParallelReporter as any,
        reporterOptions: { extraReporters: 'json' },
      });
      mocha.suite.addTest(test('in worker', () => {}));
      mocha.run(() => resolve());
    });
    const printed = log.mock.calls.map((c) => String(c[0])).join('\n');
    log.mockRestore();
    expect(printed).not.toContain('"passes"');
  });
});
