/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { expect } from '@jest/globals';

const uploadAttachment = jest.fn();

jest.mock('qase-api-v2-client', () => ({
  ResultsApi: jest.fn().mockImplementation(() => ({ createResultsV2: jest.fn() })),
  ResultStepStatus: { PASSED: 'passed', FAILED: 'failed', BLOCKED: 'blocked', SKIPPED: 'skipped' },
}));
jest.mock('qase-api-client', () => ({
  AttachmentsApi: jest.fn().mockImplementation(() => ({ uploadAttachment })),
  ConfigurationsApi: jest.fn(),
  EnvironmentsApi: jest.fn(),
  RunsApi: jest.fn(),
}));
jest.mock('../../src/client/transport/api-config-builder', () => ({
  createApiConfigV1: jest.fn(() => ({})),
  createApiConfigV2: jest.fn(() => ({})),
  resolveAppUrl: jest.fn(() => 'https://app.qase.io'),
}));

import { ClientV2 } from '../../src/client/clientV2';

const silentLogger = (): any => ({ log: jest.fn(), logDebug: jest.fn(), logError: jest.fn() });

function makeAttachment(): any {
  return {
    file_name: 'shot.png',
    mime_type: 'image/png',
    content: Buffer.from('binary'),
    size: 6,
  };
}

describe('attachment upload options from config', () => {
  beforeEach(() => {
    uploadAttachment.mockReset();
    uploadAttachment.mockResolvedValue({ data: { result: [{ hash: 'h1' }] } });
  });

  it('passes the configured concurrency and timeout down to the upload request', async () => {
    const config: any = {
      project: 'PROJ',
      uploadAttachments: true,
      attachments: { concurrency: 8, timeout: 45 },
    };
    const client = new ClientV2(silentLogger(), config, undefined, undefined);

    await client.uploadAttachment(makeAttachment());

    const options = uploadAttachment.mock.calls[0][2];
    expect(options.timeout).toBe(45_000);
    expect(options.httpsAgent.options.maxSockets).toBe(8);
  });

  it('falls back to the defaults when no attachments section is configured', async () => {
    const config: any = { project: 'PROJ', uploadAttachments: true };
    const client = new ClientV2(silentLogger(), config, undefined, undefined);

    await client.uploadAttachment(makeAttachment());

    const options = uploadAttachment.mock.calls[0][2];
    expect(options.timeout).toBe(120_000);
    expect(options.httpsAgent.options.maxSockets).toBe(4);
  });
});
