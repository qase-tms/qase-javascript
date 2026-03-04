import { expect } from '@jest/globals';
import { ReportReporter } from '../../src/reporters/report-reporter';
import { TestStatusEnum, TestResultType, TestStepType, StepType } from '../../src/models';
import { WriterInterface } from '../../src/writer';
import { LoggerInterface } from '../../src/utils/logger';

/** Shape of a serialized attachment in report output */
interface SerializedAttachment {
  id: string;
  file_name: string;
  mime_type: string;
  file_path: string;
  size?: number;
  content?: string;
}

/** Shape of serialized step data in report output */
interface SerializedStepData {
  action: string;
  expected_result: string | null;
  input_data: string | null;
  data?: string | null;
  keyword?: string;
  name?: string;
  line?: number;
}

/** Shape of a serialized step in report output */
interface SerializedStep {
  id: string;
  step_type: string;
  data: SerializedStepData;
  parent_id: string | null;
  execution: { attachments: SerializedAttachment[]; [key: string]: unknown };
  steps: SerializedStep[];
  attachments?: unknown;
}

/** Shape of a serialized result in report output */
interface SerializedResult {
  id: string;
  title: string;
  signature: string;
  execution: Record<string, unknown>;
  fields: Record<string, string>;
  attachments: SerializedAttachment[];
  steps: SerializedStep[];
  params: Record<string, string>;
  param_groups: string[][];
  testops_ids: number[] | null;
  relations: unknown;
  muted: boolean;
  message: string | null;
  testops_id?: unknown;
  group_params?: unknown;
  run_id?: unknown;
  author?: unknown;
  testops_project_mapping?: unknown;
  preparedAttachments?: unknown;
}

const createMockWriter = (): jest.Mocked<WriterInterface> => ({
  clearPreviousResults: jest.fn(),
  writeAttachment: jest.fn((attachments) => attachments.map(a => ({ ...a, file_path: '/mock/' + a.file_name }))),
  writeTestResult: jest.fn().mockResolvedValue(undefined),
  writeReport: jest.fn().mockResolvedValue('/mock/run.json'),
});

const createMockLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

