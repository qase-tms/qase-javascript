/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-return */
import { expect } from '@jest/globals';
import { RunService } from '../../../src/client/services/run-service';
import { LoggerInterface } from '../../../src/utils/logger';
import { ConfigurationService } from '../../../src/client/services/configuration-service';

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

function mockRunsApi() {
  return {
    createRun: jest.fn(),
    completeRun: jest.fn(),
    updateRunPublicity: jest.fn(),
    runUpdateExternalIssue: jest.fn(),
  };
}

function mockEnvironmentsApi() {
  return {
    getEnvironments: jest.fn(),
  };
}

function mockConfigurationService(): jest.Mocked<ConfigurationService> {
  return {
    handleConfigurations: jest.fn().mockResolvedValue([]),
  } as any;
}

function baseConfig(overrides: Record<string, any> = {}): any {
  return {
    project: 'PROJ',
    api: { token: 'tok' },
    run: { title: 'Test Run', complete: true, tags: [] },
    plan: {},
    ...overrides,
  };
}

describe('RunService', () => {
  let logger: jest.Mocked<LoggerInterface>;
  let runsApi: ReturnType<typeof mockRunsApi>;
  let envsApi: ReturnType<typeof mockEnvironmentsApi>;
  let configService: jest.Mocked<ConfigurationService>;
  let service: RunService;

  beforeEach(() => {
    logger = silentLogger();
    runsApi = mockRunsApi();
    envsApi = mockEnvironmentsApi();
    configService = mockConfigurationService();
    service = new RunService(logger, runsApi as any, envsApi as any, configService, 'https://app.qase.io');
  });

  describe('createRun', () => {
    it('should return existing run ID when config.run.id is set', async () => {
      const config = baseConfig({ run: { id: 42, complete: true, tags: [] } });
      const result = await service.createRun(config);
      expect(result).toBe(42);
      expect(runsApi.createRun).not.toHaveBeenCalled();
    });

    it('should create a new run and return its ID', async () => {
      runsApi.createRun.mockResolvedValue({
        data: { result: { id: 100 } },
      });
      const config = baseConfig();
      const result = await service.createRun(config);
      expect(result).toBe(100);
    });

    it('should resolve environment ID when environment is provided', async () => {
      envsApi.getEnvironments.mockResolvedValue({
        data: { result: { entities: [{ id: 5, slug: 'staging' }] } },
      });
      runsApi.createRun.mockResolvedValue({
        data: { result: { id: 100 } },
      });

      const config = baseConfig();
      await service.createRun(config, 'staging');

      const runObject = runsApi.createRun.mock.calls[0]![1];
      expect(runObject.environment_id).toBe(5);
    });

    it('should handle configurations when provided', async () => {
      configService.handleConfigurations.mockResolvedValue([10, 20]);
      runsApi.createRun.mockResolvedValue({
        data: { result: { id: 100 } },
      });

      const config = baseConfig({
        configurations: { values: [{ name: 'Browser', value: 'Chrome' }], createIfNotExists: true },
      });
      await service.createRun(config);

      const runObject = runsApi.createRun.mock.calls[0]![1];
      expect(runObject.configurations).toEqual([10, 20]);
    });

    it('should update external issue link when configured', async () => {
      runsApi.createRun.mockResolvedValue({
        data: { result: { id: 100 } },
      });
      const config = baseConfig({
        run: { title: 'Test', complete: true, tags: [], externalLink: { type: 'jiraCloud', link: 'PROJ-123' } },
      });

      await service.createRun(config);
      expect(runsApi.runUpdateExternalIssue).toHaveBeenCalled();
    });

    it('should throw QaseError when API fails', async () => {
      runsApi.createRun.mockRejectedValue(new Error('API down'));
      const config = baseConfig();
      await expect(service.createRun(config)).rejects.toThrow('Error creating test run');
    });
  });

  describe('completeRun', () => {
    it('should complete the run', async () => {
      const config = baseConfig();
      await service.completeRun(100, config);
      expect(runsApi.completeRun).toHaveBeenCalledWith('PROJ', 100);
    });

    it('should skip completion when config.run.complete is false', async () => {
      const config = baseConfig({ run: { complete: false } });
      await service.completeRun(100, config);
      expect(runsApi.completeRun).not.toHaveBeenCalled();
    });

    it('should log run URL after completion', async () => {
      const config = baseConfig();
      await service.completeRun(100, config);
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('run/PROJ/dashboard/100'));
    });
  });

  describe('enablePublicReport', () => {
    it('should enable public report and log URL', async () => {
      runsApi.updateRunPublicity.mockResolvedValue({
        data: { result: { url: 'https://public.url' } },
      });
      await service.enablePublicReport('PROJ', 100);
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('https://public.url'));
    });

    it('should log warning on failure instead of throwing', async () => {
      runsApi.updateRunPublicity.mockRejectedValue(new Error('fail'));
      await service.enablePublicReport('PROJ', 100);
      expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('Failed to generate'));
    });
  });
});
