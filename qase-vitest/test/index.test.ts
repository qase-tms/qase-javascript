/* eslint-disable */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { VitestQaseReporter } from '../src/index';
import VitestQaseReporterDefault from '../src/index';

const reporterMock = {
  startTestRun: jest.fn(),
  publish: jest.fn().mockResolvedValue(undefined),
  addTestResult: jest.fn().mockResolvedValue(undefined),
};

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    QaseReporter: {
      getInstance: jest.fn(() => reporterMock),
    },
    composeOptions: jest.fn(() => ({})),
    determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
      if (error) return 'failed';
      if (originalStatus === 'passed') return 'passed';
      if (originalStatus === 'skipped') return 'skipped';
      return 'failed';
    }),
    ConfigLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn(() => null),
    })),
  };
});

const mkTestCase = (overrides: any = {}) => ({
  name: 'Test',
  id: 'test-id',
  fullName: 'Suite > Test',
  result: jest.fn().mockReturnValue({ state: 'passed', errors: [] }),
  diagnostic: jest.fn().mockReturnValue({ duration: 100 }),
  meta: jest.fn().mockReturnValue({}),
  ...overrides,
}) as any;

describe('VitestQaseReporter', () => {
  let reporter: VitestQaseReporter;

  beforeEach(() => {
    jest.clearAllMocks();
    reporter = new VitestQaseReporter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exports', () => {
    it('VitestQaseReporter is the default export', () => {
      expect(VitestQaseReporterDefault).toBe(VitestQaseReporter);
    });
  });

  describe('constructor', () => {
    it('initializes commons reporter with framework metadata', () => {
      const { QaseReporter } = require('qase-javascript-commons');
      expect(QaseReporter.getInstance).toHaveBeenCalledWith(expect.objectContaining({
        frameworkPackage: 'vitest',
        frameworkName: 'vitest',
        reporterName: 'vitest-qase-reporter',
      }));
    });

    it('accepts custom configLoader and calls load() on it', () => {
      const mockConfigLoader = { load: jest.fn().mockReturnValue({ debug: true }) };
      const composeOptionsMock = jest.requireMock('qase-javascript-commons').composeOptions;
      new VitestQaseReporter({}, mockConfigLoader as any);
      expect(mockConfigLoader.load).toHaveBeenCalled();
      expect(composeOptionsMock).toHaveBeenCalledWith({}, { debug: true });
    });

    it('passes constructor options to composeOptions', () => {
      const mockConfigLoader = { load: jest.fn().mockReturnValue(null) };
      const composeOptionsMock = jest.requireMock('qase-javascript-commons').composeOptions;
      new VitestQaseReporter({ mode: 'off' } as any, mockConfigLoader as any);
      expect(composeOptionsMock).toHaveBeenCalledWith({ mode: 'off' }, null);
    });

    it('initializes metadataAccumulator and profilerTracker', () => {
      expect((reporter as any).metadataAccumulator).toBeDefined();
      expect((reporter as any).profilerTracker).toBeDefined();
    });
  });

  describe('onTestRunStart', () => {
    it('calls commons reporter.startTestRun', () => {
      reporter.onTestRunStart?.();
      expect(reporterMock.startTestRun).toHaveBeenCalled();
    });
  });

  describe('onTestRunEnd', () => {
    it('awaits commons reporter.publish', async () => {
      await reporter.onTestRunEnd?.();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('onTestCaseAnnotate', () => {
    it('forwards annotations to MetadataAccumulator', () => {
      const tc = mkTestCase();
      reporter.onTestCaseAnnotate?.(tc, { message: 'Qase Title: From Annotation' } as any);
      const m = (reporter as any).metadataAccumulator.getMetadata('test-id');
      expect(m?.title).toBe('From Annotation');
    });
  });

  describe('onTestSuiteReady / onTestSuiteResult', () => {
    it('sets and clears currentSuite via MetadataAccumulator', () => {
      reporter.onTestSuiteReady?.({ name: 'My Suite' } as any);
      expect((reporter as any).metadataAccumulator.getCurrentSuite()).toBe('My Suite');
      reporter.onTestSuiteResult?.();
      expect((reporter as any).metadataAccumulator.getCurrentSuite()).toBeUndefined();
    });
  });

  describe('onTestCaseResult', () => {
    it('forwards a built result to commons reporter.addTestResult', async () => {
      const tc = mkTestCase({ name: 'Test (Qase ID: 42)' });
      await reporter.onTestCaseResult?.(tc);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
      const call = (reporterMock.addTestResult.mock.calls[0] as any[])[0];
      expect(call.testops_id).toBe(42);
      expect(call.execution.status).toBe('passed');
    });

    it('applies metadata.title from annotation', async () => {
      const tc = mkTestCase({ name: 'Test (Qase ID: 1)' });
      reporter.onTestCaseAnnotate?.(tc, { message: 'Qase Title: Override' } as any);
      await reporter.onTestCaseResult?.(tc);
      const call = (reporterMock.addTestResult.mock.calls[0] as any[])[0];
      expect(call.title).toBe('Override');
    });

    it('clears metadata after processing the test case', async () => {
      const tc = mkTestCase();
      reporter.onTestCaseAnnotate?.(tc, { message: 'Qase Title: x' } as any);
      await reporter.onTestCaseResult?.(tc);
      const m = (reporter as any).metadataAccumulator.getMetadata('test-id');
      expect(m).toBeUndefined();
    });

    it('appends worker profiler steps from testCase.meta()._qaseProfilerSteps', async () => {
      const profilerSteps = [{ id: 'worker-step-1' }];
      const tc = mkTestCase({
        meta: jest.fn().mockReturnValue({ _qaseProfilerSteps: JSON.stringify(profilerSteps) }),
      });
      await reporter.onTestCaseResult?.(tc);
      const call = (reporterMock.addTestResult.mock.calls[0] as any[])[0];
      expect(call.steps.length).toBeGreaterThan(0);
    });

    it('silently swallows malformed worker profiler steps JSON', async () => {
      const tc = mkTestCase({
        meta: jest.fn().mockReturnValue({ _qaseProfilerSteps: 'not-json' }),
      });
      await expect(reporter.onTestCaseResult?.(tc)).resolves.not.toThrow();
    });
  });
});
