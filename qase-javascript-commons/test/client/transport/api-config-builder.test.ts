/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import { expect } from '@jest/globals';
import { createApiConfigV1, createApiConfigV2, buildHeaders, resolveAppUrl } from '../../../src/client/transport/api-config-builder';
import { HostData } from '../../../src/models/host-data';

jest.mock('qase-api-client', () => ({
  Configuration: jest.fn().mockImplementation((opts: any) => ({
    ...opts,
    basePath: '',
    baseOptions: undefined,
  })),
}));

jest.mock('qase-api-v2-client', () => ({
  Configuration: jest.fn().mockImplementation((opts: any) => ({
    ...opts,
    basePath: '',
    baseOptions: undefined,
  })),
}));

describe('api-config-builder', () => {
  describe('createApiConfigV1', () => {
    it('should create config with default host', () => {
      const config = { api: { token: 'tok123' } } as any;
      const result = createApiConfigV1(config);
      expect(result.basePath).toBe('https://api.qase.io/v1');
    });

    it('should create config with custom host', () => {
      const config = { api: { token: 'tok123', host: 'custom.qase.io' } } as any;
      const result = createApiConfigV1(config);
      expect(result.basePath).toBe('https://api-custom.qase.io/v1');
    });
  });

  describe('resolveAppUrl', () => {
    it('should resolve default app URL', () => {
      const config = { api: { token: 'tok123' } } as any;
      expect(resolveAppUrl(config)).toBe('https://app.qase.io');
    });

    it('should resolve custom app URL', () => {
      const config = { api: { token: 'tok', host: 'custom.qase.io' } } as any;
      expect(resolveAppUrl(config)).toBe('https://custom.qase.io');
    });
  });

  describe('createApiConfigV2', () => {
    it('should create V2 config with default host', () => {
      const config = { api: { token: 'tok123' } } as any;
      const result = createApiConfigV2(config);
      expect(result.basePath).toBe('https://api.qase.io/v2');
    });

    it('should create V2 config with custom host', () => {
      const config = { api: { token: 'tok123', host: 'custom.qase.io' } } as any;
      const result = createApiConfigV2(config);
      expect(result.basePath).toBe('https://api-custom.qase.io/v2');
    });

    it('should set X-Client and X-Platform headers when hostData provided', () => {
      const config = { api: { token: 'tok123' } } as any;
      const hostData: HostData = {
        reporter: '1.0.0',
        framework: '2.0.0',
        commons: '3.0.0',
        apiClientV1: '4.0.0',
        apiClientV2: '5.0.0',
        system: 'linux',
        arch: 'x64',
        language: '18.0.0',
        packageManager: '9.0.0',
        machineName: '',
        release: '',
        version: '',
      };
      const result = createApiConfigV2(config, hostData, 'qase-jest', 'jest');
      const headers = (result as any).baseOptions?.headers;
      expect(headers?.['X-Client']).toContain('reporter=qase-jest');
      expect(headers?.['X-Client']).toContain('framework=jest');
      expect(headers?.['X-Client']).toContain('core_version=3.0.0');
      expect(headers?.['X-Platform']).toContain('os=linux');
      expect(headers?.['X-Platform']).toContain('arch=x64');
    });
  });

  describe('buildHeaders', () => {
    it('should build X-Client header from hostData', () => {
      const hostData: HostData = {
        reporter: '1.0.0',
        framework: '2.0.0',
        commons: '3.0.0',
        machineName: '',
        release: '',
        version: '',
        arch: '',
        language: '',
        packageManager: '',
        system: '',
        apiClientV1: '',
        apiClientV2: '',
      };
      const headers = buildHeaders(hostData, 'qase-playwright', 'playwright');
      expect(headers['X-Client']).toBe(
        'reporter=qase-playwright;reporter_version=1.0.0;framework=playwright;framework_version=2.0.0;core_version=3.0.0'
      );
    });

    it('should build X-Platform header from hostData', () => {
      const hostData: HostData = {
        system: 'darwin',
        arch: 'arm64',
        language: '20.0.0',
        packageManager: '10.0.0',
        machineName: '',
        release: '',
        version: '',
        framework: '',
        reporter: '',
        commons: '',
        apiClientV1: '',
        apiClientV2: '',
      };
      const headers = buildHeaders(hostData);
      expect(headers['X-Platform']).toBe('os=darwin;arch=arm64;node=20.0.0;npm=10.0.0');
    });

    it('should skip empty/undefined fields', () => {
      const hostData: HostData = {
        reporter: '1.0.0',
        framework: '',
        commons: '',
        apiClientV1: '',
        apiClientV2: '',
        system: '',
        arch: '',
        language: '',
        packageManager: '',
        machineName: '',
        release: '',
        version: '',
      };
      const headers = buildHeaders(hostData);
      expect(headers['X-Client']).toBe('reporter_version=1.0.0');
      expect(headers['X-Platform']).toBeUndefined();
    });

    it('should return empty object when no data', () => {
      const hostData = {} as HostData;
      const headers = buildHeaders(hostData);
      expect(Object.keys(headers)).toHaveLength(0);
    });
  });
});
