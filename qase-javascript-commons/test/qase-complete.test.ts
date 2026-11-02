import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { QaseReporter } from '../src/qase';
import { ReportReporter } from '../src/reporters/report-reporter';
import { RunFailures } from '../src/state/run-failures';

describe('QaseReporter.complete', () => {
  let complete: jest.SpiedFunction<ReportReporter['complete']>;

  beforeEach(() => {
    (QaseReporter as unknown as { instance: unknown }).instance = undefined;
    delete process.env['QASE_RUN_SESSION'];
    complete = jest.spyOn(ReportReporter.prototype, 'complete').mockResolvedValue(undefined);
  });

  afterEach(() => {
    complete.mockRestore();
    RunFailures.consume();
    delete process.env['QASE_RUN_SESSION'];
  });

  const reporter = () => {
    const instance = QaseReporter.getInstance({
      mode: 'report',
      fallback: 'off',
      frameworkPackage: 'test',
      frameworkName: 'test',
      reporterName: 'test',
      logging: { console: false, file: false },
    } as never);
    instance.startTestRun();
    return instance;
  };

  it('completes the run', async () => {
    await reporter().complete();
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('leaves the run open when another process of the run failed to send its results', async () => {
    const instance = reporter();
    // What a worker process inheriting the session records on an upstream failure.
    RunFailures.record();

    await instance.complete();

    expect(complete).not.toHaveBeenCalled();
  });
});
