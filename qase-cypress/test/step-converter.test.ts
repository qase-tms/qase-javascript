/* eslint-disable */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { StepConverter } from '../src/step-converter';
import { StepStatusEnum } from 'qase-javascript-commons';
import type { StepEnd, StepStart } from '../src/metadata/models';

describe('StepConverter', () => {
  let converter: StepConverter;

  beforeEach(() => {
    converter = new StepConverter();
  });

  describe('convertCypressMessages', () => {
    it('returns an empty array for empty input', () => {
      expect(converter.convertCypressMessages([], 'passed')).toEqual([]);
    });

    it('maps each StepStart to a passed TextStep with id, action, start_time', () => {
      const messages: StepStart[] = [
        { id: 's1', name: 'click', timestamp: 100 } as StepStart,
        { id: 's2', name: 'verify', timestamp: 200 } as StepStart,
      ];
      const result = converter.convertCypressMessages(messages, 'passed');
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('s1');
      expect(result[0]?.data.action).toBe('click');
      expect(result[0]?.execution.status).toBe(StepStatusEnum.passed);
      // timestamps are stored as ms-since-epoch in metadata; converter emits Unix seconds.
      expect(result[0]?.execution.start_time).toBe(0.1);
    });

    it('marks the LAST step failed when test status is not passed', () => {
      const messages: StepStart[] = [
        { id: 's1', name: 'a', timestamp: 100 } as StepStart,
        { id: 's2', name: 'b', timestamp: 200 } as StepStart,
      ];
      const result = converter.convertCypressMessages(messages, 'failed');
      expect(result[0]?.execution.status).toBe(StepStatusEnum.passed);
      expect(result[1]?.execution.status).toBe(StepStatusEnum.failed);
    });
  });

  describe('getSteps', () => {
    it('returns an empty array when no messages are provided', () => {
      expect(converter.getSteps([], {})).toEqual([]);
    });

    it('builds a flat list when no parent_id is set', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 's1', name: 'a', timestamp: 100 } as StepStart,
        { id: 's1', timestamp: 200, status: 'passed' } as StepEnd,
      ];
      const result = converter.getSteps(messages, {});
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('s1');
      expect(result[0]?.execution.status).toBe(StepStatusEnum.passed);
      // start/end emitted in Unix seconds; duration in ms (end_ms - start_ms).
      expect(result[0]?.execution.start_time).toBe(0.1);
      expect(result[0]?.execution.end_time).toBe(0.2);
      expect(result[0]?.execution.duration).toBe(100);
    });

    it('leaves end_time null when no StepEnd arrives for a step', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 's1', name: 'orphan-start', timestamp: 100 } as StepStart,
      ];
      const result = converter.getSteps(messages, {});
      expect(result[0]?.execution.start_time).toBe(0.1);
      expect(result[0]?.execution.end_time).toBeNull();
      expect(result[0]?.execution.status).toBe(StepStatusEnum.failed);
    });

    it('nests a child under its parent via parentId', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 'p', name: 'parent', timestamp: 100 } as StepStart,
        { id: 'c', name: 'child', timestamp: 110, parentId: 'p' } as StepStart,
        { id: 'c', timestamp: 120, status: 'passed' } as StepEnd,
        { id: 'p', timestamp: 130, status: 'passed' } as StepEnd,
      ];
      const result = converter.getSteps(messages, {});
      expect(result).toHaveLength(1);
      expect(result[0]?.steps).toHaveLength(1);
      expect(result[0]?.steps[0]?.id).toBe('c');
      expect(result[0]?.steps[0]?.parent_id).toBe('p');
    });

    it('starts every step as failed; StepEnd updates status', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 's', name: 'a', timestamp: 100 } as StepStart,
        { id: 's', timestamp: 200, status: 'failed' } as StepEnd,
      ];
      const result = converter.getSteps(messages, {});
      expect(result[0]?.execution.status).toBe(StepStatusEnum.failed);
    });

    it('attaches per-step attachments by step id', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 's1', name: 'a', timestamp: 100 } as StepStart,
      ];
      const attachments = {
        s1: [{ file_name: 'x.png', mime_type: 'image/png', content: '', file_path: null, size: 0, id: 'a1' } as any],
      };
      const result = converter.getSteps(messages, attachments);
      expect(result[0]?.attachments).toHaveLength(1);
      expect(result[0]?.attachments[0]?.file_name).toBe('x.png');
    });

    it('sorts messages by timestamp before processing', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 'b', name: 'second', timestamp: 200 } as StepStart,
        { id: 'a', name: 'first', timestamp: 100 } as StepStart,
      ];
      const result = converter.getSteps(messages, {});
      expect(result[0]?.id).toBe('a');
      expect(result[1]?.id).toBe('b');
    });

    it('keeps a child as a top-level step when parent is missing from the message stream', () => {
      const messages: (StepStart | StepEnd)[] = [
        { id: 'orphan', name: 'lonely', timestamp: 100, parentId: 'missing-parent' } as StepStart,
      ];
      const result = converter.getSteps(messages, {});
      expect(result).toHaveLength(1);
      expect(result[0]?.parent_id).toBe('missing-parent');
    });
  });
});
