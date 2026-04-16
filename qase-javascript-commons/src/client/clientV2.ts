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
      const models = await Promise.all(
        results.map(result =>
          this.resultTransformer.transformWithDefect(
            result,
            (a) => this.attachmentService.uploadAttachments(
              this.config.project, [a], this.config.uploadAttachments ?? true,
            ).then(hashes => hashes[0] ?? ''),
            this.config.defect ?? false,
          ),
        ),
      );
      await this.resultsClient.createResultsV2(this.config.project, runId, {
        results: models,
      });
    } catch (error) {
      throw processError(error, 'Error on uploading results', results);
    }
  }
}
