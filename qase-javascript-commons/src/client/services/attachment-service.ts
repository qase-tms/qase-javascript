import { AxiosError, AxiosRequestConfig } from 'axios';
import { AttachmentsApi } from 'qase-api-client';
import { createReadStream, statSync } from 'fs';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { Readable } from 'stream';
import { Attachment } from '../../models';
import { LoggerInterface } from '../../utils/logger';
import { isAxiosError } from '../../utils/is-axios-error';
import { processError } from './api-error-handler';

const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32 MB per file
const MAX_REQUEST_SIZE = 128 * 1024 * 1024; // 128 MB per request
const MAX_FILES_PER_REQUEST = 20; // 20 files per request
const RETRYABLE_NETWORK_CODES = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED', 'EPIPE'];
const DEFAULT_CONCURRENCY = 4;
const MIN_CONCURRENCY = 1;
const MAX_CONCURRENCY = 16;
const PACING_DELAY = 1000;
const PACING_JITTER = 300;
// How many batches must succeed in a row before pacing is lifted again.
const THROTTLE_RECOVERY_SUCCESSES = 5;
const DEFAULT_TIMEOUT_SECONDS = 120;
// Drop idle pooled sockets well before a load balancer can close them on us.
const SOCKET_IDLE_TIMEOUT = 30_000;

interface AttachmentData {
  name: string;
  value: Buffer | Readable;
}

export interface AttachmentUploadOptions {
  /** How many batches may be uploaded at the same time. Defaults to 4, clamped to 1..16. */
  concurrency?: number | undefined;
  /** Per-request timeout in seconds. Defaults to 120. */
  timeout?: number | undefined;
}

export class AttachmentService {
  private readonly concurrency: number;
  /** Pacing is off until the API actually pushes back with a 429. */
  private rateLimited = false;
  private consecutiveSuccesses = 0;
  private cooldownUntil = 0;
  private readonly timeout: number;
  private readonly httpAgent: HttpAgent;
  private readonly httpsAgent: HttpsAgent;

  constructor(
    private readonly logger: LoggerInterface,
    private readonly attachmentClient: AttachmentsApi,
    options: AttachmentUploadOptions = {},
  ) {
    const requested = options.concurrency;
    const resolved = typeof requested === 'number' && Number.isFinite(requested)
      ? Math.trunc(requested)
      : DEFAULT_CONCURRENCY;
    this.concurrency = Math.min(MAX_CONCURRENCY, Math.max(MIN_CONCURRENCY, resolved));

    const timeoutSeconds = typeof options.timeout === 'number' && options.timeout > 0
      ? options.timeout
      : DEFAULT_TIMEOUT_SECONDS;
    this.timeout = timeoutSeconds * 1000;

    const agentOptions = {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: this.concurrency,
      maxFreeSockets: this.concurrency,
      timeout: SOCKET_IDLE_TIMEOUT,
    };
    this.httpAgent = new HttpAgent(agentOptions);
    this.httpsAgent = new HttpsAgent(agentOptions);
  }

  /**
   * Axios options for one upload attempt. After a connection-level failure the pooled
   * socket is suspect, so that attempt gets a throwaway agent instead.
   */
  private requestOptions(freshConnection = false): AxiosRequestConfig {
    if (freshConnection) {
      return {
        timeout: this.timeout,
        httpAgent: new HttpAgent({ keepAlive: false }),
        httpsAgent: new HttpsAgent({ keepAlive: false }),
      };
    }

    return {
      timeout: this.timeout,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
    };
  }

