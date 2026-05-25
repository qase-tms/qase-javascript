/* eslint-disable */
import { describe, it, expect } from '@jest/globals';
import { ResultBuilder } from '../src/modules/resultBuilder';
import type { MetadataShape } from '../src/modules/metadataAccumulator';

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
      if (error) return 'failed';
      if (originalStatus === 'passed') return 'passed';
      if (originalStatus === 'skipped') return 'skipped';
      return 'failed';
    }),
  };
});

const mkTestCase = (overrides: any = {}) => ({
  name: 'Test',
  id: 'test-id',
  fullName: 'Suite > Test',
  result: jest.fn().mockReturnValue({ state: 'passed', errors: [] }),
  diagnostic: jest.fn().mockReturnValue({ duration: 100, startTime: 1_700_000_000_000 }),
  ...overrides,
}) as any;

const emptyMeta = (): MetadataShape => ({
  steps: [],
  attachments: [],
});

describe('ResultBuilder.build', () => {
  it('builds a passed result with default execution shape', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('passed');
    // Vitest exposes the absolute startTime; reporter emits it as Unix seconds.
    expect(result.execution.start_time).toBe(1_700_000_000);
    expect(result.execution.end_time).toBe(1_700_000_000.1);
    expect(result.execution.duration).toBe(100);
    expect(result.id).toBe('test-id');
    expect(result.signature).toBe('Suite > Test');
    expect(result.steps).toEqual([]);
  });

  it('extracts single legacy id from name (Qase ID: 123)', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Test (Qase ID: 123)', fullName: 'Suite > Test (Qase ID: 123)' }),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.testops_id).toBe(123);
    expect(result.title).toBe('Test');
  });

  it('extracts multiple legacy ids', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Test (Qase ID: 1,2,3)' }),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.testops_id).toEqual([1, 2, 3]);
  });

  it('uses projectMapping when (Qase PROJ: N) markers are present', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Test (Qase PROJ1: 100) (Qase PROJ2: 200)' }),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.testops_id).toBeNull();
    expect(result.testops_project_mapping).toEqual({ PROJ1: [100], PROJ2: [200] });
    expect(result.title).toBe('Test');
  });

  it('uses metadata.title when provided', () => {
    const meta = emptyMeta();
    meta.title = 'Override Title';
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.title).toBe('Override Title');
  });

  it('maps failed result with errors to status=failed and stacktrace', () => {
    const error = new Error('boom');
    error.stack = 'STACK';
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'failed', errors: [error] }),
      }),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('failed');
    expect(result.execution.stacktrace).toContain('STACK');
    expect(result.message).toBe('boom');
  });

  it('maps skipped result with note to status=skipped and message=note', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'skipped', note: 'cond fail', errors: [] }),
      }),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('skipped');
    expect(result.message).toBe('cond fail');
  });

  it('uses metadata.suite for relations when present', () => {
    const meta = emptyMeta();
    meta.suite = 'My Suite - Sub';
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: 'CurrentSuite',
      profilerSteps: [],
    });
    expect(result.relations).toEqual({
      suite: { data: [
        { title: 'My Suite', public_id: null },
        { title: 'Sub', public_id: null },
      ] },
    });
  });

  it('falls back to currentSuite when metadata.suite missing', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: undefined,
      currentSuite: 'OuterSuite',
      profilerSteps: [],
    });
    expect(result.relations?.suite?.data?.[0]?.title).toBe('OuterSuite');
  });

  it('falls back to extractSuiteFromTestCase when no metadata.suite and no currentSuite', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ fullName: 'Outer > Inner > Test', name: 'Test' }),
      metadata: undefined,
      currentSuite: undefined,
      profilerSteps: [],
    });
    const titles = result.relations?.suite?.data?.map((d: any) => d.title);
    expect(titles).toEqual(['Outer > Inner']);
  });

  it('applies metadata.fields/parameters/groupParameters/tags', () => {
    const meta = emptyMeta();
    meta.fields = { severity: 'major' };
    meta.parameters = { env: 'prod' };
    meta.groupParameters = { region: 'eu' };
    meta.tags = ['smoke'];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.fields).toEqual({ severity: 'major' });
    expect(result.params).toEqual({ env: 'prod' });
    expect(result.group_params).toEqual({ region: 'eu' });
    expect(result.tags).toEqual(['smoke']);
  });

  it('applies metadata.comment as message', () => {
    const meta = emptyMeta();
    meta.comment = 'Override comment';
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.message).toBe('Override comment');
  });

  it('builds steps from metadata.steps with extractAndCleanStep applied', () => {
    const meta = emptyMeta();
    meta.steps = [
      { name: 'do thing QaseExpRes: ok', status: 'end' },
      { name: 'failed step', status: 'failed' },
    ];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.steps.length).toBe(2);
    expect(result.steps[0]?.execution?.status).toBe('passed');
    expect(result.steps[1]?.execution?.status).toBe('failed');
  });

  it('builds attachments from metadata.attachments', () => {
    const meta = emptyMeta();
    meta.attachments = [
      { name: 'a.txt', content: 'hello', contentType: 'text/plain' },
      { name: 'b.bin', path: '/tmp/b.bin' },
    ];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.attachments.length).toBe(2);
    expect(result.attachments[0]?.file_name).toBe('a.txt');
    expect(result.attachments[0]?.mime_type).toBe('text/plain');
    expect(result.attachments[1]?.file_path).toBe('/tmp/b.bin');
    expect(result.attachments[1]?.mime_type).toBe('application/octet-stream');
  });

  it('appends metadata._profilerSteps when present', () => {
    const meta = emptyMeta();
    (meta as any)._profilerSteps = [{ id: 'meta-prof-1' }];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [],
    });
    expect(result.steps).toEqual([{ id: 'meta-prof-1' }]);
  });

  it('appends profilerSteps argument after metadata steps', () => {
    const meta = emptyMeta();
    meta.steps = [{ name: 'manual', status: 'end' }];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      currentSuite: undefined,
      profilerSteps: [{ id: 'prof-1' } as any],
    });
    expect(result.steps.length).toBe(2);
    expect(result.steps[1]).toEqual({ id: 'prof-1' });
  });
});

describe('ResultBuilder.extractSuiteFromTestCase', () => {
  it('extracts suite from "Suite > Test" format', () => {
    const tc = mkTestCase({ fullName: 'Outer > Test' });
    expect(ResultBuilder.extractSuiteFromTestCase(tc)).toBe('Outer');
  });

  it('extracts multi-level suite from "A > B > Test" format', () => {
    const tc = mkTestCase({ fullName: 'A > B > Test' });
    expect(ResultBuilder.extractSuiteFromTestCase(tc)).toBe('A > B');
  });

  it('returns undefined when no suite separator', () => {
    const tc = mkTestCase({ fullName: 'JustATest', name: 'JustATest' });
    expect(ResultBuilder.extractSuiteFromTestCase(tc)).toBeUndefined();
  });

  it('falls back to testCase.name when fullName missing', () => {
    const tc = { name: 'OnlyName' } as any;
    expect(ResultBuilder.extractSuiteFromTestCase(tc)).toBeUndefined();
  });
});
