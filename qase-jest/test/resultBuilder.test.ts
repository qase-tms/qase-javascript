/* eslint-disable */
import { describe, it, expect } from '@jest/globals';
import { ResultBuilder } from '../src/modules/resultBuilder';
import { MetadataApplier } from '../src/modules/metadataApplier';

jest.mock('qase-javascript-commons', () => {
  const actual = jest.requireActual<typeof import('qase-javascript-commons')>('qase-javascript-commons');
  return {
    ...actual,
    generateSignature: jest.fn(() => 'mock-signature'),
    determineTestStatus: jest.fn((error: unknown, originalStatus: string) => {
      if (error) return 'failed';
      if (originalStatus === 'passed') return 'passed';
      if (originalStatus === 'pending') return 'skipped';
      if (originalStatus === 'todo') return 'disabled';
      return 'failed';
    }),
    parseProjectMappingFromTitle: jest.fn((title: string) => {
      const projMatch = title.match(/^\[(\w+):(\d+)\]\s+(.+)$/);
      if (projMatch) {
        return {
          projectMapping: { [projMatch[1]!]: [Number(projMatch[2])] },
          legacyIds: [],
          cleanedTitle: projMatch[3]!,
        };
      }
      const idMatch = title.match(/\(Qase ID: ([\d,]+)\)/);
      return {
        projectMapping: {},
        legacyIds: idMatch?.[1] ? idMatch[1].split(',').map(Number) : [],
        cleanedTitle: '',
      };
    }),
  };
});

const baseValue = {
  title: 'Test (Qase ID: 123)',
  fullName: 'Test Suite Test',
  status: 'passed',
  duration: 1000,
  ancestorTitles: ['Test Suite'],
  failureDetails: [],
  failureMessages: [],
} as any;

describe('ResultBuilder.build', () => {
  it('builds passed result with single legacy id', () => {
    const meta = MetadataApplier.empty();
    const result = ResultBuilder.build({
      value: baseValue,
      path: '/work/test/file.spec.ts',
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('passed');
    expect(result.execution.duration).toBe(1000);
    expect(result.testops_id).toBe(123);
    expect(result.title).toBe('Test');
    expect(result.signature).toBe('mock-signature');
    expect(result.steps).toEqual([]);
  });

  it('maps failureDetails to error message and stacktrace', () => {
    const value = {
      ...baseValue,
      status: 'failed',
      failureDetails: [{ matcherResult: { message: 'expected 1 to be 2' } }],
      failureMessages: ['Error: expected 1 to be 2\n    at <anonymous>'],
    } as any;
    const result = ResultBuilder.build({
      value,
      path: '/work/test/file.spec.ts',
      metadata: MetadataApplier.empty(),
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('failed');
    expect(result.message).toBe('expected 1 to be 2');
    expect(result.execution.stacktrace).toBe('Error: expected 1 to be 2\n    at <anonymous>');
  });

  it('falls back to "Runtime exception" when failureDetail has no matcherResult', () => {
    const value = {
      ...baseValue,
      status: 'failed',
      failureDetails: [{}],
      failureMessages: ['boom'],
    } as any;
    const result = ResultBuilder.build({
      value,
      path: '/work/test/file.spec.ts',
      metadata: MetadataApplier.empty(),
      profilerSteps: [],
    });
    expect(result.message).toBe('Runtime exception');
  });

  it('applies metadata.title and metadata.comment', () => {
    const meta = MetadataApplier.empty();
    meta.title = 'Override Title';
    meta.comment = 'Override Comment';
    const result = ResultBuilder.build({
      value: baseValue,
      path: '/x.ts',
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.title).toBe('Override Title');
    expect(result.message).toBe('Override Comment');
  });

  it('replaces relations when metadata.suite is set', () => {
    const meta = MetadataApplier.empty();
    meta.suite = 'CustomSuite';
    const result = ResultBuilder.build({
      value: baseValue,
      path: '/x.ts',
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.relations).toEqual({
      suite: { data: [{ title: 'CustomSuite', public_id: null }] },
    });
  });

  it('applies non-empty metadata maps', () => {
    const meta = MetadataApplier.empty();
    meta.fields = { severity: 'major' };
    meta.parameters = { env: 'prod' };
    meta.groupParams = { region: 'eu' };
    meta.tags = ['smoke'];
    meta.steps = [{ id: 's1' } as any];
    meta.attachments = [{ file_name: 'a' } as any];
    const result = ResultBuilder.build({
      value: baseValue,
      path: '/x.ts',
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.fields).toEqual({ severity: 'major' });
    expect(result.params).toEqual({ env: 'prod' });
    expect(result.group_params).toEqual({ region: 'eu' });
    expect(result.tags).toEqual(['smoke']);
    expect(result.steps).toEqual([{ id: 's1' }]);
    expect(result.attachments).toEqual([{ file_name: 'a' }]);
  });

  it('appends profilerSteps to result.steps after metadata steps', () => {
    const meta = MetadataApplier.empty();
    meta.steps = [{ id: 'meta1' } as any];
    const profilerSteps = [{ id: 'prof1' } as any];
    const result = ResultBuilder.build({
      value: baseValue,
      path: '/x.ts',
      metadata: meta,
      profilerSteps,
    });
    expect(result.steps).toEqual([{ id: 'meta1' }, { id: 'prof1' }]);
  });

  it('keeps testops_id null and uses projectMapping when title carries [PROJ:N] marker', () => {
    const value = { ...baseValue, title: '[PROJ:42] My test' } as any;
    const result = ResultBuilder.build({
      value,
      path: '/x.ts',
      metadata: MetadataApplier.empty(),
      profilerSteps: [],
    });
    expect(result.testops_id).toBeNull();
    expect(result.testops_project_mapping).toEqual({ PROJ: [42] });
    expect(result.title).toBe('My test');
  });

  it('removes Qase ID suffix from title via removeQaseIdsFromTitle when no projectMapping', () => {
    const value = { ...baseValue, title: 'Visible (Qase ID: 7)' } as any;
    const result = ResultBuilder.build({
      value,
      path: '/x.ts',
      metadata: MetadataApplier.empty(),
      profilerSteps: [],
    });
    expect(result.title).toBe('Visible');
    expect(result.testops_id).toBe(7);
  });

  it('builds relations from filePath split + ancestorTitles', () => {
    const value = { ...baseValue, ancestorTitles: ['Outer', 'Inner'] } as any;
    const cwd = process.cwd();
    const result = ResultBuilder.build({
      value,
      path: `${cwd}/a/b/c.ts`,
      metadata: MetadataApplier.empty(),
      profilerSteps: [],
    });
    const titles = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(titles).toEqual(['a', 'b', 'c.ts', 'Outer', 'Inner']);
  });
});

describe('ResultBuilder.normalizePath', () => {
  it('strips process.cwd prefix', () => {
    const cwd = process.cwd();
    expect(ResultBuilder.normalizePath(`${cwd}/test/file.ts`)).toBe('test/file.ts');
  });

  it('returns original path when cwd not present', () => {
    expect(ResultBuilder.normalizePath('/other/file.ts')).toBe('/other/file.ts');
  });
});
