/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method */
import { expect } from '@jest/globals';
import { ConfigurationService } from '../../../src/client/services/configuration-service';
import { LoggerInterface } from '../../../src/utils/logger';

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

function mockConfigurationsApi() {
  return {
    getConfigurations: jest.fn(),
    createConfigurationGroup: jest.fn(),
    createConfiguration: jest.fn(),
  };
}

describe('ConfigurationService', () => {
  let logger: jest.Mocked<LoggerInterface>;
  let api: ReturnType<typeof mockConfigurationsApi>;
  let service: ConfigurationService;

  beforeEach(() => {
    logger = silentLogger();
    api = mockConfigurationsApi();
    service = new ConfigurationService(logger, api as any);
  });

  it('should return empty array when no configuration values provided', async () => {
    const result = await service.handleConfigurations('PROJ', { values: [], createIfNotExists: false });
    expect(result).toEqual([]);
  });

  it('should return existing configuration IDs when groups and configs exist', async () => {
    api.getConfigurations.mockResolvedValue({
      data: {
        result: {
          entities: [{
            id: 1, title: 'Browser',
            configurations: [{ id: 10, title: 'Chrome' }],
          }],
        },
      },
    });

    const result = await service.handleConfigurations('PROJ', {
      values: [{ name: 'Browser', value: 'Chrome' }],
      createIfNotExists: false,
    });

    expect(result).toEqual([10]);
    expect(api.createConfigurationGroup).not.toHaveBeenCalled();
    expect(api.createConfiguration).not.toHaveBeenCalled();
  });

  it('should create group and config when createIfNotExists is true', async () => {
    api.getConfigurations.mockResolvedValue({
      data: { result: { entities: [] } },
    });
    api.createConfigurationGroup.mockResolvedValue({
      data: { result: { id: 5 } },
    });
    api.createConfiguration.mockResolvedValue({
      data: { result: { id: 50 } },
    });

    const result = await service.handleConfigurations('PROJ', {
      values: [{ name: 'OS', value: 'Linux' }],
      createIfNotExists: true,
    });

    expect(result).toEqual([50]);
    expect(api.createConfigurationGroup).toHaveBeenCalledWith('PROJ', { title: 'OS' });
    expect(api.createConfiguration).toHaveBeenCalledWith('PROJ', { title: 'Linux', group_id: 5 });
  });

  it('should skip when group not found and createIfNotExists is false', async () => {
    api.getConfigurations.mockResolvedValue({
      data: { result: { entities: [] } },
    });

    const result = await service.handleConfigurations('PROJ', {
      values: [{ name: 'OS', value: 'Linux' }],
      createIfNotExists: false,
    });

    expect(result).toEqual([]);
  });

  it('should handle error in getConfigurations gracefully', async () => {
    api.getConfigurations.mockRejectedValue(new Error('Network error'));

    const result = await service.handleConfigurations('PROJ', {
      values: [{ name: 'OS', value: 'Linux' }],
      createIfNotExists: true,
    });

    expect(result).toEqual([]);
    expect(logger.logError).toHaveBeenCalled();
  });
});
