/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { TestCase, TestStep } from '@playwright/test/reporter';
import { Attachment } from 'qase-javascript-commons';
import { StepIndex } from '../src/step-index';

describe('StepIndex', () => {
  let stepIndex: StepIndex;

  beforeEach(() => {
    stepIndex = new StepIndex();
  });

  function makeStep(title: string, parent?: TestStep): TestStep {
    return { title, parent } as unknown as TestStep;
  }

  function makeAttachment(name: string): Attachment {
    return { file_name: name, mime_type: 'text/plain', content: '', file_path: null, size: 0, id: name } as Attachment;
  }

  it('cacheStep stores a step→test mapping', () => {
    const step = makeStep('s');
    const test = {} as TestCase;
    stepIndex.cacheStep(step, test);
    expect(stepIndex.hasStepCached(step)).toBe(true);
  });

  it('hasStepCached returns false for an uncached step', () => {
    expect(stepIndex.hasStepCached(makeStep('x'))).toBe(false);
  });

  it('findStepByTitle locates a cached step by exact title', () => {
    const a = makeStep('aaa');
    const b = makeStep('bbb');
    stepIndex.cacheStep(a, {} as TestCase);
    stepIndex.cacheStep(b, {} as TestCase);
    expect(stepIndex.findStepByTitle('bbb')).toBe(b);
    expect(stepIndex.findStepByTitle('not-there')).toBeUndefined();
  });

  it('removeStep evicts a cached entry', () => {
    const step = makeStep('x');
    stepIndex.cacheStep(step, {} as TestCase);
    stepIndex.removeStep(step);
    expect(stepIndex.hasStepCached(step)).toBe(false);
    expect(stepIndex.findStepByTitle('x')).toBeUndefined();
  });

  it('addAttachmentToStep accumulates multiple attachments under the same parent', () => {
    const parent = makeStep('parent');
    const a1 = makeAttachment('a.txt');
    const a2 = makeAttachment('b.txt');
    stepIndex.addAttachmentToStep(parent, a1);
    stepIndex.addAttachmentToStep(parent, a2);
    expect(stepIndex.getStepAttachments(parent)).toEqual([a1, a2]);
  });

  it('getStepAttachments returns undefined when none recorded', () => {
    expect(stepIndex.getStepAttachments(makeStep('p'))).toBeUndefined();
  });

  it('attachments tracking is independent from step caching', () => {
    const cached = makeStep('cached');
    const attaches = makeStep('attaches');
    stepIndex.cacheStep(cached, {} as TestCase);
    stepIndex.addAttachmentToStep(attaches, makeAttachment('x'));
    expect(stepIndex.hasStepCached(cached)).toBe(true);
    expect(stepIndex.hasStepCached(attaches)).toBe(false);
    expect(stepIndex.getStepAttachments(attaches)).toHaveLength(1);
  });
});
