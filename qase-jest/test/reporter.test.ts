/* eslint-disable */
import { expect } from '@jest/globals';
import { JestQaseReporter } from '../src/reporter';
import { existsSync } from 'fs';
import { TestStepType } from 'qase-javascript-commons';
import { METADATA_DIR_ENV, MetadataWriter, PROJECT_GLOBAL } from '../src/metadataChannel';

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

  afterEach(() => {
    (reporter as any).metadataReader.cleanup();
  });

  // Plays the role of qase.* calls made inside the test, in what would be a worker process.
  // `project` is what the worker reads from the global the reporter puts into the project's config.
  const workerFor = (testPath: string, testName: string, project = 'project-a') =>
    new MetadataWriter(process.env[METADATA_DIR_ENV], () => ({ project, testPath, testName, invocation: 1 }));

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
    it('initializes commons reporter and hands the metadata directory to workers', () => {
      expect((reporter as any).reporter).toBe(reporterMock);
      const dir = (reporter as any).metadataReader.dir;
      expect(process.env[METADATA_DIR_ENV]).toBe(dir);
      expect(existsSync(dir)).toBe(true);
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
    const test = { path: '/test/path', context: { config: { id: 'project-a', globals: {} } } } as any;

    beforeEach(() => {
      reporter.onTestFileStart(test);
    });
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

    it('uses startedAt from onTestCaseStart to compute start/end_time', () => {
      reporter.onTestCaseStart(test, {
        ancestorTitles: ['Test Suite'],
        fullName: 'Test Suite Test',
        mode: undefined as any,
        title: 'Test (Qase ID: 123)',
        startedAt: 1_700_000_000_000,
      } as any);
      reporter.onTestCaseResult(test, testCaseResult);
      const call = reporterMock.addTestResult.mock.calls[0][0];
      expect(call.execution.start_time).toBe(1_700_000_000);
      expect(call.execution.end_time).toBe(1_700_000_001);
      expect(call.execution.duration).toBe(1000);
    });

    it('skips addTestResult when ignore flag is set', () => {
      workerFor('/test/path', 'Test Suite Test').ignore();
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();
    });

    it('applies metadata written for the test', () => {
      const worker = workerFor('/test/path', 'Test Suite Test');
      worker.title('Custom Title');
      worker.comment('Custom Comment');
      worker.suite('Custom Suite');
      worker.fields({ field1: 'value1' });
      worker.parameters({ param1: 'value1' });
      worker.groupParams({ group1: 'value1' });
      const step = new TestStepType();
      step.id = 'step1';
      worker.step(step);
      worker.attachment({ file_name: 'file' } as any);

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

    it('consumes metadata so it is not applied twice', () => {
      workerFor('/test/path', 'Test Suite Test').title('First');
      reporter.onTestCaseResult(test, testCaseResult);
      reporter.onTestCaseResult(test, testCaseResult);
      const second = reporterMock.addTestResult.mock.calls[1][0];
      expect(second.title).toBe('Test'); // not 'First'
    });

    it('applies metadata only to the test it was written for', () => {
      workerFor('/test/path', 'Test Suite Other').title('Other');
      workerFor('/test/other-file', 'Test Suite Test').title('Other file');
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult.mock.calls[0][0].title).toBe('Test');
    });

    it('tags each project with its id through the project globals', () => {
      expect(test.context.config.globals[PROJECT_GLOBAL]).toBe('project-a');
    });

    it('keeps the same test apart when it runs in two Jest projects at once', () => {
      // Jest passes the runner's shared context to onTestCaseResult, so only file events say which
      // project ran a test; overlapping runs of one file are reported from onTestResult.
      const other = { path: '/test/path', context: { config: { id: 'project-b', globals: {} } } } as any;
      reporter.onTestFileStart(other);
      workerFor('/test/path', 'Test Suite Test', 'project-a').title('From A');
      workerFor('/test/path', 'Test Suite Test', 'project-b').title('From B');

      reporter.onTestCaseResult(test, testCaseResult);
      reporter.onTestCaseResult(test, testCaseResult);
      expect(reporterMock.addTestResult).not.toHaveBeenCalled();

      const fileResult = { testFilePath: '/test/path', testResults: [testCaseResult] } as any;
      reporter.onTestResult(other, fileResult);
      reporter.onTestResult(test, fileResult);

      expect(reporterMock.addTestResult.mock.calls.map((c: any[]) => c[0].title)).toEqual(['From B', 'From A']);
    });

    it('reports a test once when another project starts the same file after it was reported', () => {
      workerFor('/test/path', 'Test Suite Test', 'project-a').title('From A');
      reporter.onTestCaseResult(test, testCaseResult);

      const other = { path: '/test/path', context: { config: { id: 'project-b', globals: {} } } } as any;
      reporter.onTestFileStart(other);
      reporter.onTestResult(test, { testFilePath: '/test/path', testResults: [testCaseResult] } as any);

      expect(reporterMock.addTestResult.mock.calls.map((c: any[]) => c[0].title)).toEqual(['From A']);
    });

    it('keeps the first id when projects share one globals object', () => {
      const shared = {};
      const a = { path: '/test/shared', context: { config: { id: 'shared-a', globals: shared } } } as any;
      const b = { path: '/test/shared', context: { config: { id: 'shared-b', globals: shared } } } as any;
      reporter.onTestFileStart(a);
      reporter.onTestFileStart(b);
      expect((shared as any)[PROJECT_GLOBAL]).toBe('shared-a');

      // Workers of both projects read 'shared-a', and the reporter reads with the same key.
      workerFor('/test/shared', 'Test Suite Test', 'shared-a').title('Shared');
      reporter.onTestResult(b, { testFilePath: '/test/shared', testResults: [testCaseResult] } as any);
      expect(reporterMock.addTestResult.mock.calls[0][0].title).toBe('Shared');
    });

    it('falls back to no project when the project globals cannot be changed', () => {
      const frozen = { path: '/test/frozen', context: { config: { id: 'project-c', globals: Object.freeze({}) } } } as any;
      reporter.onTestFileStart(frozen);
      // The worker sees no project global either, so both sides use the empty key.
      workerFor('/test/frozen', 'Test Suite Test', '').title('No project');
      reporter.onTestCaseResult(frozen, testCaseResult);
      expect(reporterMock.addTestResult.mock.calls[0][0].title).toBe('No project');
    });

    it('reports the test without metadata when the metadata file is corrupt', () => {
      const { writeFileSync, readdirSync } = jest.requireActual<typeof import('fs')>('fs');
      workerFor('/test/path', 'Test Suite Test').title('T');
      const dir = (reporter as any).metadataReader.dir;
      const [file] = readdirSync(dir);
      writeFileSync(`${dir}/${file}`, '{"title":');
      expect(() => reporter.onTestCaseResult(test, testCaseResult)).not.toThrow();
      expect(reporterMock.addTestResult.mock.calls[0][0].title).toBe('Test');
    });
  });

  describe('onTestResult', () => {
    it('forwards pending test results to addTestResult', () => {
      const test = { path: '/test/path', context: { config: { id: 'project-a', globals: {} } } } as any;
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

    it('skips non-pending test results already reported per test case', () => {
      const test = { path: '/test/path', context: { config: { id: 'project-a', globals: {} } } } as any;
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
});
