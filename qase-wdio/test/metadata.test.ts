/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { TestResultType } from 'qase-javascript-commons';
import { Storage } from '../src/storage';
import { MetadataApplier } from '../src/metadata';

describe('MetadataApplier', () => {
  let storage: Storage;
  let metadata: MetadataApplier;

  beforeEach(() => {
    storage = new Storage();
    metadata = new MetadataApplier(storage);
  });

  function withTest(): TestResultType {
    const t = new TestResultType('t');
    t.id = 'test-id';
    storage.push(t);
    return t;
  }

  describe('addQaseId', () => {
    it('is a no-op when there is no current test', () => {
      expect(() => metadata.addQaseId({ ids: [1] })).not.toThrow();
    });

    it('sets testops_id on the current test', () => {
      const t = withTest();
      metadata.addQaseId({ ids: [1, 2] });
      expect(t.testops_id).toEqual([1, 2]);
    });
  });

  describe('addTitle', () => {
    it('is a no-op when there is no current test', () => {
      expect(() => metadata.addTitle({ title: 'x' })).not.toThrow();
    });

    it('overwrites the title of the current test', () => {
      const t = withTest();
      metadata.addTitle({ title: 'new title' });
      expect(t.title).toBe('new title');
    });
  });

  describe('addComment', () => {
    it('writes to storage.comment regardless of active test', () => {
      metadata.addComment({ comment: 'hi' });
      expect(storage.comment).toBe('hi');
    });
  });

  describe('addSuite', () => {
    it('is a no-op when there is no current test', () => {
      expect(() => metadata.addSuite({ suite: 'S' })).not.toThrow();
    });

    it('sets relations.suite on the current test', () => {
      const t = withTest();
      metadata.addSuite({ suite: 'My Suite' });
      expect(t.relations).toEqual({
        suite: { data: [{ title: 'My Suite', public_id: null }] },
      });
    });
  });

  describe('addParameters', () => {
    it('coerces values to string and assigns to params', () => {
      const t = withTest();
      metadata.addParameters({ records: { browser: 'chrome', count: 3 as unknown as string } });
      expect(t.params).toEqual({ browser: 'chrome', count: '3' });
    });
  });

  describe('addGroupParameters', () => {
    it('coerces values to string and assigns to group_params', () => {
      const t = withTest();
      metadata.addGroupParameters({ records: { region: 'eu' } });
      expect(t.group_params).toEqual({ region: 'eu' });
    });
  });

  describe('addFields', () => {
    it('assigns records to fields (raw, not coerced — matches original behavior)', () => {
      const t = withTest();
      metadata.addFields({ records: { layer: 'api' } });
      expect(t.fields).toEqual({ layer: 'api' });
    });
  });

  describe('addTags', () => {
    it('appends to existing tags', () => {
      const t = withTest();
      t.tags = ['existing'];
      metadata.addTags({ tags: ['a', 'b'] });
      expect(t.tags).toEqual(['existing', 'a', 'b']);
    });
  });

  describe('addAttachment', () => {
    it('attaches each path with derived mime type', () => {
      const t = withTest();
      metadata.addAttachment({ paths: ['/tmp/screenshot.png'] });
      expect(t.attachments).toHaveLength(1);
      expect(t.attachments[0]?.file_name).toBe('screenshot.png');
      expect(t.attachments[0]?.file_path).toBe('/tmp/screenshot.png');
    });

    it('attaches inline content with default mime type', () => {
      const t = withTest();
      metadata.addAttachment({ content: 'data', name: 'inline.txt' });
      expect(t.attachments[0]?.file_name).toBe('inline.txt');
      expect(t.attachments[0]?.mime_type).toBe('application/octet-stream');
      expect(t.attachments[0]?.content).toBe('data');
    });
  });

  describe('ignore', () => {
    it('flips storage.ignore when there is a current test', () => {
      withTest();
      metadata.ignore();
      expect(storage.ignore).toBe(true);
    });

    it('does nothing without a current test', () => {
      metadata.ignore();
      expect(storage.ignore).toBe(false);
    });
  });

  describe('addStep', () => {
    it('appends step to the last item (a test, when no step is active)', () => {
      const t = withTest();
      const step = { id: 's', step_type: 'text', data: { action: 'do', expected_result: null, data: null }, parent_id: null, execution: { start_time: 0, end_time: 0, status: 'passed', duration: null }, steps: [], attachments: [] };
      metadata.addStep(step as any);
      expect(t.steps).toHaveLength(1);
    });
  });
});