  async uploadAttachment(projectCode: string, attachment: Attachment): Promise<string> {
    try {
      const data = this.prepareAttachmentData(attachment);
      const response = await this.attachmentClient.uploadAttachment(projectCode, [data], this.requestOptions());
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

    // Workers pull from a shared cursor, so a slow batch never blocks the others.
    let nextBatchIndex = 0;
    const workerCount = Math.min(this.concurrency, batches.length);

    const worker = async (): Promise<void> => {
      for (;;) {
        const index = nextBatchIndex++;
        if (index >= batches.length) {
          return;
        }

        const batch = batches[index];
        if (!batch || batch.length === 0) {
          continue;
        }

        await this.uploadBatch(projectCode, batch, index, batches.length, hashByAttachment);

        if (nextBatchIndex < batches.length) {
          await this.pace();
        }
      }
    };

    await Promise.all(Array.from({ length: workerCount }, () => worker()));

    return hashByAttachment;
  }

  /**
   * Sleeps between batches only while the API is rate limiting us. When no 429 has been
   * seen, batches follow each other immediately — pacing costs real time in CI and buys
   * nothing against connection resets.
   */
  private async pace(): Promise<void> {
    if (!this.rateLimited) {
      return;
    }
    await this.delay(PACING_DELAY + Math.random() * PACING_JITTER);
  }

  /** Blocks until the window requested by the last 429 (via Retry-After) has passed. */
  private async awaitCooldown(): Promise<void> {
    const remaining = this.cooldownUntil - Date.now();
    if (remaining > 0) {
      await this.delay(remaining);
    }
  }

  private noteRateLimited(waitTime: number): void {
    this.rateLimited = true;
    this.consecutiveSuccesses = 0;
    this.cooldownUntil = Math.max(this.cooldownUntil, Date.now() + waitTime);
  }

  private noteSuccess(): void {
    if (!this.rateLimited) {
      return;
    }
    this.consecutiveSuccesses++;
    if (this.consecutiveSuccesses >= THROTTLE_RECOVERY_SUCCESSES) {
      this.rateLimited = false;
      this.consecutiveSuccesses = 0;
      this.logger.logDebug('Attachment upload rate limiting has cleared, resuming full speed');
    }
  }

  private async uploadBatch(
    projectCode: string,
    batch: Attachment[],
    index: number,
    totalBatches: number,
    hashByAttachment: Map<Attachment, string>,
  ): Promise<void> {
    try {
      const batchNames = batch.map(a => a.file_path ?? a.file_name).join(', ');
      this.logger.logDebug(
        `Uploading batch ${index + 1}/${totalBatches} with ${batch.length} file(s): ${batchNames}`,
      );

      const response = await this.uploadWithRetry(
        projectCode,
        () => batch.map(a => this.prepareAttachmentData(a)),
        batchNames,
      );

      const results = response.data.result;
      if (!results) {
        return;
      }

      if (results.length !== batch.length) {
        this.logger.logError(
          `Attachment upload response size mismatch for batch ${index + 1}: ` +
          `expected ${batch.length} result(s), got ${results.length}. ` +
          `Skipping hash mapping for this batch to avoid mis-assigning attachments.`,
        );
        return;
      }

      for (let j = 0; j < batch.length; j++) {
        const hash = results[j]?.hash;
        const attachment = batch[j];
        if (hash && attachment) {
          hashByAttachment.set(attachment, hash);
        }
      }
    } catch (error) {
      this.logger.logError(`Cannot upload batch ${index + 1}:`, error);
    }
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
    // A factory, not a ready array: file-backed attachments are read streams, and a
    // stream can only be consumed once. Every attempt needs freshly opened streams.
    createData: () => AttachmentData[],
    attachmentNames: string,
    maxRetries = 5,
    initialDelay = 1000,
  ): Promise<{ data: { result?: { hash?: string }[] } }> {
    let lastError: unknown;
    let delay = initialDelay;
    let connectionSuspect = false;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.awaitCooldown();
        const response = await this.attachmentClient.uploadAttachment(
          projectCode,
          createData(),
          this.requestOptions(connectionSuspect),
        );
        this.noteSuccess();
        return response;
      } catch (error) {
        lastError = error;

        const is429 = isAxiosError(error) && error.response?.status === 429;
        const isNetwork = this.isRetryableNetworkError(error);
        connectionSuspect = isNetwork;

        if (!is429 && !isNetwork) {
          throw error;
        }

        if (attempt < maxRetries) {
          const retryAfter = is429 ? this.getRetryAfter(error) : null;
          const baseWaitTime = retryAfter ?? delay;
          const jitterPercent = 0.1 + Math.random() * 0.2;
          const jitter = baseWaitTime * jitterPercent;
          const waitTime = Math.floor(baseWaitTime + jitter);

          if (is429) {
            // Hold every worker back until the window the API asked for has passed.
            this.noteRateLimited(waitTime);
          }

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
