/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import Mocha from 'mocha';

// Runs real Mocha suites through the reporter; only the Qase upstream is replaced.
const upstream = {
  startTestRunAsync: jest.fn(async () => undefined),
  publish: jest.fn(async () => undefined),
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
});
