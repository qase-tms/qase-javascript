import {
  RunsApi,
  EnvironmentsApi,
  RunCreate,
  Environment,
  RunExternalIssuesTypeEnum,
} from 'qase-api-client';
import { TestOpsOptionsType } from '../../models/config/TestOpsOptionsType';
import { LoggerInterface } from '../../utils/logger';
import { QaseError } from '../../utils/qase-error';
import { getStartTime } from '../dateUtils';
import { processError, getErrorMessage } from './api-error-handler';
import { ConfigurationService } from './configuration-service';
import chalk from 'chalk';

export class RunService {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly runClient: RunsApi,
    private readonly environmentClient: EnvironmentsApi,
    private readonly configurationService: ConfigurationService,
    private readonly appUrl: string | undefined,
  ) {}

  async createRun(config: TestOpsOptionsType, environment?: string): Promise<number> {
    if (config.run.id) {
      return config.run.id;
    }

    try {
      let configurationIds: number[] = [];
      if (config.configurations) {
        configurationIds = await this.configurationService.handleConfigurations(
          config.project,
          config.configurations,
        );
      }

      const environmentId = await this.getEnvironmentId(config.project, environment);
      const runObject = this.prepareRunObject(config, environmentId, configurationIds);

      this.logger.logDebug(`Creating test run: ${JSON.stringify(runObject)}`);

      const { data } = await this.runClient.createRun(config.project, runObject);

      if (!data.result?.id) {
        throw new QaseError('Failed to create test run');
      }

      this.logger.logDebug(`Test run created: ${JSON.stringify(data)}`);

      if (config.run.externalLink && data.result.id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        const apiType = config.run.externalLink.type === 'jiraCloud'
          ? RunExternalIssuesTypeEnum.JIRA_CLOUD
          : RunExternalIssuesTypeEnum.JIRA_SERVER;

        await this.runClient.runUpdateExternalIssue(config.project, {
          type: apiType,
          links: [{
            run_id: data.result.id,
            external_issue: config.run.externalLink.link,
          }],
        });
      }

      return data.result.id;
    } catch (error) {
      throw processError(error, 'Error creating test run');
    }
  }

  async completeRun(runId: number, config: TestOpsOptionsType): Promise<void> {
    if (!config.run.complete) {
      return;
    }

    try {
      await this.runClient.completeRun(config.project, runId);
    } catch (error) {
      throw processError(error, 'Error on completing run');
    }

    if (this.appUrl) {
      const runUrl = `${this.appUrl}/run/${config.project}/dashboard/${runId}`;
      this.logger.log(chalk`{blue Test run link: ${runUrl}}`);
    }
  }

  async enablePublicReport(projectCode: string, runId: number): Promise<void> {
    try {
      const { data } = await this.runClient.updateRunPublicity(
        projectCode,
        runId,
        { status: true },
      );
      if (data.result?.url) {
        this.logger.log(chalk`{blue Public report link: ${data.result.url}}`);
      }
    } catch (error) {
      this.logger.log(chalk`{yellow Failed to generate public report link: ${getErrorMessage(error)}}`);
    }
  }

  private async getEnvironmentId(projectCode: string, environment?: string): Promise<number | undefined> {
    if (!environment) return undefined;

    const { data } = await this.environmentClient.getEnvironments(
      projectCode,
      undefined,
      environment,
      100,
    );

    return data.result?.entities?.find((env: Environment) => env.slug === environment)?.id;
  }

  private prepareRunObject(
    config: TestOpsOptionsType,
    environmentId?: number,
    configurationIds?: number[],
  ): RunCreate {
    const runObject: RunCreate = {
      title: config.run.title ?? `Automated run ${new Date().toISOString()}`,
      description: config.run.description ?? '',
      is_autotest: true,
      cases: [],
      start_time: getStartTime(),
      tags: config.run.tags ?? [],
    };

    if (environmentId !== undefined) {
      runObject.environment_id = environmentId;
    }

    if (config.plan.id) {
      runObject.plan_id = config.plan.id;
    }

    if (configurationIds && configurationIds.length > 0) {
      runObject.configurations = configurationIds;
    }

    return runObject;
  }
}
