import { expect } from '@jest/globals';
import { Metadata } from '../src/models';
import { StepType, StepStatusEnum } from 'qase-javascript-commons';

describe('Metadata', () => {
  it('should allow creating a valid metadata object', () => {
    const metadata: Metadata = {
      title: 'Test Title',
      ignore: false,
      comment: 'Test Comment',
      suite: 'Test Suite',
      fields: { field1: 'value1' },
      parameters: { param1: 'value1' },
      groupParams: { group1: 'value1' },
      steps: [{ 
        id: 'step1',
        step_type: StepType.TEXT,
        data: { action: 'Test action', expected_result: null, data: null },
        parent_id: null,
        execution: { status: StepStatusEnum.passed, start_time: null, end_time: null, duration: null },
        attachments: [],
        steps: []
      }],
      attachments: [{ 
        file_name: 'file.txt', 
        content: 'content',
        mime_type: 'text/plain',
        file_path: null,
        size: 7,
        id: 'test-id'
      }],
    };

    expect(metadata.title).toBe('Test Title');
    expect(metadata.ignore).toBe(false);
    expect(metadata.comment).toBe('Test Comment');
    expect(metadata.suite).toBe('Test Suite');
    expect(metadata.fields).toEqual({ field1: 'value1' });
    expect(metadata.parameters).toEqual({ param1: 'value1' });
    expect(metadata.groupParams).toEqual({ group1: 'value1' });
    expect(metadata.steps).toHaveLength(1);
    expect(metadata.attachments).toHaveLength(1);
  });

  it('should allow undefined values for optional fields', () => {
    const metadata: Metadata = {
      title: undefined,
      ignore: false,
      comment: undefined,
      suite: undefined,
      fields: {},
      parameters: {},
      groupParams: {},
      steps: [],
      attachments: [],
    };

    expect(metadata.title).toBeUndefined();
    expect(metadata.comment).toBeUndefined();
    expect(metadata.suite).toBeUndefined();
  });

  it('should allow empty arrays and objects', () => {
    const metadata: Metadata = {
      title: undefined,
      ignore: false,
      comment: undefined,
      suite: undefined,
      fields: {},
      parameters: {},
      groupParams: {},
      steps: [],
      attachments: [],
    };

    expect(metadata.fields).toEqual({});
    expect(metadata.parameters).toEqual({});
    expect(metadata.groupParams).toEqual({});
    expect(metadata.steps).toEqual([]);
    expect(metadata.attachments).toEqual([]);
  });
}); 
