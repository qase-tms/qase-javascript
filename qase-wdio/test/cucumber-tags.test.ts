/* eslint-disable */
import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { CucumberTagAdapter } from '../src/cucumber-tags';
import { MetadataApplier } from '../src/metadata';
import { Storage } from '../src/storage';

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

  it('parses @tags=a, b , c with whitespace trim', () => {
    adapter.applyTags([{ name: '@tags=a, b , c' }]);
    expect(addTags).toHaveBeenCalledWith({ tags: ['a', 'b', 'c'] });
  });
});
