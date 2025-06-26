import { expect } from '@jest/globals';
import { EventEmitter } from 'events';
import { Formatter } from '@cucumber/cucumber';
import { Envelope } from '@cucumber/messages';
import { CucumberQaseReporter } from '../src/reporter';

jest.mock('qase-javascript-commons', () => ({
  QaseReporter: { getInstance: jest.fn() },
  composeOptions: jest.fn(() => ({})),
  ConfigLoader: jest.fn().mockImplementation(() => ({ load: jest.fn(() => ({})) })),
}));

jest.mock('../src/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
      addScenario: jest.fn(),
      addPickle: jest.fn(),
      addAttachment: jest.fn(),
      addTestCase: jest.fn(),
      addTestCaseStarted: jest.fn(),
      addTestCaseStep: jest.fn(),
      convertTestCase: jest.fn(() => ({ id: 'result-id' })),
    })),
  };
});

describe('CucumberQaseReporter', () => {
  let eventBroadcaster: EventEmitter;
  let qaseReporterMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBroadcaster = new EventEmitter();
    // Мокаем reporter
    qaseReporterMock = {
      addTestResult: jest.fn(),
      publish: jest.fn().mockResolvedValue(undefined),
      startTestRun: jest.fn(),
    };
    require('qase-javascript-commons').QaseReporter.getInstance.mockReturnValue(qaseReporterMock);
  });

  function createReporter() {
    return new CucumberQaseReporter({
      eventBroadcaster,
      colorFns: {} as any,
      cwd: '',
      eventDataCollector: {} as any,
      log: jest.fn(),
      parsedArgvOptions: {},
      snippetBuilder: {} as any,
      stream: {} as any,
      supportCodeLibrary: {} as any,
      cleanup: jest.fn(),
    });
  }

  it('should extend Formatter', () => {
    const reporter = createReporter();
    expect(reporter).toBeInstanceOf(Formatter);
  });

  it('should subscribe to envelope events and call storage methods', () => {
    const reporter = createReporter();
    const storage = reporter['storage'];

    const gherkinEnvelope: Envelope = { gherkinDocument: { feature: { children: [], name: 'f' } } } as any;
    const pickleEnvelope: Envelope = { pickle: { id: 'p1' } } as any;
    const attachmentEnvelope: Envelope = { attachment: { testStepId: 'step1', mediaType: 'text/plain', body: 'data' } } as any;
    const testCaseEnvelope: Envelope = { testCase: { id: 'tc1' } } as any;
    const testCaseStartedEnvelope: Envelope = { testCaseStarted: { id: 'tcs1' } } as any;
    const testStepFinishedEnvelope: Envelope = { testStepFinished: { testCaseStartedId: 'tcs1', testStepId: 'step1', testStepResult: { status: 'PASSED' } } } as any;
    const testCaseFinishedEnvelope: Envelope = { testCaseFinished: { testCaseStartedId: 'tcs1' } } as any;

    eventBroadcaster.emit('envelope', gherkinEnvelope);
    eventBroadcaster.emit('envelope', pickleEnvelope);
    eventBroadcaster.emit('envelope', attachmentEnvelope);
    eventBroadcaster.emit('envelope', testCaseEnvelope);
    eventBroadcaster.emit('envelope', testCaseStartedEnvelope);
    eventBroadcaster.emit('envelope', testStepFinishedEnvelope);
    eventBroadcaster.emit('envelope', testCaseFinishedEnvelope);

    expect(storage.addScenario).toHaveBeenCalledWith(gherkinEnvelope.gherkinDocument);
    expect(storage.addPickle).toHaveBeenCalledWith(pickleEnvelope.pickle);
    expect(storage.addAttachment).toHaveBeenCalledWith(attachmentEnvelope.attachment);
    expect(storage.addTestCase).toHaveBeenCalledWith(testCaseEnvelope.testCase);
    expect(storage.addTestCaseStarted).toHaveBeenCalledWith(testCaseStartedEnvelope.testCaseStarted);
    expect(storage.addTestCaseStep).toHaveBeenCalledWith(testStepFinishedEnvelope.testStepFinished);
    expect(storage.convertTestCase).toHaveBeenCalledWith(testCaseFinishedEnvelope.testCaseFinished);
    expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith({ id: 'result-id' });
  });

  it('should not call addTestResult if convertTestCase returns undefined', () => {
    const reporter = createReporter();
    const storage = reporter['storage'];
    (storage.convertTestCase as jest.Mock).mockReturnValueOnce(undefined);
    const testCaseFinishedEnvelope: Envelope = { testCaseFinished: { testCaseStartedId: 'tcs1' } } as any;
    eventBroadcaster.emit('envelope', testCaseFinishedEnvelope);
    expect(qaseReporterMock.addTestResult).not.toHaveBeenCalled();
  });

  it('should call reporter.publish on testRunFinished', async () => {
    createReporter();
    const testRunFinishedEnvelope: Envelope = { testRunFinished: {} } as any;
    eventBroadcaster.emit('envelope', testRunFinishedEnvelope);
    // Ждем завершения промиса
    await new Promise(process.nextTick);
    expect(qaseReporterMock.publish).toHaveBeenCalled();
  });

  it('should call reporter.startTestRun on testRunStarted', () => {
    createReporter();
    const testRunStartedEnvelope: Envelope = { testRunStarted: {} } as any;
    eventBroadcaster.emit('envelope', testRunStartedEnvelope);
    expect(qaseReporterMock.startTestRun).toHaveBeenCalled();
  });
}); 
