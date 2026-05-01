/* eslint-disable */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MetadataApplier } from '../src/modules/metadataApplier';
import { StepType, TestStepType } from 'qase-javascript-commons';

jest.mock('qase-javascript-commons/internal', () => ({
  extractAndCleanStep: jest.fn((s: string) => ({ cleanedString: s.replace(/ QaseExpRes:.*$/, ''), expectedResult: 'expected', data: 'data' })),
}));

describe('MetadataApplier', () => {
  let applier: MetadataApplier;

  beforeEach(() => {
    jest.clearAllMocks();
    applier = new MetadataApplier();
  });

  it('starts with empty metadata', () => {
    const m = applier.get();
    expect(m.title).toBeUndefined();
    expect(m.comment).toBeUndefined();
    expect(m.suite).toBeUndefined();
    expect(m.ignore).toBe(false);
    expect(m.fields).toEqual({});
    expect(m.parameters).toEqual({});
    expect(m.groupParams).toEqual({});
    expect(m.tags).toEqual([]);
    expect(m.steps).toEqual([]);
    expect(m.attachments).toEqual([]);
  });

  it('applyTitle sets title', () => {
    applier.applyTitle('My Title');
    expect(applier.get().title).toBe('My Title');
  });

  it('applyComment sets comment', () => {
    applier.applyComment('My Comment');
    expect(applier.get().comment).toBe('My Comment');
  });

  it('applySuite sets suite', () => {
    applier.applySuite('My\tSuite');
    expect(applier.get().suite).toBe('My\tSuite');
  });

  it('applyFields sets fields map', () => {
    applier.applyFields({ severity: 'critical' });
    expect(applier.get().fields).toEqual({ severity: 'critical' });
  });

  it('applyParameters sets parameters map', () => {
    applier.applyParameters({ env: 'prod' });
    expect(applier.get().parameters).toEqual({ env: 'prod' });
  });

  it('applyGroupParams sets groupParams map', () => {
    applier.applyGroupParams({ region: 'us-east' });
    expect(applier.get().groupParams).toEqual({ region: 'us-east' });
  });

  it('applyTags appends to tags', () => {
    applier.applyTags(['smoke']);
    applier.applyTags(['regression', 'p0']);
    expect(applier.get().tags).toEqual(['smoke', 'regression', 'p0']);
  });

  it('applyIgnore sets ignore=true', () => {
    applier.applyIgnore();
    expect(applier.get().ignore).toBe(true);
  });

  it('applyAttachment pushes attachment', () => {
    const a1 = { file_name: 'a' } as any;
    const a2 = { file_name: 'b' } as any;
    applier.applyAttachment(a1);
    applier.applyAttachment(a2);
    expect(applier.get().attachments).toEqual([a1, a2]);
  });

  it('applyStep with StepType.TEXT cleans action via extractAndCleanStep', () => {
    const step: TestStepType = {
      step_type: StepType.TEXT,
      data: { action: 'click submit QaseExpRes: ok', expected_result: null, data: null },
    } as any;
    applier.applyStep(step);
    const stored = applier.get().steps[0] as any;
    expect(stored.data.action).toBe('click submit');
    expect(stored.data.expected_result).toBe('expected');
    expect(stored.data.data).toBe('data');
  });

  it('applyStep with undefined step_type still runs cleanup (default text)', () => {
    const step: TestStepType = {
      data: { action: 'navigate', expected_result: null, data: null },
    } as any;
    applier.applyStep(step);
    const stored = applier.get().steps[0] as any;
    expect(stored.data.action).toBe('navigate');
  });

  it('applyStep with non-text step_type leaves data untouched', () => {
    const step: TestStepType = {
      step_type: 'gherkin',
      data: { keyword: 'Given', name: 'a state' },
    } as any;
    applier.applyStep(step);
    const stored = applier.get().steps[0] as any;
    expect(stored.data).toEqual({ keyword: 'Given', name: 'a state' });
  });

  it('applyStep with text step but no action leaves data untouched', () => {
    const step: TestStepType = {
      step_type: 'text',
      data: { other: 'value' } as any,
    } as any;
    applier.applyStep(step);
    const stored = applier.get().steps[0] as any;
    expect(stored.data).toEqual({ other: 'value' });
  });

  it('reset returns metadata to empty', () => {
    applier.applyTitle('X');
    applier.applyTags(['t']);
    applier.applyIgnore();
    applier.reset();
    const m = applier.get();
    expect(m.title).toBeUndefined();
    expect(m.tags).toEqual([]);
    expect(m.ignore).toBe(false);
  });
});
