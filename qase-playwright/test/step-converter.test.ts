/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { TestStep } from '@playwright/test/reporter';
import { StepStatusEnum, StepType } from 'qase-javascript-commons';
import { StepConverter } from '../src/step-converter';
import { StepIndex } from '../src/step-index';

function makeStep(partial: Partial<TestStep> & { title: string }): TestStep {
  return {
    category: 'test.step',
    startTime: new Date(0),
    duration: 0,
    steps: [],
    error: undefined,
    ...partial,
  } as unknown as TestStep;
}

describe('StepConverter', () => {
  let stepIndex: StepIndex;
  let converter: StepConverter;

  beforeEach(() => {
    stepIndex = new StepIndex();
    converter = new StepConverter(stepIndex);
  });

  it('returns an empty array when there are no steps', () => {
    expect(converter.transform([], null)).toEqual([]);
  });

  it('skips steps that are not test.step or hook', () => {
    const step = makeStep({ title: 'noise', category: 'pw:api' as any });
    expect(converter.transform([step], null)).toEqual([]);
  });

  it('skips step_attach_* sentinel titles', () => {
    const step = makeStep({ title: 'step_attach_body_12345678-1234-1234-1234-123456789012_inline.txt' });
    expect(converter.transform([step], null)).toEqual([]);
  });

  it('skips defaultSteps when their children are leaf categories only', () => {
    const step = makeStep({ title: 'Before Hooks', steps: [] });
    expect(converter.transform([step], null)).toEqual([]);
  });

  it('keeps defaultSteps that have non-leaf children', () => {
    const child = makeStep({ title: 'inner-test-step', category: 'test.step' as any });
    const step = makeStep({ title: 'Before Hooks', steps: [child] });
    const result = converter.transform([step], null);
    expect(result).toHaveLength(1);
    expect(result[0]?.steps).toHaveLength(1);
    expect(result[0]?.steps[0]?.data.action).toBe('inner-test-step');
  });

  it('maps a leaf test.step with its title, status and timing', () => {
    const step = makeStep({ title: 'click button', startTime: new Date(1000), duration: 5 });
    const result = converter.transform([step], 'parent-id');
    expect(result).toHaveLength(1);
    expect(result[0]?.step_type).toBe(StepType.TEXT);
    expect(result[0]?.parent_id).toBe('parent-id');
    expect(result[0]?.execution.status).toBe(StepStatusEnum.passed);
    expect(result[0]?.execution.start_time).toBe(1);
    expect(result[0]?.execution.end_time).toBe(1.005);
    expect(result[0]?.execution.duration).toBe(5);
    expect(result[0]?.data.action).toBe('click button');
  });

  it('marks a step as failed when it has an error', () => {
    const step = makeStep({ title: 'oops', error: { message: 'boom' } as any });
    const result = converter.transform([step], null);
    expect(result[0]?.execution.status).toBe(StepStatusEnum.failed);
  });

  it('attaches stepIndex.getStepAttachments to the matching step', () => {
    const step = makeStep({ title: 's' });
    stepIndex.addAttachmentToStep(step, { file_name: 'x.txt', mime_type: 'text/plain', content: '', file_path: null, size: 0, id: 'a1' } as any);
    const result = converter.transform([step], null);
    expect(result[0]?.attachments).toHaveLength(1);
    expect(result[0]?.attachments[0]?.file_name).toBe('x.txt');
  });
});
