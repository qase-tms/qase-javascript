import { expect } from '@jest/globals';
import { ReportReporter } from '../../src/reporters/report-reporter';
import { TestStatusEnum, TestResultType, TestStepType, StepType } from '../../src/models';
import { WriterInterface } from '../../src/writer';
import { LoggerInterface } from '../../src/utils/logger';

const createMockWriter = (): jest.Mocked<WriterInterface> => ({
  clearPreviousResults: jest.fn(),
  writeAttachment: jest.fn((attachments) => attachments.map(a => ({ ...a, file_path: '/mock/' + a.file_name }))),
  writeTestResult: jest.fn().mockResolvedValue(undefined),
  writeReport: jest.fn().mockResolvedValue('/mock/report.json'),
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
    expect(writer.clearPreviousResults).toHaveBeenCalled();
    expect(writer.writeAttachment).toHaveBeenCalled();
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
    expect(writer.clearPreviousResults).toHaveBeenCalled();
    expect(writer.writeReport).toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('/mock/report.json'));
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
    expect(reportArg?.stats).toEqual({ total: 5, passed: 1, failed: 1, skipped: 1, broken: 1, muted: 1 });
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
    expect(writer.writeAttachment).toHaveBeenCalledTimes(2);
    expect(result[0]?.attachments[0]?.file_path).toBe('/mock/parent.txt');
    expect(result[0]?.steps[0]?.attachments[0]?.file_path).toBe('/mock/child.txt');
  });
}); 
