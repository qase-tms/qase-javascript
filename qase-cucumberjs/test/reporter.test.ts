/* eslint-disable */
import { expect } from '@jest/globals';
import { EventEmitter } from 'events';
import { Formatter } from '@cucumber/cucumber';
import { Envelope, AttachmentContentEncoding } from '@cucumber/messages';
import { CucumberQaseReporter } from '../src/reporter';

interface QaseReporterMock {
  addTestResult: jest.Mock;
  publish: jest.Mock;
  startTestRun: jest.Mock;
}

const qaseReporterMock: QaseReporterMock = {
  addTestResult: jest.fn(),
  publish: jest.fn().mockResolvedValue(undefined),
  startTestRun: jest.fn(),
};

const storageMock = {
  addScenario: jest.fn(),
  addPickle: jest.fn(),
  addAttachment: jest.fn(),
  addTestCase: jest.fn(),
  addTestCaseStarted: jest.fn(),
  addTestCaseStep: jest.fn(),
  convertTestCase: jest.fn(() => ({ id: 'result-id' })) as jest.Mock,
};

jest.mock('qase-javascript-commons', () => ({
  QaseReporter: { 
    getInstance: jest.fn(() => qaseReporterMock) 
  },
  composeOptions: jest.fn(() => ({})),
  ConfigLoader: jest.fn().mockImplementation(() => ({ 
    load: jest.fn(() => ({})) 
  })),
}));

jest.mock('../src/storage', () => ({
  Storage: jest.fn(() => storageMock),
}));

describe('CucumberQaseReporter', () => {
  let eventBroadcaster: EventEmitter;

  beforeEach(() => {
    jest.clearAllMocks();
    eventBroadcaster = new EventEmitter();
  });

  function createReporter(): CucumberQaseReporter {
    return new CucumberQaseReporter({
      eventBroadcaster,
      colorFns: {} as Formatter['colorFns'],
      cwd: '',
      eventDataCollector: {} as Formatter['eventDataCollector'],
      log: jest.fn(),
      parsedArgvOptions: {},
      snippetBuilder: {} as Formatter['snippetBuilder'],
      stream: {} as Formatter['stream'],
      supportCodeLibrary: {} as Formatter['supportCodeLibrary'],
      cleanup: jest.fn(),
    });
  }

  it('should extend Formatter', () => {
    const reporter = createReporter();
    expect(reporter).toBeInstanceOf(Formatter);
  });

  it('should subscribe to envelope events and call storage methods', () => {
    createReporter();

    const gherkinEnvelope: Envelope = { 
      gherkinDocument: { feature: { children: [], name: 'f' } } 
    } as unknown as Envelope;
    const pickleEnvelope: Envelope = { 
      pickle: { id: 'p1' } 
    } as unknown as Envelope;
    const attachmentEnvelope: Envelope = { 
      attachment: { 
        testStepId: 'step1', 
        mediaType: 'text/plain', 
        body: 'data',
        contentEncoding: AttachmentContentEncoding.IDENTITY
      } 
    } as unknown as Envelope;
    const testCaseEnvelope: Envelope = { 
      testCase: { id: 'tc1' } 
    } as unknown as Envelope;
    const testCaseStartedEnvelope: Envelope = { 
      testCaseStarted: { id: 'tcs1' } 
    } as unknown as Envelope;
    const testStepFinishedEnvelope: Envelope = { 
      testStepFinished: { 
        testCaseStartedId: 'tcs1', 
        testStepId: 'step1', 
        testStepResult: { status: 'PASSED' } 
      } 
    } as unknown as Envelope;
    const testCaseFinishedEnvelope: Envelope = { 
      testCaseFinished: { testCaseStartedId: 'tcs1' } 
    } as unknown as Envelope;

    eventBroadcaster.emit('envelope', gherkinEnvelope);
    eventBroadcaster.emit('envelope', pickleEnvelope);
    eventBroadcaster.emit('envelope', attachmentEnvelope);
    eventBroadcaster.emit('envelope', testCaseEnvelope);
    eventBroadcaster.emit('envelope', testCaseStartedEnvelope);
    eventBroadcaster.emit('envelope', testStepFinishedEnvelope);
    eventBroadcaster.emit('envelope', testCaseFinishedEnvelope);

    expect(storageMock.addScenario).toHaveBeenCalledWith(gherkinEnvelope.gherkinDocument);
    expect(storageMock.addPickle).toHaveBeenCalledWith(pickleEnvelope.pickle);
    expect(storageMock.addAttachment).toHaveBeenCalledWith(attachmentEnvelope.attachment);
    expect(storageMock.addTestCase).toHaveBeenCalledWith(testCaseEnvelope.testCase);
    expect(storageMock.addTestCaseStarted).toHaveBeenCalledWith(testCaseStartedEnvelope.testCaseStarted);
    expect(storageMock.addTestCaseStep).toHaveBeenCalledWith(testStepFinishedEnvelope.testStepFinished);
    expect(storageMock.convertTestCase).toHaveBeenCalledWith(testCaseFinishedEnvelope.testCaseFinished);
    expect(qaseReporterMock.addTestResult).toHaveBeenCalledWith({ id: 'result-id' });
  });

  it('should not call addTestResult if convertTestCase returns undefined', () => {
    createReporter();
    storageMock.convertTestCase.mockReturnValueOnce(undefined);
    const testCaseFinishedEnvelope: Envelope = { 
      testCaseFinished: { testCaseStartedId: 'tcs1' } 
    } as unknown as Envelope;
    eventBroadcaster.emit('envelope', testCaseFinishedEnvelope);
    expect(qaseReporterMock.addTestResult).not.toHaveBeenCalled();
  });

  it('should call reporter.publish on testRunFinished', async () => {
    createReporter();
    const testRunFinishedEnvelope: Envelope = { 
      testRunFinished: {} 
    } as unknown as Envelope;
    eventBroadcaster.emit('envelope', testRunFinishedEnvelope);
    // Wait for promise completion
    await new Promise((resolve) => process.nextTick(resolve));
    expect(qaseReporterMock.publish).toHaveBeenCalled();
  });

  it('should call reporter.startTestRun on testRunStarted', () => {
    createReporter();
    const testRunStartedEnvelope: Envelope = { 
      testRunStarted: {} 
    } as unknown as Envelope;
    eventBroadcaster.emit('envelope', testRunStartedEnvelope);
    expect(qaseReporterMock.startTestRun).toHaveBeenCalled();
  });
}); 
