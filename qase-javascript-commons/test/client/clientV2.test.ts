/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-template-expressions */
import { expect } from '@jest/globals';

jest.mock('qase-api-v2-client', () => ({
  ResultsApi: jest.fn().mockImplementation(() => ({ createResultsV2: jest.fn() })),
  ResultStepStatus: { PASSED: 'passed', FAILED: 'failed', BLOCKED: 'blocked', SKIPPED: 'skipped' },
}));
jest.mock('qase-api-client', () => ({
  AttachmentsApi: jest.fn(),
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
import { StepStatusEnum, StepType, TestStatusEnum } from '../../src/models';

const silentLogger = (): any => ({ log: jest.fn(), logDebug: jest.fn(), logError: jest.fn() });

function makeResult(overrides: any = {}): any {
  return {
    title: 'Test case',
    testops_id: 1,
    execution: {
      status: TestStatusEnum.passed,
      start_time: 1000, end_time: 2000, duration: 1000, stacktrace: null, thread: 'main',
    },
    attachments: [],
    preparedAttachments: [],
    steps: [],
    params: {},
    group_params: {},
    relations: null,
    message: null,
    fields: {},
    tags: [],
    signature: 'sig-1',
    ...overrides,
  };
}

describe('ClientV2.uploadResults', () => {
  let client: ClientV2;
  let uploadAttachmentsMapped: jest.Mock;
  let createResultsV2: jest.Mock;

  beforeEach(() => {
    const config: any = { project: 'PROJ', uploadAttachments: true, defect: false };
    client = new ClientV2(silentLogger(), config, undefined, undefined);

    // Build the hash map from the exact attachment objects passed in.
    uploadAttachmentsMapped = jest.fn((_project: string, attachments: any[]) => {
      const map = new Map<any, string>();
      for (const a of attachments) {
        map.set(a, `hash-${a.file_name}`);
      }
      return Promise.resolve(map);
    });
    createResultsV2 = jest.fn().mockResolvedValue(undefined);

    (client as any).attachmentService = { uploadAttachmentsMapped };
    (client as any).resultsClient = { createResultsV2 };
  });

  it('uploads all attachments of the batch once and maps hashes back to result and step', async () => {
    const resultAttachment = { file_name: 'result.png' } as any;
    const stepAttachment = { file_name: 'step.png' } as any;

    const result = makeResult({
      attachments: [resultAttachment],
      steps: [
        {
          step_type: StepType.TEXT,
          data: { action: 'Click' },
          execution: { status: StepStatusEnum.passed, duration: 10 },
          attachments: [stepAttachment],
          steps: [],
        },
      ],
    });

    await client.uploadResults(42, [result]);

    // All attachments uploaded in a single batched call.
    expect(uploadAttachmentsMapped).toHaveBeenCalledTimes(1);
    const passedAttachments = uploadAttachmentsMapped.mock.calls[0][1];
    expect(passedAttachments).toEqual([resultAttachment, stepAttachment]);

    // Hashes land on the right places.
    const payload = createResultsV2.mock.calls[0][2];
    const model = payload.results[0];
    expect(model.attachments).toEqual(['hash-result.png']);
    expect(model.steps[0].execution.attachments).toEqual(['hash-step.png']);
  });

  it('does not upload attachments when uploadAttachments is disabled', async () => {
    (client as any).config.uploadAttachments = false;
    uploadAttachmentsMapped.mockResolvedValue(new Map());

    const result = makeResult({ attachments: [{ file_name: 'x.png' } as any] });
    await client.uploadResults(42, [result]);

    expect(uploadAttachmentsMapped.mock.calls[0][2]).toBe(false);

    // uploadAttachmentsMapped is still called (it handles the disabled flag internally),
    // but returns an empty map, so no hashes are attached.
    const payload = createResultsV2.mock.calls[0][2];
    expect(payload.results[0].attachments).toEqual([]);
  });
});
