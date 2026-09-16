/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import { expect } from '@jest/globals';

jest.mock('../../src/client/clientV2', () => ({
  ClientV2: jest.fn().mockImplementation(() => ({})),
}));

import { ClientV2 } from '../../src/client/clientV2';
import { TestOpsMultiReporter } from '../../src/reporters/testops-multi-reporter';
import { TestResultType, TestStatusEnum } from '../../src/models';

const silentLogger = (): any => ({ log: jest.fn(), logDebug: jest.fn(), logError: jest.fn() });

const hostData: any = { system: 'darwin', arch: 'arm64' };

describe('TestOpsMultiReporter project options', () => {
  beforeEach(() => {
    (ClientV2 as unknown as jest.Mock).mockClear();
  });

  it('passes the attachments tuning to every project client', () => {
    const testopsOptions: any = {
      project: 'MAIN',
      api: { token: 'token' },
      run: {},
      plan: {},
      attachments: { concurrency: 8, timeout: 45 },
    };
    const multiConfig: any = { projects: [{ code: 'ONE' }, { code: 'TWO' }] };

    new TestOpsMultiReporter(
      silentLogger(), testopsOptions, multiConfig, false, hostData, 'reporter', 'framework',
    );

    const calls = (ClientV2 as unknown as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    for (const call of calls) {
      expect(call[1].attachments).toEqual({ concurrency: 8, timeout: 45 });
    }
  });

  it('leaves attachments unset when the global config has none', () => {
    const testopsOptions: any = { project: 'MAIN', api: { token: 'token' }, run: {}, plan: {} };
    const multiConfig: any = { projects: [{ code: 'ONE' }] };

    new TestOpsMultiReporter(
      silentLogger(), testopsOptions, multiConfig, false, hostData, 'reporter', 'framework',
    );

    const projectOptions = (ClientV2 as unknown as jest.Mock).mock.calls[0][1];
    expect(projectOptions.attachments).toBeUndefined();
  });
});

describe('TestOpsMultiReporter failed batches', () => {
  const buildReporter = (logger: any): TestOpsMultiReporter => {
    const testopsOptions: any = { project: 'MAIN', api: { token: 'token' }, run: {}, plan: {} };
    const multiConfig: any = { projects: [{ code: 'ONE' }] };

    return new TestOpsMultiReporter(
      logger, testopsOptions, multiConfig, false, hostData, 'reporter', 'framework',
    );
  };

  const makeResult = (title: string): TestResultType => {
    const result = new TestResultType(title);
    result.execution.status = TestStatusEnum.passed;
    return result;
  };

  beforeEach(() => {
    (ClientV2 as unknown as jest.Mock).mockClear();
  });

  it('reports a failed batch without the logging call throwing', async () => {
    const logger = silentLogger();
    const uploadError = new Error('400 title may not be greater than 255 characters');
    const reporter: any = buildReporter(logger);

    reporter.clients.set('ONE', { uploadResults: jest.fn().mockRejectedValue(uploadError) });
    reporter.runIds.set('ONE', 42);
    reporter.projectQueues.set('ONE', [makeResult('a'), makeResult('b')]);
    reporter.firstIndexByProject.set('ONE', 0);

    await expect(reporter.sendResultsForProject('ONE')).resolves.toBe(false);

    expect(logger.logError).toHaveBeenCalledWith(
      expect.stringContaining('[ONE] Unable to send 2 result(s) to Qase after retries'),
      uploadError,
    );
  });
});
