import { AxiosError } from 'axios';
import {
  AttachmentsApi,
  Configuration,
  EnvironmentsApi,
  RunCreate,
  RunsApi,
  Environment,
  ConfigurationsApi,
  ConfigurationGroupCreate,
  ConfigurationCreate,
  RunExternalIssuesTypeEnum,
} from 'qase-api-client';
import { Attachment, TestResultType, ConfigurationGroup } from '../models';
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
const APP_BASE_URL = 'https://';
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
  private readonly configurationClient: ConfigurationsApi;

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
    this.configurationClient = new ConfigurationsApi(apiConfig);
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
      // Handle configurations if provided
      let configurationIds: number[] = [];
      if (this.config.configurations) {
        configurationIds = await this.handleConfigurations();
      }

      const environmentId = await this.getEnvironmentId();
      const runObject = this.prepareRunObject(environmentId, configurationIds);

      this.logger.logDebug(`Creating test run: ${JSON.stringify(runObject)}`);

      const { data } = await this.runClient.createRun(
        this.config.project,
        runObject,
      );

      if (!data.result?.id) {
        throw new QaseError('Failed to create test run');
      }

      this.logger.logDebug(`Test run created: ${JSON.stringify(data)}`);

      if (this.config.run.externalLink && data.result.id) {
        // Map our enum values to API enum values
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        const apiType = this.config.run.externalLink.type === 'jiraCloud'
          ? RunExternalIssuesTypeEnum.JIRA_CLOUD
          : RunExternalIssuesTypeEnum.JIRA_SERVER;

        await this.runClient.runUpdateExternalIssue(this.config.project, {
          type: apiType,
          links: [
            {
              run_id: data.result.id,
              external_issue: this.config.run.externalLink.link,
            },
          ],
        });
      }

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

  async enablePublicReport(runId: number): Promise<void> {
    try {
      const { data } = await this.runClient.updateRunPublicity(
        this.config.project,
        runId,
        { status: true }
      );
      if (data.result?.url) {
        this.logger.log(chalk`{blue Public report link: ${data.result.url}}`);
      }
    } catch (error) {
      this.logger.log(chalk`{yellow Failed to generate public report link: ${this.getErrorMessage(error)}}`);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
      const err = error as AxiosError<ApiErrorResponse>;
      const errorData = err.response?.data;
      return errorData?.errorMessage ?? errorData?.error ?? errorData?.message ?? 'Unknown API error';
    }
    return error instanceof Error ? error.message : 'Unknown error';
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

    // Add initial random delay to spread out requests from different workers/shard
    // This helps prevent all workers from hitting the API at the same time
    if (attachments.length > 0) {
      const initialJitter = Math.random() * 500; // 0-500ms random delay
      await this.delay(initialJitter);
    }

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      if (!attachment) {
        continue;
      }

      try {
        this.logger.logDebug(`Uploading attachment: ${attachment.file_path ?? attachment.file_name}`);

        const data = this.prepareAttachmentData(attachment);
        const response = await this.uploadAttachmentWithRetry(
          this.config.project,
          [data],
          attachment.file_path ?? attachment.file_name,
        );

        const hash = response.data.result?.[0]?.hash;
        if (hash) {
          uploadedHashes.push(hash);
        }
      } catch (error) {
        this.logger.logError('Cannot upload attachment:', error);
      }

      // Add delay between requests to avoid rate limiting
      // Skip delay after the last attachment
      if (i < attachments.length - 1) {
        // Increased delay with random jitter to prevent synchronization
        const baseDelay = 1000; // 1000ms (1 second) base delay
        const jitter = Math.random() * 300; // 0-300ms random jitter
        await this.delay(baseDelay + jitter);
      }
    }

    return uploadedHashes;
  }

  /**
   * Upload attachment with retry logic for 429 errors
   * @param project Project code
   * @param data Attachment data
   * @param attachmentName Attachment name for logging
   * @param maxRetries Maximum number of retry attempts
   * @param initialDelay Initial delay in milliseconds
   * @returns Promise with upload response
   */
  private async uploadAttachmentWithRetry(
    project: string,
    data: AttachmentData[],
    attachmentName: string,
    maxRetries = 5,
    initialDelay = 1000,
  ): Promise<{ data: { result?: { hash?: string }[] } }> {
    let lastError: unknown;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.attachmentClient.uploadAttachment(project, data);
      } catch (error) {
        lastError = error;

        // Check if it's a 429 error (Too Many Requests)
        if (isAxiosError(error)) {
          if (error.response?.status === 429) {
            if (attempt < maxRetries) {
              const retryAfter = this.getRetryAfter(error);
              const baseWaitTime = retryAfter ?? delay;
              
              // Add jitter (random delay) to prevent all workers from retrying simultaneously
              // Jitter is 10-30% of the wait time to spread out retry attempts
              const jitterPercent = 0.1 + Math.random() * 0.2; // 10-30%
              const jitter = baseWaitTime * jitterPercent;
              const waitTime = Math.floor(baseWaitTime + jitter);
              
              this.logger.logDebug(
                `Rate limit exceeded (429) for attachment "${attachmentName}". ` +
                `Retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`
              );

              await this.delay(waitTime);
              
              // Exponential backoff: double the delay for next attempt
              delay = Math.min(delay * 2, 30000); // Cap at 30 seconds
            } else {
              this.logger.logError(
                `Failed to upload attachment "${attachmentName}" after ${maxRetries} retries due to rate limiting`
              );
            }
          } else {
            // For non-429 errors, throw immediately
            throw error;
          }
        } else {
          // For non-Axios errors, throw immediately
          throw error;
        }
      }
    }

    // If we exhausted all retries, throw the last error
    throw lastError;
  }

  /**
   * Extract Retry-After header value from response or return null
   * @param error Axios error
   * @returns Retry-After value in milliseconds or null
   */
  private getRetryAfter(error: AxiosError): number | null {
    const headers = error.response?.headers;
    if (!headers) {
      return null;
    }
    
    const retryAfterHeader: unknown = headers['retry-after'];
    if (retryAfterHeader && typeof retryAfterHeader === 'string') {
      const retryAfterSeconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(retryAfterSeconds)) {
        return retryAfterSeconds * 1000; // Convert to milliseconds
      }
    }
    return null;
  }

  /**
   * Delay execution for specified milliseconds
   * @param ms Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  private prepareRunObject(environmentId?: number, configurationIds?: number[]): RunCreate {
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

    if (configurationIds && configurationIds.length > 0) {
      runObject.configurations = configurationIds;
    }

    return runObject;
  }

  /**
   * Get all configuration groups with their configurations
   * @returns Promise<ConfigurationGroup[]> Array of configuration groups
   * @private
   */
  private async getConfigurations(): Promise<ConfigurationGroup[]> {
    try {
      const { data } = await this.configurationClient.getConfigurations(this.config.project);
      const entities = data.result?.entities ?? [];

      // Convert API response to domain model
      return entities.map(group => ({
        id: group.id ?? 0,
        title: group.title ?? '',
        configurations: group.configurations?.map(config => ({
          id: config.id ?? 0,
          title: config.title ?? ''
        })) ?? []
      }));
    } catch (error) {
      throw this.processError(error, 'Error getting configurations');
    }
  }

  /**
   * Create a configuration group
   * @param title Group title
   * @returns Promise<number | undefined> Created group ID
   * @private
   */
  private async createConfigurationGroup(title: string): Promise<number | undefined> {
    try {
      const group: ConfigurationGroupCreate = { title };
      const { data } = await this.configurationClient.createConfigurationGroup(this.config.project, group);
      return data.result?.id;
    } catch (error) {
      throw this.processError(error, 'Error creating configuration group');
    }
  }

  /**
   * Create a configuration in a group
   * @param title Configuration title
   * @param groupId Group ID
   * @returns Promise<number | undefined> Created configuration ID
   * @private
   */
  private async createConfiguration(title: string, groupId: number): Promise<number | undefined> {
    try {
      const config: ConfigurationCreate = { title, group_id: groupId };
      const { data } = await this.configurationClient.createConfiguration(this.config.project, config);
      return data.result?.id;
    } catch (error) {
      throw this.processError(error, 'Error creating configuration');
    }
  }

  /**
   * Handle configuration creation based on config settings
   * @returns Promise<number[]> Array of configuration IDs
   * @private
   */
    private async handleConfigurations(): Promise<number[]> {
    if (!this.config.configurations?.values.length) {
      return [];
    }

    const configurationIds: number[] = [];

    try {
      // Get existing configuration groups
      const existingGroups = await this.getConfigurations();

      for (const configValue of this.config.configurations.values) {
        const { name: groupName, value: configName } = configValue;

        // Find existing group or create new one
        const group = existingGroups.find(g => g.title === groupName);
        let groupId: number;

        if (group) {
          groupId = group.id;
          this.logger.logDebug(`Found existing configuration group: ${groupName}`);
        } else {
          if (this.config.configurations.createIfNotExists) {
            const newGroupId = await this.createConfigurationGroup(groupName);
            if (newGroupId) {
              groupId = newGroupId;
              this.logger.logDebug(`Created new configuration group: ${groupName} with ID: ${groupId}`);
            } else {
              this.logger.logDebug(`Failed to create configuration group: ${groupName}, skipping`);
              continue;
            }
          } else {
            this.logger.logDebug(`Configuration group not found: ${groupName}, skipping`);
            continue;
          }
        }

        if (groupId) {
          // Check if configuration already exists in the group
          const existingConfig = group?.configurations.find(c => c.title === configName);
          if (!existingConfig) {
            // Check if we should create configuration if it doesn't exist
            if (this.config.configurations.createIfNotExists) {
              const configId = await this.createConfiguration(configName, groupId);
              if (configId) {
                configurationIds.push(configId);
              }
              this.logger.logDebug(`Created configuration: ${configName} in group: ${groupName}`);
            } else {
              this.logger.logDebug(`Configuration not found: ${configName} in group: ${groupName}, skipping`);
            }
          } else {
            if (existingConfig.id) {
              configurationIds.push(existingConfig.id);
            }
            this.logger.logDebug(`Configuration already exists: ${configName} in group: ${groupName}`);
          }
        }
      }
    } catch (error) {
      this.logger.logError('Error handling configurations:', error);
      // Don't throw error to avoid blocking test run creation
    }

    return configurationIds;
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
