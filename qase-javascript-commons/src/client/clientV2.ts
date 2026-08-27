import { ResultsApi } from 'qase-api-v2-client';
import { TestResultType } from '../models';
import { LoggerInterface } from '../utils/logger';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';
import { HostData } from '../models/host-data';
import { ClientV1 } from './clientV1';
import { createApiConfigV2 } from './transport/api-config-builder';
import { ResultTransformer } from './services/result-transformer';
import { getErrorMessage, processError } from './services/api-error-handler';
import { withRetry } from './transport/retry-policy';

export class ClientV2 extends ClientV1 {
  private readonly resultsClient: ResultsApi;
  private readonly resultTransformer: ResultTransformer;

  constructor(
    logger: LoggerInterface,
    config: TestOpsOptionsType,
    environment: string | undefined,
    rootSuite: string | undefined,
    hostData?: HostData,
    reporterName?: string,
    frameworkName?: string,
  ) {
    super(logger, config, environment);
    const apiConfig = createApiConfigV2(config, hostData, reporterName, frameworkName);
    this.resultsClient = new ResultsApi(apiConfig);
    this.resultTransformer = new ResultTransformer(logger, rootSuite);
  }

  override async uploadResults(runId: number, results: TestResultType[]): Promise<void> {
    try {
      const uploadEnabled = this.config.uploadAttachments ?? true;
      const project = this.config.project;

      // 1. Collect every attachment across the whole batch of results.
      const allAttachments = results.flatMap((result) =>
        this.resultTransformer.collectAttachments(result),
      );

      // 2. Upload them once, in real batches, sequentially (bounded concurrency).
      const hashByAttachment = await this.attachmentService.uploadAttachmentsMapped(
        project,
        allAttachments,
        uploadEnabled,
      );

      // 3. Transform each result, resolving already-uploaded hashes synchronously.
      const models = results.map((result) =>
        this.resultTransformer.transformWithDefect(
          result,
          (attachment) => hashByAttachment.get(attachment) ?? '',
          this.config.defect ?? false,
        ),
      );

      // Only the results call is retried: attachments were uploaded above and carry their own
      // retry, and every result now sends an idempotency key, so a repeat cannot duplicate.
      await withRetry(
        () => this.resultsClient.createResultsV2(project, runId, {
          results: models,
        }),
        {
          retries: this.config.api.retries,
          baseDelayMs: this.retryBackoffMs(),
          onRetry: ({ attempt, delayMs, error }) => {
            this.logger.log(
              `Failed to send ${models.length} result(s) to Qase: ${getErrorMessage(error)}. ` +
              `Retrying in ${delayMs}ms (attempt ${attempt})`,
            );
          },
        },
      );
    } catch (error) {
      throw processError(error, 'Error on uploading results', results);
    }
  }

  /**
   * @returns {number | undefined} first backoff step in milliseconds, or undefined for the default
   */
  private retryBackoffMs(): number | undefined {
    const seconds = this.config.api.retryBackoff;
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) {
      return undefined;
    }
    return seconds * 1000;
  }
}
