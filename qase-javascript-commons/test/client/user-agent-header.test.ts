import { expect } from '@jest/globals';
import { HostData } from '../../src/models/host-data';

// Mock qase-api-v2-client
const mockV2Configuration = jest.fn().mockImplementation(() => ({
  basePath: '',
  baseOptions: undefined,
}));
jest.mock('qase-api-v2-client', () => ({
  Configuration: mockV2Configuration,
  ResultsApi: jest.fn().mockImplementation(() => ({})),
  ResultStepStatus: { PASSED: 'passed', FAILED: 'failed', BLOCKED: 'blocked', SKIPPED: 'skipped' },
}));

// Mock qase-api-client
const mockV1Configuration = jest.fn().mockImplementation(() => ({
  basePath: '',
  baseOptions: undefined,
}));
jest.mock('qase-api-client', () => ({
  Configuration: mockV1Configuration,
  RunsApi: jest.fn().mockImplementation(() => ({})),
  EnvironmentsApi: jest.fn().mockImplementation(() => ({})),
  AttachmentsApi: jest.fn().mockImplementation(() => ({})),
  ConfigurationsApi: jest.fn().mockImplementation(() => ({})),
  RunExternalIssuesTypeEnum: { JIRA_CLOUD: 'jiraCloud', JIRA_SERVER: 'jiraServer' },
}));

// Mock form-data
jest.mock('form-data', () => jest.fn());

import { ClientV2 } from '../../src/client/clientV2';
import { LoggerInterface } from '../../src/utils/logger';
import { TestOpsOptionsType } from '../../src/models/config/TestOpsOptionsType';

function createMockLogger(): LoggerInterface {
  return {
    log: jest.fn(),
    logError: jest.fn(),
    logDebug: jest.fn(),
  };
}

function createMockConfig(): TestOpsOptionsType {
  return {
    api: {
      token: 'test-token',
      host: 'qase.io',
    },
    project: 'TEST',
    run: {
      complete: false,
    },
    uploadAttachments: true,
    defect: false,
  } as TestOpsOptionsType;
}

function createHostData(overrides: Partial<HostData> = {}): HostData {
  return {
    system: 'darwin',
    machineName: 'test-machine',
    release: '21.0.0',
    version: '12.0',
    arch: 'x64',
    language: 'v18.0.0',
    packageManager: '9.0.0',
    framework: '1.0.0',
    reporter: '2.0.0',
    commons: '2.5.10',
    apiClientV1: '1.1.3',
    apiClientV2: '1.0.4',
    ...overrides,
  };
}

describe('User-Agent header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set User-Agent header with qase-api-client-js/<version> format on v2 config', () => {
    const hostData = createHostData({ apiClientV2: '1.0.4' });

    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      hostData,
      'jest',
      'jest',
    );

    // The v2 Configuration instance gets baseOptions set with headers
    const v2Instance = mockV2Configuration.mock.results[0]?.value;
    expect(v2Instance).toBeDefined();

    const userAgent = v2Instance.baseOptions?.headers?.['User-Agent'];
    expect(userAgent).toBe('qase-api-client-js/1.0.4');
  });

  it('should set User-Agent header on v1 config', () => {
    const hostData = createHostData({ apiClientV2: '1.0.4' });

    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      hostData,
      'jest',
      'jest',
    );

    // The v1 Configuration instance also gets baseOptions set with User-Agent
    const v1Instance = mockV1Configuration.mock.results[0]?.value;
    expect(v1Instance).toBeDefined();

    const userAgent = v1Instance.baseOptions?.headers?.['User-Agent'];
    expect(userAgent).toBe('qase-api-client-js/1.0.4');
  });

  it('should contain qase-api-client substring in User-Agent', () => {
    const hostData = createHostData({ apiClientV2: '2.0.0' });

    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      hostData,
      'jest',
      'jest',
    );

    const v2Instance = mockV2Configuration.mock.results[0]?.value;
    const userAgent: string = v2Instance.baseOptions?.headers?.['User-Agent'];

    expect(userAgent).toMatch(/qase-api-client/i);
  });

  it('should match expected format qase-api-client-<language>/<version>', () => {
    const hostData = createHostData({ apiClientV2: '3.1.0' });

    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      hostData,
      'jest',
      'jest',
    );

    const v2Instance = mockV2Configuration.mock.results[0]?.value;
    const userAgent: string = v2Instance.baseOptions?.headers?.['User-Agent'];

    expect(userAgent).toMatch(/^qase-api-client-js\/\d+\.\d+\.\d+$/);
    expect(userAgent).toBe('qase-api-client-js/3.1.0');
  });

  it('should not set User-Agent when hostData is not provided', () => {
    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      undefined,
    );

    const v2Instance = mockV2Configuration.mock.results[0]?.value;
    const userAgent = v2Instance.baseOptions?.headers?.['User-Agent'];
    expect(userAgent).toBeUndefined();
  });

  it('should not set User-Agent when apiClientV2 version is empty', () => {
    const hostData = createHostData({ apiClientV2: '' });

    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      hostData,
      'jest',
      'jest',
    );

    const v2Instance = mockV2Configuration.mock.results[0]?.value;
    const userAgent = v2Instance.baseOptions?.headers?.['User-Agent'];
    expect(userAgent).toBeUndefined();
  });

  it('should preserve other headers alongside User-Agent', () => {
    const hostData = createHostData();

    new ClientV2(
      createMockLogger(),
      createMockConfig(),
      undefined,
      undefined,
      hostData,
      'jest',
      'jest',
    );

    const v2Instance = mockV2Configuration.mock.results[0]?.value;
    const headers = v2Instance.baseOptions?.headers;

    expect(headers?.['User-Agent']).toBeDefined();
    expect(headers?.['X-Client']).toBeDefined();
    expect(headers?.['X-Platform']).toBeDefined();
  });
});
