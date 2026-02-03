import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VitestQaseReporter } from '../src/index';
import { parseProjectMappingFromTitle } from 'qase-javascript-commons';

// Mock qase-javascript-commons (use real parseProjectMappingFromTitle and other utils)
jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual('qase-javascript-commons') as typeof import('qase-javascript-commons');
  return {
    ...actual,
    QaseReporter: {
    getInstance: jest.fn().mockReturnValue({
      startTestRun: jest.fn(),
      publish: jest.fn().mockResolvedValue(undefined),
      addTestResult: jest.fn().mockResolvedValue(undefined),
    }),
  },
  TestResultType: jest.fn().mockImplementation(() => ({
    id: '',
    signature: '',
    testops_id: null,
    relations: null,
    execution: {
      status: 'passed',
      start_time: null,
      end_time: null,
      duration: 0,
    },
    message: null,
    fields: null,
    params: null,
    group_params: null,
    steps: [],
    attachments: [],
  })),
  TestStepType: jest.fn().mockImplementation(() => ({
    id: '',
    data: {
      action: '',
      expected_result: null,
      data: null,
    },
    execution: {
      status: 'passed',
    },
  })),
  TestStatusEnum: {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
  },
  StepStatusEnum: {
    passed: 'passed',
    failed: 'failed',
  },
  composeOptions: jest.fn().mockReturnValue({}),
  determineTestStatus: jest.fn((error, originalStatus) => {
    if (error) return 'failed';
    if (originalStatus === 'passed') return 'passed';
    if (originalStatus === 'pending') return 'skipped';
    if (originalStatus === 'skipped') return 'skipped';
    return 'failed';
  }),
  };
});

