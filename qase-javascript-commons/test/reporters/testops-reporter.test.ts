import { expect } from '@jest/globals';
import { TestOpsReporter } from '../../src/reporters/testops-reporter';
import { TestResultType, TestStatusEnum } from '../../src/models';
import { LoggerInterface } from '../../src/utils/logger';
import { IClient } from '../../src/client/interface';
import { StateManager } from '../../src/state/state';

jest.mock('async-mutex', () => ({
  Mutex: jest.fn().mockImplementation(() => ({
    acquire: jest.fn().mockResolvedValue(jest.fn()),
  })),
}));

jest.mock('chalk', () => {
  const mockChalk = jest.fn((strings: string[], ...values: string[]) => {
    return strings.reduce((result: string, str: string, i: number) => {
      return result + str + (values[i] || '');
    }, '');
  });
  
  (mockChalk as unknown as { blue: jest.Mock; green: jest.Mock; yellow: jest.Mock }).blue = jest.fn((text: string) => text);
  (mockChalk as unknown as { blue: jest.Mock; green: jest.Mock; yellow: jest.Mock }).green = jest.fn((text: string) => text);
  (mockChalk as unknown as { blue: jest.Mock; green: jest.Mock; yellow: jest.Mock }).yellow = jest.fn((text: string) => text);
  
  return mockChalk;
});

jest.mock('../../src/state/state', () => ({
  StateManager: {
    setRunId: jest.fn(),
  },
}));

