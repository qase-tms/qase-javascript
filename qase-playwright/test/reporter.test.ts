/* eslint-disable */
import { expect } from '@jest/globals';
import { PlaywrightQaseReporter } from '../src/reporter';
import { ReporterContentType } from '../src/playwright';
import { removeQaseIdsFromTitle, extractAndCleanStep } from 'qase-javascript-commons/internal';

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
    determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
      if (error) return 'failed';
      if (originalStatus === 'passed') return 'passed';
      if (originalStatus === 'pending') return 'skipped';
      if (originalStatus === 'todo') return 'disabled';
      if (originalStatus === 'timedOut') return 'failed';
      if (originalStatus === 'interrupted') return 'failed';
      return 'failed';
    }),
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
  };
});

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
      const result = extractAndCleanStep(input);
      expect(result.expectedResult).toBe('Button should be clicked');
      expect(result.data).toBe('Button data');
      expect(result.cleanedString).toBe('Click button');
    });

    it('should handle step with only expected result', () => {
      const input = 'Click button QaseExpRes:: Button should be clicked QaseData:';
      const result = extractAndCleanStep(input);
      expect(result.expectedResult).toBe('Button should be clicked');
      expect(result.data).toBe(null);
      expect(result.cleanedString).toBe('Click button');
    });

    it('should handle step with only data', () => {
      const input = 'Click button QaseExpRes: QaseData:: Button data';
      const result = extractAndCleanStep(input);
      expect(result.expectedResult).toBe('');
      expect(result.data).toBe('Button data');
      expect(result.cleanedString).toBe('Click button');
    });

    it('should return original string if no QaseExpRes or QaseData', () => {
      const input = 'Click button';
      const result = extractAndCleanStep(input);
      expect(result.expectedResult).toBe(null);
      expect(result.data).toBe(null);
      expect(result.cleanedString).toBe('Click button');
    });
  });

  describe('removeQaseIdsFromTitle', () => {
    it('should remove Qase ID from title', () => {
      const result = removeQaseIdsFromTitle('Test (Qase ID: 123)');
      expect(result).toBe('Test');
    });
    it('should remove multiple Qase IDs from title', () => {
      const result = removeQaseIdsFromTitle('Test (Qase ID: 123,456)');
      expect(result).toBe('Test');
    });
    it('should return original title if no Qase ID', () => {
      const result = removeQaseIdsFromTitle('Test without ID');
      expect(result).toBe('Test without ID');
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
      expect(reporter['stepIndex'].hasStepCached(step)).toBe(true);
    });

    it('should not cache test step if category is not test.step', () => {
      const testCase = { ...testCaseMock };
      const step = { category: 'hook', title: 'Hook 1' };
      const result = { ...testResultMock };

      reporter.onStepBegin(testCase as any, result as any, step as any);

      // @ts-ignore
      expect(reporter['stepIndex'].hasStepCached(step)).toBe(false);
    });

    it('should not cache test step if already cached', () => {
      const testCase = { ...testCaseMock };
      const step = { category: 'test.step', title: 'Step 1' };
      const result = { ...testResultMock };

      // @ts-ignore
      reporter['stepIndex'].cacheStep(step, testCase);

      reporter.onStepBegin(testCase as any, result as any, step as any);

      // @ts-ignore
      expect(reporter['stepIndex'].hasStepCached(step)).toBe(true);
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
      expect(call.testops_id).toBe(123);
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

});
