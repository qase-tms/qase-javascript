import { describe, it, expect } from 'vitest';
import { QaseCoreReporter, QaseCoreReporterOptions } from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
  reporterName: 'qase-core-reporter',
  frameworkName: 'qase-core-reporter',
};

describe('apiToken', () => {
  it('should be able to set from reporterOptions.apiToken ', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].apiToken).toBe('token');
  });

  it('should be able to set from QASE_API_TOKEN', () => {
    process.env.QASE_API_TOKEN = 'token_env';
    const reporter = new QaseCoreReporter(
      {
        projectCode: 'code',
      } as any,
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].apiToken).toBe('token_env');
  });

  it('should take QASE_API_TOKEN over reporterOptions.apiToken', () => {
    process.env.QASE_API_TOKEN = 'token_env';
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['options'].apiToken).toBe('token_env');
  });
});
