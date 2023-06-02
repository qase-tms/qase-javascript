import { describe, it, expect } from 'vitest';
import { QaseCoreReporter } from '../../../src';

describe('qaseCoreReporterOptions', () => {
  it('should be able to set qaseCoreReporterOptions.frameworkName', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      {
        frameworkName: 'framework',
      } as any,
    );

    expect(reporter['options']['qaseCoreReporterOptions']?.frameworkName).toBe(
      'framework',
    );
  });
  it('should be able to set qaseCoreReporterOptions.reporterName', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      {
        reporterName: 'reporter',
      } as any,
    );

    expect(reporter['options']['qaseCoreReporterOptions']?.reporterName).toBe(
      'reporter',
    );
  });
  it('should be able to set qaseCoreReporterOptions.screenshotFolder', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      {
        screenshotFolder: 'screenshotFolder',
      } as any,
    );

    expect(
      reporter['options']['qaseCoreReporterOptions']?.screenshotFolder,
    ).toBe('screenshotFolder');
  });
  it('should be able to set qaseCoreReporterOptions.videoFolder', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      {
        videoFolder: 'videoFolder',
      } as any,
    );

    expect(reporter['options']['qaseCoreReporterOptions']?.videoFolder).toBe(
      'videoFolder',
    );
  });
  it('should be able to set qaseCoreReporterOptions.uploadAttachments', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      {
        uploadAttachments: true,
      } as any,
    );

    expect(
      reporter['options']['qaseCoreReporterOptions']?.uploadAttachments,
    ).toBe(true);
  });
  it('should be able to set qaseCoreReporterOptions.loadConfig', () => {
    const reporter = new QaseCoreReporter(
      {
        apiToken: 'token',
        projectCode: 'code',
      },
      {
        loadConfig: true,
      } as any,
    );

    expect(reporter['options']['qaseCoreReporterOptions']?.loadConfig).toBe(
      true,
    );
  });
});
