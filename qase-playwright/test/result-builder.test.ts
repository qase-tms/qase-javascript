/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { TestCase, TestResult, TestStatus } from '@playwright/test/reporter';
import { ResultBuilder, BuildArgs } from '../src/result-builder';
import { StepConverter } from '../src/step-converter';
import { StepIndex } from '../src/step-index';
import { TestCaseMetadata } from '../src/metadata-extractor';
import { ReporterOptionsType } from '../src/options';

function emptyMetadata(): TestCaseMetadata {
  return {
    ids: [],
    title: '',
    fields: {},
    parameters: {},
    groupParams: {},
    attachments: [],
    ignore: false,
    suite: '',
    comment: '',
    tags: [],
  };
}

function makeTest(title: string, titlePath: string[] = ['file.spec.ts', title]): TestCase {
  return {
    title,
    titlePath: () => titlePath,
    annotations: [],
  } as unknown as TestCase;
}

function makeResult(status: TestStatus, opts: Partial<TestResult> = {}): TestResult {
  return {
    status,
    startTime: new Date(0),
    duration: 0,
    parallelIndex: 0,
    error: undefined,
    errors: [],
    attachments: [],
    steps: [],
    stdout: [],
    stderr: [],
    retry: 0,
    ...opts,
  } as unknown as TestResult;
}

function emptyOptions(): ReporterOptionsType {
  return {} as ReporterOptionsType;
}

function defaultArgs(over: Partial<BuildArgs> = {}): BuildArgs {
  return {
    test: makeTest('test title'),
    result: makeResult('passed' as TestStatus),
    metadata: emptyMetadata(),
    annotations: { ids: [], projectMapping: null, suites: [] },
    options: emptyOptions(),
    isCaptureLogs: false,
    qaseIdsRegistry: new Map<string, number[]>(),
    ...over,
  };
}

describe('ResultBuilder precedence chain', () => {
  let builder: ResultBuilder;

  beforeEach(() => {
    const stepIndex = new StepIndex();
    builder = new ResultBuilder(new StepConverter(stepIndex));
  });

  it('uses metadata.projectMapping when present', () => {
    const args = defaultArgs({
      metadata: { ...emptyMetadata(), projectMapping: { PROJ: [1] } },
    });
    const r = builder.build(args)!;
    expect(r.testops_project_mapping).toEqual({ PROJ: [1] });
    expect(r.testops_id).toBeNull();
  });

  it('uses annotation projectMapping when metadata has none', () => {
    const args = defaultArgs({
      annotations: { ids: [], projectMapping: { PROJ_A: [1] }, suites: [] },
    });
    const r = builder.build(args)!;
    expect(r.testops_project_mapping).toEqual({ PROJ_A: [1] });
  });

  it('uses title-extracted projectMapping when metadata and annotation have none', () => {
    const args = defaultArgs({
      test: makeTest('login (Qase PROJ_T: 1)'),
    });
    const r = builder.build(args)!;
    expect(r.testops_project_mapping).toEqual({ PROJ_T: [1] });
  });

  it('uses annotation ids when no projectMapping', () => {
    const args = defaultArgs({ annotations: { ids: [42], projectMapping: null, suites: [] } });
    const r = builder.build(args)!;
    expect(r.testops_id).toBe(42);
  });

  it('uses metadata.ids when no annotation ids and no mapping', () => {
    const args = defaultArgs({ metadata: { ...emptyMetadata(), ids: [7] } });
    const r = builder.build(args)!;
    expect(r.testops_id).toBe(7);
  });

  it('uses static qaseIds Map fallback when nothing else matches', () => {
    const registry = new Map<string, number[]>([['fallback test', [99]]]);
    const args = defaultArgs({ test: makeTest('fallback test'), qaseIdsRegistry: registry });
    const r = builder.build(args)!;
    expect(r.testops_id).toEqual([99]);
  });
});

describe('ResultBuilder feature flags and merging', () => {
  let builder: ResultBuilder;

  beforeEach(() => {
    const stepIndex = new StepIndex();
    builder = new ResultBuilder(new StepConverter(stepIndex));
  });

  it('returns null when metadata.ignore is true', () => {
    const args = defaultArgs({ metadata: { ...emptyMetadata(), ignore: true } });
    expect(builder.build(args)).toBeNull();
  });

  it('adds browser parameter when options.browser.addAsParameter is true', () => {
    const test = { title: 't', titlePath: () => ['t'], annotations: [], _projectId: 'chrome' } as unknown as TestCase;
    const options = { browser: { addAsParameter: true, parameterName: 'browser' } } as unknown as ReporterOptionsType;
    const r = builder.build(defaultArgs({ test, options }))!;
    expect(r.params).toEqual(expect.objectContaining({ browser: 'chrome' }));
  });

  it('marks the test as flaky when retry>0 and status is passed', () => {
    const args = defaultArgs({ result: makeResult('passed' as TestStatus, { retry: 1 }), options: { markAsFlaky: true } as ReporterOptionsType });
    const r = builder.build(args)!;
    expect(r.fields['is_flaky']).toBe('true');
  });

  it('does not mark flaky when retry is 0', () => {
    const args = defaultArgs({ options: { markAsFlaky: true } as ReporterOptionsType });
    const r = builder.build(args)!;
    expect(r.fields['is_flaky']).toBeUndefined();
  });

  it('filters test.title out of suites', () => {
    const test = makeTest('login', ['root', 'login']);
    const r = builder.build(defaultArgs({ test }))!;
    expect(r.relations.suite.data.map((s: { title: string }) => s.title)).not.toContain('login');
  });

  it('merges comment with error message into the message field', () => {
    const error: any = { message: 'boom', stack: undefined };
    const args = defaultArgs({
      result: makeResult('failed' as TestStatus, { error, errors: [error] }),
      metadata: { ...emptyMetadata(), comment: 'note' },
    });
    const r = builder.build(args)!;
    expect(r.message).toContain('note');
    expect(r.message).toContain('boom');
  });

  it('appends profiler steps when a profiler attachment is present', () => {
    const profilerStep = { id: 'p1' } as any;
    const profilerAttachment = {
      contentType: 'application/qase.profiler-steps+json',
      body: Buffer.from(JSON.stringify([profilerStep])),
      name: 'profiler.json',
    } as any;
    const args = defaultArgs({ result: makeResult('passed' as TestStatus, { attachments: [profilerAttachment] }) });
    const r = builder.build(args)!;
    expect(r.steps[r.steps.length - 1]).toEqual(profilerStep);
  });

  it('attaches stdout/stderr as logs when isCaptureLogs is true', () => {
    const args = defaultArgs({
      result: makeResult('passed' as TestStatus, { stdout: ['line1\n'], stderr: ['err1\n'] }),
      isCaptureLogs: true,
    });
    const r = builder.build(args)!;
    expect(r.attachments.find((a: any) => a.file_name === 'stdout.log')).toBeDefined();
    expect(r.attachments.find((a: any) => a.file_name === 'stderr.log')).toBeDefined();
  });
});
