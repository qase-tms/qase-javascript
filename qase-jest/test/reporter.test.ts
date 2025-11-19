/* eslint-disable */
import { expect } from '@jest/globals';
import { JestQaseReporter } from '../src/reporter';

// Mocks
const reporterMock = {
  startTestRun: jest.fn(),
  addTestResult: jest.fn().mockResolvedValue(undefined),
  publish: jest.fn().mockResolvedValue(undefined),
};

jest.mock('qase-javascript-commons', () => ({
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
  determineTestStatus: jest.fn((error, originalStatus) => {
    if (error) return 'failed';
    if (originalStatus === 'passed') return 'passed';
    if (originalStatus === 'pending') return 'skipped';
    if (originalStatus === 'todo') return 'disabled';
    return 'failed';
  }),
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({})),
  })),
}));

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
    it('should map Jest statuses to TestStatusEnum correctly', () => {
      expect(JestQaseReporter.statusMap.passed).toBe('passed');
      expect(JestQaseReporter.statusMap.failed).toBe('failed');
      expect(JestQaseReporter.statusMap.skipped).toBe('skipped');
      expect(JestQaseReporter.statusMap.disabled).toBe('disabled');
      expect(JestQaseReporter.statusMap.pending).toBe('skipped');
      expect(JestQaseReporter.statusMap.todo).toBe('disabled');
      expect(JestQaseReporter.statusMap.focused).toBe('passed');
    });
  });

  describe('static qaseIdRegExp', () => {
    it('should match Qase ID patterns', () => {
      expect(JestQaseReporter.qaseIdRegExp.test('Test (Qase ID: 123)')).toBe(true);
      expect(JestQaseReporter.qaseIdRegExp.test('Test (Qase ID: 123,456)')).toBe(true);
      expect(JestQaseReporter.qaseIdRegExp.test('Test without ID')).toBe(false);
    });
  });

  describe('static getCaseId', () => {
    it('should extract single case ID', () => {
      const result = (JestQaseReporter as any).getCaseId('Test (Qase ID: 123)');
      expect(result).toEqual([123]);
    });

    it('should extract multiple case IDs', () => {
      const result = (JestQaseReporter as any).getCaseId('Test (Qase ID: 123,456,789)');
      expect(result).toEqual([123, 456, 789]);
    });

    it('should return empty array for no match', () => {
      const result = (JestQaseReporter as any).getCaseId('Test without ID');
      expect(result).toEqual([]);
    });
  });

  describe('constructor', () => {
    it('should initialize reporter and global.Qase', () => {
      expect((reporter as any).reporter).toBe(reporterMock);
      // @ts-expect-error - global.Qase is dynamically added at runtime
      expect(global.Qase).toBeDefined();
      expect((reporter as any).metadata).toBeDefined();
    });
  });

  describe('onRunStart', () => {
    it('should call reporter.startTestRun', () => {
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
    } as any;

    it('should call addTestResult with correct data', () => {
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.title).toBe('Test');
      expect(call.testops_id).toEqual([123]);
      expect(call.execution.duration).toBe(1000);
    });

    it('should not call addTestResult if ignore is true', () => {
      (reporter as any).metadata.ignore = true;
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });

    it('should apply metadata if set', () => {
      (reporter as any).metadata.title = 'Custom Title';
      (reporter as any).metadata.comment = 'Custom Comment';
      (reporter as any).metadata.suite = 'Custom Suite';
      (reporter as any).metadata.fields = { field1: 'value1' };
      (reporter as any).metadata.parameters = { param1: 'value1' };
      (reporter as any).metadata.groupParams = { group1: 'value1' };
      (reporter as any).metadata.steps = [{ id: 'step1' } as any];
      (reporter as any).metadata.attachments = [{ file_name: 'file' } as any];

      reporter.onTestCaseResult(test, testCaseResult);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.title).toBe('Custom Title');
      expect(call.message).toBe('Custom Comment');
      expect(call.relations?.suite?.data[0].title).toBe('Custom Suite');
      expect(call.fields).toEqual({ field1: 'value1' });
      expect(call.params).toEqual({ param1: 'value1' });
      expect(call.group_params).toEqual({ group1: 'value1' });
      expect(call.steps).toEqual([{ id: 'step1' }]);
      expect(call.attachments).toEqual([{ file_name: 'file' }]);
    });
  });

  describe('onTestResult', () => {
    it('should process pending test results', () => {
      const test = {} as any;
      const result = {
        testFilePath: '/test/path',
        testResults: [
          { status: 'pending', title: 'Test (Qase ID: 123)', fullName: 'Test', ancestorTitles: [] },
        ],
      } as any;

      reporter.onTestResult(test, result);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
    });

    it('should skip non-pending test results', () => {
      const test = {} as any;
      const result = {
        testFilePath: '/test/path',
        testResults: [
          { status: 'passed', title: 'Test', fullName: 'Test', ancestorTitles: [] },
        ],
      } as any;

      reporter.onTestResult(test, result);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });
  });

  describe('onRunComplete', () => {
    it('should call reporter.publish', () => {
      reporter.onRunComplete();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('onRunnerEnd', () => {
    it('should call reporter.publish', async () => {
      await reporter.onRunnerEnd();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('getLastError', () => {
    it('should do nothing (empty method)', () => {
      expect(() => reporter.getLastError()).not.toThrow();
    });
  });

  describe('metadata methods', () => {
    it('should add title', () => {
      reporter.addTitle('Custom Title');
      expect((reporter as any).metadata.title).toBe('Custom Title');
    });

    it('should add comment', () => {
      reporter.addComment('Custom Comment');
      expect((reporter as any).metadata.comment).toBe('Custom Comment');
    });

    it('should add suite', () => {
      reporter.addSuite('Custom Suite');
      expect((reporter as any).metadata.suite).toBe('Custom Suite');
    });

    it('should add fields', () => {
      const fields = { field1: 'value1', field2: 'value2' };
      reporter.addFields(fields);
      expect((reporter as any).metadata.fields).toEqual(fields);
    });

    it('should add parameters', () => {
      const parameters = { param1: 'value1', param2: 'value2' };
      reporter.addParameters(parameters);
      expect((reporter as any).metadata.parameters).toEqual(parameters);
    });

    it('should add group parameters', () => {
      const groupParams = { group1: 'value1', group2: 'value2' };
      reporter.addGroupParams(groupParams);
      expect((reporter as any).metadata.groupParams).toEqual(groupParams);
    });

    it('should add ignore flag', () => {
      reporter.addIgnore();
      expect((reporter as any).metadata.ignore).toBe(true);
    });

    it('should add step', () => {
      const step = { id: 'step1' } as any;
      reporter.addStep(step);
      expect((reporter as any).metadata.steps).toContain(step);
    });

    it('should add attachment', () => {
      const attachment = { file_name: 'file' } as any;
      reporter.addAttachment(attachment);
      expect((reporter as any).metadata.attachments).toContain(attachment);
    });
  });

  describe('getSignature', () => {
    it('should call generateSignature with correct parameters', () => {
      const result = (reporter as any).getSignature('/path/to/file', 'Test Name', [123, 456], { param: 'value' });
      const { generateSignature } = require('qase-javascript-commons');
      expect(generateSignature).toHaveBeenCalledWith([123, 456], ['', 'path', 'to', 'file', 'test_name'], { param: 'value' });
      expect(result).toBe('mock-signature');
    });
  });

  describe('getRelations', () => {
    it('should create relations from file path and suites', () => {
      const result = (reporter as any).getRelations('/path/to/file', ['Suite1', 'Suite2']);
      expect(result.suite.data).toHaveLength(6); // '', path, to, file, Suite1, Suite2
      expect(result.suite.data[0].title).toBe('');
      expect(result.suite.data[1].title).toBe('path');
      expect(result.suite.data[4].title).toBe('Suite1');
      expect(result.suite.data[5].title).toBe('Suite2');
    });
  });

  describe('getCurrentTestPath', () => {
    it('should remove execution path from full path', () => {
      const result = (reporter as any).getCurrentTestPath(process.cwd() + '/test/file.js');
      expect(result).toBe('test/file.js');
    });
  });

  describe('cleanMetadata', () => {
    it('should reset metadata to empty state', () => {
      (reporter as any).metadata.title = 'Title';
      (reporter as any).metadata.ignore = true;
      (reporter as any).cleanMetadata();
      expect((reporter as any).metadata.title).toBeUndefined();
      expect((reporter as any).metadata.ignore).toBe(false);
    });
  });

  describe('convertToResult', () => {
    it('should convert passed test result', () => {
      const value = {
        title: 'Test (Qase ID: 123)',
        fullName: 'Test Suite Test',
        status: 'passed',
        duration: 1000,
        ancestorTitles: ['Test Suite'],
        failureDetails: [],
        failureMessages: [],
      } as any;

      const result = (reporter as any).convertToResult(value, '/test/path');
      expect(result.title).toBe('Test');
      expect(result.testops_id).toEqual([123]);
      expect(result.execution.status).toBe('passed');
      expect(result.execution.duration).toBe(1000);
    });

    it('should convert failed test result', () => {
      const value = {
        title: 'Test (Qase ID: 123)',
        fullName: 'Test Suite Test',
        status: 'failed',
        duration: 1000,
        ancestorTitles: ['Test Suite'],
        failureDetails: [{ matcherResult: { message: 'Assertion failed' } }],
        failureMessages: ['Error: Assertion failed'],
      } as any;

      const result = (reporter as any).convertToResult(value, '/test/path');
      expect(result.execution.status).toBe('failed');
      expect(result.message).toBe('Assertion failed');
      expect(result.execution.stacktrace).toBe('Error: Assertion failed');
    });
  });

  describe('createEmptyMetadata', () => {
    it('should create empty metadata object', () => {
      const result = (reporter as any).createEmptyMetadata();
      expect(result.title).toBeUndefined();
      expect(result.ignore).toBe(false);
      expect(result.comment).toBeUndefined();
      expect(result.suite).toBeUndefined();
      expect(result.fields).toEqual({});
      expect(result.parameters).toEqual({});
      expect(result.groupParams).toEqual({});
      expect(result.steps).toEqual([]);
      expect(result.attachments).toEqual([]);
    });
  });

  describe('removeQaseIdsFromTitle', () => {
    it('should remove Qase ID from title', () => {
      const result = (reporter as any).removeQaseIdsFromTitle('Test (Qase ID: 123)');
      expect(result).toBe('Test');
    });

    it('should remove multiple Qase IDs from title', () => {
      const result = (reporter as any).removeQaseIdsFromTitle('Test (Qase ID: 123,456)');
      expect(result).toBe('Test');
    });

    it('should return original title if no Qase ID', () => {
      const result = (reporter as any).removeQaseIdsFromTitle('Test without ID');
      expect(result).toBe('Test without ID');
    });
  });
}); 
