/* eslint-disable */
import { describe, expect, it } from '@jest/globals';
import { Status } from '@cucumber/cucumber';
import { PickleStep, TestStepFinished, TestStepStarted } from '@cucumber/messages';
import { StepStatusEnum, StepType } from 'qase-javascript-commons';
import { TestCase } from '@cucumber/messages/dist/esm/src/messages';
import { StepConverter } from '../src/modules/stepConverter';

function pickleStep(id: string, text: string): PickleStep {
  return { id, text, astNodeIds: [], type: 'Action' } as unknown as PickleStep;
}

function finished(stepId: string, status: any, durationSec = 1, durationNanos = 0, finishedAtSec = 0, finishedAtNanos = 0): TestStepFinished {
  return {
    testStepId: stepId,
    testCaseStartedId: 'tcs1',
    testStepResult: {
      status,
      duration: { seconds: durationSec, nanos: durationNanos },
    },
    timestamp: { seconds: finishedAtSec, nanos: finishedAtNanos },
  } as unknown as TestStepFinished;
}

function started(stepId: string, startedAtSec = 0, startedAtNanos = 0): TestStepStarted {
  return {
    testStepId: stepId,
    testCaseStartedId: 'tcs1',
    timestamp: { seconds: startedAtSec, nanos: startedAtNanos },
  } as unknown as TestStepStarted;
}

const emptyStarted = new Map<string, TestStepStarted>();

describe('StepConverter', () => {
  it('converts a passed step', () => {
    const pickleSteps = [pickleStep('p-step1', 'Given a thing')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, emptyStarted, finishedMap, () => []);
    expect(out).toHaveLength(1);
    expect(out[0]?.step_type).toBe(StepType.GHERKIN);
    expect(out[0]?.execution.status).toBe(StepStatusEnum.passed);
    expect(out[0]?.execution.duration).toBe(1000);
    expect((out[0]?.data as any).keyword).toBe('Given a thing');
  });

  it('emits start_time/end_time from TestStepStarted/Finished timestamps', () => {
    const pickleSteps = [pickleStep('p-step1', 'Given a thing')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const startedMap = new Map<string, TestStepStarted>([
      ['s1', started('s1', 1_700_000_000, 250_000_000)],
    ]);
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED, 0, 500_000_000, 1_700_000_000, 750_000_000)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, startedMap, finishedMap, () => []);
    expect(out[0]?.execution.start_time).toBeCloseTo(1_700_000_000.25, 6);
    expect(out[0]?.execution.end_time).toBeCloseTo(1_700_000_000.75, 6);
    // duration: 0 sec + 500_000_000 ns = 500 ms
    expect(out[0]?.execution.duration).toBe(500);
  });

  it('leaves start_time null if no TestStepStarted event was recorded', () => {
    const pickleSteps = [pickleStep('p-step1', 'Step')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED, 0, 0, 1_700_000_001, 0)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, emptyStarted, finishedMap, () => []);
    expect(out[0]?.execution.start_time).toBeNull();
    expect(out[0]?.execution.end_time).toBe(1_700_000_001);
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

    const out = StepConverter.convert(pickleSteps, tc, emptyStarted, finishedMap, () => []);
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

    const out = StepConverter.convert(pickleSteps, tc, emptyStarted, finishedMap, () => []);
    expect(out).toHaveLength(0);
  });

  it('attaches step attachments via lookup', () => {
    const pickleSteps = [pickleStep('p-step1', 'Step')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.PASSED)],
    ]);
    const attach = { file_name: 'log.txt', mime_type: 'text/plain', content: 'x', file_path: null, size: 0, id: 'a1' };

    const out = StepConverter.convert(pickleSteps, tc, emptyStarted, finishedMap, (id) => id === 's1' ? [attach] : []);
    expect(out[0]?.attachments).toEqual([attach]);
  });

  it('maps FAILED to StepStatusEnum.failed', () => {
    const pickleSteps = [pickleStep('p-step1', 'Step')];
    const tc = { id: 'tc1', testSteps: [{ id: 's1', pickleStepId: 'p-step1' }] } as unknown as TestCase;
    const finishedMap = new Map<string, TestStepFinished>([
      ['s1', finished('s1', Status.FAILED)],
    ]);

    const out = StepConverter.convert(pickleSteps, tc, emptyStarted, finishedMap, () => []);
    expect(out[0]?.execution.status).toBe(StepStatusEnum.failed);
  });
});
