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

const mkModule = (moduleId = '/root/test/file.test.ts') => ({ type: 'module', moduleId });
const mkParent = (names: string[], module: any = mkModule()) =>
  names.reduce((parent: any, name) => ({ type: 'suite', name, parent, module }), module);

const mkTestCase = (overrides: any = {}) => ({
  name: 'Test',
  id: 'test-id',
  fullName: 'Suite > Test',
  parent: mkParent(['Suite']),
  module: mkModule(),
  project: { config: { root: '/root' } },
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
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('passed');
    // Vitest exposes the absolute startTime; reporter emits it as Unix seconds.
    expect(result.execution.start_time).toBe(1_700_000_000);
    expect(result.execution.end_time).toBe(1_700_000_000.1);
    expect(result.execution.duration).toBe(100);
    expect(result.id).toBe('test-id');
    expect(result.signature).toBe('test::file.test.ts::suite::test');
    expect(result.steps).toEqual([]);
  });

  it('extracts single legacy id from name (Qase ID: 123)', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Test (Qase ID: 123)', fullName: 'Suite > Test (Qase ID: 123)' }),
      metadata: undefined,
      profilerSteps: [],
    });
    expect(result.testops_id).toBe(123);
    expect(result.title).toBe('Test');
  });

  it('extracts multiple legacy ids', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Test (Qase ID: 1,2,3)' }),
      metadata: undefined,
      profilerSteps: [],
    });
    expect(result.testops_id).toEqual([1, 2, 3]);
  });

  it('uses projectMapping when (Qase PROJ: N) markers are present', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Test (Qase PROJ1: 100) (Qase PROJ2: 200)' }),
      metadata: undefined,
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
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('failed');
    expect(result.execution.stacktrace).toContain('STACK');
    expect(result.message).toBe('boom');
  });

  it('reports a test that passed on a retry as passed, without the earlier attempts\' errors', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'passed', errors: [new Error('first attempt')] }),
      }),
      metadata: undefined,
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('passed');
    expect(result.message).toBeNull();
    expect(result.execution.stacktrace).toBeFalsy();
  });

  it('takes the message of a test failing on every retry from its last attempt', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'failed', errors: [new Error('attempt 1'), new Error('attempt 2')] }),
      }),
      metadata: undefined,
      profilerSteps: [],
    });
    expect(result.execution.status).toBe('failed');
    expect(result.message).toBe('attempt 2');
    expect(result.execution.stacktrace).toContain('attempt 1');
  });

  it('maps skipped result with note to status=skipped and message=note', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'skipped', note: 'cond fail', errors: [] }),
      }),
      metadata: undefined,
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
      profilerSteps: [],
    });
    expect(result.relations).toEqual({
      suite: { data: [
        { title: 'My Suite', public_id: null },
        { title: 'Sub', public_id: null },
      ] },
    });
  });

  it.each([
    ['a tab', 'Application\tAuthentication'],
    ['the two characters \\t', 'Application\\tAuthentication'],
  ])('splits a metadata.suite separated by %s into nested suites', (_, suite) => {
    const meta = emptyMeta();
    meta.suite = suite;
    const result = ResultBuilder.build({ testCase: mkTestCase(), metadata: meta, profilerSteps: [] });
    expect(result.relations?.suite?.data.map((d) => d.title)).toEqual(['Application', 'Authentication']);
  });

  it('takes the suite path from the describe blocks the test is nested in', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ fullName: 'Outer > Inner > Test', parent: mkParent(['Outer', 'Inner']) }),
      metadata: undefined,
      profilerSteps: [],
    });
    const titles = result.relations?.suite?.data?.map((d: any) => d.title);
    expect(titles).toEqual(['Outer', 'Inner']);
  });

  it('keeps a describe title containing " > " or " - " as one suite', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ parent: mkParent(['API - v2 > users']) }),
      metadata: undefined,
      profilerSteps: [],
    });
    const titles = result.relations?.suite?.data?.map((d: any) => d.title);
    expect(titles).toEqual(['API - v2 > users']);
  });

  it('sets no suite for a test outside any describe block', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ fullName: 'Test', parent: mkModule() }),
      metadata: undefined,
      profilerSteps: [],
    });
    expect(result.relations).toBeNull();
  });

  it('builds the signature from Qase IDs, file, describe blocks, title and parameters', () => {
    const meta = emptyMeta();
    meta.parameters = { Browser: 'Chrome' };
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        name: 'Log In (Qase ID: 5,6)',
        parent: mkParent(['Auth Flow', 'Form'], mkModule('/root/test/auth/login.test.ts')),
        module: mkModule('/root/test/auth/login.test.ts'),
      }),
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.signature).toBe("5-6::test::auth::login.test.ts::auth_flow::form::log_in::{'browser':'chrome'}");
  });

  it('builds the signature without IDs for multi-project titles', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase({ name: 'Login (Qase PROJ1: 100)' }),
      metadata: undefined,
      profilerSteps: [],
    });
    expect(result.signature).toBe('test::file.test.ts::suite::login');
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
      profilerSteps: [],
    });
    expect(result.message).toBe('Override comment');
  });

  it('keeps the error message of a failed test after the comment', () => {
    const meta = emptyMeta();
    meta.comment = 'my comment';
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'failed', errors: [new Error('boom')] }),
      }),
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.message).toBe('my comment\n\nboom');
  });

  it('keeps the skip note after the comment', () => {
    const meta = emptyMeta();
    meta.comment = 'my comment';
    const result = ResultBuilder.build({
      testCase: mkTestCase({
        result: jest.fn().mockReturnValue({ state: 'skipped', note: 'cond fail', errors: [] }),
      }),
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.message).toBe('my comment\n\ncond fail');
  });

  it('builds steps from metadata.steps with extractAndCleanStep applied', () => {
    const meta = emptyMeta();
    meta.steps = [
      { name: 'do thing QaseExpRes: ok', status: 'end', steps: [] },
      { name: 'failed step', status: 'failed', steps: [] },
    ];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.steps.length).toBe(2);
    expect(result.steps[0]?.execution?.status).toBe('passed');
    expect(result.steps[1]?.execution?.status).toBe('failed');
  });

  it('builds nested steps under their parent step', () => {
    const meta = emptyMeta();
    meta.steps = [
      {
        name: 'parent',
        status: 'end',
        steps: [
          { name: 'child', status: 'failed', steps: [] },
          { name: 'unfinished', status: 'start', steps: [] },
        ],
      },
    ];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      profilerSteps: [],
    });
    expect(result.steps.length).toBe(1);
    const parent = result.steps[0]!;
    expect((parent.data as any).action).toBe('parent');
    expect(parent.steps.map((s: any) => [s.data.action, s.execution.status, s.parent_id])).toEqual([
      ['child', 'failed', parent.id],
      ['unfinished', 'failed', parent.id],
    ]);
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
      profilerSteps: [],
    });
    expect(result.steps).toEqual([{ id: 'meta-prof-1' }]);
  });

  it('appends profilerSteps argument after metadata steps', () => {
    const meta = emptyMeta();
    meta.steps = [{ name: 'manual', status: 'end', steps: [] }];
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: meta,
      profilerSteps: [{ id: 'prof-1' } as any],
    });
    expect(result.steps.length).toBe(2);
    expect(result.steps[1]).toEqual({ id: 'prof-1' });
  });

  it('sets muted when metadata.muted is true', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: { ...emptyMeta(), muted: true },
      profilerSteps: [],
    });
    expect(result.muted).toBe(true);
  });

  it('leaves muted false when metadata has no mute', () => {
    const result = ResultBuilder.build({
      testCase: mkTestCase(),
      metadata: emptyMeta(),
      profilerSteps: [],
    });
    expect(result.muted).toBe(false);
  });
});