describe('VitestQaseReporter - Main scenarios', () => {
  let reporter: VitestQaseReporter;

  beforeEach(() => {
    reporter = new VitestQaseReporter();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('Extracting Qase ID from test name (parseProjectMappingFromTitle)', () => {
    it('should extract single Qase ID', () => {
      const title = 'Test Name (Qase ID: 123)';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.legacyIds).toEqual([123]);
      expect(Object.keys(parsed.projectMapping)).toHaveLength(0);
    });

    it('should extract multiple Qase IDs', () => {
      const title = 'Test Name (Qase ID: 123,456,789)';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.legacyIds).toEqual([123, 456, 789]);
    });

    it('should return empty array if Qase ID not found', () => {
      const title = 'Test Name without Qase ID';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.legacyIds).toEqual([]);
    });

    it('should handle invalid Qase IDs', () => {
      const title = 'Test Name (Qase ID: abc,def)';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.legacyIds).toEqual([]);
    });

    it('should extract multi-project mapping', () => {
      const title = 'Test (Qase PROJ1: 100) (Qase PROJ2: 200)';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.legacyIds).toEqual([]);
      expect(parsed.projectMapping).toEqual({ PROJ1: [100], PROJ2: [200] });
      expect(parsed.cleanedTitle).toBe('Test');
    });
  });

  describe('Removing Qase ID from test name (parseProjectMappingFromTitle cleanedTitle)', () => {
    it('should remove Qase ID from name', () => {
      const title = 'Test Name (Qase ID: 123)';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.cleanedTitle).toBe('Test Name');
    });

    it('should remove multiple Qase IDs from name', () => {
      const title = 'Test Name (Qase ID: 123,456,789)';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.cleanedTitle).toBe('Test Name');
    });

    it('should return original name if Qase ID not found', () => {
      const title = 'Test Name without Qase ID';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.cleanedTitle).toBe(title);
    });

    it('should handle trailing spaces', () => {
      const title = 'Test Name (Qase ID: 123)   ';
      const parsed = parseProjectMappingFromTitle(title);
      expect(parsed.cleanedTitle).toBe('Test Name');
    });
  });

  describe('Creating test result', () => {
    it('should create test result with basic information', () => {
      const mockTestCase = {
        name: 'Test Name (Qase ID: 123)',
        id: 'test-id',
        fullName: 'Suite > Test Name (Qase ID: 123)',
        result: jest.fn().mockReturnValue({
          state: 'passed',
          errors: [],
        }),
        diagnostic: jest.fn().mockReturnValue({
          startTime: 1000,
          duration: 500,
        }),
      };
      
      const result = reporter['createTestResult'](mockTestCase as any);
      
      expect(result.id).toBe('test-id');
      expect(result.signature).toBe('Suite > Test Name (Qase ID: 123)');
      expect(result.testops_id).toBe(123);
      expect(result.execution.status).toBe('passed');
      expect(result.execution.start_time).toBe(null);
      expect(result.execution.end_time).toBe(null);
      expect(result.execution.duration).toBe(500);
    });

    it('should handle test without Qase ID', () => {
      const mockTestCase = {
        name: 'Test Name without Qase ID',
        id: 'test-id',
        fullName: 'Suite > Test Name without Qase ID',
        result: jest.fn().mockReturnValue({
          state: 'passed',
          errors: [],
        }),
        diagnostic: jest.fn().mockReturnValue({
          startTime: 1000,
          duration: 500,
        }),
      };
      
      const result = reporter['createTestResult'](mockTestCase as any);
      
      expect(result.testops_id).toBeNull();
      expect(result.signature).toBe('Suite > Test Name without Qase ID');
    });

    it('should handle test with multiple Qase IDs', () => {
      const mockTestCase = {
        name: 'Test Name (Qase ID: 123,456)',
        id: 'test-id',
        fullName: 'Suite > Test Name (Qase ID: 123,456)',
        result: jest.fn().mockReturnValue({
          state: 'passed',
          errors: [],
        }),
        diagnostic: jest.fn().mockReturnValue({
          startTime: 1000,
          duration: 500,
        }),
      };
      
      const result = reporter['createTestResult'](mockTestCase as any);
      
      expect(result.testops_id).toEqual([123, 456]);
    });

    it('should handle test with errors', () => {
      const error = new Error('Test failed');
      error.stack = 'Error stack trace';
      const mockTestCase = {
        name: 'Test Name (Qase ID: 123)',
        id: 'test-id',
        fullName: 'Suite > Test Name (Qase ID: 123)',
        result: jest.fn().mockReturnValue({
          state: 'failed',
          errors: [error],
        }),
        diagnostic: jest.fn().mockReturnValue({
          startTime: 1000,
          duration: 500,
        }),
      };
      
      const result = reporter['createTestResult'](mockTestCase as any);
      
      expect(result.execution.status).toBe('failed');
      expect(result.execution.stacktrace).toContain('Error stack trace');
      expect(result.message).toBe('Test failed');
    });

    it('should handle skipped test with note', () => {
      const mockTestCase = {
        name: 'Test Name (Qase ID: 123)',
        id: 'test-id',
        fullName: 'Suite > Test Name (Qase ID: 123)',
        result: jest.fn().mockReturnValue({
          state: 'skipped',
          note: 'Test skipped due to condition',
        }),
        diagnostic: jest.fn().mockReturnValue({
          startTime: 1000,
          duration: 500,
        }),
      };
      
      const result = reporter['createTestResult'](mockTestCase as any);
      
      expect(result.execution.status).toBe('skipped');
      expect(result.message).toBe('Test skipped due to condition');
    });
  });

  describe('Annotation processing', () => {
    it('should process title annotation', () => {
      const mockTestCase = {
        id: 'test-id',
        name: 'Test Name',
      };
      const mockAnnotation = {
        message: 'Qase Title: Test Title',
      };

      reporter.onTestCaseAnnotate?.(mockTestCase as any, mockAnnotation as any);
      
      const metadata = reporter['testMetadata'].get('test-id');
      expect(metadata?.title).toBe('Test Title');
    });

    it('should process comment annotation', () => {
      const mockTestCase = {
        id: 'test-id',
        name: 'Test Name',
      };
      const mockAnnotation = {
        message: 'Qase Comment: Test Comment',
      };

      reporter.onTestCaseAnnotate?.(mockTestCase as any, mockAnnotation as any);
      
      const metadata = reporter['testMetadata'].get('test-id');
      expect(metadata?.comment).toBe('Test Comment');
    });

    it('should process suite annotation', () => {
      const mockTestCase = {
        id: 'test-id',
        name: 'Test Name',
      };
      const mockAnnotation = {
        message: 'Qase Suite: Test Suite',
      };

      reporter.onTestCaseAnnotate?.(mockTestCase as any, mockAnnotation as any);
      
      const metadata = reporter['testMetadata'].get('test-id');
      expect(metadata?.suite).toBe('Test Suite');
    });

    it('should process fields annotation', () => {
      const mockTestCase = {
        id: 'test-id',
        name: 'Test Name',
      };
      const mockAnnotation = {
        message: 'Qase Fields: {"field1":"value1","field2":"value2"}',
      };

      reporter.onTestCaseAnnotate?.(mockTestCase as any, mockAnnotation as any);
      
      const metadata = reporter['testMetadata'].get('test-id');
      expect(metadata?.fields).toEqual({ field1: 'value1', field2: 'value2' });
    });

    it('should process parameters annotation', () => {
      const mockTestCase = {
        id: 'test-id',
        name: 'Test Name',
      };
      const mockAnnotation = {
        message: 'Qase Parameters: {"param1":"value1"}',
      };

      reporter.onTestCaseAnnotate?.(mockTestCase as any, mockAnnotation as any);
      
      const metadata = reporter['testMetadata'].get('test-id');
      expect(metadata?.parameters).toEqual({ param1: 'value1' });
    });

    it('should ignore non-Qase annotations', () => {
      const mockTestCase = {
        id: 'test-id',
        name: 'Test Name',
      };
      const mockAnnotation = {
        message: 'Regular annotation message',
      };

      reporter.onTestCaseAnnotate?.(mockTestCase as any, mockAnnotation as any);
      
      const metadata = reporter['testMetadata'].get('test-id');
      expect(metadata).toEqual({ steps: [], attachments: [] });
    });
  });

  describe('Suite extraction', () => {
    it('should extract suite from fullName with separator', () => {
      const testCase = {
        fullName: 'Suite Name > Test Name',
        name: 'Test Name',
      };
      
      const result = reporter['extractSuiteFromTestCase'](testCase as any);
      
      expect(result).toBe('Suite Name');
    });

    it('should extract suite from fullName with multiple separators', () => {
      const testCase = {
        fullName: 'Parent Suite > Child Suite > Test Name',
        name: 'Test Name',
      };
      
      const result = reporter['extractSuiteFromTestCase'](testCase as any);
      
      expect(result).toBe('Parent Suite > Child Suite');
    });

    it('should return undefined if separator not found', () => {
      const testCase = {
        fullName: 'Test Name',
        name: 'Test Name',
      };
      
      const result = reporter['extractSuiteFromTestCase'](testCase as any);
      
      expect(result).toBeUndefined();
    });

    it('should use name if fullName not available', () => {
      const testCase = {
        name: 'Suite Name > Test Name',
      };
      
      const result = reporter['extractSuiteFromTestCase'](testCase as any);
      
      expect(result).toBe('Suite Name');
    });
  });

  describe('Reporter lifecycle', () => {
    it('should have onTestRunStart method', () => {
      expect(typeof reporter.onTestRunStart).toBe('function');
    });

    it('should have onTestRunEnd method', () => {
      expect(typeof reporter.onTestRunEnd).toBe('function');
    });

    it('should have onTestCaseResult method', () => {
      expect(typeof reporter.onTestCaseResult).toBe('function');
    });

    it('should have onTestCaseAnnotate method', () => {
      expect(typeof reporter.onTestCaseAnnotate).toBe('function');
    });

    it('should have onTestSuiteReady method', () => {
      expect(typeof reporter.onTestSuiteReady).toBe('function');
    });

    it('should have onTestSuiteResult method', () => {
      expect(typeof reporter.onTestSuiteResult).toBe('function');
    });
  });
});
