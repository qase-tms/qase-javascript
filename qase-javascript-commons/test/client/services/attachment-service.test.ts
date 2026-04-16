/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method */
import { expect } from '@jest/globals';
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
});
