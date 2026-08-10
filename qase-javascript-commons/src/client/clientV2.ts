import { ResultsApi } from 'qase-api-v2-client';
import { TestResultType } from '../models';
import { LoggerInterface } from '../utils/logger';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';
import { HostData } from '../models/host-data';
import { ClientV1 } from './clientV1';
import { createApiConfigV2 } from './transport/api-config-builder';
import { ResultTransformer } from './services/result-transformer';
import { processError } from './services/api-error-handler';

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

      await this.resultsClient.createResultsV2(project, runId, {
        results: models,
      });
    } catch (error) {
      throw processError(error, 'Error on uploading results', results);
    }
  }
}