describe('TestOpsReporter', () => {
  let mockLogger: jest.Mocked<LoggerInterface>;
  let mockApiClient: jest.Mocked<IClient>;
  let reporter: TestOpsReporter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockLogger = {
      log: jest.fn(),
      logDebug: jest.fn(),
      logError: jest.fn(),
    };

    mockApiClient = {
      createRun: jest.fn(),
      completeRun: jest.fn(),
      uploadResults: jest.fn(),
    };

    reporter = new TestOpsReporter(
      mockLogger,
      mockApiClient,
      true,
      'TEST_PROJECT',
      'qase.io',
      100,
      123
    );
  });

  describe('constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(reporter).toBeInstanceOf(TestOpsReporter);
      expect(reporter['baseUrl']).toBe('https://app.qase.io');
      expect(reporter['batchSize']).toBe(100);
      expect(reporter['runId']).toBe(123);
      expect(reporter['projectCode']).toBe('TEST_PROJECT');
      expect(reporter['withState']).toBe(true);
    });

    it('should use defaultChunkSize when batchSize is not provided', () => {
      const reporterWithoutBatch = new TestOpsReporter(
        mockLogger,
        mockApiClient,
        false,
        'TEST_PROJECT'
      );
      expect(reporterWithoutBatch['batchSize']).toBe(200);
    });

    it('should handle custom baseUrl correctly', () => {
      const reporterWithCustomUrl = new TestOpsReporter(
        mockLogger,
        mockApiClient,
        false,
        'TEST_PROJECT',
        'custom.qase.io'
      );
      expect(reporterWithCustomUrl['baseUrl']).toBe('https://custom.qase.io');
    });

    it('should replace api with app in baseUrl', () => {
      const reporterWithApiUrl = new TestOpsReporter(
        mockLogger,
        mockApiClient,
        false,
        'TEST_PROJECT',
        'api.custom.qase.io'
      );
      expect(reporterWithApiUrl['baseUrl']).toBe('https://app.custom.qase.io');
    });
  });

  describe('startTestRun', () => {
    it('should create a new test run', async () => {
      mockApiClient.createRun.mockResolvedValue(456);

      await reporter.startTestRun();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.createRun).toHaveBeenCalled();
      expect(reporter['runId']).toBe(456);
      expect(process.env['QASE_TESTOPS_RUN_ID']).toBe('456');
      expect(reporter['isTestRunReady']).toBe(true);
    });

    it('should save runId in StateManager when withState=true', async () => {
      mockApiClient.createRun.mockResolvedValue(789);

      await reporter.startTestRun();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(StateManager.setRunId).toHaveBeenCalledWith(789);
    });
  });

  describe('addTestResult', () => {
    beforeEach(async () => {
      mockApiClient.createRun.mockResolvedValue(123);
      await reporter.startTestRun();
    });

    it('should add successful test without showing link', async () => {
      const testResult = new TestResultType('Successful Test');
      testResult.id = 'test-1';
      testResult.testops_id = 1;
      testResult.execution.status = TestStatusEnum.passed;
      testResult.execution.duration = 1000;

      await reporter.addTestResult(testResult);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).not.toHaveBeenCalledWith(
        expect.stringContaining('See why this test failed')
      );
    });

    it('should show link for failed test with single ID', async () => {
      const testResult = new TestResultType('Failed Test');
      testResult.id = 'test-2';
      testResult.testops_id = 2;
      testResult.execution.status = TestStatusEnum.failed;
      testResult.execution.duration = 1000;

      await reporter.addTestResult(testResult);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('See why this test failed')
      );
    });

    it('should show links for failed test with multiple IDs', async () => {
      const testResult = new TestResultType('Failed Test Multiple IDs');
      testResult.id = 'test-3';
      testResult.testops_id = [3, 4, 5];
      testResult.execution.status = TestStatusEnum.failed;
      testResult.execution.duration = 1000;

      await reporter.addTestResult(testResult);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledTimes(3);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('See why this test failed')
      );
    });

    it('should publish results when batchSize is reached', async () => {
      const testResults = Array.from({ length: 100 }, (_, i) => {
        const result = new TestResultType(`Test ${i}`);
        result.id = `test-${i}`;
        result.testops_id = i;
        result.execution.status = TestStatusEnum.passed;
        result.execution.duration = 1000;
        return result;
      });

      for (const result of testResults) {
        await reporter.addTestResult(result);
      }

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.uploadResults).toHaveBeenCalledWith(123, testResults);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.logDebug).toHaveBeenCalledWith('Results sent to Qase: 100');
    });
  });

  describe('publish', () => {
    it('should send results and complete run', async () => {
      mockApiClient.createRun.mockResolvedValue(123);
      await reporter.startTestRun();

      const testResult = new TestResultType('Test');
      testResult.id = 'test-1';
      testResult.testops_id = 1;
      testResult.execution.status = TestStatusEnum.passed;
      testResult.execution.duration = 1000;

      await reporter.addTestResult(testResult);
      await reporter.publish();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.uploadResults).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.completeRun).toHaveBeenCalledWith(123);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith('{green Run 123 completed}');
    });
  });

  describe('sendResults', () => {
    beforeEach(async () => {
      mockApiClient.createRun.mockResolvedValue(123);
      await reporter.startTestRun();
    });

    it('should show message when no results to send', async () => {
      await reporter.sendResults();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('{yellow No results to send to Qase}')
      );
    });

    it('should send remaining results', async () => {
      const testResults = Array.from({ length: 50 }, (_, i) => {
        const result = new TestResultType(`Test ${i}`);
        result.id = `test-${i}`;
        result.testops_id = i;
        result.execution.status = TestStatusEnum.passed;
        result.execution.duration = 1000;
        return result;
      });

      for (const result of testResults) {
        await reporter.addTestResult(result);
      }

      await reporter.sendResults();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.uploadResults).toHaveBeenCalledWith(123, testResults);
    });

    it('should send results in chunks when exceeding defaultChunkSize', async () => {
      reporter['results'] = [];
      reporter['firstIndex'] = 0;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      mockApiClient.uploadResults.mockClear();
      
      const testResults = Array.from({ length: 250 }, (_, i) => {
        const result = new TestResultType(`Test ${i}`);
        result.id = `test-${i}`;
        result.testops_id = i;
        result.execution.status = TestStatusEnum.passed;
        result.execution.duration = 1000;
        return result;
      });

      for (const result of testResults) {
        await reporter.addTestResult(result);
      }

      await reporter.sendResults();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.uploadResults).toHaveBeenCalledTimes(3);
    });
  });

  describe('complete', () => {
    it('should complete run', async () => {
      mockApiClient.createRun.mockResolvedValue(123);
      await reporter.startTestRun();

      await reporter.complete();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockApiClient.completeRun).toHaveBeenCalledWith(123);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith('{green Run 123 completed}');
    });

    it('should throw error when runId is not set', async () => {
      const reporterWithoutRun = new TestOpsReporter(
        mockLogger,
        mockApiClient,
        false,
        'TEST_PROJECT'
      );

      await expect(reporterWithoutRun.complete()).rejects.toThrow('Run ID is not set');
    });
  });

  describe('prepareFailedTestLink', () => {
    beforeEach(async () => {
      mockApiClient.createRun.mockResolvedValue(123);
      await reporter.startTestRun();
    });

    it('should create link with test ID', () => {
      const link = reporter['prepareFailedTestLink'](42, 'Test Title');
      
      expect(link).toContain('TEST_PROJECT-42');
      expect(link).toContain('https://app.qase.io/run/TEST_PROJECT/dashboard/123');
    });

    it('should create link with test title when ID is not provided', () => {
      const link = reporter['prepareFailedTestLink'](null, 'Test Title');
      
      expect(link).toContain(encodeURI('Test Title'));
      expect(link).toContain('https://app.qase.io/run/TEST_PROJECT/dashboard/123');
    });

    it('should throw error when runId is not set', () => {
      const reporterWithoutRun = new TestOpsReporter(
        mockLogger,
        mockApiClient,
        false,
        'TEST_PROJECT'
      );

      expect(() => {
        reporterWithoutRun['prepareFailedTestLink'](42, 'Test Title');
      }).toThrow('Run ID is not set');
    });
  });

  describe('showLink', () => {
    beforeEach(async () => {
      mockApiClient.createRun.mockResolvedValue(123);
      await reporter.startTestRun();
    });

    it('should show link for failed test', () => {
      reporter['showLink'](42, 'Failed Test');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('See why this test failed')
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('TEST_PROJECT-42')
      );
    });
  });
}); 
