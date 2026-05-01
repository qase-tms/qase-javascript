/* eslint-disable */
import { expect } from '@jest/globals';
import { JestQaseReporter } from '../src/reporter';
import { TestStepType } from 'qase-javascript-commons';

const reporterMock = {
  startTestRun: jest.fn(),
  addTestResult: jest.fn().mockResolvedValue(undefined),
  publish: jest.fn().mockResolvedValue(undefined),
};

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    QaseReporter: {
      getInstance: jest.fn(() => reporterMock),
    },
    composeOptions: jest.fn(() => ({})),
    TestStatusEnum: {
      passed: 'passed',
      failed: 'failed',
      skipped: 'skipped',
      disabled: 'disabled',
    },
    generateSignature: jest.fn(() => 'mock-signature'),
    determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
      if (error) return 'failed';
      if (originalStatus === 'passed') return 'passed';
      if (originalStatus === 'pending') return 'skipped';
      if (originalStatus === 'todo') return 'disabled';
      return 'failed';
    }),
    parseProjectMappingFromTitle: jest.fn((title: string) => {
      const idMatch = title.match(/\(Qase ID: ([\d,]+)\)/);
      return {
        projectMapping: {},
        legacyIds: idMatch?.[1] ? idMatch[1].split(',').map(Number) : [],
        cleanedTitle: '',
      };
    }),
    ConfigLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn(() => ({})),
    })),
  };
});

