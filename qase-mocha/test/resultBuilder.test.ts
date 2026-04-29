/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import {
  StepStatusEnum,
  StepType,
  TestStatusEnum,
  TestStepType,
} from 'qase-javascript-commons';
import { Metadata } from '../src/types';
import { ResultBuilder } from '../src/modules/resultBuilder';

function makeMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const m = new Metadata();
  Object.assign(m, overrides);
  return m;
}

function makeTest(opts: {
  title?: string;
  state?: 'passed' | 'failed' | 'pending';
  err?: { message: string; stack?: string };
  duration?: number;
  parentTitlePath?: string[];
  parentFile?: string;
} = {}): any {
  return {
    title: opts.title ?? 'sample',
    state: opts.state ?? 'passed',
    err: opts.err,
    duration: opts.duration,
    parent: opts.parentTitlePath
      ? {
          titlePath: () => opts.parentTitlePath!,
          file: opts.parentFile,
          parent: undefined,
        }
      : undefined,
  };
}

const STEP_FIXTURE: TestStepType = {
  step_type: StepType.TEXT,
  data: { action: 's1', expected_result: null, data: null },
  execution: { start_time: 0, status: StepStatusEnum.passed, end_time: 1, duration: 1 },
  id: 'step-1',
  parent_id: null,
  attachments: [],
  steps: [],
};

describe('ResultBuilder', () => {
  const baseArgs = {
    test: makeTest({ parentTitlePath: ['Suite'], parentFile: '/repo/test/foo.spec.ts' }),
    metadata: makeMetadata(),
    steps: [],
    profilerSteps: [],
    output: { stdout: '', stderr: '' },
    testBeginTime: 1700000000000,
    cwd: '/repo/',
  };

  it('builds a passed result with empty metadata', () => {
    const result = ResultBuilder.build({ ...baseArgs });
    expect(result.execution.status).toBe(TestStatusEnum.passed);
    expect(result.title).toBe('sample');
    expect(result.testops_id).toBeNull();
  });

  it('marks failed when test.err present', () => {
    const failedTest = makeTest({
      state: 'failed',
      err: { message: 'expected 1 to equal 2', stack: 'stack-here' },
      parentTitlePath: ['Suite'],
    });
    const result = ResultBuilder.build({ ...baseArgs, test: failedTest });
    expect(result.execution.status).toBe(TestStatusEnum.failed);
    expect(result.execution.stacktrace).toBe('stack-here');
    expect(result.message).toBe('expected 1 to equal 2');
  });

  it('maps pending → skipped', () => {
    const pendingTest = makeTest({ state: 'pending', parentTitlePath: ['Suite'] });
    const result = ResultBuilder.build({ ...baseArgs, test: pendingTest });
    expect(result.execution.status).toBe(TestStatusEnum.skipped);
  });

  it('uses metadata.title when provided', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ title: 'overridden' }),
    });
    expect(result.title).toBe('overridden');
  });

  it('removes "(Qase ID: 7)" suffix from title when metadata.title not set', () => {
    const test = makeTest({ title: 'login (Qase ID: 7)', parentTitlePath: ['Suite'] });
    const result = ResultBuilder.build({ ...baseArgs, test });
    expect(result.title).toBe('login');
  });

  it('sets testops_id from metadata.ids when no project mapping in title', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ ids: [42] }),
    });
    expect(result.testops_id).toEqual([42]);
  });

  it('falls back to legacy ids parsed from title when metadata.ids empty', () => {
    const test = makeTest({ title: 'order (Qase ID: 9)', parentTitlePath: ['Suite'] });
    const result = ResultBuilder.build({ ...baseArgs, test });
    expect(result.testops_id).toEqual([9]);
  });

  it('builds suite relations from parent.titlePath() when no metadata.suite', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      test: makeTest({ parentTitlePath: ['Outer', 'Inner'] }),
    });
    const data = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(data).toEqual(['Outer', 'Inner']);
  });

  it('overrides suite relation with metadata.suite when set', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ suite: 'OnlyThis' }),
    });
    const data = (result.relations as any).suite.data.map((d: any) => d.title);
    expect(data).toEqual(['OnlyThis']);
  });

  it('merges StepRunner steps and ProfilerTracker steps in order', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      steps: [STEP_FIXTURE],
      profilerSteps: [{ ...STEP_FIXTURE, id: 'profiler-1' }],
    });
    expect(result.steps.map((s) => s.id)).toEqual(['step-1', 'profiler-1']);
  });

  it('attaches stdout.txt and stderr.txt when output non-empty', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata(),
      output: { stdout: 'log-out', stderr: 'log-err' },
      attachLogs: true,
    });
    const names = result.attachments.map((a) => a.file_name);
    expect(names).toContain('stdout.txt');
    expect(names).toContain('stderr.txt');
  });

  it('does not attach logs when attachLogs flag is false', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      output: { stdout: 'data', stderr: '' },
      attachLogs: false,
    });
    expect(result.attachments).toEqual([]);
  });

  it('appends test.err.message after metadata.comment with double newline', () => {
    const result = ResultBuilder.build({
      ...baseArgs,
      metadata: makeMetadata({ comment: 'note' }),
      test: makeTest({
        state: 'failed',
        err: { message: 'extra' },
        parentTitlePath: ['Suite'],
      }),
    });
    expect(result.message).toBe('note\n\nextra');
  });
});
