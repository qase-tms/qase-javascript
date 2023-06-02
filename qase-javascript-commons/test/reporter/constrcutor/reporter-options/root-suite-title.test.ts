import { describe, it, expect } from 'vitest';
import { QaseCoreReporter, QaseCoreReporterOptions } from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
  reporterName: 'qase-core-reporter',
  frameworkName: 'qase-core-reporter',
};

describe('rootSuiteTitle', () => {
  it('should be able to set from reporterOptions.rootSuiteTitle', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
        rootSuiteTitle: 'rootSuiteTitle-Text',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].rootSuiteTitle).toBe('rootSuiteTitle-Text');
  });

  it('should be able to set from QASE_ROOT_SUITE_TITLE', () => {
    process.env.QASE_ROOT_SUITE_TITLE = 'rootSuiteTitle-ENV';
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].rootSuiteTitle).toBe('rootSuiteTitle-ENV');
  });

  it('should take QASE_ROOT_SUITE_TITLE over reporterOptions.rootSuiteTitle', () => {
    process.env.QASE_ROOT_SUITE_TITLE = 'rootSuiteTitle-ENV';
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
        rootSuiteTitle: 'rootSuiteTitle-Text',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].rootSuiteTitle).toBe('rootSuiteTitle-ENV');
  });
});
