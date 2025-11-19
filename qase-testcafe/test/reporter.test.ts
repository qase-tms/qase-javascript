/* eslint-disable */
import { expect } from '@jest/globals';
import { TestcafeQaseReporter } from '../src/reporter';

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
  },
  generateSignature: jest.fn(() => 'mock-signature'),
  determineTestStatus: jest.fn((error, originalStatus) => {
    if (error) return 'failed';
    if (originalStatus === 'passed') return 'passed';
    if (originalStatus === 'pending') return 'skipped';
    return 'failed';
  }),
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({})),
  })),
}));

describe('TestcafeQaseReporter', () => {
  let reporter: TestcafeQaseReporter;
  const options = {};

  beforeEach(() => {
    jest.clearAllMocks();
    reporter = new TestcafeQaseReporter(options);
  });

  describe('static getStatus', () => {
    it('should return skipped if testRunInfo.skipped is true', () => {
      const info = { skipped: true, errs: [] } as any;
      expect((TestcafeQaseReporter as any).getStatus(info)).toBe('skipped');
    });
    it('should return failed if there are errors', () => {
      const info = { skipped: false, errs: [{}] } as any;
      expect((TestcafeQaseReporter as any).getStatus(info)).toBe('failed');
    });
    it('should return passed if no errors and not skipped', () => {
      const info = { skipped: false, errs: [] } as any;
      expect((TestcafeQaseReporter as any).getStatus(info)).toBe('passed');
    });
  });

  describe('static transformAttachments', () => {
    it('should transform screenshots to attachments', () => {
      const screenshots = [
        { screenshotPath: 'a.png', thumbnailPath: '', userAgent: '', quarantineAttempt: 0, takenOnFail: false },
        { screenshotPath: 'b.png', thumbnailPath: '', userAgent: '', quarantineAttempt: 0, takenOnFail: false },
      ];
      const result = (TestcafeQaseReporter as any).transformAttachments(screenshots);
      expect(result).toHaveLength(2);
      expect(result[0].file_name).toBe('a.png');
      expect(result[1].file_name).toBe('b.png');
    });
  });

  describe('constructor', () => {
    it('should initialize reporter and global.Qase', () => {
      expect((reporter as any).reporter).toBe(reporterMock);
      // @ts-expect-error - global.Qase is dynamically added at runtime
      expect(global.Qase).toBeDefined();
    });
  });

  describe('addStep', () => {
    it('should add step to steps array', () => {
      reporter.addStep({ id: '1' } as any);
      expect((reporter as any).steps).toHaveLength(1);
    });
  });

  describe('addAttachment', () => {
    it('should add attachment to attachments array', () => {
      reporter.addAttachment({ file_name: 'file', file_path: '', mime_type: '', content: '', size: 0, id: 'id' });
      expect((reporter as any).attachments).toHaveLength(1);
    });
  });

  describe('startTestRun', () => {
    it('should call reporter.startTestRun', () => {
      reporter.startTestRun();
      expect(reporterMock.startTestRun).toHaveBeenCalled();
    });
  });

  describe('reportTestStart', () => {
    it('should reset steps, attachments, and testBeginTime', () => {
      (reporter as any).steps = [{ id: '1' }];
      (reporter as any).attachments = [{ file_name: 'file', file_path: '', mime_type: '', content: '', size: 0, id: 'id' }];
      (reporter as any).testBeginTime = 123;
      reporter.reportTestStart();
      expect((reporter as any).steps).toEqual([]);
      expect((reporter as any).attachments).toEqual([]);
      expect(typeof (reporter as any).testBeginTime).toBe('number');
    });
  });

  describe('reportTestDone', () => {
    const testRunInfo = {
      errs: [],
      warnings: [],
      durationMs: 1000,
      unstable: false,
      screenshotPath: '',
      screenshots: [],
      quarantine: {},
      skipped: false,
      fixture: { id: 'f1', name: 'Fixture', path: '/path/to/fixture', meta: {} },
    };
    const meta = { QaseID: '123', QaseTitle: 'Custom Title', QaseFields: '{"f":"v"}', QaseParameters: '{"p":"v"}', QaseGroupParameters: '{"g":"v"}' };
    const formatError = (e: any, prefix: string) => prefix + (e.errMsg || '');

    it('should call addTestResult with correct data', async () => {
      await reporter.reportTestDone('Test Title', testRunInfo, meta, formatError);
      expect(reporterMock.addTestResult).toHaveBeenCalled();
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.title).toBe('Custom Title');
      expect(call.fields).toEqual({ f: 'v' });
      expect(call.params).toEqual({ p: 'v' });
      expect(call.group_params).toEqual({ g: 'v' });
      expect(call.execution.duration).toBe(1000);
      expect(call.signature).toBe('mock-signature');
    });

    it('should not call addTestResult if QaseIgnore is true', async () => {
      await reporter.reportTestDone('Test Title', testRunInfo, { ...meta, QaseIgnore: 'true' }, formatError);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });

    it('should handle errors and attachments', async () => {
      const info = { ...testRunInfo, errs: [{
        userAgent: '',
        screenshotPath: '',
        testRunId: '',
        testRunPhase: '',
        type: '',
        errMsg: 'fail',
      }] };
      (reporter as any).attachments = [{ file_name: 'file', file_path: '', mime_type: '', content: '', size: 0, id: 'id' }];
      await reporter.reportTestDone('Test Title', info, meta, formatError);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.message).toContain('fail');
      expect(call.attachments).toHaveLength(1);
    });
  });

  describe('reportTaskDone', () => {
    it('should call reporter.publish', async () => {
      await reporter.reportTaskDone();
      expect(reporterMock.publish).toHaveBeenCalled();
    });
  });

  describe('getMeta', () => {
    it('should parse all meta fields', () => {
      const meta = {
        QaseID: '1,2',
        QaseTitle: 'title',
        QaseFields: '{"a":"b"}',
        QaseParameters: '{"p":"v"}',
        QaseGroupParameters: '{"g":"v"}',
        QaseIgnore: 'true',
        CID: '3',
      };
      const result = (reporter as any).getMeta(meta);
      expect(result.QaseID).toEqual([1, 2]);
      expect(result.QaseTitle).toBe('title');
      expect(result.QaseFields).toEqual({ a: 'b' });
      expect(result.QaseParameters).toEqual({ p: 'v' });
      expect(result.QaseGroupParameters).toEqual({ g: 'v' });
      expect(result.QaseIgnore).toBe(true);
    });
    it('should handle empty meta', () => {
      const result = (reporter as any).getMeta({});
      expect(result.QaseID).toEqual([]);
      expect(result.QaseTitle).toBeUndefined();
      expect(result.QaseFields).toEqual({});
      expect(result.QaseParameters).toEqual({});
      expect(result.QaseGroupParameters).toEqual({});
      expect(result.QaseIgnore).toBe(false);
    });
  });

  describe('getSignature', () => {
    it('should call generateSignature with correct args', () => {
      const fixture = { name: 'Fix', path: '/a/b', id: 'id', meta: {} };
      const ids = [1, 2];
      const params = { p: 'v' };
      const result = (reporter as any).getSignature(fixture, 'Test Title', ids, params);
      const { generateSignature } = require('qase-javascript-commons');
      expect(generateSignature).toHaveBeenCalled();
      expect(result).toBe('mock-signature');
    });
  });
}); 
