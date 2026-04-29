/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { MetadataApplier } from '../src/modules/metadataApplier';

describe('MetadataApplier', () => {
  let applier: MetadataApplier;

  beforeEach(() => {
    applier = new MetadataApplier();
  });

  it('applyQaseId(number) sets ids to single-element array', () => {
    applier.applyQaseId(123);
    expect(applier.get().ids).toEqual([123]);
  });

  it('applyQaseId(array) sets ids to that array', () => {
    applier.applyQaseId([1, 2, 3]);
    expect(applier.get().ids).toEqual([1, 2, 3]);
  });

  it('applyTitle sets title field', () => {
    applier.applyTitle('Custom title');
    expect(applier.get().title).toBe('Custom title');
  });

  it('applyParameters coerces keys and values to strings', () => {
    applier.applyParameters({ a: 1, b: true } as unknown as Record<string, string>);
    expect(applier.get().parameters).toEqual({ a: '1', b: 'true' });
  });

  it('applyGroupParameters coerces keys and values to strings', () => {
    applier.applyGroupParameters({ env: 'prod' });
    expect(applier.get().groupParameters).toEqual({ env: 'prod' });
  });

  it('applyFields coerces keys and values to strings', () => {
    applier.applyFields({ severity: 'high' });
    expect(applier.get().fields).toEqual({ severity: 'high' });
  });

  it('applySuite sets the suite override', () => {
    applier.applySuite('My Suite');
    expect(applier.get().suite).toBe('My Suite');
  });

  it('applyIgnore sets the ignore flag', () => {
    applier.applyIgnore();
    expect(applier.get().ignore).toBe(true);
  });

  it('applyTags accumulates across calls and applyComment appends with \\n\\n', () => {
    applier.applyTags(['smoke']);
    applier.applyTags(['regression', 'fast']);
    applier.applyComment('first');
    applier.applyComment('second');

    expect(applier.get().tags).toEqual(['smoke', 'regression', 'fast']);
    expect(applier.get().comment).toBe('first\n\nsecond\n\n');
  });

  it('reset() clears all fields back to initial values', () => {
    applier.applyQaseId(99);
    applier.applyTitle('Custom');
    applier.applyTags(['smoke']);
    applier.applyIgnore();
    applier.applyAttach({ name: 'log.txt', content: 'x', contentType: 'text/plain' });

    applier.reset();

    const m = applier.get();
    expect(m.ids).toEqual([]);
    expect(m.title).toBe('');
    expect(m.tags).toEqual([]);
    expect(m.ignore).toBe(false);
    expect(m.attachments).toEqual([]);
  });
});
