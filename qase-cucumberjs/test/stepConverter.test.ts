/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { Status } from '@cucumber/cucumber';
import { PickleStep, TestStepFinished } from '@cucumber/messages';
import { StepStatusEnum, StepType } from 'qase-javascript-commons';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { StepConverter } from '../src/modules/stepConverter';

function pickleStep(id: string, text: string): PickleStep {
  return { id, text, astNodeIds: [], type: 'Action' } as unknown as PickleStep;
}

function finished(stepId: string, status: any, durationSec = 1): TestStepFinished {
  return {
    testStepId: stepId,
    testCaseStartedId: 'tcs1',
    testStepResult: {
      status,
      duration: { seconds: durationSec, nanos: 0 },
    },
  } as unknown as TestStepFinished;
}

describe('StepConverter', () => {
  it('converts a passed step', () => {
    const pickleSteps = [pickleStep('p-step1', 'Given a thing')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, finishedMap, () => []);
    expect(out).toHaveLength(1);
    expect(out[0]?.step_type).toBe(StepType.GHERKIN);
    expect(out[0]?.execution.status).toBe(StepStatusEnum.passed);
    expect(out[0]?.execution.duration).toBe(1000);
    expect((out[0]?.data as any).keyword).toBe('Given a thing');
  });

  it('skips test steps with no finished entry', () => {
    const pickleSteps = [pickleStep('p-step1', 'Given a thing'), pickleStep('p-step2', 'Then it works')];
    const tc = {
      id: 'tc1',
      testSteps: [{ id: 's1', pickleStepId: 'p-step1' }, { id: 's2', pickleStepId: 'p-step2' }],
    } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, finishedMap, () => []);
    expect(out).toHaveLength(1);
  });

  it('skips test steps whose pickleStepId is not found in pickle.steps', () => {
    const pickleSteps = [pickleStep('p-step1', 'Given a thing')];
    const tc = {
      id: 'tc1',
      testSteps: [{ id: 's1', pickleStepId: 'non-existent' }],
    } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, finishedMap, () => []);
    expect(out).toHaveLength(0);
  });

  it('attaches step attachments via lookup', () => {
    const pickleSteps = [pickleStep('p-step1', 'Step')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED)],
    ]);
    const attach = { file_name: 'log.txt', mime_type: 'text/plain', content: 'x', file_path: null, size: 0, id: 'a1' };

    const out = StepConverter.convert(pickleSteps, tc, finishedMap, (id) => id === 's1' ? [attach] : []);
    expect(out[0]?.attachments).toEqual([attach]);
  });

  it('maps FAILED to StepStatusEnum.failed', () => {
    const pickleSteps = [pickleStep('p-step1', 'Step')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.FAILED)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, finishedMap, () => []);
    expect(out[0]?.execution.status).toBe(StepStatusEnum.failed);
  });
});
