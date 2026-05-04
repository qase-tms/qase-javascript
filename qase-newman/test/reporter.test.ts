/* eslint-disable */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NewmanQaseReporter } from '../src/reporter';
import { EventEmitter } from 'events';

const reporterMock = {
  startTestRun: jest.fn(),
  addTestResult: jest.fn(),
  publish: jest.fn(),
};

jest.mock('qase-javascript-commons', () => ({
  QaseReporter: {
    getInstance: jest.fn(() => reporterMock),
  },
  composeOptions: jest.fn(() => ({})),
  TestStatusEnum: {
    passed: 'passed',
    failed: 'failed',
  },
  generateSignature: jest.fn(() => 'mock-signature'),
  determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
    if (error) return 'failed';
    if (originalStatus === 'passed') return 'passed';
    return 'failed';
  }),
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({})),
  })),
  getPackageVersion: jest.fn(() => '5.3.5'),
}));

jest.mock('semver', () => ({
  lt: jest.fn(() => false),
}));

const mkItem = (id: string, name: string, exec: string[] = [], parent: any = null) => ({
  id,
  name,
  events: {
    each: (cb: any) => cb({ listen: 'test', script: { exec } }),
  },
  parent: () => parent,
}) as any;

describe('NewmanQaseReporter', () => {
  let reporter: NewmanQaseReporter;
  let emitter: EventEmitter;
  const options: any = {};
  const collectionOptions: any = { iterationData: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    emitter = new EventEmitter();
    reporter = new NewmanQaseReporter(emitter, options, collectionOptions);
  });

  describe('public static API (re-exports)', () => {
    it('exposes qaseIdRegExp', () => {
      expect(NewmanQaseReporter.qaseIdRegExp).toBeDefined();
      expect(NewmanQaseReporter.qaseIdRegExp.test('// qase: 1')).toBe(true);
    });

    it('exposes qaseParamRegExp', () => {
      expect(NewmanQaseReporter.qaseParamRegExp).toBeDefined();
    });

    it('exposes qaseProjectRegExp', () => {
      expect(NewmanQaseReporter.qaseProjectRegExp).toBeDefined();
    });

    it('exposes getCaseIds, getProjectMapping, getParameters, getParentTitles', () => {
      expect(typeof NewmanQaseReporter.getCaseIds).toBe('function');
      expect(typeof NewmanQaseReporter.getProjectMapping).toBe('function');
      expect(typeof NewmanQaseReporter.getParameters).toBe('function');
      expect(typeof NewmanQaseReporter.getParentTitles).toBe('function');
    });
  });

  describe('constructor', () => {
    it('initializes the commons reporter with framework metadata', () => {
      const { QaseReporter } = require('qase-javascript-commons');
      expect(QaseReporter.getInstance).toHaveBeenCalledWith({
        frameworkPackage: 'newman',
        frameworkName: 'newman',
        reporterName: 'newman-reporter-qase',
      });
    });

    it('reads autoCollectParams=false by default', () => {
      expect((reporter as any).autoCollectParams).toBe(false);
    });

    it('reads autoCollectParams=true when config sets it', () => {
      const customLoader = {
        load: jest.fn(() => ({ framework: { newman: { autoCollectParams: true } } })),
      } as any;
      const r = new NewmanQaseReporter(new EventEmitter(), options, collectionOptions, customLoader);
      expect((r as any).autoCollectParams).toBe(true);
    });

    it('parses iterationData via IterationDataParser', () => {
      const r = new NewmanQaseReporter(
        new EventEmitter(),
        options,
        { iterationData: [{ env: 'prod' }, { env: 'staging' }] } as any,
      );
      expect((r as any).parameters).toEqual([{ env: 'prod' }, { env: 'staging' }]);
    });
  });

  describe('event flow', () => {
    it('starts the test run on `start`', () => {
      emitter.emit('start');
      expect(reporterMock.startTestRun).toHaveBeenCalled();
    });

    it('creates a pending result on `beforeItem`', () => {
      const item = mkItem('id-1', 'Item 1', ['// qase: 5']);
      emitter.emit('beforeItem', undefined, { item });
      const pending = (reporter as any).pendingResultMap.get('id-1');
      expect(pending).toBeDefined();
      expect(pending.title).toBe('Item 1');
      expect(pending.testops_id).toEqual([5]);
    });

    it('updates pending status on failed `assertion`', () => {
      const item = mkItem('id-2', 'Item 2', []);
      emitter.emit('beforeItem', undefined, { item });
      const err = new Error('boom');
      err.stack = 'STACK';
      emitter.emit('assertion', err, { item });
      const pending = (reporter as any).pendingResultMap.get('id-2');
      expect(pending.execution.status).toBe('failed');
      expect(pending.execution.stacktrace).toBe('STACK');
      expect(pending.message).toBe('boom');
    });

    it('finalizes and forwards on `item`, then clears state', () => {
      const item = mkItem('id-3', 'Item 3', []);
      emitter.emit('beforeItem', undefined, { item });
      emitter.emit('item', undefined, { item, cursor: { iteration: 0 } });
      expect(reporterMock.addTestResult).toHaveBeenCalled();
      expect((reporter as any).pendingResultMap.has('id-3')).toBe(false);
      expect((reporter as any).timerMap.has('id-3')).toBe(false);
    });

    it('publishes on `beforeDone`', () => {
      emitter.emit('beforeDone');
      expect(reporterMock.publish).toHaveBeenCalled();
    });

    it('skips finalize when no pending result for the item', () => {
      const item = mkItem('id-orphan', 'Orphan', []);
      emitter.emit('item', undefined, { item, cursor: { iteration: 0 } });
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });
  });

  describe('prepareParameters glue', () => {
    it('returns {} when no iteration data was provided', () => {
      const item = mkItem('p1', 'P1', ['qase.parameters: env']);
      const result = (reporter as any).prepareParameters(item, 0);
      expect(result).toEqual({});
    });

    it('filters available iteration data by declared parameters', () => {
      const r = new NewmanQaseReporter(
        new EventEmitter(),
        options,
        { iterationData: [{ env: 'prod', extra: 'x' }] } as any,
      );
      const item = mkItem('p2', 'P2', ['qase.parameters: env']);
      const result = (r as any).prepareParameters(item, 0);
      expect(result).toEqual({ env: 'prod' });
    });

    it('returns full iteration data when autoCollectParams=true and no params declared', () => {
      const customLoader = {
        load: jest.fn(() => ({ framework: { newman: { autoCollectParams: true } } })),
      } as any;
      const r = new NewmanQaseReporter(
        new EventEmitter(),
        options,
        { iterationData: [{ env: 'prod' }] } as any,
        customLoader,
      );
      const item = mkItem('p3', 'P3', []); // no qase.parameters
      const result = (r as any).prepareParameters(item, 0);
      expect(result).toEqual({ env: 'prod' });
    });
  });

  describe('preventExit', () => {
    it('does not override process.exit when newman >= 5.3.2', () => {
      const semver = require('semver');
      semver.lt.mockReturnValueOnce(false);
      const before = process.exit;
      (reporter as any).preventExit();
      expect(process.exit).toBe(before);
    });
  });
});
