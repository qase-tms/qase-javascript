/* eslint-disable */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MetadataAccumulator } from '../src/modules/metadataAccumulator';

const mkAnnotation = (message: string, attachment?: any) => ({
  message,
  attachment,
}) as any;

describe('MetadataAccumulator.parseAnnotation', () => {
  let acc: MetadataAccumulator;

  beforeEach(() => {
    acc = new MetadataAccumulator();
  });

  it('lazily initializes metadata entry on first annotation', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Title: My Title'));
    const m = acc.getMetadata('t1');
    expect(m).toBeDefined();
    expect(m!.title).toBe('My Title');
    expect(m!.steps).toEqual([]);
    expect(m!.attachments).toEqual([]);
  });

  it('parses Qase Title annotation', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Title: New Title'));
    expect(acc.getMetadata('t1')!.title).toBe('New Title');
  });

  it('parses Qase Comment annotation', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Comment: A note'));
    expect(acc.getMetadata('t1')!.comment).toBe('A note');
  });

  it('parses Qase Suite annotation', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Suite: My Suite'));
    expect(acc.getMetadata('t1')!.suite).toBe('My Suite');
  });

  it('parses Qase Fields annotation as JSON', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Fields: {"severity":"critical"}'));
    expect(acc.getMetadata('t1')!.fields).toEqual({ severity: 'critical' });
  });

  it('parses Qase Parameters annotation', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Parameters: {"env":"prod","port":8080}'));
    expect(acc.getMetadata('t1')!.parameters).toEqual({ env: 'prod', port: '8080' });
  });

  it('parses Qase Group Parameters annotation', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Group Parameters: {"region":"eu"}'));
    expect(acc.getMetadata('t1')!.groupParameters).toEqual({ region: 'eu' });
  });

  it('parses Qase Tags annotation as JSON array', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Tags: ["smoke","p0"]'));
    expect(acc.getMetadata('t1')!.tags).toEqual(['smoke', 'p0']);
  });

  it('falls back on Qase Tags when JSON parse fails', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Tags: smoke, p0,p1'));
    expect(acc.getMetadata('t1')!.tags).toEqual(['smoke', 'p0', 'p1']);
  });

  it('appends tags across multiple annotations', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Tags: ["a"]'));
    acc.parseAnnotation('t1', mkAnnotation('Qase Tags: ["b","c"]'));
    expect(acc.getMetadata('t1')!.tags).toEqual(['a', 'b', 'c']);
  });

  it('Qase Step Start sets currentStep but does not push', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Step Start: do thing'));
    const m = acc.getMetadata('t1')!;
    expect(m.currentStep).toBe('do thing');
    expect(m.steps).toEqual([]);
  });

  it('Qase Step End pushes step and clears currentStep', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Step Start: do thing'));
    acc.parseAnnotation('t1', mkAnnotation('Qase Step End: do thing'));
    const m = acc.getMetadata('t1')!;
    expect(m.steps).toEqual([{ name: 'do thing', status: 'end' }]);
    expect(m.currentStep).toBeUndefined();
  });

  it('Qase Step Failed pushes failed step and clears currentStep', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Step Start: risky'));
    acc.parseAnnotation('t1', mkAnnotation('Qase Step Failed: risky - boom'));
    const m = acc.getMetadata('t1')!;
    expect(m.steps).toEqual([{ name: 'risky', status: 'failed' }]);
    expect(m.currentStep).toBeUndefined();
  });

  it('Qase Step End without prior Step Start is a no-op', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Step End: nothing'));
    expect(acc.getMetadata('t1')!.steps).toEqual([]);
  });

  it('Qase Attachment with path stores path metadata', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Attachment: file.txt', {
      path: '/tmp/file.txt',
      contentType: 'text/plain',
    }));
    const m = acc.getMetadata('t1')!;
    expect(m.attachments).toEqual([
      { name: 'file.txt', path: '/tmp/file.txt', contentType: 'text/plain' },
    ]);
  });

  it('Qase Attachment with body string stores content', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Attachment: data.json', {
      body: '{"a":1}',
      contentType: 'application/json',
    }));
    const m = acc.getMetadata('t1')!;
    expect(m.attachments[0]).toEqual({
      name: 'data.json',
      content: '{"a":1}',
      contentType: 'application/json',
    });
  });

  it('Qase Profiler Steps annotation stores parsed steps on _profilerSteps', () => {
    const steps = [{ id: 'step-1', data: { action: 'fetch' } }];
    acc.parseAnnotation('t1', mkAnnotation(`Qase Profiler Steps: ${JSON.stringify(steps)}`));
    const m = acc.getMetadata('t1')! as any;
    expect(m._profilerSteps).toEqual(steps);
  });

  it('Qase Profiler Steps with malformed JSON is silently swallowed', () => {
    expect(() =>
      acc.parseAnnotation('t1', mkAnnotation('Qase Profiler Steps: not-json')),
    ).not.toThrow();
    const m = acc.getMetadata('t1')! as any;
    expect(m._profilerSteps).toBeUndefined();
  });

  it('non-Qase annotation is ignored', () => {
    acc.parseAnnotation('t1', mkAnnotation('Some other annotation'));
    expect(acc.getMetadata('t1')).toBeUndefined();
  });

  it('Qase Fields with malformed JSON does not throw', () => {
    expect(() =>
      acc.parseAnnotation('t1', mkAnnotation('Qase Fields: not-json')),
    ).not.toThrow();
    expect(acc.getMetadata('t1')!.fields).toBeUndefined();
  });
});

describe('MetadataAccumulator state lifecycle', () => {
  let acc: MetadataAccumulator;

  beforeEach(() => {
    acc = new MetadataAccumulator();
  });

  it('getMetadata returns undefined before any annotation', () => {
    expect(acc.getMetadata('t1')).toBeUndefined();
  });

  it('clearMetadata removes the entry for a test', () => {
    acc.parseAnnotation('t1', mkAnnotation('Qase Title: x'));
    expect(acc.getMetadata('t1')).toBeDefined();
    acc.clearMetadata('t1');
    expect(acc.getMetadata('t1')).toBeUndefined();
  });

  it('clearMetadata of an unknown test is a no-op', () => {
    expect(() => acc.clearMetadata('unknown')).not.toThrow();
  });

  it('setCurrentSuite stores the suite name', () => {
    acc.setCurrentSuite('My Suite');
    expect(acc.getCurrentSuite()).toBe('My Suite');
  });

  it('clearCurrentSuite resets to undefined', () => {
    acc.setCurrentSuite('My Suite');
    acc.clearCurrentSuite();
    expect(acc.getCurrentSuite()).toBeUndefined();
  });

  it('getCurrentSuite returns undefined initially', () => {
    expect(acc.getCurrentSuite()).toBeUndefined();
  });
});
