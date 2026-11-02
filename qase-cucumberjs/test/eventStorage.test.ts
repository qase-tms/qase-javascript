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

  it('addAttachment keys step attachments by attempt and step, test attachments by attempt', () => {
    storage.addAttachment({
      testCaseStartedId: 'tcs1',
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

    expect(storage.getStepAttachments('tcs1', 'step1')).toHaveLength(1);
    expect(storage.getStepAttachments('tcs1', 'step1')[0]?.mime_type).toBe('image/png');
    expect(storage.getAttachments('tcs1')).toHaveLength(1);
    expect(storage.getAttachments('tcs1')[0]?.mime_type).toBe('text/plain');
    expect(storage.getAttachments('missing')).toEqual([]);
  });

  it('addTestStepFinished / getTestStepFinished round-trip', () => {
    const finished = { testStepId: 's1', testCaseStartedId: 'tcs1', testStepResult: { status: 'PASSED', duration: { seconds: 0, nanos: 0 } } } as unknown as TestStepFinished;
    storage.addTestStepFinished(finished);
    expect(storage.getTestStepFinished('s1')).toBe(finished);
  });

  it('addScenario keeps the keyword of background, scenario and Rule steps', () => {
    const doc = {
      feature: {
        name: 'F',
        children: [
          { background: { steps: [{ id: 'b1', keyword: 'Given ' }] } },
          { scenario: { id: 'sc', steps: [{ id: 's1', keyword: 'When ' }], examples: [] } },
          { rule: { id: 'r', children: [
            { background: { steps: [{ id: 'rb1', keyword: 'And ' }] } },
            { scenario: { id: 'rsc', steps: [{ id: 'rs1', keyword: 'Then ' }], examples: [] } },
          ] } },
        ],
      },
    } as unknown as GherkinDocument;
    storage.addScenario(doc);
    expect(['b1', 's1', 'rb1', 'rs1'].map((id) => storage.getStepKeyword(id))).toEqual(['Given', 'When', 'And', 'Then']);
  });

  it('addScenario finds scenarios nested in a Rule', () => {
    const doc = {
      feature: {
        name: 'Feature R',
        children: [{
          rule: {
            id: 'rule1',
            children: [{
              scenario: {
                id: 'sc-r',
                steps: [],
                examples: [{
                  tableHeader: { cells: [{ value: 'v' }] },
                  tableBody: [{ id: 'row-r', cells: [{ value: '1' }] }],
                }],
              },
            }],
          },
        }],
      },
    } as unknown as GherkinDocument;
    storage.addScenario(doc);
    const sc = storage.getScenario('sc-r');
    expect(sc?.name).toBe('Feature R');
    expect(sc?.parameters).toEqual({ 'row-r': { v: '1' } });
  });

  it('attachment with a testStepId is kept on the step only, per attempt', () => {
    storage.addAttachment({ testCaseStartedId: 'tcs1', testStepId: 'step1', mediaType: 'text/plain', body: 'a' } as any);
    storage.addAttachment({ testCaseStartedId: 'tcs2', testStepId: 'step1', mediaType: 'text/plain', body: 'b' } as any);
    expect(storage.getAttachments('tcs1')).toEqual([]);
    expect(storage.getStepAttachments('tcs1', 'step1').map((a) => a.content)).toEqual(['a']);
    expect(storage.getStepAttachments('tcs2', 'step1').map((a) => a.content)).toEqual(['b']);
  });
});
