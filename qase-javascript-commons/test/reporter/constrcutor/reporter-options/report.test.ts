import { describe, it, expect, vi } from 'vitest';
import { QaseCoreReporter, QaseCoreReporterOptions } from '../../../../src';

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
  reporterName: 'qase-core-reporter',
  frameworkName: 'qase-core-reporter',
};

describe('report', () => {
  it('should disable reporter if reporterOptions.report is false', () => {
    delete process.env.QASE_LOGGING;
    const consoleSpy = vi.spyOn(console, 'log');
    const reporter = new QaseCoreReporter(
      {
        report: false,
        apiToken: 'token',
        projectCode: 'code',
        logging: true,
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['isDisabled']).toBe(true);
    expect(consoleSpy).toBeCalledWith(
      expect.stringContaining('Reporting to qase.io is disabled.'),
    );
  });
  it('should disable reporter if QASE_REPORT and reporterOptions.report is not set', () => {
    delete process.env.QASE_LOGGING;
    const consoleSpy = vi.spyOn(console, 'log');
    const qaseCoreReporterOptions: QaseCoreReporterOptions = {
      reporterName: 'qase-core-reporter',
      frameworkName: 'qase-core-reporter',
    };
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
        logging: true,
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['isDisabled']).toBe(true);
    expect(consoleSpy).toBeCalledWith(
      expect.stringContaining('Reporting to qase.io is disabled.'),
    );
  });

  it('should enable reporter if reporterOptions.report is true', () => {
    const qaseCoreReporterOptions: QaseCoreReporterOptions = {
      reporterName: 'qase-core-reporter',
      frameworkName: 'qase-core-reporter',
    };
    const reporter = new QaseCoreReporter(
      {
        report: true,
        apiToken: 'token',
        projectCode: 'code',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['isDisabled']).toBe(false);
  });

  it('should enable reporter if QASE_REPORT is set', () => {
    process.env.QASE_REPORT = '1';
    const qaseCoreReporterOptions: QaseCoreReporterOptions = {
      reporterName: 'qase-core-reporter',
      frameworkName: 'qase-core-reporter',
    };
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      qaseCoreReporterOptions,
    );

    expect(reporter['isDisabled']).toBe(false);
  });

  it('should log QASE_ENABLED message if qaseCoreReporterOptions.enabledSupport is true', () => {
    delete process.env.QASE_REPORT;
    const consoleSpy = vi.spyOn(console, 'log');
    const qaseCoreReporterOptions: QaseCoreReporterOptions = {
      reporterName: 'qase-core-reporter',
      frameworkName: 'qase-core-reporter',
      enabledSupport: true,
    };
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      qaseCoreReporterOptions,
    );

    expect(consoleSpy).toBeCalledWith(
      expect.stringContaining(
        'QASE_ENABLED env variable is not set or Qase reporter option "enabled" is false.',
      ),
    );
  });
});
