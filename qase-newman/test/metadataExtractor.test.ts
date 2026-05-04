/* eslint-disable */
import { describe, it, expect } from '@jest/globals';
import { MetadataExtractor } from '../src/modules/metadataExtractor';

const eventListFromExec = (exec: string[], listen = 'test') => ({
  each: (callback: (event: any) => void) => {
    callback({ listen, script: { exec } });
  },
}) as any;

describe('MetadataExtractor.getCaseIds', () => {
  it('extracts single id from `// qase: 123`', () => {
    expect(MetadataExtractor.getCaseIds(eventListFromExec(['// qase: 123']))).toEqual([123]);
  });

  it('extracts multiple ids from `// qase: 1,2,3`', () => {
    expect(MetadataExtractor.getCaseIds(eventListFromExec(['// qase: 1,2,3']))).toEqual([1, 2, 3]);
  });

  it('returns [] for non-test event listeners', () => {
    expect(MetadataExtractor.getCaseIds(eventListFromExec(['// qase: 1'], 'prerequest'))).toEqual([]);
  });

  it('handles events with no script.exec', () => {
    const eventList = { each: (cb: any) => cb({ listen: 'test', script: {} }) } as any;
    expect(MetadataExtractor.getCaseIds(eventList)).toEqual([]);
  });

  it('handles `// Qase:` (capital Q)', () => {
    expect(MetadataExtractor.getCaseIds(eventListFromExec(['// Qase: 42']))).toEqual([42]);
  });
});

describe('MetadataExtractor.getProjectMapping', () => {
  it('parses single project marker `// qase PROJ: 1,2`', () => {
    expect(MetadataExtractor.getProjectMapping(eventListFromExec(['// qase PROJ: 1,2'])))
      .toEqual({ PROJ: [1, 2] });
  });

  it('parses multiple project markers across lines', () => {
    expect(
      MetadataExtractor.getProjectMapping(
        eventListFromExec(['// qase PROJ1: 1', '// qase PROJ2: 2,3']),
      ),
    ).toEqual({ PROJ1: [1], PROJ2: [2, 3] });
  });

  it('ignores `// qase ID: 1,2` (legacy single-project marker, parsed by qaseIdRegExp instead)', () => {
    expect(MetadataExtractor.getProjectMapping(eventListFromExec(['// qase ID: 5']))).toEqual({});
  });

  it('returns {} for non-test events', () => {
    expect(MetadataExtractor.getProjectMapping(eventListFromExec(['// qase PROJ: 1'], 'prerequest')))
      .toEqual({});
  });

  it('combines repeated project codes', () => {
    expect(
      MetadataExtractor.getProjectMapping(
        eventListFromExec(['// qase PROJ: 1', '// qase PROJ: 2,3']),
      ),
    ).toEqual({ PROJ: [1, 2, 3] });
  });
});

describe('MetadataExtractor.getParameters', () => {
  const itemWithExec = (exec: string[], parent: any = null) => ({
    events: { each: (cb: any) => cb({ listen: 'test', script: { exec } }) },
    parent: () => parent,
  }) as any;

  it('extracts parameters from `qase.parameters: a, b`', () => {
    expect(MetadataExtractor.getParameters(itemWithExec(['qase.parameters: param1, param2'])))
      .toEqual(['param1', 'param2']);
  });

  it('aggregates parameters from parent items', () => {
    const parent = itemWithExec(['qase.parameters: parentParam']);
    expect(MetadataExtractor.getParameters(itemWithExec(['qase.parameters: childParam'], parent)))
      .toEqual(['childParam', 'parentParam']);
  });

  it('returns [] when no parameters declared', () => {
    expect(MetadataExtractor.getParameters(itemWithExec(['regular code']))).toEqual([]);
  });
});

describe('MetadataExtractor.getParentTitles', () => {
  it('walks up the parent chain and collects names', () => {
    const grandparent = { name: 'GP', parent: () => null } as any;
    const parent = { name: 'P', parent: () => grandparent } as any;
    const item = { name: 'I', parent: () => parent } as any;
    expect(MetadataExtractor.getParentTitles(item)).toEqual(['GP', 'P', 'I']);
  });

  it('returns [] for items without name and no parent', () => {
    const item = { parent: () => null } as any;
    expect(MetadataExtractor.getParentTitles(item)).toEqual([]);
  });

  it('skips levels without `name` property', () => {
    const grandparent = { name: 'GP', parent: () => null } as any;
    const parent = { parent: () => grandparent } as any; // no `name`
    const item = { name: 'I', parent: () => parent } as any;
    expect(MetadataExtractor.getParentTitles(item)).toEqual(['GP', 'I']);
  });
});

describe('MetadataExtractor regexps', () => {
  it('exposes qaseIdRegExp as static', () => {
    expect(MetadataExtractor.qaseIdRegExp.test('// qase: 1,2')).toBe(true);
  });
  it('exposes qaseParamRegExp as static', () => {
    expect(MetadataExtractor.qaseParamRegExp.test('qase.parameters: a, b')).toBe(true);
  });
  it('exposes qaseProjectRegExp as static', () => {
    const re = new RegExp(MetadataExtractor.qaseProjectRegExp.source, 'gi');
    expect(re.exec('// qase PROJ: 1')).not.toBeNull();
  });
});
