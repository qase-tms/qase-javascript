/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { PickleTag } from '@cucumber/messages';
import { TagParser } from '../src/modules/tagParser';

function tag(name: string): PickleTag {
  return { name, astNodeId: '' } as PickleTag;
}

describe('TagParser', () => {
  it('parses legacy @Q-123 / @q123 ids', () => {
    const md = TagParser.parse([tag('@Q-7'), tag('@q42')]);
    expect(md.ids).toEqual(expect.arrayContaining([7, 42]));
  });

  it('parses @QaseId=10,20,30 (new style, comma-separated)', () => {
    const md = TagParser.parse([tag('@QaseId=10,20,30')]);
    expect(md.ids).toEqual(expect.arrayContaining([10, 20, 30]));
  });

  it('parses @QaseTitle= override', () => {
    const md = TagParser.parse([tag('@QaseTitle=Custom Title With Spaces')]);
    expect(md.title).toBe('Custom Title With Spaces');
  });

  it('parses @QaseFields= JSON object', () => {
    const md = TagParser.parse([tag('@QaseFields={"severity":"high"}')]);
    expect(md.fields).toEqual({ severity: 'high' });
  });

  it('normalizes single quotes in @QaseFields= JSON', () => {
    const md = TagParser.parse([tag(`@QaseFields={'env':'prod'}`)]);
    expect(md.fields).toEqual({ env: 'prod' });
  });

  it('parses @QaseParameters= and @QaseGroupParameters=', () => {
    const md = TagParser.parse([
      tag('@QaseParameters={"region":"eu"}'),
      tag('@QaseGroupParameters={"shard":"1"}'),
    ]);
    expect(md.parameters).toEqual({ region: 'eu' });
    expect(md.group_params).toEqual({ shard: '1' });
  });

  it('parses @QaseSuite= override', () => {
    const md = TagParser.parse([tag('@QaseSuite=My Suite')]);
    expect(md.suite).toBe('My Suite');
  });

  it('parses @QaseIgnore as isIgnore=true', () => {
    const md = TagParser.parse([tag('@QaseIgnore')]);
    expect(md.isIgnore).toBe(true);
  });

  it('parses @QaseTags= comma-separated list', () => {
    const md = TagParser.parse([tag('@QaseTags=smoke, regression, fast')]);
    expect(md.tags).toEqual(['smoke', 'regression', 'fast']);
  });

  it('parseProjectMappingFromTags integration: legacy id + project mapping', () => {
    // Just verify default empty path; project-mapping integration is exercised by storage.test.ts
    const md = TagParser.parse([tag('@regular-tag-not-qase')]);
    expect(md.ids).toEqual([]);
    expect(md.projectMapping).toEqual({});
    expect(md.fields).toEqual({});
    expect(md.title).toBeNull();
    expect(md.isIgnore).toBe(false);
    expect(md.parameters).toEqual({});
    expect(md.group_params).toEqual({});
    expect(md.suite).toBeNull();
    expect(md.tags).toEqual([]);
  });
});
