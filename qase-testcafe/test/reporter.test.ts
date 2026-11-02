/* eslint-disable */
import { expect } from '@jest/globals';
import { TestcafeQaseReporter } from '../src/reporter';
import { MetadataParser } from '../src/modules/metadataParser';
import { ResultBuilder } from '../src/modules/resultBuilder';

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
      expect(ResultBuilder.getStatus(info)).toBe('skipped');
    });
    it('should return failed if there are errors', () => {
      const info = { skipped: false, errs: [{}] } as any;
      expect(ResultBuilder.getStatus(info)).toBe('failed');
    });
    it('should return passed if no errors and not skipped', () => {
      const info = { skipped: false, errs: [] } as any;
      expect(ResultBuilder.getStatus(info)).toBe('passed');
    });
  });

  describe('static transformAttachments', () => {
    it('should transform screenshots to attachments', () => {
      const screenshots = [
        { screenshotPath: 'a.png', thumbnailPath: '', userAgent: '', quarantineAttempt: 0, takenOnFail: false },
        { screenshotPath: 'b.png', thumbnailPath: '', userAgent: '', quarantineAttempt: 0, takenOnFail: false },
      ];
      const result = ResultBuilder.transformAttachments(screenshots);
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

  describe('steps and attachments under concurrency', () => {
    const info = (browsers: any[]) => ({
      errs: [], warnings: [], durationMs: 1, unstable: false, screenshotPath: '', screenshots: [],
      quarantine: {}, skipped: false, fixture: { id: 'f', name: 'F', meta: {} }, browsers,
    }) as any;
    const step = (action: string) => ({ id: action, data: { action }, steps: [] } as any);
    const attachment = (file_name: string) =>
      ({ file_name, file_path: null, mime_type: 'text/plain', content: 'x', size: 1, id: file_name } as any);
    const reported = () => reporterMock.addTestResult.mock.calls.map((c: any) => c[0]);

    it('keeps what each test run records apart when tests overlap', async () => {
      reporter.reportTestStart({ testId: 'a', testRunIds: ['run-a'], startTime: new Date(1000), skipped: false });
      reporter.reportTestStart({ testId: 'b', testRunIds: ['run-b'], startTime: new Date(2000), skipped: false });
      reporter.addStep(step('a1'), 'run-a');
      reporter.addStep(step('b1'), 'run-b');
      reporter.addAttachment(attachment('b.txt'), 'run-b');
      reporter.addStep(step('a2'), 'run-a');

      await reporter.reportTestDone('A', { ...info([{ testRunId: 'run-a' }]), testId: 'a' }, {}, () => '');
      await reporter.reportTestDone('B', { ...info([{ testRunId: 'run-b' }]), testId: 'b' }, {}, () => '');

      const [a, b] = reported();
      expect(a.steps.map((s: any) => s.data.action)).toEqual(['a1', 'a2']);
      expect(a.attachments).toEqual([]);
      expect(a.execution.start_time).toBe(1);
      expect(b.steps.map((s: any) => s.data.action)).toEqual(['b1']);
      expect(b.attachments.map((x: any) => x.file_name)).toEqual(['b.txt']);
      expect(b.execution.start_time).toBe(2);
    });

    it('reports only the final quarantine attempt', async () => {
      reporter.addStep(step('try1'), 'run-1');
      reporter.addAttachment(attachment('try1.txt'), 'run-1');
      reporter.addStep(step('try2'), 'run-2');

      await reporter.reportTestDone('Q', info([{ testRunId: 'run-2', quarantineAttemptsTestRunIds: ['run-1', 'run-2'] }]), {}, () => '');

      expect(reported()[0].steps.map((s: any) => s.data.action)).toEqual(['try2']);
      expect(reported()[0].attachments).toEqual([]);
      expect((reporter as any).recorded.size).toBe(0);
    });

    it('takes steps from one browser and attachments from all', async () => {
      reporter.addStep(step('s'), 'chrome');
      reporter.addAttachment(attachment('chrome.png'), 'chrome');
      reporter.addStep(step('s'), 'firefox');
      reporter.addAttachment(attachment('firefox.png'), 'firefox');

      await reporter.reportTestDone('M', info([{ testRunId: 'chrome' }, { testRunId: 'firefox' }]), {}, () => '');

      expect(reported()[0].steps).toHaveLength(1);
      expect(reported()[0].attachments.map((x: any) => x.file_name)).toEqual(['chrome.png', 'firefox.png']);
    });

    it('gives calls outside a known test run to the next reported test', async () => {
      reporter.reportTestStart();
      reporter.addStep(step('loose'));
      reporter.addAttachment(attachment('loose.txt'));

      await reporter.reportTestDone('L', info([]), {}, () => '');

      expect(reported()[0].steps.map((s: any) => s.data.action)).toEqual(['loose']);
      expect(reported()[0].attachments.map((x: any) => x.file_name)).toEqual(['loose.txt']);
    });

    it('drops what an ignored test recorded', async () => {
      reporter.addStep(step('ignored'), 'run-i');
      await reporter.reportTestDone('I', info([{ testRunId: 'run-i' }]), { QaseIgnore: 'true' }, () => '');
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
      expect((reporter as any).recorded.size).toBe(0);
    });
  });

  describe('startTestRun', () => {
    it('should call reporter.startTestRun', () => {
      reporter.startTestRun();
      expect(reporterMock.startTestRun).toHaveBeenCalled();
    });
  });

  describe('reportTestStart', () => {
    it('should reset unattributed records and testBeginTime', () => {
      reporter.addStep({ id: '1' } as any, null);
      (reporter as any).testBeginTime = 123;
      reporter.reportTestStart();
      expect((reporter as any).unattributed.steps).toEqual([]);
      expect((reporter as any).testBeginTime).not.toBe(123);
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

    it('should use suite metadata for relations when QaseSuite is provided', async () => {
      const suitesMeta = { ...meta, QaseSuite: 'Parent\tChild' };
      await reporter.reportTestDone('Test Title', testRunInfo, suitesMeta, formatError);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.relations.suite.data).toEqual([
        { title: 'Parent', public_id: null },
        { title: 'Child', public_id: null },
      ]);
    });

    it('should fall back to fixture name when QaseSuite is not provided', async () => {
      await reporter.reportTestDone('Test Title', testRunInfo, meta, formatError);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.relations.suite.data).toEqual([
        { title: 'Fixture', public_id: null },
      ]);
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
      reporter.addAttachment({ file_name: 'file', file_path: '', mime_type: '', content: '', size: 0, id: 'id' }, null);
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
      const result = MetadataParser.parse(meta);
      expect(result.QaseID).toEqual([1, 2]);
      expect(result.QaseTitle).toBe('title');
      expect(result.QaseFields).toEqual({ a: 'b' });
      expect(result.QaseParameters).toEqual({ p: 'v' });
      expect(result.QaseGroupParameters).toEqual({ g: 'v' });
      expect(result.QaseIgnore).toBe(true);
    });
    it('should parse QaseSuite from meta', () => {
      const meta = { QaseSuite: 'Parent\tChild' };
      const result = MetadataParser.parse(meta);
      expect(result.QaseSuite).toBe('Parent\tChild');
    });
    it('should leave QaseSuite undefined when not provided', () => {
      const result = MetadataParser.parse({});
      expect(result.QaseSuite).toBeUndefined();
    });
    it('should handle empty meta', () => {
      const result = MetadataParser.parse({});
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
      const result = ResultBuilder.getSignature(fixture, 'Test Title', ids, params);
      const { generateSignature } = require('qase-javascript-commons');
      expect(generateSignature).toHaveBeenCalled();
      expect(result).toBe('mock-signature');
    });
  });
}); 
