/* eslint-disable */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EventEmitter } from 'events';
import { Collection, Item } from 'postman-collection';

// Real commons status and signature helpers; only the Qase upstream is replaced.
const upstream = {
  startTestRun: jest.fn(),
  addTestResult: jest.fn(async (_result: any) => undefined),
  publish: jest.fn(async () => undefined),
};

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    QaseReporter: { getInstance: jest.fn(() => upstream) },
    ConfigLoader: jest.fn().mockImplementation(() => ({ load: () => ({}) })),
  };
});

import { NewmanQaseReporter } from '../src/reporter';

const collectionWith = (...items: any[]) => new Collection({ info: { name: 'C' }, item: items });

const itemDef = (name: string, test: string[] = [], prerequest: string[] = []) => ({
  name,
  request: { method: 'GET', url: 'http://localhost/x' },
  event: [
    { listen: 'test', script: { exec: test } },
    { listen: 'prerequest', script: { exec: prerequest } },
  ],
});

// Replays the events newman emits for one item.
const runItem = (
  emitter: EventEmitter,
  item: Item,
  opts: { iteration?: number; skipRequest?: boolean; requestError?: Error; scriptError?: Error; assertionError?: Error } = {},
) => {
  const cursor = { iteration: opts.iteration ?? 0 };
  emitter.emit('beforeItem', null, { item, cursor });
  if (opts.scriptError) emitter.emit('script', opts.scriptError, { item, cursor });
  if (!opts.skipRequest) {
    emitter.emit('request', opts.requestError ?? null, { item, cursor });
    if (opts.assertionError) emitter.emit('assertion', opts.assertionError, { item, cursor });
  }
  emitter.emit('item', null, { item, cursor });
};

const lastResult = () => {
  const calls = upstream.addTestResult.mock.calls;
  return calls[calls.length - 1]![0];
};

describe('NewmanQaseReporter result status and identity', () => {
  let emitter: EventEmitter;

  const start = (iterationData: any[] = []) => {
    emitter = new EventEmitter();
    new NewmanQaseReporter(emitter, {} as any, { iterationData } as any);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    start();
  });

  it('reports a passing request as passed', () => {
    const item = collectionWith(itemDef('ok')).items.idx(0) as Item;
    runItem(emitter, item);
    expect(lastResult().execution.status).toBe('passed');
  });

  it('reports a request skipped with pm.execution.skipRequest() as skipped', () => {
    const item = collectionWith(itemDef('skipped')).items.idx(0) as Item;
    runItem(emitter, item, { skipRequest: true });
    expect(lastResult().execution.status).toBe('skipped');
  });

  it('reports a script error as invalid, with its message', () => {
    const item = collectionWith(itemDef('script error')).items.idx(0) as Item;
    runItem(emitter, item, { scriptError: new ReferenceError('undefinedFn is not defined') });
    expect(lastResult().execution.status).toBe('invalid');
    expect(lastResult().message).toContain('undefinedFn is not defined');
  });

  it('reports a request error as invalid, with its message', () => {
    const item = collectionWith(itemDef('request error')).items.idx(0) as Item;
    runItem(emitter, item, { requestError: new Error('connect ECONNREFUSED 127.0.0.1:1') });
    expect(lastResult().execution.status).toBe('invalid');
    expect(lastResult().message).toContain('ECONNREFUSED');
  });

  it('keeps a failed assertion as failed', () => {
    const item = collectionWith(itemDef('assertion')).items.idx(0) as Item;
    const err: any = { name: 'AssertionError', message: 'expected 200 to be 404', stack: 'AssertionError: expected 200 to be 404' };
    runItem(emitter, item, { assertionError: err });
    expect(lastResult().execution.status).toBe('failed');
  });

  it('accepts space separated ids in `// qase: 4 5 6`', () => {
    const item = collectionWith(itemDef('ids', ['// qase: 4 5 6'])).items.idx(0) as Item;
    runItem(emitter, item);
    expect(lastResult().testops_id).toEqual([4, 5, 6]);
  });

  it('keeps the original case of parameter names and values', () => {
    start([{ UserName: 'Alice' }]);
    const item = collectionWith(itemDef('params', ['// qase.parameters: UserName'])).items.idx(0) as Item;
    runItem(emitter, item);
    expect(lastResult().params).toEqual({ UserName: 'Alice' });
  });

  it('gives each data-driven iteration its own signature', () => {
    start([{ user: 'alice' }, { user: 'bob' }]);
    const item = collectionWith(itemDef('params', ['// qase.parameters: user'])).items.idx(0) as Item;
    runItem(emitter, item, { iteration: 0 });
    const first = lastResult().signature;
    runItem(emitter, item, { iteration: 1 });
    const second = lastResult().signature;
    expect(first).not.toBe(second);
    expect(second).toContain('bob');
  });
});
