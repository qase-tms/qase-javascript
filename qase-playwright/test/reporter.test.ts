import { expect } from '@jest/globals';
import { PlaywrightQaseReporter } from '../src/reporter';
import { ReporterContentType } from '../src/playwright';

// Mocks for Playwright types
const testCaseMock = {
  title: 'Test (Qase ID: 123)',
  titlePath: jest.fn(() => ['Suite1', 'Suite2', 'Test (Qase ID: 123)']),
  annotations: [],
  parent: undefined,
};

const testResultMock = {
  status: 'passed',
  attachments: [],
  errors: [],
  steps: [],
  duration: 1000,
  startTime: new Date(),
  endTime: new Date(),
  stderr: [],
  stdout: [],
  parallelIndex: 0,
};

jest.mock('uuid', () => ({ 
  v4: jest.fn(() => 'uuid-mock') 
}));

const reporterMock = {
  startTestRun: jest.fn(),
  addTestResult: jest.fn().mockResolvedValue(undefined),
  publish: jest.fn().mockResolvedValue(undefined),
  isCaptureLogs: jest.fn(() => false),
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
    timedOut: 'failed',
    interrupted: 'failed',
    invalid: 'invalid',
  },
  StepStatusEnum: {
    passed: 'passed',
    failed: 'failed',
  },
  StepType: {
    TEXT: 'text',
  },
  generateSignature: jest.fn(() => 'mock-signature'),
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({})),
  })),
  CompoundError: class CompoundError extends Error {
    addMessage(message: string) {
      this.message = message;
    }
    addStacktrace(stacktrace: string) {
      this.stack = stacktrace;
    }
    get stacktrace() {
      return this.stack;
    }
  },
}));

