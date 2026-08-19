/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { expect } from '@jest/globals';

jest.mock('../../src/client/clientV2', () => ({
  ClientV2: jest.fn().mockImplementation(() => ({})),
}));

import { ClientV2 } from '../../src/client/clientV2';
import { TestOpsMultiReporter } from '../../src/reporters/testops-multi-reporter';

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