describe('JestQaseReporter', () => {
  let reporter: JestQaseReporter;
  const globalConfig = {} as any;
  const options = {};
  const state = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    reporter = new JestQaseReporter(globalConfig, options, state);
  });

  describe('static statusMap', () => {
    it('maps Jest statuses to TestStatusEnum correctly', () => {
      expect(JestQaseReporter.statusMap.passed).toBe('passed');
      expect(JestQaseReporter.statusMap.failed).toBe('failed');
      expect(JestQaseReporter.statusMap.skipped).toBe('skipped');
      expect(JestQaseReporter.statusMap.disabled).toBe('disabled');
      expect(JestQaseReporter.statusMap.pending).toBe('skipped');
      expect(JestQaseReporter.statusMap.todo).toBe('disabled');
      expect(JestQaseReporter.statusMap.focused).toBe('passed');
    });
  });

  describe('constructor', () => {
    it('initializes commons reporter and global.Qase', () => {
      expect((reporter as any).reporter).toBe(reporterMock);
      // @ts-expect-error - global.Qase is dynamically added at runtime
      expect(global.Qase).toBeDefined();
      expect((reporter as any).metadataApplier).toBeDefined();
      expect((reporter as any).profilerTracker).toBeDefined();
    });
  });

  describe('onRunStart', () => {
    it('calls reporter.startTestRun', () => {
      reporter.onRunStart();
      expect(reporterMock.startTestRun).toHaveBeenCalled();
    });
  });

  describe('onTestCaseResult', () => {
    const test = { path: '/test/path' } as any;
    const testCaseResult = {
      title: 'Test (Qase ID: 123)',
      fullName: 'Test Suite Test',
      status: 'passed',
      duration: 1000,
      ancestorTitles: ['Test Suite'],
      failureDetails: [],
      failureMessages: [],
    } as any;

    it('forwards a built result to addTestResult', () => {
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.title).toBe('Test');
      expect(call.testops_id).toBe(123);
      expect(call.execution.duration).toBe(1000);
    });

    it('skips addTestResult when ignore flag is set', () => {
      reporter.addIgnore();
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });

    it('applies metadata overrides through MetadataApplier', () => {
      reporter.addTitle('Custom Title');
      reporter.addComment('Custom Comment');
      reporter.addSuite('Custom Suite');
      reporter.addFields({ field1: 'value1' });
      reporter.addParameters({ param1: 'value1' });
      reporter.addGroupParams({ group1: 'value1' });
      const step = new TestStepType();
      step.id = 'step1';
      reporter.addStep(step);
      reporter.addAttachment({ file_name: 'file' } as any);

      reporter.onTestCaseResult(test, testCaseResult);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.title).toBe('Custom Title');
      expect(call.message).toBe('Custom Comment');
      expect(call.relations?.suite?.data[0].title).toBe('Custom Suite');
      expect(call.fields).toEqual({ field1: 'value1' });
      expect(call.params).toEqual({ param1: 'value1' });
      expect(call.group_params).toEqual({ group1: 'value1' });
      expect(call.steps[0].id).toBe('step1');
      expect(call.attachments).toEqual([{ file_name: 'file' }]);
    });

    it('resets metadata after each test case', () => {
      reporter.addTitle('First');
      reporter.onTestCaseResult(test, testCaseResult);
      reporter.onTestCaseResult(test, testCaseResult);
      const second = reporterMock.addTestResult.mock.calls[1][0];
      expect(second.title).toBe('Test'); // not 'First'
    });
  });

  describe('onTestResult', () => {
    it('forwards pending test results to addTestResult', () => {
      const test = {} as any;
      const result = {
        testFilePath: '/test/path',
        testResults: [
          {
            status: 'pending',
            title: 'Test (Qase ID: 123)',
            fullName: 'Test',
            ancestorTitles: [],
            failureDetails: [],
            failureMessages: [],
          },
        ],
      } as any;

      reporter.onTestResult(test, result);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
    });

    it('skips non-pending test results', () => {
      const test = {} as any;
      const result = {
        testFilePath: '/test/path',
        testResults: [
          {
            status: 'passed',
            title: 'Test',
            fullName: 'Test',
            ancestorTitles: [],
            failureDetails: [],
            failureMessages: [],
          },
        ],
      } as any;

      reporter.onTestResult(test, result);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });
  });

  describe('onRunComplete', () => {
    it('calls reporter.publish', () => {
      reporter.onRunComplete();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('onRunnerEnd', () => {
    it('awaits reporter.publish', async () => {
      await reporter.onRunnerEnd();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('getLastError', () => {
    it('does nothing (no-op for Jest reporter contract)', () => {
      expect(() => reporter.getLastError()).not.toThrow();
    });
  });

  describe('add* mutators delegate to MetadataApplier', () => {
    it('addTitle, addComment, addSuite update metadata', () => {
      reporter.addTitle('T');
      reporter.addComment('C');
      reporter.addSuite('S');
      const m = (reporter as any).metadataApplier.get();
      expect(m.title).toBe('T');
      expect(m.comment).toBe('C');
      expect(m.suite).toBe('S');
    });

    it('addFields, addParameters, addGroupParams set maps', () => {
      reporter.addFields({ f: '1' });
      reporter.addParameters({ p: '1' });
      reporter.addGroupParams({ g: '1' });
      const m = (reporter as any).metadataApplier.get();
      expect(m.fields).toEqual({ f: '1' });
      expect(m.parameters).toEqual({ p: '1' });
      expect(m.groupParams).toEqual({ g: '1' });
    });

    it('addTags appends to tags array', () => {
      reporter.addTags(['a']);
      reporter.addTags(['b', 'c']);
      const m = (reporter as any).metadataApplier.get();
      expect(m.tags).toEqual(['a', 'b', 'c']);
    });

    it('addIgnore sets the ignore flag', () => {
      reporter.addIgnore();
      const m = (reporter as any).metadataApplier.get();
      expect(m.ignore).toBe(true);
    });

    it('addStep and addAttachment append', () => {
      const step = new TestStepType();
      step.id = 's';
      reporter.addStep(step);
      reporter.addAttachment({ file_name: 'a' } as any);
      const m = (reporter as any).metadataApplier.get();
      expect(m.steps[0].id).toBe('s');
      expect(m.attachments).toEqual([{ file_name: 'a' }]);
    });
  });
});
