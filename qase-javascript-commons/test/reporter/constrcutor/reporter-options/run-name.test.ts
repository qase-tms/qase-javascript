import { describe, it, expect } from 'vitest';
import { QaseCoreReporter, QaseCoreReporterOptions } from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
  reporterName: 'qase-core-reporter',
  frameworkName: 'qase-core-reporter',
};

describe('runName', () => {
  it('should be able to set from reporterOptions.runName', () => {
    const reporter = new QaseCoreReporter(
      {
        report: true,
        apiToken: 'token',
        projectCode: 'code',
        logging: true,
        runName: 'runName',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].runName).toBe('runName');
  });
  it('should be able to set from QASE_RUN_NAME', () => {
    process.env.QASE_RUN_NAME = 'runNameENV';
    const reporter = new QaseCoreReporter(
      {
        report: true,
        apiToken: 'token',
        projectCode: 'code',
        logging: true,
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].runName).toBe('runNameENV');
  });
  it('should default to false if QASE_RUN_NAME and ', () => {
    process.env.QASE_RUN_NAME = 'runNameENV';
    const reporter = new QaseCoreReporter(
      {
        report: true,
        apiToken: 'token',
        projectCode: 'code',
        logging: true,
        runName: 'runName',
      },
      qaseCoreReporterOptions,
    );
    expect(reporter['options'].runName).toBe('runNameENV');
  });
});
