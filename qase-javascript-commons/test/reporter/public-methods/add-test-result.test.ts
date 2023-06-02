import { describe, it, expect } from 'vitest';
import { ResultCreateStatusEnum } from 'qaseio/dist/src';
import { QaseCoreReporter, QaseOptions, TestResult } from '../../../src';

describe('addTestResult', () => {
  const options: QaseOptions = {
    report: true,
    apiToken: '123',
    projectCode: 'TP',
    logging: true,
    basePath: 'https://api.qase.io/v1',
    runComplete: true,
    environmentId: 1,
    rootSuiteTitle: 'Cypress tests',
  };

  const qaseCoreOptions = {
    frameworkName: 'jest',
    reporterName: 'qase-core-reporter',
    screenshotFolder: './',
    uploadAttachments: true,
  };

  it('should add unknown case', () => {
    const testData: TestResult = {
      id: '1245643254',
      title: 'Test 1',
      status: ResultCreateStatusEnum.PASSED,
      duration: 100,
    };

    const expectedData = {
      id: '1245643254',
      status: 'passed',
      time_ms: 100,
      stacktrace: undefined,
      comment: undefined,
      defect: false,
      param: undefined,
      attachments: undefined,
      case: {
        title: 'Test 1',
        suite_title: 'Cypress tests',
      },
    };

    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.PASSED, [
      { path: process.cwd() + '/screenshots/' + 'screenshot.png' },
    ]);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should add unknown case even without root suite title', () => {
    const testData: TestResult = {
      id: '1245643254',
      title: 'Test 1',
      status: ResultCreateStatusEnum.PASSED,
      duration: 100,
      suitePath: 'Test Suite',
    };

    const expectedData = {
      id: '1245643254',
      status: 'passed',
      time_ms: 100,
      stacktrace: undefined,
      comment: undefined,
      defect: false,
      param: undefined,
      attachments: undefined,
      case: {
        title: 'Test 1',
        suite_title: 'Test Suite',
      },
    };

    options.rootSuiteTitle = undefined as any;

    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.PASSED, []);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );

    options.rootSuiteTitle = 'Cypress tests';
  });

  it('should add failed as default status if no status/unknown is provided', () => {
    const testData: TestResult = {
      id: '1245643254',
      title: 'Test 1',
      duration: 100,
    } as any;

    const expectedData = {
      id: '1245643254',
      status: 'failed',
      time_ms: 100,
    };
    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, 'unknown-status' as any, []);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should add test case with title and status only', () => {
    const testData: TestResult = {
      title: 'Test 4',
      status: ResultCreateStatusEnum.FAILED,
    };

    const expectedData = {
      status: 'failed',
      time_ms: 0,
      stacktrace: undefined,
      comment: undefined,
      defect: true,
      param: undefined,
      attachments: undefined,
      case: { title: 'Test 4', suite_title: 'Cypress tests' },
    };
    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should add test with error', () => {
    const testData: TestResult = {
      title: 'Test 2',
      status: ResultCreateStatusEnum.FAILED,
      duration: 100,
      error: new Error('Test 2 error'),
      suitePath: 'tMy First Test\tTest Suite - Level 2',
    };

    const expectedData = {
      status: 'failed',
      time_ms: 100,
      comment: 'Test 2: Test 2 error',
      defect: true,
      param: undefined,
      attachments: undefined,
      case: {
        title: 'Test 2',
        suite_title: 'Cypress tests\ttMy First Test\tTest Suite - Level 2',
      },
    };
    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED, []);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should add test with error and stacktrace', () => {
    const testData: TestResult = {
      title: 'Test 3',
      status: ResultCreateStatusEnum.FAILED,
      duration: 100,
      stacktrace: 'Test 3 error stacktrace',
      error: new Error('Test 3 error'),
      suitePath: 'My First Test\tTest Suite - Level 4',
    };

    const expectedData = {
      status: 'failed',
      time_ms: 100,
      stacktrace: 'Test 3 error stacktrace',
      comment: 'Test 3: Test 3 error',
      defect: true,
      param: undefined,
      attachments: undefined,
      case: {
        title: 'Test 3',
        suite_title: 'Cypress tests\tMy First Test\tTest Suite - Level 4',
      },
    };
    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED, []);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should add test with attachment hash', () => {
    const testData: TestResult = {
      title: 'Test 2',
      status: ResultCreateStatusEnum.FAILED,
      duration: 100,
      error: new Error('Test 2 error'),
      attachments: ['123454328o798u9p4jnkjfn'],
      suitePath: 'My First Test\tTest Suite - Level 2',
    };

    const expectedData = {
      status: 'failed',
      time_ms: 100,
      comment: 'Test 2: Test 2 error',
      defect: true,
      param: undefined,
      attachments: ['123454328o798u9p4jnkjfn'],
      case: {
        title: 'Test 2',
        suite_title: 'Cypress tests\tMy First Test\tTest Suite - Level 2',
      },
    };

    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED, []);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should parse param from title', () => {
    const testData: TestResult = {
      title: 'Test 5 (Qase Dataset: #0 (expected data))',
      status: ResultCreateStatusEnum.SKIPPED,
    };

    const expectedData = {
      status: 'skipped',
      time_ms: 0,
      stacktrace: undefined,
      comment: '::_using data set #0 (expected data)_',
      defect: false,
      param: { jest: '#0' },
      attachments: undefined,
      case: {
        title: 'Test 5',
        suite_title: 'Cypress tests',
      },
    };

    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.SKIPPED);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });

  it('should parse param from failed test', () => {
    const testData: TestResult = {
      title: 'Test 5 (Qase Dataset: #0 (expected data))',
      error: new Error('Test 5 error'),
      stacktrace: 'Test 5 error stacktrace',
      status: ResultCreateStatusEnum.FAILED,
    };

    const expectedData = {
      status: 'failed',
      time_ms: 0,
      stacktrace: 'Test 5 error stacktrace',
      defect: true,
      param: { jest: '#0' },
      attachments: undefined,
      case: {
        title: 'Test 5',
        suite_title: 'Cypress tests',
      },
    };

    const reporter = new QaseCoreReporter(options, qaseCoreOptions);
    reporter.addTestResult(testData, ResultCreateStatusEnum.FAILED);
    expect(reporter['resultsForPublishing'][0]).toEqual(
      expect.objectContaining(expectedData),
    );
  });
});
