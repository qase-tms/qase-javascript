import { AxiosError } from 'axios';
import { AttachmentsApi } from 'qase-api-client';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';
import { Attachment } from '../../models';
import { LoggerInterface } from '../../utils/logger';
import { isAxiosError } from '../../utils/is-axios-error';
import { processError } from './api-error-handler';

const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32 MB per file
const MAX_REQUEST_SIZE = 128 * 1024 * 1024; // 128 MB per request
const MAX_FILES_PER_REQUEST = 20; // 20 files per request
const RETRYABLE_NETWORK_CODES = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED', 'EPIPE'];

interface AttachmentData {
  name: string;
  value: Buffer | Readable;
}

export class AttachmentService {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly attachmentClient: AttachmentsApi,
  ) {}

  async uploadAttachment(projectCode: string, attachment: Attachment): Promise<string> {
    try {
      const data = this.prepareAttachmentData(attachment);
      const response = await this.attachmentClient.uploadAttachment(projectCode, [data]);
      return response.data.result?.[0]?.hash ?? '';
    } catch (error) {
      throw processError(error, 'Error on uploading attachment');
    }
  }

  async uploadAttachments(
    projectCode: string,
    attachments: Attachment[],
    uploadEnabled: boolean,
  ): Promise<string[]> {
    const map = await this.uploadAttachmentsMapped(projectCode, attachments, uploadEnabled);
    return [...map.values()];
  }

  async uploadAttachmentsMapped(
    projectCode: string,
    attachments: Attachment[],
    uploadEnabled: boolean,
  ): Promise<Map<Attachment, string>> {
    const hashByAttachment = new Map<Attachment, string>();

    if (!uploadEnabled) {
      return hashByAttachment;
    }

    const validAttachments: Attachment[] = [];

    for (const attachment of attachments) {
      if (!attachment) continue;

      this.ensureAttachmentSize(attachment);

      if (attachment.size === 0) {
        this.logger.logError(
          `Cannot determine size for attachment "${attachment.file_path ?? attachment.file_name}". Skipping.`,
        );
        continue;
      }

      if (attachment.size > MAX_FILE_SIZE) {
        this.logger.logError(
          `Attachment "${attachment.file_path ?? attachment.file_name}" exceeds maximum file size (32 MB). ` +
          `File size: ${(attachment.size / (1024 * 1024)).toFixed(2)} MB. Skipping.`,
        );
        continue;
      }

      validAttachments.push(attachment);
    }

    if (validAttachments.length === 0) {
      return hashByAttachment;
    }

    const initialJitter = Math.random() * 500;
    await this.delay(initialJitter);

    const batches = this.groupIntoBatches(validAttachments);
    this.logger.logDebug(`Uploading ${validAttachments.length} attachments in ${batches.length} batch(es)`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (!batch || batch.length === 0) continue;

      try {
        const batchNames = batch.map(a => a.file_path ?? a.file_name).join(', ');
        this.logger.logDebug(
          `Uploading batch ${i + 1}/${batches.length} with ${batch.length} file(s): ${batchNames}`,
        );

        const batchData = batch.map(a => this.prepareAttachmentData(a));
        const response = await this.uploadWithRetry(projectCode, batchData, batchNames);

        const results = response.data.result;
        if (!results) {
          continue;
        }

        if (results.length !== batch.length) {
          this.logger.logError(
            `Attachment upload response size mismatch for batch ${i + 1}: ` +
            `expected ${batch.length} result(s), got ${results.length}. ` +
            `Skipping hash mapping for this batch to avoid mis-assigning attachments.`,
          );
          continue;
        }

        for (let j = 0; j < batch.length; j++) {
          const hash = results[j]?.hash;
          const attachment = batch[j];
          if (hash && attachment) {
            hashByAttachment.set(attachment, hash);
          }
        }
      } catch (error) {
        this.logger.logError(`Cannot upload batch ${i + 1}:`, error);
      }

      if (i < batches.length - 1) {
        const baseDelay = 1000;
        const jitter = Math.random() * 300;
        await this.delay(baseDelay + jitter);
      }
    }

    return hashByAttachment;
  }

  private groupIntoBatches(attachments: Attachment[]): Attachment[][] {
    const batches: Attachment[][] = [];
    let currentBatch: Attachment[] = [];
    let currentBatchSize = 0;

    for (const attachment of attachments) {
      const attachmentSize = attachment.size;
      const wouldExceedFileLimit = currentBatch.length >= MAX_FILES_PER_REQUEST;
      const wouldExceedSizeLimit = currentBatchSize + attachmentSize > MAX_REQUEST_SIZE;

      if (wouldExceedFileLimit || wouldExceedSizeLimit) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
      }

      if (attachmentSize > MAX_REQUEST_SIZE) {
        this.logger.logError(
          `Attachment "${attachment.file_path ?? attachment.file_name}" exceeds maximum request size (128 MB). ` +
          `File size: ${(attachmentSize / (1024 * 1024)).toFixed(2)} MB. Skipping.`,
        );
        continue;
      }

      currentBatch.push(attachment);
      currentBatchSize += attachmentSize;
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  private async uploadWithRetry(
    projectCode: string,
    data: AttachmentData[],
    attachmentNames: string,
    maxRetries = 5,
    initialDelay = 1000,
  ): Promise<{ data: { result?: { hash?: string }[] } }> {
    let lastError: unknown;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.attachmentClient.uploadAttachment(projectCode, data);
      } catch (error) {
        lastError = error;

        const is429 = isAxiosError(error) && error.response?.status === 429;
        const isNetwork = this.isRetryableNetworkError(error);

        if (!is429 && !isNetwork) {
          throw error;
        }

        if (attempt < maxRetries) {
          const retryAfter = is429 ? this.getRetryAfter(error) : null;
          const baseWaitTime = retryAfter ?? delay;
          const jitterPercent = 0.1 + Math.random() * 0.2;
          const jitter = baseWaitTime * jitterPercent;
          const waitTime = Math.floor(baseWaitTime + jitter);

          const reason = is429
            ? 'Rate limit exceeded (429)'
            : `Network error (${(error as AxiosError).code ?? 'unknown'})`;
          this.logger.logDebug(
            `${reason} for attachment(s) "${attachmentNames}". ` +
            `Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`,
          );

          await this.delay(waitTime);
          delay = Math.min(delay * 2, 30000);
        } else {
          this.logger.logError(
            `Failed to upload attachment(s) "${attachmentNames}" after ${maxRetries} retries due to ` +
            `${is429 ? 'rate limiting' : 'network errors'}`,
          );
        }
      }
    }

    throw lastError;
  }

  private getRetryAfter(error: AxiosError): number | null {
    const headers = error.response?.headers;
    if (!headers) return null;

    const retryAfterHeader: unknown = headers['retry-after'];
    if (retryAfterHeader && typeof retryAfterHeader === 'string') {
      const retryAfterSeconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(retryAfterSeconds)) {
        return retryAfterSeconds * 1000;
      }
    }
    return null;
  }

  private isRetryableNetworkError(error: unknown): boolean {
    if (!isAxiosError(error)) {
      return false;
    }
    // A network-level failure has no HTTP response attached.
    if (error.response) {
      return false;
    }
    return typeof error.code === 'string' && RETRYABLE_NETWORK_CODES.includes(error.code);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private ensureAttachmentSize(attachment: Attachment): void {
    if (attachment.size > 0) return;

    try {
      if (attachment.file_path) {
        const stats = statSync(attachment.file_path);
        attachment.size = stats.size;
      } else if (attachment.content) {
        if (typeof attachment.content === 'string') {
          if (attachment.content.match(/^[A-Za-z0-9+/=]+$/)) {
            attachment.size = Buffer.from(attachment.content, 'base64').length;
          } else {
            attachment.size = Buffer.byteLength(attachment.content, 'utf8');
          }
        } else if (Buffer.isBuffer(attachment.content)) {
          attachment.size = attachment.content.length;
        } else {
          attachment.size = Buffer.byteLength(String(attachment.content), 'utf8');
        }
      }
    } catch (error) {
      this.logger.logDebug(
        `Could not determine size for attachment "${attachment.file_path ?? attachment.file_name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      attachment.size = 0;
    }
  }

  private prepareAttachmentData(attachment: Attachment): AttachmentData {
    if (attachment.file_path) {
      return {
        name: attachment.file_name,
        value: createReadStream(attachment.file_path),
      };
    }

    return {
      name: attachment.file_name,
      value: typeof attachment.content === 'string'
        ? Buffer.from(attachment.content, attachment.content.match(/^[A-Za-z0-9+/=]+$/) ? 'base64' : undefined)
        : attachment.content,
    };
  }
}
