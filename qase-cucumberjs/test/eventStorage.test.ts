/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { GherkinDocument, Pickle, TestCaseStarted, TestStepFinished } from '@cucumber/messages';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { EventStorage } from '../src/modules/eventStorage';

describe('EventStorage', () => {
  let storage: EventStorage;

  beforeEach(() => {
    storage = new EventStorage();
  });

  it('addPickle / getPickle round-trip', () => {
    const pickle = { id: 'p1', name: 'pickle one', tags: [], steps: [], astNodeIds: [], uri: 'features/x.feature', language: 'en' } as unknown as Pickle;
    storage.addPickle(pickle);
    expect(storage.getPickle('p1')).toBe(pickle);
    expect(storage.getPickle('missing')).toBeUndefined();
  });

  it('addTestCase / getTestCase round-trip', () => {
    const tc = { id: 'tc1', pickleId: 'p1', testSteps: [] } as unknown as TestCase;
    storage.addTestCase(tc);
    expect(storage.getTestCase('tc1')).toBe(tc);
  });

  it('addTestCaseStarted / getTestCaseStarted round-trip', () => {
    const tcs = { id: 'tcs1', testCaseId: 'tc1', timestamp: { seconds: 1, nanos: 0 } } as unknown as TestCaseStarted;
    storage.addTestCaseStarted(tcs);
    expect(storage.getTestCaseStarted('tcs1')).toBe(tcs);
  });

  it('addScenario extracts feature name and example parameters', () => {
    const doc = {
      feature: {
        name: 'Feature A',
        children: [{
          scenario: {
            id: 'sc1',
            examples: [{
              tableHeader: { cells: [{ value: 'env' }, { value: 'region' }] },
              tableBody: [
                { id: 'row1', cells: [{ value: 'prod' }, { value: 'eu' }] },
              ],
            }],
          },
        }],
      },
    } as unknown as GherkinDocument;
    storage.addScenario(doc);
    const sc = storage.getScenario('sc1');
    expect(sc).toBeDefined();
    expect(sc?.name).toBe('Feature A');
    expect(sc?.parameters).toEqual({ row1: { env: 'prod', region: 'eu' } });
  });

  it('addAttachment keys both testStepId and testCaseStartedId', () => {
    storage.addAttachment({
      testStepId: 'step1',
      mediaType: 'image/png',
      body: 'data',
      contentEncoding: 'BASE64',
    } as any);
    storage.addAttachment({
      testCaseStartedId: 'tcs1',
      mediaType: 'text/plain',
      body: 'log',
      contentEncoding: 'IDENTITY',
    } as any);

    expect(storage.getAttachments('step1')).toHaveLength(1);
    expect(storage.getAttachments('step1')[0]?.mime_type).toBe('image/png');
    expect(storage.getAttachments('tcs1')).toHaveLength(1);
    expect(storage.getAttachments('tcs1')[0]?.mime_type).toBe('text/plain');
    expect(storage.getAttachments('missing')).toEqual([]);
  });

  it('addTestStepFinished / getTestStepFinished round-trip', () => {
    const finished = { testStepId: 's1', testCaseStartedId: 'tcs1', testStepResult: { status: 'PASSED', duration: { seconds: 0, nanos: 0 } } } as unknown as TestStepFinished;
    storage.addTestStepFinished(finished);
    expect(storage.getTestStepFinished('s1')).toBe(finished);
  });
});
