/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method */
import { expect } from '@jest/globals';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { AttachmentService } from '../../../src/client/services/attachment-service';
import { LoggerInterface } from '../../../src/utils/logger';
import { Attachment } from '../../../src/models';

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

function mockAttachmentsApi() {
  return {
    uploadAttachment: jest.fn(),
  };
}

function makeTempFile(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'qase-attachment-'));
  const filePath = join(dir, 'trace.zip');
  writeFileSync(filePath, content);
  return filePath;
}

function networkError(code = 'ECONNRESET'): Error {
  const error: any = new Error('socket hang up');
  error.isAxiosError = true;
  error.code = code;
  // no `response` -> this is a network-level failure
  return error as Error;
}

function rateLimitError(retryAfterSeconds: string): Error {
  const error: any = new Error('Too Many Requests');
  error.isAxiosError = true;
  error.response = { status: 429, headers: { 'retry-after': retryAfterSeconds }, data: {} };
  return error as Error;
}

/**
 * Replaces the service's sleep with a no-op that records how long it was asked to wait,
 * so pacing can be asserted precisely without the tests actually sleeping.
 */
function spyOnDelay(service: AttachmentService): jest.SpyInstance {
  return jest.spyOn(service as any, 'delay').mockResolvedValue(undefined);
}

/** Inter-batch pacing is 1000ms + up to 300ms of jitter; retry backoff waits are far longer. */
function pacingDelays(spy: jest.SpyInstance): number[] {
  return spy.mock.calls
    .map(call => call[0] as number)
    .filter(ms => ms >= 1000 && ms <= 1300);
}

function makeAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    file_name: 'test.png',
    mime_type: 'image/png',
    content: Buffer.from('test-content'),
    size: 12,
    ...overrides,
  } as Attachment;
}

