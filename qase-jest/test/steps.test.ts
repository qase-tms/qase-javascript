/* eslint-disable */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { qase } from '../src/jest';
import { MetadataApplier } from '../src/modules/metadataApplier';

jest.mock('../src/metadataChannel', () => {
  const writer = {
    step: jest.fn(),
    attachment: jest.fn(),
  };
  return { MetadataWriter: jest.fn(() => writer), writer };
});

const writer = jest.requireMock<{ writer: Record<string, jest.Mock> }>('../src/metadataChannel').writer;

const actions = (steps: any[]): any[] =>
  steps.map((s) => (s.steps.length ? { [s.data.action]: actions(s.steps) } : s.data.action));

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe('qase.step nesting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('nests a step called inside another step under its parent', async () => {
    await qase.step('parent', async () => {
      await qase.step('child 1', async () => {
        await qase.step('grandchild', () => undefined);
      });
      await qase.step('child 2', () => undefined);
    });
    await qase.step('sibling', () => undefined);

    const steps = writer.step!.mock.calls.map((c) => c[0]);
    expect(actions(steps)).toEqual([
      { parent: [{ 'child 1': ['grandchild'] }, 'child 2'] },
      'sibling',
    ]);
  });

  it('keeps steps run in parallel in start order', async () => {
    await qase.step('parent', async () => {
      await Promise.all([
        qase.step('slow', async () => {
          await tick();
        }),
        qase.step('fast', () => undefined),
      ]);
    });

    const steps = writer.step!.mock.calls.map((c) => c[0]);
    expect(actions(steps)).toEqual([{ parent: ['slow', 'fast'] }]);
  });

  it('records a failed nested step under its parent and rethrows', async () => {
    await expect(
      qase.step('parent', async () => {
        await qase.step('child', () => {
          throw new Error('boom');
        });
      }),
    ).rejects.toThrow('boom');

    const [parent] = writer.step!.mock.calls.map((c) => c[0]);
    expect(parent.execution.status).toBe('failed');
    expect(parent.steps[0].data.action).toBe('child');
    expect(parent.steps[0].execution.status).toBe('failed');
  });

  it('cleans expected result and data of nested steps', async () => {
    await qase.step('parent', async () => {
      await qase.step('child', () => undefined, 'it works', 'input');
    });

    const applier = new MetadataApplier();
    applier.applyStep(writer.step!.mock.calls[0]![0]);
    const [parent] = applier.get().steps as any[];
    expect(parent.steps[0].data).toEqual({ action: 'child', expected_result: 'it works', data: 'input' });
  });

  it('attaches to the current step instead of the test', async () => {
    await qase.step('parent', async () => {
      await qase.step('child', () => {
        qase.attach({ name: 'inner.txt', content: 'inner', contentType: 'text/plain' });
      });
      qase.attach({ name: 'outer.txt', content: 'outer' });
    });
    qase.attach({ name: 'test.txt', content: 'test' });

    const [parent] = writer.step!.mock.calls.map((c) => c[0]);
    expect(parent.attachments.map((a: any) => a.file_name)).toEqual(['outer.txt']);
    expect(parent.steps[0].attachments.map((a: any) => a.file_name)).toEqual(['inner.txt']);
    expect(writer.attachment!.mock.calls.map((c) => c[0].file_name)).toEqual(['test.txt']);
  });
});
