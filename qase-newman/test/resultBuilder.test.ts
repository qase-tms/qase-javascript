/* eslint-disable */
import { describe, it, expect } from '@jest/globals';
import { ResultBuilder } from '../src/modules/resultBuilder';

const mkItem = (overrides: any = {}) => ({
  id: 'item-1',
  name: 'Sample Item',
  ...overrides,
}) as any;

describe('ResultBuilder.buildPending', () => {
  it('returns a TestResultType with default execution shape', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: [],
      ids: [],
      projectMapping: {},
      signature: 'sig-1',
    });
    expect(result.execution.status).toBe('passed');
    expect(result.execution.start_time).toBeNull();
    expect(result.execution.end_time).toBeNull();
    expect(result.execution.duration).toBe(0);
    expect(result.execution.stacktrace).toBeNull();
    expect(result.execution.thread).toBeNull();
    expect(result.id).toBe('item-1');
    expect(result.title).toBe('Sample Item');
    expect(result.signature).toBe('sig-1');
    expect(result.attachments).toEqual([]);
    expect(result.steps).toEqual([]);
    expect(result.fields).toEqual({});
    expect(result.params).toEqual({});
    expect(result.group_params).toEqual({});
  });

  it('sets relations from suites array', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: ['Folder A', 'Folder B'],
      ids: [],
      projectMapping: {},
      signature: 'sig-2',
    });
    expect(result.relations).toEqual({
      suite: {
        data: [
          { title: 'Folder A', public_id: null },
          { title: 'Folder B', public_id: null },
        ],
      },
    });
  });

  it('leaves relations null for empty suites', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: [],
      ids: [],
      projectMapping: {},
      signature: 'sig-3',
    });
    expect(result.relations).toBeNull();
  });

  it('sets testops_id to ids array when ids non-empty', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: [],
      ids: [42, 100],
      projectMapping: {},
      signature: 'sig-4',
    });
    expect(result.testops_id).toEqual([42, 100]);
  });

  it('leaves testops_id null when no ids', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: [],
      ids: [],
      projectMapping: {},
      signature: 'sig-5',
    });
    expect(result.testops_id).toBeNull();
  });

  it('sets testops_project_mapping when projectMapping non-empty', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: [],
      ids: [],
      projectMapping: { PROJ: [7] },
      signature: 'sig-6',
    });
    expect(result.testops_project_mapping).toEqual({ PROJ: [7] });
  });

  it('leaves testops_project_mapping null when projectMapping empty', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem(),
      suites: [],
      ids: [],
      projectMapping: {},
      signature: 'sig-7',
    });
    expect(result.testops_project_mapping).toBeNull();
  });

  it('preserves item.id and item.name', () => {
    const result = ResultBuilder.buildPending({
      item: mkItem({ id: 'abc-123', name: 'Custom Title' }),
      suites: [],
      ids: [],
      projectMapping: {},
      signature: 'sig-8',
    });
    expect(result.id).toBe('abc-123');
    expect(result.title).toBe('Custom Title');
  });
});
