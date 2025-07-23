import { AxiosError } from 'axios';
import { AttachmentsApi, Configuration, EnvironmentsApi, RunCreate, RunsApi, Environment } from 'qase-api-client';
import { Attachment, TestResultType } from '../models';
import { TestOpsOptionsType } from '../models/config/TestOpsOptionsType';
import { isAxiosError } from '../utils/is-axios-error';
import { QaseError } from '../utils/qase-error';
import { IClient } from './interface';
import { LoggerInterface } from '../utils/logger';
import chalk from 'chalk';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { getStartTime } from './dateUtils';
import FormData from 'form-data';

const DEFAULT_API_HOST = 'qase.io';
const API_BASE_URL = 'https://api-';
const APP_BASE_URL = 'https://app-';
const API_VERSION = '/v1';

enum ApiErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  UNPROCESSABLE_ENTITY = 422
}

interface ApiErrorResponse {
  errorMessage?: string;
  error?: string;
  message?: string;
}

interface AttachmentData {
  name: string;
  value: Buffer | Readable;
}

export class ClientV1 implements IClient {
  private readonly appUrl: string | undefined;

  private readonly runClient: RunsApi;
  private readonly environmentClient: EnvironmentsApi;
  private readonly attachmentClient: AttachmentsApi;

  constructor(
    protected readonly logger: LoggerInterface,
    protected readonly config: TestOpsOptionsType,
    private readonly environment: string | undefined,
  ) {
    const { apiConfig, appUrl } = this.createApiConfig();
    this.appUrl = appUrl;

    this.runClient = new RunsApi(apiConfig);
    this.environmentClient = new EnvironmentsApi(apiConfig);
    this.attachmentClient = new AttachmentsApi(apiConfig);
  }

  private createApiConfig(): { apiConfig: Configuration; appUrl: string } {
    const apiConfig = new Configuration({ apiKey: this.config.api.token, formDataCtor: FormData });

    if (this.config.api.host && this.config.api.host != DEFAULT_API_HOST) {
      apiConfig.basePath = `${API_BASE_URL}${this.config.api.host}${API_VERSION}`;
      return { apiConfig, appUrl: `${APP_BASE_URL}${this.config.api.host}` };
    }

    apiConfig.basePath = `https://api.${DEFAULT_API_HOST}${API_VERSION}`;
    return { apiConfig, appUrl: `https://app.${DEFAULT_API_HOST}` };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadResults(_runId: number, _results: TestResultType[]): Promise<void> {
    throw new Error('Use ClientV2 to upload results');
  }

  async createRun(): Promise<number> {
    if (this.config.run.id) {
      return this.config.run.id;
    }

    try {
      const environmentId = await this.getEnvironmentId();
      const runObject = this.prepareRunObject(environmentId);

      this.logger.logDebug(`Creating test run: ${JSON.stringify(runObject)}`);

      const { data } = await this.runClient.createRun(
        this.config.project,
        runObject,
      );

      if (!data.result?.id) {
        throw new QaseError('Failed to create test run');
      }

      this.logger.logDebug(`Test run created: ${JSON.stringify(data)}`);

      return data.result.id;
    } catch (error) {
      throw this.processError(error, 'Error creating test run');
    }
  }

  async completeRun(runId: number): Promise<void> {
    if (!this.config.run.complete) {
      return;
    }

    try {
      await this.runClient.completeRun(this.config.project, runId);
    } catch (error) {
      throw this.processError(error, 'Error on completing run');
    }

    if (this.appUrl) {
      const runUrl = `${this.appUrl}/run/${this.config.project}/dashboard/${runId}`;
      this.logger.log(chalk`{blue Test run link: ${runUrl}}`);
    }
  }

  async uploadAttachment(attachment: Attachment): Promise<string> {
    try {
      const data = this.prepareAttachmentData(attachment);
      const response = await this.attachmentClient.uploadAttachment(
        this.config.project,
        [data],
      );

      return response.data.result?.[0]?.hash ?? '';
    } catch (error) {
      throw this.processError(error, 'Error on uploading attachment');
    }
  }

  protected async uploadAttachments(attachments: Attachment[]): Promise<string[]> {
    if (!this.config.uploadAttachments) {
      return [];
    }
    const uploadedHashes: string[] = [];

    for (const attachment of attachments) {
      try {
        this.logger.logDebug(`Uploading attachment: ${attachment.file_path ?? attachment.file_name}`);

        const data = this.prepareAttachmentData(attachment);
        const response = await this.attachmentClient.uploadAttachment(
          this.config.project,
          [data],
        );

        const hash = response.data.result?.[0]?.hash;
        if (hash) {
          uploadedHashes.push(hash);
        }
      } catch (error) {
        this.logger.logError('Cannot upload attachment:', error);
      }
    }

    return uploadedHashes;
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

  private async getEnvironmentId(): Promise<number | undefined> {
    if (!this.environment) return undefined;

    const { data } = await this.environmentClient.getEnvironments(
      this.config.project,
      undefined,
      this.environment,
      100,
    );

    return data.result?.entities?.find((env: Environment) => env.slug === this.environment)?.id;
  }

  private prepareRunObject(environmentId?: number): RunCreate {
    const runObject: RunCreate = {
      title: this.config.run.title ?? `Automated run ${new Date().toISOString()}`,
      description: this.config.run.description ?? '',
      is_autotest: true,
      cases: [],
      start_time: getStartTime(),
      tags: this.config.run.tags ?? [],
    };

    if (environmentId !== undefined) {
      runObject.environment_id = environmentId;
    }

    if (this.config.plan.id) {
      runObject.plan_id = this.config.plan.id;
    }

    return runObject;
  }

  /**
   * Process error and throw QaseError
   * @param {Error | AxiosError} error
   * @param {string} message
   * @param {object} model
   * @private
   */
  protected processError(error: unknown, message: string, model?: object): QaseError {
    if (!isAxiosError(error)) {
      return new QaseError(message, { cause: error });
    }

    const err = error as AxiosError<ApiErrorResponse>;
    const errorData = err.response?.data;
    const status = err.response?.status;

    switch (status) {
      case ApiErrorCode.UNAUTHORIZED:
        return new QaseError(`${message}: Unauthorized. Please check your API token.`);
      case ApiErrorCode.FORBIDDEN:
        return new QaseError(`${message}: ${errorData?.errorMessage ?? 'Forbidden'}`);
      case ApiErrorCode.NOT_FOUND:
        return new QaseError(`${message}: Not found.`);
      case ApiErrorCode.BAD_REQUEST:
      case ApiErrorCode.UNPROCESSABLE_ENTITY:
        return new QaseError(
          `${message}: Bad request\n${JSON.stringify(errorData)}\nBody: ${JSON.stringify(model)}`,
        );
      default:
        return new QaseError(message, { cause: err });
    }
  }
}
