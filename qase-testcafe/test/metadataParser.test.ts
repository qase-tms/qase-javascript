/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { MetadataParser } from '../src/modules/metadataParser';
import { metadataEnum } from '../src/types';

describe('MetadataParser', () => {
  it('returns default empty metadata for empty input', () => {
    const md = MetadataParser.parse({});
    expect(md[metadataEnum.id]).toEqual([]);
    expect(md[metadataEnum.title]).toBeUndefined();
    expect(md[metadataEnum.suite]).toBeUndefined();
    expect(md[metadataEnum.fields]).toEqual({});
    expect(md[metadataEnum.parameters]).toEqual({});
    expect(md[metadataEnum.groupParameters]).toEqual({});
    expect(md[metadataEnum.ignore]).toBe(false);
    expect(md[metadataEnum.projects]).toEqual({});
    expect(md[metadataEnum.tags]).toEqual([]);
  });

  it('parses comma-separated QaseID into number array', () => {
    const md = MetadataParser.parse({ QaseID: '1,2,3' });
    expect(md[metadataEnum.id]).toEqual([1, 2, 3]);
  });

  it('uses legacy CID when QaseID is missing', () => {
    const md = MetadataParser.parse({ CID: '7' });
    expect(md[metadataEnum.id]).toEqual([7]);
  });

  it('QaseID overrides legacy CID when both present', () => {
    const md = MetadataParser.parse({ CID: '7', QaseID: '99' });
    expect(md[metadataEnum.id]).toEqual([99]);
  });

  it('parses QaseTitle, QaseSuite, QaseIgnore', () => {
    const md = MetadataParser.parse({
      QaseTitle: 'Custom title',
      QaseSuite: 'Outer\tInner',
      QaseIgnore: 'true',
    });
    expect(md[metadataEnum.title]).toBe('Custom title');
    expect(md[metadataEnum.suite]).toBe('Outer\tInner');
    expect(md[metadataEnum.ignore]).toBe(true);
  });

  it('parses QaseFields / QaseParameters / QaseGroupParameters JSON', () => {
    const md = MetadataParser.parse({
      QaseFields: '{"severity":"high"}',
      QaseParameters: '{"region":"eu"}',
      QaseGroupParameters: '{"shard":"1"}',
    });
    expect(md[metadataEnum.fields]).toEqual({ severity: 'high' });
    expect(md[metadataEnum.parameters]).toEqual({ region: 'eu' });
    expect(md[metadataEnum.groupParameters]).toEqual({ shard: '1' });
  });

  it('parses QaseTags as comma-separated trimmed list', () => {
    const md = MetadataParser.parse({ QaseTags: 'smoke, regression , fast' });
    expect(md[metadataEnum.tags]).toEqual(['smoke', 'regression', 'fast']);
  });

  it('tolerates invalid JSON in QaseProjects', () => {
    const md = MetadataParser.parse({ QaseProjects: 'not-json' });
    expect(md[metadataEnum.projects]).toEqual({});
  });
});