describe('ReportReporter', () => {
  let writer: jest.Mocked<WriterInterface>;
  let logger: jest.Mocked<LoggerInterface>;
  let reporter: ReportReporter;

  beforeEach(() => {
    writer = createMockWriter();
    logger = createMockLogger();
    reporter = new ReportReporter(logger, writer, 'jest', 'reporter', 'dev', 'RootSuite', 42);
  });

  it('should initialize with correct parameters', () => {
    expect(reporter).toBeInstanceOf(ReportReporter);
  });

  it('should set startTime on startTestRun', async () => {
    const oldTime = reporter['startTime'];
    await new Promise(resolve => setTimeout(resolve, 2));
    await reporter.startTestRun();
    expect(reporter['startTime']).toBeGreaterThanOrEqual(oldTime);
  });

  it('should call sendResults and complete on publish', async () => {
    const sendResultsSpy = jest.spyOn(reporter, 'sendResults').mockResolvedValue();
    const completeSpy = jest.spyOn(reporter, 'complete').mockResolvedValue();
    await reporter.publish();
    expect(sendResultsSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should write test results and handle attachments in sendResults', async () => {
    const testResult = new TestResultType('Test 1');
    testResult.id = 't1';
    testResult.execution.status = TestStatusEnum.passed;
    testResult.execution.duration = 100;
    testResult.attachments = [{ file_name: 'file.txt', mime_type: 'text/plain', file_path: null, content: 'abc', size: 3, id: 'a1' }];
    const step = new TestStepType(StepType.TEXT);
    step.id = 's1';
    step.data = { action: 'Step 1', expected_result: null, data: null };
    step.attachments = [{ file_name: 'step.txt', mime_type: 'text/plain', file_path: null, content: 'def', size: 3, id: 'a2' }];
    testResult.steps = [step];
    reporter['results'] = [testResult];
    await reporter.sendResults();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(writer.writeAttachment).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(writer.writeTestResult).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
    expect(reporter['results'][0]?.attachments[0]?.file_path).toBe('/mock/file.txt');
    expect(reporter['results'][0]?.steps[0]?.attachments[0]?.file_path).toBe('/mock/step.txt');
  });

  it('should add rootSuite to relations if present', async () => {
    const testResult = new TestResultType('Test 2');
    testResult.id = 't2';
    testResult.execution.status = TestStatusEnum.passed;
    testResult.execution.duration = 50;
    testResult.relations = { suite: { data: [] } };
    reporter['results'] = [testResult];
    await reporter.sendResults();
    expect(reporter['results'][0]?.relations?.suite?.data[0]).toEqual({ title: 'RootSuite', public_id: null });
  });

  it('should create relations if not present but rootSuite is set', async () => {
    const testResult = new TestResultType('Test 3');
    testResult.id = 't3';
    testResult.execution.status = TestStatusEnum.passed;
    testResult.execution.duration = 30;
    testResult.relations = null;
    reporter['results'] = [testResult];
    await reporter.sendResults();
    expect(reporter['results'][0]?.relations?.suite?.data[0]).toEqual({ title: 'RootSuite', public_id: null });
  });

  it('should write report and log path on complete', async () => {
    reporter['results'] = [];
    await reporter.complete();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(writer.writeReport).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('/mock/run.json'));
  });

  it('should correctly calculate stats and cumulative duration in complete', async () => {
    const testResult1 = new TestResultType('Test 1');
    testResult1.id = 't1';
    testResult1.execution.status = TestStatusEnum.passed;
    testResult1.execution.duration = 10;
    const testResult2 = new TestResultType('Test 2');
    testResult2.id = 't2';
    testResult2.execution.status = TestStatusEnum.failed;
    testResult2.execution.duration = 20;
    const testResult3 = new TestResultType('Test 3');
    testResult3.id = 't3';
    testResult3.execution.status = TestStatusEnum.skipped;
    testResult3.execution.duration = 5;
    const testResult4 = new TestResultType('Test 4');
    testResult4.id = 't4';
    testResult4.execution.status = TestStatusEnum.invalid;
    testResult4.execution.duration = 7;
    const testResult5 = new TestResultType('Test 5');
    testResult5.id = 't5';
    testResult5.execution.status = TestStatusEnum.blocked;
    testResult5.execution.duration = 3;
    reporter['results'] = [testResult1, testResult2, testResult3, testResult4, testResult5];
    await reporter.complete();
    const reportArg = writer.writeReport.mock.calls[0]?.[0];
    expect(reportArg?.stats).toEqual({ total: 5, passed: 1, failed: 1, skipped: 1, invalid: 1, blocked: 1, muted: 0 });
    expect(reportArg?.execution.cumulative_duration).toBe(45);
    expect(reportArg?.results.length).toBe(5);
  });

  it('should recursively copy step attachments', () => {
    const parentStep = new TestStepType(StepType.TEXT);
    parentStep.id = 'parent';
    parentStep.data = { action: 'Parent', expected_result: null, data: null };
    parentStep.attachments = [{ file_name: 'parent.txt', mime_type: 'text/plain', file_path: null, content: 'parent', size: 6, id: 'p1' }];

    const childStep = new TestStepType(StepType.TEXT);
    childStep.id = 'child';
    childStep.data = { action: 'Child', expected_result: null, data: null };
    childStep.attachments = [{ file_name: 'child.txt', mime_type: 'text/plain', file_path: null, content: 'child', size: 5, id: 'c1' }];

    parentStep.steps = [childStep];
    const steps: TestStepType[] = [parentStep];

    const result = reporter['copyStepAttachments'](steps);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(writer.writeAttachment).toHaveBeenCalledTimes(2);
    expect(result[0]?.attachments[0]?.file_path).toBe('/mock/parent.txt');
    expect(result[0]?.steps[0]?.attachments[0]?.file_path).toBe('/mock/child.txt');
  });

  describe('serialization transformation', () => {
    it('should serialize testops_id as testops_ids array when single number', async () => {
      const testResult = new TestResultType('Test with single testops_id');
      testResult.id = 't1';
      testResult.testops_id = 42;
      testResult.execution.status = TestStatusEnum.passed;
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      expect(serialized.testops_ids).toEqual([42]);
      expect(serialized.testops_id).toBeUndefined();
    });

    it('should serialize testops_id as testops_ids when already array', async () => {
      const testResult = new TestResultType('Test with array testops_id');
      testResult.id = 't2';
      testResult.testops_id = [1, 2, 3];
      testResult.execution.status = TestStatusEnum.passed;
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      expect(serialized.testops_ids).toEqual([1, 2, 3]);
      expect(serialized.testops_id).toBeUndefined();
    });

    it('should serialize testops_id as testops_ids null when null', async () => {
      const testResult = new TestResultType('Test with null testops_id');
      testResult.id = 't3';
      testResult.testops_id = null;
      testResult.execution.status = TestStatusEnum.passed;
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      expect(serialized.testops_ids).toBeNull();
      expect(serialized.testops_id).toBeUndefined();
    });

    it('should serialize group_params as param_groups array of arrays', async () => {
      const testResult = new TestResultType('Test with group params');
      testResult.id = 't4';
      testResult.group_params = { browser: 'chrome', os: 'linux' };
      testResult.execution.status = TestStatusEnum.passed;
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      expect(serialized.param_groups).toEqual([['browser', 'os']]);
      expect(serialized.group_params).toBeUndefined();
    });

    it('should serialize empty group_params as empty param_groups array', async () => {
      const testResult = new TestResultType('Test with empty group params');
      testResult.id = 't5';
      testResult.group_params = {};
      testResult.execution.status = TestStatusEnum.passed;
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      expect(serialized.param_groups).toEqual([]);
      expect(serialized.group_params).toBeUndefined();
    });

    it('should serialize step data.data as data.input_data for text steps', async () => {
      const testResult = new TestResultType('Test with step data');
      testResult.id = 't6';
      testResult.execution.status = TestStatusEnum.passed;

      const step = new TestStepType(StepType.TEXT);
      step.id = 's1';
      step.data = { action: 'click button', expected_result: 'success', data: 'some input data' };
      testResult.steps = [step];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      const serializedStep = serialized.steps[0];
      expect(serializedStep.data.input_data).toBe('some input data');
      expect(serializedStep.data.data).toBeUndefined();
      expect(serializedStep.data.action).toBe('click button');
      expect(serializedStep.data.expected_result).toBe('success');
    });

    it('should move step attachments to execution.attachments', async () => {
      const testResult = new TestResultType('Test with step attachments');
      testResult.id = 't7';
      testResult.execution.status = TestStatusEnum.passed;

      const step = new TestStepType(StepType.TEXT);
      step.id = 's1';
      step.data = { action: 'step action', expected_result: null, data: null };
      step.attachments = [
        { file_name: 'step.txt', mime_type: 'text/plain', file_path: '/path/step.txt', content: 'abc', size: 123, id: 'a1' }
      ];
      testResult.steps = [step];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      const serializedStep = serialized.steps[0];

      // No top-level attachments field
      expect(serializedStep.attachments).toBeUndefined();

      // Attachments inside execution
      expect(serializedStep.execution.attachments).toBeDefined();
      expect(serializedStep.execution.attachments.length).toBe(1);
      expect(serializedStep.execution.attachments[0].file_name).toBe('step.txt');
    });

    it('should exclude attachment size field from serialized output', async () => {
      const testResult = new TestResultType('Test with attachments');
      testResult.id = 't8';
      testResult.execution.status = TestStatusEnum.passed;
      testResult.attachments = [
        { file_name: 'file.txt', mime_type: 'text/plain', file_path: '/path/file.txt', content: 'data', size: 1234, id: 'a1' }
      ];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      const attachment = serialized.attachments[0];

      expect(attachment.id).toBe('a1');
      expect(attachment.file_name).toBe('file.txt');
      expect(attachment.mime_type).toBe('text/plain');
      // file_path is modified by mock writer to add /mock/ prefix
      expect(attachment.file_path).toBe('/mock/file.txt');
      expect(attachment.size).toBeUndefined();
      expect(attachment.content).toBeUndefined();
    });

    it('should exclude internal-only fields from serialized output', async () => {
      const testResult = new TestResultType('Test with internal fields');
      testResult.id = 't9';
      testResult.execution.status = TestStatusEnum.passed;
      testResult.run_id = 42;
      testResult.author = 'test-author';
      testResult.testops_project_mapping = { proj1: [1, 2] };
      testResult.preparedAttachments = ['att1', 'att2'];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;

      expect(serialized.run_id).toBeUndefined();
      expect(serialized.author).toBeUndefined();
      expect(serialized.testops_project_mapping).toBeUndefined();
      expect(serialized.preparedAttachments).toBeUndefined();

      // These fields should be present
      expect(serialized.id).toBe('t9');
      expect(serialized.title).toBeDefined();
      expect(serialized.signature).toBeDefined();
      expect(serialized.execution).toBeDefined();
      expect(serialized.fields).toBeDefined();
      expect(serialized.attachments).toBeDefined();
      expect(serialized.steps).toBeDefined();
      expect(serialized.params).toBeDefined();
      expect(serialized.param_groups).toBeDefined();
      expect(serialized.testops_ids).toBeDefined();
      expect(serialized.relations).toBeDefined();
      expect(serialized.muted).toBeDefined();
      expect(serialized.message).toBeDefined();
    });

    it('should recursively serialize nested steps', async () => {
      const testResult = new TestResultType('Test with nested steps');
      testResult.id = 't10';
      testResult.execution.status = TestStatusEnum.passed;

      const parentStep = new TestStepType(StepType.TEXT);
      parentStep.id = 'parent';
      parentStep.data = { action: 'Parent step', expected_result: null, data: 'parent data' };
      parentStep.attachments = [
        { file_name: 'parent.txt', mime_type: 'text/plain', file_path: '/path/parent.txt', content: 'p', size: 100, id: 'p1' }
      ];

      const childStep = new TestStepType(StepType.TEXT);
      childStep.id = 'child';
      childStep.data = { action: 'Child step', expected_result: null, data: 'child data' };
      childStep.attachments = [
        { file_name: 'child.txt', mime_type: 'text/plain', file_path: '/path/child.txt', content: 'c', size: 50, id: 'c1' }
      ];

      parentStep.steps = [childStep];
      testResult.steps = [parentStep];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      const serializedParent = serialized.steps[0];
      const serializedChild = serializedParent.steps[0];

      // Parent step
      expect(serializedParent.data.input_data).toBe('parent data');
      expect(serializedParent.data.data).toBeUndefined();
      expect(serializedParent.execution.attachments.length).toBe(1);
      expect(serializedParent.execution.attachments[0].size).toBeUndefined();
      expect(serializedParent.attachments).toBeUndefined();

      // Child step
      expect(serializedChild.data.input_data).toBe('child data');
      expect(serializedChild.data.data).toBeUndefined();
      expect(serializedChild.execution.attachments.length).toBe(1);
      expect(serializedChild.execution.attachments[0].size).toBeUndefined();
      expect(serializedChild.attachments).toBeUndefined();
    });

    it('should convert gherkin step data to text format during serialization', async () => {
      const testResult = new TestResultType('Test with gherkin steps');
      testResult.id = 't11';
      testResult.execution.status = TestStatusEnum.passed;

      const gherkinStep = new TestStepType(StepType.GHERKIN);
      gherkinStep.id = 'g1';
      gherkinStep.data = { keyword: 'Given', name: 'I am on the home page', line: 5 };
      testResult.steps = [gherkinStep];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serialized = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      const serializedStep = serialized.steps[0];

      // Gherkin data should be converted to text format (STEP-03)
      expect(serializedStep.data.action).toBe('Given I am on the home page');
      expect(serializedStep.data.expected_result).toBe(null);
      expect(serializedStep.data.input_data).toBe(null);
      // Gherkin-specific fields should not be present
      expect(serializedStep.data.keyword).toBeUndefined();
      expect(serializedStep.data.name).toBeUndefined();
      expect(serializedStep.data.line).toBeUndefined();
    });

    it('should convert gherkin steps to text format with all BDD keywords', async () => {
      const testResult = new TestResultType('Gherkin Step Conversion Test');
      testResult.id = 'test-gherkin-conversion';
      testResult.execution.status = TestStatusEnum.passed;

      const gherkinStep = new TestStepType(StepType.GHERKIN);
      gherkinStep.id = 'step-gherkin-1';
      gherkinStep.data = {
        keyword: 'Given',
        name: 'I am on the login page',
        line: 5,
      };

      testResult.steps = [gherkinStep];
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const calls = writer.writeTestResult.mock.calls;
      const serializedResult = calls[0]?.[0] as unknown as SerializedResult;
      const serializedStep = serializedResult.steps[0];

      // Verify Gherkin converted to TEXT format
      expect(serializedStep.data.action).toBe('Given I am on the login page');
      expect(serializedStep.data.expected_result).toBe(null);
      expect(serializedStep.data.input_data).toBe(null);

      // Verify no Gherkin fields in output
      expect(serializedStep.data.keyword).toBeUndefined();
      expect(serializedStep.data.name).toBeUndefined();
      expect(serializedStep.data.line).toBeUndefined();
    });

    it('should recursively convert nested gherkin steps', async () => {
      const testResult = new TestResultType('Nested Gherkin Conversion Test');
      testResult.id = 'test-nested-gherkin';
      testResult.execution.status = TestStatusEnum.passed;

      const parentStep = new TestStepType(StepType.GHERKIN);
      parentStep.id = 'parent-gherkin';
      parentStep.data = { keyword: 'When', name: 'I perform login', line: 10 };

      const childStep = new TestStepType(StepType.GHERKIN);
      childStep.id = 'child-gherkin';
      childStep.data = { keyword: 'And', name: 'I enter credentials', line: 11 };

      parentStep.steps = [childStep];
      testResult.steps = [parentStep];

      reporter['results'] = [testResult];
      await reporter.sendResults();

      const serializedResult = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;
      const serializedParent = serializedResult.steps[0];
      const serializedChild = serializedParent.steps[0];

      expect(serializedParent.data.action).toBe('When I perform login');
      expect(serializedParent.data.expected_result).toBe(null);
      expect(serializedParent.data.input_data).toBe(null);
      expect(serializedParent.data.keyword).toBeUndefined();

      expect(serializedChild.data.action).toBe('And I enter credentials');
      expect(serializedChild.data.expected_result).toBe(null);
      expect(serializedChild.data.input_data).toBe(null);
      expect(serializedChild.data.keyword).toBeUndefined();
    });

    it('should handle mixed text and gherkin steps', async () => {
      const testResult = new TestResultType('Mixed Steps Test');
      testResult.id = 'test-mixed-steps';
      testResult.execution.status = TestStatusEnum.passed;

      const textStep = new TestStepType(StepType.TEXT);
      textStep.id = 'text-step';
      textStep.data = { action: 'Manual step', expected_result: 'Success', data: 'test data' };

      const gherkinStep = new TestStepType(StepType.GHERKIN);
      gherkinStep.id = 'gherkin-step';
      gherkinStep.data = { keyword: 'Then', name: 'I see success message', line: 15 };

      testResult.steps = [textStep, gherkinStep];
      reporter['results'] = [testResult];

      await reporter.sendResults();

      const serializedResult = writer.writeTestResult.mock.calls[0]?.[0] as unknown as SerializedResult;

      // TEXT step: data -> input_data
      expect(serializedResult.steps[0].data.action).toBe('Manual step');
      expect(serializedResult.steps[0].data.expected_result).toBe('Success');
      expect(serializedResult.steps[0].data.input_data).toBe('test data');

      // Gherkin step: keyword + name -> action
      expect(serializedResult.steps[1].data.action).toBe('Then I see success message');
      expect(serializedResult.steps[1].data.expected_result).toBe(null);
      expect(serializedResult.steps[1].data.input_data).toBe(null);
    });
  });
}); 
