import {
  AttachmentsApi,
  ConfigurationsApi,
  EnvironmentsApi,
  RunsApi,
} from 'qase-api-client';
import { Attachment, TestResultType } from '../models';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';
import { LoggerInterface } from '../utils/logger';
import { IClient } from './interface';
import { createApiConfigV1, resolveAppUrl } from './transport/api-config-builder';
import { AttachmentService } from './services/attachment-service';
import { ConfigurationService } from './services/configuration-service';
import { RunService } from './services/run-service';

export class ClientV1 implements IClient {
  protected readonly attachmentService: AttachmentService;
  protected readonly runService: RunService;

  constructor(
    protected readonly logger: LoggerInterface,
    protected readonly config: TestOpsOptionsType,
    protected readonly environment: string | undefined,
  ) {
    const apiConfig = createApiConfigV1(config);
    const appUrl = resolveAppUrl(config);

    const configurationService = new ConfigurationService(
      logger,
      new ConfigurationsApi(apiConfig),
    );

    this.runService = new RunService(
      logger,
      new RunsApi(apiConfig),
      new EnvironmentsApi(apiConfig),
      configurationService,
      appUrl,
    );

    this.attachmentService = new AttachmentService(
      logger,
      new AttachmentsApi(apiConfig),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadResults(_runId: number, _results: TestResultType[]): Promise<void> {
    throw new Error('Use ClientV2 to upload results');
  }

  async createRun(): Promise<number> {
    return this.runService.createRun(this.config, this.environment);
  }

  async completeRun(runId: number): Promise<void> {
    return this.runService.completeRun(runId, this.config);
  }

  async enablePublicReport(runId: number): Promise<void> {
    return this.runService.enablePublicReport(this.config.project, runId);
  }

  async uploadAttachment(attachment: Attachment): Promise<string> {
    return this.attachmentService.uploadAttachment(this.config.project, attachment);
  }
}
