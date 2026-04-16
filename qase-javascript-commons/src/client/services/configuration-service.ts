import { ConfigurationsApi, ConfigurationGroupCreate, ConfigurationCreate } from 'qase-api-client';
import { ConfigurationGroup } from '../../models';
import { TestOpsConfigurationType } from '../../models/config/TestOpsOptionsType';
import { LoggerInterface } from '../../utils/logger';
import { processError } from './api-error-handler';

export class ConfigurationService {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly configurationClient: ConfigurationsApi,
  ) {}

  async handleConfigurations(
    projectCode: string,
    configurations: TestOpsConfigurationType,
  ): Promise<number[]> {
    if (!configurations.values.length) {
      return [];
    }

    const configurationIds: number[] = [];

    try {
      const existingGroups = await this.getConfigurations(projectCode);

      for (const configValue of configurations.values) {
        const { name: groupName, value: configName } = configValue;

        const group = existingGroups.find(g => g.title === groupName);
        let groupId: number;

        if (group) {
          groupId = group.id;
          this.logger.logDebug(`Found existing configuration group: ${groupName}`);
        } else {
          if (configurations.createIfNotExists) {
            const newGroupId = await this.createConfigurationGroup(projectCode, groupName);
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
          const existingConfig = group?.configurations.find(c => c.title === configName);
          if (!existingConfig) {
            if (configurations.createIfNotExists) {
              const configId = await this.createConfiguration(projectCode, configName, groupId);
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
    }

    return configurationIds;
  }

  private async getConfigurations(projectCode: string): Promise<ConfigurationGroup[]> {
    try {
      const { data } = await this.configurationClient.getConfigurations(projectCode);
      const entities = data.result?.entities ?? [];

      return entities.map(group => ({
        id: group.id ?? 0,
        title: group.title ?? '',
        configurations: group.configurations?.map(config => ({
          id: config.id ?? 0,
          title: config.title ?? '',
        })) ?? [],
      }));
    } catch (error) {
      throw processError(error, 'Error getting configurations');
    }
  }

  private async createConfigurationGroup(projectCode: string, title: string): Promise<number | undefined> {
    try {
      const group: ConfigurationGroupCreate = { title };
      const { data } = await this.configurationClient.createConfigurationGroup(projectCode, group);
      return data.result?.id;
    } catch (error) {
      throw processError(error, 'Error creating configuration group');
    }
  }

  private async createConfiguration(projectCode: string, title: string, groupId: number): Promise<number | undefined> {
    try {
      const config: ConfigurationCreate = { title, group_id: groupId };
      const { data } = await this.configurationClient.createConfiguration(projectCode, config);
      return data.result?.id;
    } catch (error) {
      throw processError(error, 'Error creating configuration');
    }
  }
}
