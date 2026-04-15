/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/require-await */
import { expect } from '@jest/globals';
import { ReporterFactory } from '../../src/qase/reporter-factory';
import { ModeEnum, OptionsType } from '../../src/options';
import { ConfigType } from '../../src/config';
import { EnvApiEnum, EnvTestOpsEnum } from '../../src/env';
import { LoggerInterface } from '../../src/utils/logger';
import { HostData } from '../../src/models/host-data';
import { DisabledException } from '../../src/utils/disabled-exception';
import { TestOpsReporter, TestOpsMultiReporter, ReportReporter } from '../../src/reporters';

jest.mock('qase-api-v2-client', () => ({
  Configuration: jest.fn(),
  ResultsApi: jest.fn(),
  ResultStepStatus: {
    PASSED: 'passed',
    FAILED: 'failed',
    BLOCKED: 'blocked',
    SKIPPED: 'skipped',
  },
}));

jest.mock('qase-api-client', () => ({
  Configuration: jest.fn(),
  RunsApi: jest.fn(),
  EnvironmentsApi: jest.fn(),
  AttachmentsApi: jest.fn(),
  ConfigurationsApi: jest.fn(),
}));

const silentLogger = (): jest.Mocked<LoggerInterface> => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

const emptyHostData: HostData = {} as HostData;

const baseOptions = (): ConfigType & OptionsType =>
  ({
    frameworkName: 'playwright',
    frameworkPackage: 'playwright',
    reporterName: 'qase-playwright',
  }) as unknown as ConfigType & OptionsType;

describe('ReporterFactory', () => {
  let factory: ReporterFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    factory = new ReporterFactory(silentLogger(), emptyHostData);
  });

  describe('off mode', () => {
    it('throws DisabledException', () => {
      expect(() => factory.create(ModeEnum.off, baseOptions(), false)).toThrow(
        DisabledException,
      );
    });
  });

  describe('testops mode validation', () => {
    it('throws when token missing', () => {
      const opts = { ...baseOptions(), testops: { project: 'DEMO' } } as any;
      expect(() => factory.create(ModeEnum.testops, opts, false)).toThrow(
        new RegExp(`testops.api.token.*${EnvApiEnum.token}`),
      );
    });

    it('throws when project missing', () => {
      const opts = { ...baseOptions(), testops: { api: { token: 't' } } } as any;
      expect(() => factory.create(ModeEnum.testops, opts, false)).toThrow(
        new RegExp(`testops.project.*${EnvTestOpsEnum.project}`),
      );
    });

    it('creates TestOpsReporter when options are valid', () => {
      const opts = {
        ...baseOptions(),
        testops: { api: { token: 't' }, project: 'DEMO' },
      } as any;
      const r = factory.create(ModeEnum.testops, opts, false);
      expect(r).toBeInstanceOf(TestOpsReporter);
    });
  });

  describe('testops_multi mode validation', () => {
    it('throws when token missing', () => {
      const opts = {
        ...baseOptions(),
        testops_multi: { projects: [{ code: 'A' }] },
      } as any;
      expect(() => factory.create(ModeEnum.testops_multi, opts, false)).toThrow(
        /testops.api.token/,
      );
    });

    it('throws when projects list is empty', () => {
      const opts = {
        ...baseOptions(),
        testops: { api: { token: 't' } },
        testops_multi: { projects: [] },
      } as any;
      expect(() => factory.create(ModeEnum.testops_multi, opts, false)).toThrow(
        /testops_multi.projects/,
      );
    });

    it('throws when any project lacks a code', () => {
      const opts = {
        ...baseOptions(),
        testops: { api: { token: 't' } },
        testops_multi: { projects: [{ code: 'A' }, { code: '' }] },
      } as any;
      expect(() => factory.create(ModeEnum.testops_multi, opts, false)).toThrow(
        /Each project.*code/,
      );
    });

    it('creates TestOpsMultiReporter when options are valid', () => {
      const opts = {
        ...baseOptions(),
        testops: { api: { token: 't' } },
        testops_multi: { projects: [{ code: 'A' }] },
      } as any;
      const r = factory.create(ModeEnum.testops_multi, opts, false);
      expect(r).toBeInstanceOf(TestOpsMultiReporter);
    });

    it('threads withState through to TestOpsMultiReporter', () => {
      const opts = {
        ...baseOptions(),
        testops: { api: { token: 't' } },
        testops_multi: { projects: [{ code: 'A' }] },
      } as any;
      // Verify both true and false produce an instance (no exception).
      // The 4th constructor argument is withState per the class signature.
      expect(factory.create(ModeEnum.testops_multi, opts, true)).toBeInstanceOf(TestOpsMultiReporter);
      expect(factory.create(ModeEnum.testops_multi, opts, false)).toBeInstanceOf(TestOpsMultiReporter);
    });
  });

  describe('report mode', () => {
    it('creates ReportReporter', () => {
      const opts = { ...baseOptions() } as any;
      const r = factory.create(ModeEnum.report, opts, false);
      expect(r).toBeInstanceOf(ReportReporter);
    });
  });

  describe('unknown mode', () => {
    it('throws', () => {
      expect(() =>
        factory.create('garbage' as ModeEnum, baseOptions(), false),
      ).toThrow('Unknown mode type');
    });
  });
});
