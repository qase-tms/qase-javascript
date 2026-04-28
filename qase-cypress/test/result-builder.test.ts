/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import type { Suite, Test } from 'mocha';
import {
  StepStatusEnum,
  TestStatusEnum,
} from 'qase-javascript-commons';
import { ResultBuilder, BuildArgs, BuildSkippedArgs } from '../src/result-builder';
import { StepConverter } from '../src/step-converter';
import type { Metadata } from '../src/metadata/models';
import type { ReporterOptionsType } from '../src/options';

function makeTest(opts: { title: string; state?: string; err?: { message: string; stack?: string }; suiteTitlePath?: string[]; file?: string }): Test {
  const parent = opts.suiteTitlePath
    ? ({
        titlePath: () => opts.suiteTitlePath!,
        file: opts.file,
        parent: undefined,
      } as unknown as Suite)
    : undefined;
  return {
    title: opts.title,
    state: opts.state,
    err: opts.err,
    parent,
  } as unknown as Test;
}

function emptyMetadata(): Metadata {
  return {
    title: undefined,
    fields: {},
    parameters: {},
    groupParams: {},
    ignore: false,
    suite: undefined,
    comment: undefined,
    steps: [],
    cucumberSteps: [],
    currentStepId: undefined,
    firstStepName: undefined,
    attachments: [],
    stepAttachments: {},
  } as unknown as Metadata;
}

function defaultArgs(over: Partial<BuildArgs> = {}): BuildArgs {
  return {
    test: makeTest({ title: 'login', state: 'passed', suiteTitlePath: ['Auth', 'login'], file: '/tests/auth.spec.ts' }),
    metadata: emptyMetadata(),
    screenshotsFolder: undefined,
    testBeginTime: 1000,
    isCucumber: false,
    options: {} as ReporterOptionsType,
    ...over,
  };
}

describe('ResultBuilder.build', () => {
  let builder: ResultBuilder;

  beforeEach(() => {
    builder = new ResultBuilder(new StepConverter());
  });

  it('returns null when metadata.ignore is true', () => {
    const args = defaultArgs({ metadata: { ...emptyMetadata(), ignore: true } });
    expect(builder.build(args)).toBeNull();
  });

  it('uses metadata.title when present, otherwise removes Qase IDs from test.title', () => {
    const args1 = defaultArgs({ metadata: { ...emptyMetadata(), title: 'override' } });
    expect(builder.build(args1)?.title).toBe('override');

    const args2 = defaultArgs({ test: makeTest({ title: 'login (Qase ID: 1)' }) });
    expect(builder.build(args2)?.title).toBe('login');
  });

  it('extracts testops_id from a (Qase ID: 1,2) title when no metadata or annotations', () => {
    const args = defaultArgs({ test: makeTest({ title: 'login (Qase ID: 1,2)' }) });
    const r = builder.build(args)!;
    expect(r.testops_id).toEqual([1, 2]);
  });

  it('combines metadata.comment with test.err.message into the message field', () => {
    const args = defaultArgs({
      test: makeTest({ title: 't', state: 'failed', err: { message: 'boom' } }),
      metadata: { ...emptyMetadata(), comment: 'note' },
    });
    const r = builder.build(args)!;
    expect(r.message).toContain('note');
    expect(r.message).toContain('boom');
  });

  it('uses metadata.suite as a single-element relations.suite when present', () => {
    const args = defaultArgs({ metadata: { ...emptyMetadata(), suite: 'Custom' } });
    const r = builder.build(args)!;
    expect((r.relations as any).suite.data).toEqual([{ title: 'Custom', public_id: null }]);
  });

  it('falls back to test.parent.titlePath() for relations.suite when metadata.suite is empty', () => {
    const args = defaultArgs({ test: makeTest({ title: 't', suiteTitlePath: ['A', 'B'] }) });
    const r = builder.build(args)!;
    expect((r.relations as any).suite.data).toEqual([
      { title: 'A', public_id: null },
      { title: 'B', public_id: null },
    ]);
  });

  it('produces steps from metadata.steps via StepConverter.getSteps', () => {
    const args = defaultArgs({
      metadata: {
        ...emptyMetadata(),
        steps: [{ id: 's1', name: 'click', timestamp: 100 } as any],
        stepAttachments: {},
      },
    });
    const r = builder.build(args)!;
    expect(r.steps).toHaveLength(1);
    expect(r.steps[0]?.id).toBe('s1');
  });

  it('appends cucumber steps when isCucumber is true and metadata.cucumberSteps is non-empty', () => {
    const args = defaultArgs({
      test: makeTest({ title: 'login', state: 'passed', suiteTitlePath: ['Auth', 'login'] }),
      isCucumber: true,
      metadata: {
        ...emptyMetadata(),
        cucumberSteps: [{ id: 'c1', name: 'Given x', timestamp: 50 } as any],
      },
    });
    const r = builder.build(args)!;
    expect(r.steps.find((s: any) => s.id === 'c1')).toBeDefined();
  });

  it('maps test.state via determineTestStatus', () => {
    const passedArgs = defaultArgs({ test: makeTest({ title: 't', state: 'passed' }) });
    expect(builder.build(passedArgs)?.execution.status).toBe(TestStatusEnum.passed);
    const failedArgs = defaultArgs({ test: makeTest({ title: 't', state: 'failed', err: { message: 'expected x to equal y' } }) });
    expect(builder.build(failedArgs)?.execution.status).toBe(TestStatusEnum.failed);
  });

  it('computes signature with normalized suites and parameters', () => {
    const args = defaultArgs({
      test: makeTest({ title: 'login', suiteTitlePath: ['Auth Suite'], file: '/x/y.spec.ts' }),
      metadata: { ...emptyMetadata(), parameters: { user: 'admin' } },
    });
    const r = builder.build(args)!;
    expect(typeof r.signature).toBe('string');
    expect(r.signature.length).toBeGreaterThan(0);
  });
});

describe('ResultBuilder.buildSkipped', () => {
  let builder: ResultBuilder;

  beforeEach(() => {
    builder = new ResultBuilder(new StepConverter());
  });

  it('returns a skipped status result', () => {
    const test = makeTest({ title: 't', suiteTitlePath: ['Auth', 't'] });
    const opts: BuildSkippedArgs = { test, screenshotsFolder: undefined, testBeginTime: 1000 };
    const r = builder.buildSkipped(opts);
    expect(r.execution.status).toBe(TestStatusEnum.skipped);
    expect(r.execution.duration).toBe(0);
  });

  it('extracts ids from a (Qase ID: 5) title even without metadata', () => {
    const test = makeTest({ title: 'foo (Qase ID: 5)' });
    const r = builder.buildSkipped({ test, screenshotsFolder: undefined, testBeginTime: 1000 });
    expect(r.testops_id).toBe(5);
  });

  it('builds relations.suite from test.parent.titlePath() when present', () => {
    const test = makeTest({ title: 't', suiteTitlePath: ['Outer', 'Inner', 't'] });
    const r = builder.buildSkipped({ test, screenshotsFolder: undefined, testBeginTime: 1000 });
    expect((r.relations as any).suite.data).toEqual([
      { title: 'Outer', public_id: null },
      { title: 'Inner', public_id: null },
      { title: 't', public_id: null },
    ]);
  });

  it('produces no steps and no attachments when screenshotsFolder is undefined', () => {
    const test = makeTest({ title: 't' });
    const r = builder.buildSkipped({ test, screenshotsFolder: undefined, testBeginTime: 1000 });
    expect(r.steps).toEqual([]);
    expect(r.attachments).toEqual([]);
  });
});
