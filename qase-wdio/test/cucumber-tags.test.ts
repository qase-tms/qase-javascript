/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { CucumberTagAdapter } from '../src/cucumber-tags';
import { MetadataApplier } from '../src/metadata';
import { Storage } from '../src/storage';
import { TestResultType } from 'qase-javascript-commons';

describe('CucumberTagAdapter', () => {
  let metadata: MetadataApplier;
  let adapter: CucumberTagAdapter;
  let addQaseId: ReturnType<typeof jest.spyOn>;
  let addTitle: ReturnType<typeof jest.spyOn>;
  let addSuite: ReturnType<typeof jest.spyOn>;
  let addTags: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    metadata = new MetadataApplier(new Storage());
    adapter = new CucumberTagAdapter(metadata);
    addQaseId = jest.spyOn(metadata, 'addQaseId');
    addTitle = jest.spyOn(metadata, 'addTitle');
    addSuite = jest.spyOn(metadata, 'addSuite');
    addTags = jest.spyOn(metadata, 'addTags');
  });

  it('skips tags without "="', () => {
    adapter.applyTags([{ name: '@noequals' }]);
    expect(addQaseId).not.toHaveBeenCalled();
    expect(addTitle).not.toHaveBeenCalled();
  });

  it('parses @qaseid=1,2,3 into number array via parseQaseIdsFromString', () => {
    adapter.applyTags([{ name: '@qaseid=1,2,3' }]);
    expect(addQaseId).toHaveBeenCalledWith({ ids: [1, 2, 3] });
  });

  it('is case-insensitive on the tag key', () => {
    adapter.applyTags([{ name: '@QASEID=42' }]);
    expect(addQaseId).toHaveBeenCalledWith({ ids: [42] });
  });

  it('parses @title=...', () => {
    adapter.applyTags([{ name: '@title=Login flow' }]);
    expect(addTitle).toHaveBeenCalledWith({ title: 'Login flow' });
  });

  it('parses @suite=...', () => {
    adapter.applyTags([{ name: '@suite=Smoke' }]);
    expect(addSuite).toHaveBeenCalledWith({ suite: 'Smoke' });
  });

  it('marks the result muted for @QaseMuted', () => {
    const storage = new Storage();
    const t = new TestResultType('t');
    storage.push(t);
    new CucumberTagAdapter(new MetadataApplier(storage)).applyTags([{ name: '@QaseMuted' }]);
    expect(t.muted).toBe(true);
  });

  it('leaves the result unmuted without @QaseMuted', () => {
    const storage = new Storage();
    const t = new TestResultType('t');
    storage.push(t);
    new CucumberTagAdapter(new MetadataApplier(storage)).applyTags([{ name: '@smoke' }, { name: '@qaseid=1' }]);
    expect(t.muted).toBe(false);
  });

  it('parses @tags=a, b , c with whitespace trim', () => {
    adapter.applyTags([{ name: '@tags=a, b , c' }]);
    expect(addTags).toHaveBeenCalledWith({ tags: ['a', 'b', 'c'] });
  });

  describe('full tag set, applied to a real result', () => {
    const apply = (...names: string[]) => {
      const storage = new Storage();
      const result = new TestResultType('scenario');
      storage.push(result);
      new CucumberTagAdapter(new MetadataApplier(storage)).applyTags(names.map((name) => ({ name })));
      return { storage, result };
    };

    it('reads @QaseTitle, @QaseSuite and @QaseTags like cucumberjs', () => {
      const { result } = apply('@QaseTitle=Login_flow', '@QaseSuite=Auth', '@QaseTags=smoke,auth');
      expect(result.title).toBe('Login_flow');
      expect(result.relations?.suite?.data.map((d) => d.title)).toEqual(['Auth']);
      expect(result.tags).toEqual(['smoke', 'auth']);
    });

    it('splits nested suites on a literal \\t, since a tag cannot hold a real tab', () => {
      const { result } = apply('@QaseSuite=Auth\\tLogin\\tHappy');
      expect(result.relations?.suite?.data.map((d) => d.title)).toEqual(['Auth', 'Login', 'Happy']);
    });

    it('reads @QaseFields, @QaseParameters and @QaseGroupParameters as JSON, single quotes allowed', () => {
      const { result } = apply(
        `@QaseFields={'severity':'high'}`,
        '@QaseFields={"priority":"low"}',
        `@QaseParameters={'browser':'chrome'}`,
        `@QaseGroupParameters={'env':'staging'}`,
      );
      expect(result.fields).toEqual({ severity: 'high', priority: 'low' });
      expect(result.params).toEqual({ browser: 'chrome' });
      expect(result.group_params).toEqual({ env: 'staging' });
    });

    it('ignores malformed JSON instead of failing the scenario', () => {
      const { result } = apply('@QaseFields={broken');
      expect(result.fields).toEqual({});
    });

    it('marks the scenario ignored for @QaseIgnore', () => {
      const { storage } = apply('@QaseIgnore');
      expect(storage.ignore).toBe(true);
    });

    it('collects ids from @QaseID, @Q-N and @QN together', () => {
      const { result } = apply('@QaseID=1,2', '@Q-3', '@q4');
      expect(result.testops_id).toEqual([1, 2, 3, 4]);
    });

    it('reads @qaseid.PROJ(ids) into the project mapping', () => {
      const { result } = apply('@qaseid.PROJ1(10,11)', '@qaseid.PROJ2(12)');
      expect(result.testops_project_mapping).toEqual({ PROJ1: [10, 11], PROJ2: [12] });
      expect(result.testops_id).toBeNull();
    });

    it('keeps "=" inside a value', () => {
      const { result } = apply('@Title=a=b');
      expect(result.title).toBe('a=b');
    });

    it('leaves unrelated tags alone', () => {
      const { result } = apply('@smoke', '@wip');
      expect(result.title).toBe('scenario');
      expect(result.testops_id).toBeNull();
      expect(result.tags).toEqual([]);
    });
  });
});
