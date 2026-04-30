/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { TestStatusEnum } from 'qase-javascript-commons';
import { ResultBuilder } from '../src/modules/resultBuilder';
import { metadataEnum, MetadataType, TestRunInfoType } from '../src/types';

function makeMetadata(overrides: Partial<MetadataType> = {}): MetadataType {
  return {
    QaseID: [],
    QaseTitle: undefined,
    QaseSuite: undefined,
    QaseFields: {},
    QaseParameters: {},
    QaseGroupParameters: {},
    QaseIgnore: false,
    QaseProjects: {},
    QaseTags: [],
    ...overrides,
  } as MetadataType;
}

function makeInfo(overrides: Partial<TestRunInfoType> = {}): TestRunInfoType {
  return {
    errs: [],
    warnings: [],
    durationMs: 1000,
    unstable: false,
    screenshotPath: '',
    screenshots: [],
    quarantine: {},
    skipped: false,
    fixture: { id: 'f', name: 'My fixture', path: '/repo/test/x.spec.ts', meta: {} },
    ...overrides,
  } as TestRunInfoType;
}

const formatError = (err: any, prefix: string) => `${prefix}${err?.errMsg ?? ''}`;

describe('ResultBuilder', () => {
  const baseArgs = {
    title: 'sample',
    testRunInfo: makeInfo(),
    metadata: makeMetadata(),
    formatError,
    steps: [],
    attachments: [],
    profilerSteps: [],
    testBeginTime: 1700000000000,
    browserName: null as string | null,
    browserOptions: undefined,
  };

  it('builds a passed result with default metadata', () => {
    const result = ResultBuilder.build({ ...baseArgs });
    expect(result.execution.status).toBe(TestStatusEnum.passed);
    expect(result.title).toBe('sample');
    expect(result.testops_id).toBeNull();
  });

  it('marks skipped when testRunInfo.skipped is true', () => {
    const result = ResultBuilder.build({ ...baseArgs, testRunInfo: makeInfo({ skipped: true }) });
    expect(result.execution.status).toBe(TestStatusEnum.skipped);
  });

  it('marks failed when errs[0] has assertion message', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      testRunInfo: makeInfo({
        errs: [{ userAgent: '', screenshotPath: '', testRunId: '', testRunPhase: '', type: '', errMsg: 'expected 1 to equal 2' }],
      }),
    });
    expect(result.execution.status).toBe(TestStatusEnum.failed);
  });

  it('uses metadata.QaseTitle override', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ QaseTitle: 'Override' }),
    });
    expect(result.title).toBe('Override');
  });

  it('overrides suite relations when QaseSuite is set (tab-separated)', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ QaseSuite: 'Outer\tInner' }),
    });
    const titles = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(titles).toEqual(['Outer', 'Inner']);
  });

  it('uses fixture.name when no QaseSuite', () => {
    const result = ResultBuilder.build({ ...baseArgs });
    const titles = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(titles).toEqual(['My fixture']);
  });

  it('injects browser parameter when browserOptions.addAsParameter is true', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      browserName: 'chrome',
      browserOptions: { addAsParameter: true, parameterName: 'browser' } as any,
    });
    expect(result.params).toEqual({ browser: 'chrome' });
  });

  it('does not inject browser parameter when addAsParameter is false', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      browserName: 'chrome',
      browserOptions: { addAsParameter: false } as any,
    });
    expect(result.params).toEqual({});
  });

  it('merges screenshot attachments first then user attachments', () => {
    const screenshot = { screenshotPath: 'shot.png', thumbnailPath: '', userAgent: '', quarantineAttempt: 0, takenOnFail: false };
    const userAttach = { file_name: 'log.txt', mime_type: 'text/plain', file_path: null, content: 'x', size: 0, id: 'u1' };
    const result = ResultBuilder.build({
      ...baseArgs,
      testRunInfo: makeInfo({ screenshots: [screenshot] }),
      attachments: [userAttach as any],
    });
    expect(result.attachments).toHaveLength(2);
    expect(result.attachments[0]?.file_path).toBe('shot.png');
    expect(result.attachments[1]?.file_name).toBe('log.txt');
  });

  it('respects project mapping precedence', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ QaseID: [42], QaseProjects: { PROJ: [10] } }),
    });
    expect((result as any).testops_project_mapping).toEqual({ PROJ: [10] });
  });
});