describe('AttachmentService', () => {
  let logger: jest.Mocked<LoggerInterface>;
  let api: ReturnType<typeof mockAttachmentsApi>;
  let service: AttachmentService;

  beforeEach(() => {
    logger = silentLogger();
    api = mockAttachmentsApi();
    service = new AttachmentService(logger, api as any);
  });

  describe('uploadAttachment', () => {
    it('should upload a single attachment and return hash', async () => {
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'abc123' }] },
      });

      const result = await service.uploadAttachment('PROJ', makeAttachment());
      expect(result).toBe('abc123');
    });

    it('should return empty string when no hash in response', async () => {
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{}] },
      });

      const result = await service.uploadAttachment('PROJ', makeAttachment());
      expect(result).toBe('');
    });
  });

  describe('uploadAttachments', () => {
    it('should return empty array when uploadAttachments disabled', async () => {
      const result = await service.uploadAttachments('PROJ', [makeAttachment()], false);
      expect(result).toEqual([]);
      expect(api.uploadAttachment).not.toHaveBeenCalled();
    });

    it('should skip null/undefined attachments', async () => {
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'h1' }] },
      });

      const result = await service.uploadAttachments('PROJ', [null as any, makeAttachment()], true);
      expect(result).toEqual(['h1']);
    });

    it('should skip oversized attachments (> 32 MB)', async () => {
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'h1' }] },
      });

      const bigAttachment = makeAttachment({ size: 33 * 1024 * 1024 });
      const normalAttachment = makeAttachment({ size: 100 });

      const result = await service.uploadAttachments('PROJ', [bigAttachment, normalAttachment], true);
      expect(result).toEqual(['h1']);
      expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum file size'));
    });

    it('should batch attachments respecting MAX_FILES_PER_REQUEST limit', async () => {
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'h' }] },
      });

      // Create 25 attachments — should result in 2 batches (20 + 5)
      const attachments = Array.from({ length: 25 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 })
      );

      await service.uploadAttachments('PROJ', attachments, true);
      expect(api.uploadAttachment).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 errors with exponential backoff', async () => {
      const axiosError: any = new Error('Too Many Requests');
      axiosError.isAxiosError = true;
      axiosError.response = { status: 429, headers: { 'retry-after': '1' }, data: {} };

      api.uploadAttachment
        .mockRejectedValueOnce(axiosError)
        .mockResolvedValueOnce({ data: { result: [{ hash: 'h1' }] } });

      const result = await service.uploadAttachments('PROJ', [makeAttachment()], true);
      expect(result).toEqual(['h1']);
      expect(api.uploadAttachment).toHaveBeenCalledTimes(2);
    });

    it('should retry on transient network errors (ECONNRESET) then succeed', async () => {
      const netError: any = new Error('socket hang up');
      netError.isAxiosError = true;
      netError.code = 'ECONNRESET';
      // no `response` -> this is a network-level failure

      api.uploadAttachment
        .mockRejectedValueOnce(netError)
        .mockResolvedValueOnce({ data: { result: [{ hash: 'h1' }] } });

      const result = await service.uploadAttachments('PROJ', [makeAttachment()], true);
      expect(result).toEqual(['h1']);
      expect(api.uploadAttachment).toHaveBeenCalledTimes(2);
    });

    it('should not retry axios errors that carry an HTTP response (e.g. 500)', async () => {
      const httpError: any = new Error('Server Error');
      httpError.isAxiosError = true;
      httpError.response = { status: 500, headers: {}, data: {} };

      api.uploadAttachment.mockRejectedValue(httpError);

      const result = await service.uploadAttachments('PROJ', [makeAttachment()], true);
      expect(result).toEqual([]);
      expect(api.uploadAttachment).toHaveBeenCalledTimes(1);
    });

    it('should continue with next batch if current batch fails with non-429 error', async () => {
      const nonRetryableError: any = new Error('Server Error');
      nonRetryableError.isAxiosError = true;
      nonRetryableError.response = { status: 500, headers: {}, data: {} };

      api.uploadAttachment
        .mockRejectedValueOnce(nonRetryableError)
        .mockResolvedValueOnce({ data: { result: [{ hash: 'h2' }] } });

      // 2 batches: first will fail, second should succeed
      const batch1 = Array.from({ length: 20 }, (_, i) =>
        makeAttachment({ file_name: `a${i}.png`, size: 100 })
      );
      const batch2 = [makeAttachment({ file_name: 'b.png', size: 100 })];

      const result = await service.uploadAttachments('PROJ', [...batch1, ...batch2], true);
      expect(result).toEqual(['h2']);
      expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('Cannot upload batch 1'), expect.anything());
    });

    it('should calculate size from file content when size is 0', async () => {
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'h1' }] },
      });

      const attachment = makeAttachment({ size: 0, content: Buffer.from('hello') });
      const result = await service.uploadAttachments('PROJ', [attachment], true);
      expect(result).toEqual(['h1']);
    });

    it('should return empty array when all attachments are invalid', async () => {
      const result = await service.uploadAttachments('PROJ', [makeAttachment({ size: 0, content: undefined, file_path: undefined })], true);
      expect(result).toEqual([]);
    });
  });

  describe('uploadAttachmentsMapped', () => {
    it('should return an empty map when upload disabled', async () => {
      const map = await service.uploadAttachmentsMapped('PROJ', [makeAttachment()], false);
      expect(map.size).toBe(0);
      expect(api.uploadAttachment).not.toHaveBeenCalled();
    });

    it('should map each attachment to its hash by index within the batch', async () => {
      const a1 = makeAttachment({ file_name: 'a1.png', size: 100 });
      const a2 = makeAttachment({ file_name: 'a2.png', size: 100 });
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'hash-a1' }, { hash: 'hash-a2' }] },
      });

      const map = await service.uploadAttachmentsMapped('PROJ', [a1, a2], true);

      expect(map.get(a1)).toBe('hash-a1');
      expect(map.get(a2)).toBe('hash-a2');
    });

    it('should skip mapping a batch when response length does not match request length', async () => {
      const a1 = makeAttachment({ file_name: 'a1.png', size: 100 });
      const a2 = makeAttachment({ file_name: 'a2.png', size: 100 });
      // Only one hash returned for two files -> ambiguous, must not mis-assign.
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'only-one' }] },
      });

      const map = await service.uploadAttachmentsMapped('PROJ', [a1, a2], true);

      expect(map.size).toBe(0);
      expect(logger.logError).toHaveBeenCalledWith(expect.stringContaining('response size mismatch'));
    });

    it('should split >20 attachments into multiple requests and map all of them', async () => {
      const attachments = Array.from({ length: 25 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      // First request: 20 files, second: 5 files. Return matching-length results.
      api.uploadAttachment
        .mockResolvedValueOnce({ data: { result: attachments.slice(0, 20).map((_, i) => ({ hash: `h${i}` })) } })
        .mockResolvedValueOnce({ data: { result: attachments.slice(20).map((_, i) => ({ hash: `h${20 + i}` })) } });

      const map = await service.uploadAttachmentsMapped('PROJ', attachments, true);

      expect(api.uploadAttachment).toHaveBeenCalledTimes(2);
      expect(map.size).toBe(25);
      expect(map.get(attachments[0])).toBe('h0');
      expect(map.get(attachments[24])).toBe('h24');
    });

    it('should recreate file streams on every retry attempt', async () => {
      // A read stream can only be consumed once, so a retry that reuses the first
      // stream would upload nothing. Each attempt must get a fresh stream.
      const attachment = makeAttachment({
        file_name: 'trace.zip',
        file_path: makeTempFile('trace-content'),
        content: undefined,
        size: 13,
      });

      api.uploadAttachment
        .mockRejectedValueOnce(networkError())
        .mockResolvedValueOnce({ data: { result: [{ hash: 'h1' }] } });

      const map = await service.uploadAttachmentsMapped('PROJ', [attachment], true);

      expect(api.uploadAttachment).toHaveBeenCalledTimes(2);
      const firstStream = api.uploadAttachment.mock.calls[0][1][0].value;
      const secondStream = api.uploadAttachment.mock.calls[1][1][0].value;
      expect(secondStream).not.toBe(firstStream);
      expect(map.get(attachment)).toBe('h1');
    });

    it('should keep no more than `concurrency` uploads in flight', async () => {
      let inFlight = 0;
      let maxInFlight = 0;
      api.uploadAttachment.mockImplementation(async (_code: string, files: any[]) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise(resolve => setTimeout(resolve, 20));
        inFlight--;
        return { data: { result: files.map((_, i) => ({ hash: `h${i}` })) } };
      });

      // 100 attachments -> 5 batches of 20.
      const attachments = Array.from({ length: 100 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      service = new AttachmentService(logger, api as any, { concurrency: 3 });

      const map = await service.uploadAttachmentsMapped('PROJ', attachments, true);

      expect(api.uploadAttachment).toHaveBeenCalledTimes(5);
      expect(maxInFlight).toBe(3);
      expect(map.size).toBe(100);
    });

    it('should default to 4 concurrent uploads', async () => {
      let inFlight = 0;
      let maxInFlight = 0;
      api.uploadAttachment.mockImplementation(async (_code: string, files: any[]) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise(resolve => setTimeout(resolve, 20));
        inFlight--;
        return { data: { result: files.map((_, i) => ({ hash: `h${i}` })) } };
      });

      const attachments = Array.from({ length: 200 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );

      await service.uploadAttachmentsMapped('PROJ', attachments, true);

      expect(maxInFlight).toBe(4);
    });

    it('should clamp concurrency to the supported range', async () => {
      let inFlight = 0;
      let maxInFlight = 0;
      api.uploadAttachment.mockImplementation(async (_code: string, files: any[]) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise(resolve => setTimeout(resolve, 10));
        inFlight--;
        return { data: { result: files.map((_, i) => ({ hash: `h${i}` })) } };
      });

      const attachments = Array.from({ length: 100 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      service = new AttachmentService(logger, api as any, { concurrency: 0 });

      await service.uploadAttachmentsMapped('PROJ', attachments, true);

      expect(maxInFlight).toBe(1);
    });

    it('should not pace batches while the API returns no 429', async () => {
      api.uploadAttachment.mockImplementation((_code: string, files: any[]) =>
        Promise.resolve({ data: { result: files.map((_, i) => ({ hash: `h${i}` })) } }),
      );

      // 100 attachments -> 5 batches, uploaded one at a time so pacing would be visible.
      const attachments = Array.from({ length: 100 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      service = new AttachmentService(logger, api as any, { concurrency: 1 });
      const delaySpy = spyOnDelay(service);

      const map = await service.uploadAttachmentsMapped('PROJ', attachments, true);

      expect(map.size).toBe(100);
      expect(pacingDelays(delaySpy)).toEqual([]);
    });

    it('should pace batches once the API returns a 429', async () => {
      api.uploadAttachment
        .mockRejectedValueOnce(rateLimitError('5'))
        .mockImplementation((_code: string, files: any[]) =>
          Promise.resolve({ data: { result: files.map((_, i) => ({ hash: `h${i}` })) } }),
        );

      const attachments = Array.from({ length: 60 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      service = new AttachmentService(logger, api as any, { concurrency: 1 });
      const delaySpy = spyOnDelay(service);

      const map = await service.uploadAttachmentsMapped('PROJ', attachments, true);

      expect(map.size).toBe(60);
      // 3 batches: the first is rate limited, so the two gaps that follow are paced.
      expect(pacingDelays(delaySpy)).toHaveLength(2);
    });

    it('should stop pacing after five consecutive successful batches', async () => {
      api.uploadAttachment
        .mockRejectedValueOnce(rateLimitError('5'))
        .mockImplementation((_code: string, files: any[]) =>
          Promise.resolve({ data: { result: files.map((_, i) => ({ hash: `h${i}` })) } }),
        );

      // 200 attachments -> 10 batches.
      const attachments = Array.from({ length: 200 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      service = new AttachmentService(logger, api as any, { concurrency: 1 });
      const delaySpy = spyOnDelay(service);

      await service.uploadAttachmentsMapped('PROJ', attachments, true);

      // Batches 1..4 are followed by a paced gap; the fifth success clears the throttle.
      expect(pacingDelays(delaySpy)).toHaveLength(4);
    });

    it('should wait out the Retry-After window before starting the next batch', async () => {
      api.uploadAttachment
        .mockRejectedValueOnce(rateLimitError('5'))
        .mockImplementation((_code: string, files: any[]) =>
          Promise.resolve({ data: { result: files.map((_, i) => ({ hash: `h${i}` })) } }),
        );

      const attachments = Array.from({ length: 40 }, (_, i) =>
        makeAttachment({ file_name: `file${i}.png`, size: 100 }),
      );
      service = new AttachmentService(logger, api as any, { concurrency: 2 });
      const delaySpy = spyOnDelay(service);

      await service.uploadAttachmentsMapped('PROJ', attachments, true);

      // Retry-After: 5 -> the retry backoff waits at least 5s (plus jitter).
      const longWaits = delaySpy.mock.calls.map(call => call[0] as number).filter(ms => ms >= 5000);
      expect(longWaits.length).toBeGreaterThan(0);
    });

    it('should send uploads through a keep-alive agent bounded by the concurrency', async () => {
      api.uploadAttachment.mockResolvedValue({ data: { result: [{ hash: 'h1' }] } });
      service = new AttachmentService(logger, api as any, { concurrency: 6, timeout: 30 });

      await service.uploadAttachmentsMapped('PROJ', [makeAttachment()], true);

      const options = api.uploadAttachment.mock.calls[0][2];
      expect(options.timeout).toBe(30_000);
      expect(options.httpsAgent.options.keepAlive).toBe(true);
      expect(options.httpsAgent.options.maxSockets).toBe(6);
      expect(options.httpAgent.options.keepAlive).toBe(true);
    });

    it('should default the request timeout to 120 seconds', async () => {
      api.uploadAttachment.mockResolvedValue({ data: { result: [{ hash: 'h1' }] } });

      await service.uploadAttachmentsMapped('PROJ', [makeAttachment()], true);

      expect(api.uploadAttachment.mock.calls[0][2].timeout).toBe(120_000);
    });

    it('should retry network failures on a fresh connection', async () => {
      // The socket that was just reset must not be reused, so the retry runs without keep-alive.
      api.uploadAttachment
        .mockRejectedValueOnce(networkError())
        .mockResolvedValueOnce({ data: { result: [{ hash: 'h1' }] } });

      await service.uploadAttachmentsMapped('PROJ', [makeAttachment()], true);

      const firstAgent = api.uploadAttachment.mock.calls[0][2].httpsAgent;
      const retryAgent = api.uploadAttachment.mock.calls[1][2].httpsAgent;
      expect(firstAgent.options.keepAlive).toBe(true);
      expect(retryAgent.options.keepAlive).toBe(false);
      expect(retryAgent).not.toBe(firstAgent);
    });

    it('should keep using the pooled agent when retrying a 429', async () => {
      // Rate limiting is not a connection problem — the pooled connection stays valid.
      api.uploadAttachment
        .mockRejectedValueOnce(rateLimitError('1'))
        .mockResolvedValueOnce({ data: { result: [{ hash: 'h1' }] } });
      const delaySpy = spyOnDelay(service);

      await service.uploadAttachmentsMapped('PROJ', [makeAttachment()], true);

      expect(delaySpy).toHaveBeenCalled();
      const firstAgent = api.uploadAttachment.mock.calls[0][2].httpsAgent;
      const retryAgent = api.uploadAttachment.mock.calls[1][2].httpsAgent;
      expect(retryAgent).toBe(firstAgent);
    });

    it('uploadAttachments wrapper returns the mapped hashes as an array', async () => {
      const a1 = makeAttachment({ file_name: 'a1.png', size: 100 });
      const a2 = makeAttachment({ file_name: 'a2.png', size: 100 });
      api.uploadAttachment.mockResolvedValue({
        data: { result: [{ hash: 'hash-a1' }, { hash: 'hash-a2' }] },
      });

      const result = await service.uploadAttachments('PROJ', [a1, a2], true);
      expect(result).toEqual(['hash-a1', 'hash-a2']);
    });
  });
});