describe('PlaywrightQaseReporter', () => {
  let reporter: PlaywrightQaseReporter;
  const options = { framework: {} } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    reporter = new PlaywrightQaseReporter(options);
  });

  describe('static statusMap', () => {
    it('should map Playwright statuses to TestStatusEnum correctly', () => {
      expect(PlaywrightQaseReporter.statusMap.passed).toBe('passed');
      expect(PlaywrightQaseReporter.statusMap.failed).toBe('failed');
      expect(PlaywrightQaseReporter.statusMap.skipped).toBe('skipped');
      expect(PlaywrightQaseReporter.statusMap.timedOut).toBe('failed');
      expect(PlaywrightQaseReporter.statusMap.interrupted).toBe('failed');
    });
  });

  describe('static addIds', () => {
    it('should add ids for a test title', () => {
      PlaywrightQaseReporter.addIds([1, 2, 3], 'Test title');
      // @ts-ignore
      expect(PlaywrightQaseReporter.qaseIds.get('Test title')).toEqual([1, 2, 3]);
    });
  });

  describe('static transformSuiteTitle', () => {
    it('should return suite title path', () => {
      const result = PlaywrightQaseReporter['transformSuiteTitle'](testCaseMock as any);
      expect(result).toEqual(['Suite1', 'Suite2', 'Test (Qase ID: 123)']);
    });
  });

  describe('static transformError', () => {
    it('should transform test errors to compound error', () => {
      const errors = [
        { message: 'Error 1', stack: 'Stack 1' },
        { message: 'Error 2', stack: 'Stack 2' },
      ];
      // @ts-ignore
      const result = PlaywrightQaseReporter['transformError'](errors);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Error 2');
      expect((result as any).stacktrace).toBe('Stack 2');
    });

    it('should handle errors without message or stack', () => {
      const errors = [
        { message: undefined, stack: undefined },
        { message: 'Error 1', stack: undefined },
        { message: undefined, stack: 'Stack 1' },
      ];
      // @ts-ignore
      const result = PlaywrightQaseReporter['transformError'](errors);
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('extractQaseIdsFromAnnotation', () => {
    it('should extract single id from qaseid annotation', () => {
      const annotations = [
        { type: 'qaseid', description: '123' },
      ];
      // @ts-ignore
      const ids = reporter['extractQaseIdsFromAnnotation'](annotations);
      expect(ids).toEqual([123]);
    });

    it('should extract multiple ids from qaseid annotation', () => {
      const annotations = [
        { type: 'qaseid', description: '123,456' },
      ];
      // @ts-ignore
      const ids = reporter['extractQaseIdsFromAnnotation'](annotations);
      expect(ids).toEqual([123, 456]);
    });

    it('should return empty array if no qaseid annotation', () => {
      const annotations = [
        { type: 'other', description: '789' },
      ];
      // @ts-ignore
      const ids = reporter['extractQaseIdsFromAnnotation'](annotations);
      expect(ids).toEqual([]);
    });

    it('should handle case insensitive type', () => {
      const annotations = [
        { type: 'QASEID', description: '123' },
      ];
      // @ts-ignore
      const ids = reporter['extractQaseIdsFromAnnotation'](annotations);
      expect(ids).toEqual([123]);
    });
  });

  describe('extractSuiteFromAnnotation', () => {
    it('should extract suite from qasesuite annotation', () => {
      const annotations = [
        { type: 'qasesuite', description: 'Test Suite' },
      ];
      // @ts-ignore
      const suites = reporter['extractSuiteFromAnnotation'](annotations);
      expect(suites).toEqual(['Test Suite']);
    });

    it('should return empty array if no qasesuite annotation', () => {
      const annotations = [
        { type: 'other', description: 'Test Suite' },
      ];
      // @ts-ignore
      const suites = reporter['extractSuiteFromAnnotation'](annotations);
      expect(suites).toEqual([]);
    });

    it('should handle case insensitive type', () => {
      const annotations = [
        { type: 'QASESUITE', description: 'Test Suite' },
      ];
      // @ts-ignore
      const suites = reporter['extractSuiteFromAnnotation'](annotations);
      expect(suites).toEqual(['Test Suite']);
    });
  });

  describe('checkChildrenSteps', () => {
    it('should return true for empty steps array', () => {
      // @ts-ignore
      const result = reporter['checkChildrenSteps']([]);
      expect(result).toBe(true);
    });

    it('should return false if steps contain test.step category', () => {
      const steps = [
        { category: 'test.step', title: 'Step 1' },
      ];
      // @ts-ignore
      const result = reporter['checkChildrenSteps'](steps);
      expect(result).toBe(false);
    });

    it('should return false if steps contain hook category', () => {
      const steps = [
        { category: 'hook', title: 'Hook 1' },
      ];
      // @ts-ignore
      const result = reporter['checkChildrenSteps'](steps);
      expect(result).toBe(false);
    });

    it('should return true if steps contain only other categories', () => {
      const steps = [
        { category: 'other', title: 'Other 1' },
      ];
      // @ts-ignore
      const result = reporter['checkChildrenSteps'](steps);
      expect(result).toBe(true);
    });
  });

  describe('extractAndCleanStep', () => {
    it('should extract expected result and data from step title', () => {
      const input = 'Click button QaseExpRes:: Button should be clicked QaseData:: Button data';
      // @ts-ignore
      const result = reporter['extractAndCleanStep'](input);
      expect(result.expectedResult).toBe('Button should be clicked');
      expect(result.data).toBe('Button data');
      expect(result.cleanedString).toBe('Click button');
    });

    it('should handle step with only expected result', () => {
      const input = 'Click button QaseExpRes:: Button should be clicked QaseData:';
      // @ts-ignore
      const result = reporter['extractAndCleanStep'](input);
      expect(result.expectedResult).toBe('Button should be clicked');
      expect(result.data).toBe(null);
      expect(result.cleanedString).toBe('Click button');
    });

    it('should handle step with only data', () => {
      const input = 'Click button QaseExpRes: QaseData:: Button data';
      // @ts-ignore
      const result = reporter['extractAndCleanStep'](input);
      expect(result.expectedResult).toBe('');
      expect(result.data).toBe('Button data');
      expect(result.cleanedString).toBe('Click button');
    });

    it('should return original string if no QaseExpRes or QaseData', () => {
      const input = 'Click button';
      // @ts-ignore
      const result = reporter['extractAndCleanStep'](input);
      expect(result.expectedResult).toBe(null);
      expect(result.data).toBe(null);
      expect(result.cleanedString).toBe('Click button');
    });
  });

  describe('removeQaseIdsFromTitle', () => {
    it('should remove Qase ID from title', () => {
      // @ts-ignore
      const result = reporter['removeQaseIdsFromTitle']('Test (Qase ID: 123)');
      expect(result).toBe('Test');
    });
    it('should remove multiple Qase IDs from title', () => {
      // @ts-ignore
      const result = reporter['removeQaseIdsFromTitle']('Test (Qase ID: 123,456)');
      expect(result).toBe('Test');
    });
    it('should return original title if no Qase ID', () => {
      // @ts-ignore
      const result = reporter['removeQaseIdsFromTitle']('Test without ID');
      expect(result).toBe('Test without ID');
    });
  });

  describe('convertLogsToAttachments', () => {
    it('should convert string logs to attachment', () => {
      // @ts-ignore
      const result = reporter['convertLogsToAttachments'](['log1', 'log2'], 'log.txt');
      expect(result.file_name).toBe('log.txt');
      expect(result.content).toBe('log1log2');
      expect(result.mime_type).toBe('text/plain');
    });

    it('should convert buffer logs to attachment', () => {
      // @ts-ignore
      const result = reporter['convertLogsToAttachments']([Buffer.from('log1'), Buffer.from('log2')], 'log.txt');
      expect(result.file_name).toBe('log.txt');
      expect(result.content).toBe('log1log2');
      expect(result.mime_type).toBe('text/plain');
    });
  });

  describe('constructor', () => {
    it('should initialize reporter and options', () => {
      expect((reporter as any).reporter).toBe(reporterMock);
      expect((reporter as any).options).toBe(options.framework);
    });
  });

  describe('onStepBegin', () => {
    it('should cache test step if category is test.step', () => {
      const testCase = { ...testCaseMock };
      const step = { category: 'test.step', title: 'Step 1' };
      const result = { ...testResultMock };
      
      reporter.onStepBegin(testCase as any, result as any, step as any);
      
      // @ts-ignore
      expect(reporter['stepCache'].has(step)).toBe(true);
    });

    it('should not cache test step if category is not test.step', () => {
      const testCase = { ...testCaseMock };
      const step = { category: 'hook', title: 'Hook 1' };
      const result = { ...testResultMock };
      
      reporter.onStepBegin(testCase as any, result as any, step as any);
      
      // @ts-ignore
      expect(reporter['stepCache'].has(step)).toBe(false);
    });

    it('should not cache test step if already cached', () => {
      const testCase = { ...testCaseMock };
      const step = { category: 'test.step', title: 'Step 1' };
      const result = { ...testResultMock };
      
      // @ts-ignore
      reporter['stepCache'].set(step, testCase);
      
      reporter.onStepBegin(testCase as any, result as any, step as any);
      
      // @ts-ignore
      expect(reporter['stepCache'].has(step)).toBe(true);
    });
  });

  describe('onBegin', () => {
    it('should call reporter.startTestRun', () => {
      reporter.onBegin();
      expect(reporterMock.startTestRun).toHaveBeenCalled();
    });
  });

  describe('onTestEnd', () => {
    it('should call addTestResult with correct data', async () => {
      const testCase = { ...testCaseMock };
      const result = { ...testResultMock, parallelIndex: 0 };
      await reporter.onTestEnd(testCase as any, result as any);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.title).toBe('Test');
      expect(call.execution.status).toBe('passed');
      expect(call.execution.duration).toBe(1000);
    });

    it('should handle failed test', async () => {
      const testCase = { ...testCaseMock };
      const result = { ...testResultMock, status: 'failed', errors: [{ message: 'fail', stack: 'stack' }], parallelIndex: 0 };
      await reporter.onTestEnd(testCase as any, result as any);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.execution.status).toBe('failed');
      expect(call.message).toBeNull();
    });

    it('should handle ignored test', async () => {
      const testCase = { ...testCaseMock };
      const result = { ...testResultMock, attachments: [{ contentType: ReporterContentType, body: Buffer.from(JSON.stringify({ ignore: true })) }] };
      await reporter.onTestEnd(testCase as any, result as any);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });

    it('should handle test with comment', async () => {
      const testCase = { ...testCaseMock };
      const result = { 
        ...testResultMock, 
        attachments: [{ 
          contentType: ReporterContentType, 
          body: Buffer.from(JSON.stringify({ comment: 'Test comment' })) 
        }] 
      };
      await reporter.onTestEnd(testCase as any, result as any);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.message).toBe('Test comment');
    });

    it('should handle test with suite from metadata', async () => {
      const testCase = { ...testCaseMock };
      const result = { 
        ...testResultMock, 
        attachments: [{ 
          contentType: ReporterContentType, 
          body: Buffer.from(JSON.stringify({ suite: 'Test Suite' })) 
        }] 
      };
      await reporter.onTestEnd(testCase as any, result as any);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.relations.suite.data).toEqual([{ title: 'Test Suite', public_id: null }]);
    });

    it('should handle test with qaseid annotation', async () => {
      const testCase = { 
        ...testCaseMock, 
        annotations: [{ type: 'qaseid', description: '123' }] 
      };
      const result = { ...testResultMock };
      await reporter.onTestEnd(testCase as any, result as any);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.testops_id).toEqual([123]);
    });

    it('should handle test with qasesuite annotation', async () => {
      const testCase = { 
        ...testCaseMock, 
        annotations: [{ type: 'qasesuite', description: 'Suite from annotation' }] 
      };
      const result = { ...testResultMock };
      await reporter.onTestEnd(testCase as any, result as any);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.relations.suite.data).toEqual([{ title: 'Suite from annotation', public_id: null }]);
    });

    it('should capture logs when isCaptureLogs is true', async () => {
      reporterMock.isCaptureLogs.mockReturnValue(true);
      const testCase = { ...testCaseMock };
      const result = { 
        ...testResultMock, 
        stdout: ['stdout log'],
        stderr: ['stderr log']
      };
      await reporter.onTestEnd(testCase as any, result as any);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.attachments).toHaveLength(2);
      expect(call.attachments[0].file_name).toBe('stdout.log');
      expect(call.attachments[1].file_name).toBe('stderr.log');
    });
  });

  describe('onEnd', () => {
    it('should call reporter.publish', async () => {
      await reporter.onEnd();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('transformAttachments', () => {
    it('should parse metadata from attachments', () => {
      const meta = { ids: [1], title: 'T', fields: { a: 'b' }, parameters: { p: 'v' }, groupParams: { g: 'v' }, ignore: false, suite: 'S', comment: 'C' };
      const attachments = [{ contentType: ReporterContentType, body: Buffer.from(JSON.stringify(meta)) }];
      // @ts-ignore
      const result = reporter['transformAttachments'](attachments);
      expect(result.ids).toEqual([1]);
      expect(result.title).toBe('T');
      expect(result.fields).toEqual({ a: 'b' });
      expect(result.parameters).toEqual({ p: 'v' });
      expect(result.groupParams).toEqual({ g: 'v' });
      expect(result.ignore).toBe(false);
      expect(result.suite).toBe('S');
      expect(result.comment).toBe('C');
    });

    it('should handle step attachments', () => {
      const attachments = [{ name: 'step_attach_body_uuid', contentType: 'text/plain', body: Buffer.from('body') }];
      // @ts-ignore
      const result = reporter['transformAttachments'](attachments);
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments?.[0]?.file_name).toBe('step_attach_body_uuid');
    });

    it('should handle regular attachments', () => {
      const attachments = [{ name: 'file.txt', contentType: 'text/plain', body: Buffer.from('content'), path: '/path/to/file.txt' }];
      // @ts-ignore
      const result = reporter['transformAttachments'](attachments);
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments?.[0]?.file_name).toBe('file.txt');
      expect(result.attachments?.[0]?.file_path).toBe('/path/to/file.txt');
    });

    it('should handle attachments without path', () => {
      const attachments = [{ name: 'file.txt', contentType: 'text/plain', body: Buffer.from('content') }];
      // @ts-ignore
      const result = reporter['transformAttachments'](attachments);
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments?.[0]?.file_name).toBe('file.txt');
      expect(result.attachments?.[0]?.file_path).toBe(null);
    });
  });

  describe('transformSteps', () => {
    it('should transform steps recursively', () => {
      const steps = [
        { 
          title: 'Step 1', 
          category: 'test.step',
          steps: [], 
          duration: 10, 
          error: undefined, 
          startTime: new Date(),
          location: { file: 'file', line: 1, column: 1 } 
        },
        { 
          title: 'Step 2', 
          category: 'test.step',
          steps: [], 
          duration: 20, 
          error: { message: 'fail' }, 
          startTime: new Date(),
          location: { file: 'file', line: 2, column: 2 } 
        },
      ];
      // @ts-ignore
      const result = reporter['transformSteps'](steps, null);
      expect(result).toHaveLength(2);
      expect((result?.[0]?.data as any)?.action).toBe('Step 1');
      expect(result?.[1]?.execution.status).toBe('failed');
    });

    it('should skip steps with non-test.step category', () => {
      const steps = [
        { 
          title: 'Step 1', 
          category: 'other',
          steps: [], 
          duration: 10, 
          error: undefined, 
          startTime: new Date(),
          location: { file: 'file', line: 1, column: 1 } 
        },
      ];
      // @ts-ignore
      const result = reporter['transformSteps'](steps, null);
      expect(result).toHaveLength(0);
    });

    it('should skip default steps with children', () => {
      const steps = [
        { 
          title: 'Before Hooks', 
          category: 'test.step',
          steps: [{ category: 'other', title: 'Child' }], 
          duration: 10, 
          error: undefined, 
          startTime: new Date(),
          location: { file: 'file', line: 1, column: 1 } 
        },
      ];
      // @ts-ignore
      const result = reporter['transformSteps'](steps, null);
      expect(result).toHaveLength(0);
    });
  });
}); 
