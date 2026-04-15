/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/require-await */
import { expect } from '@jest/globals';
import { ReportSerializer } from '../../src/formatter/report-serializer';
import {
  Attachment,
  StepStatusEnum,
  StepType,
  TestResultType,
  TestStatusEnum,
  TestStepType,
} from '../../src/models';

const attachment = (id: string, fileName: string): Attachment =>
  ({
    id,
    file_name: fileName,
    mime_type: 'text/plain',
    file_path: `/tmp/${fileName}`,
    size: 42,
    content: 'x',
  }) as unknown as Attachment;

const textStep = (id: string, action: string): TestStepType =>
  ({
    id,
    step_type: StepType.TEXT,
    data: { action, expected_result: 'ok', data: 'raw-input' },
    parent_id: null,
    execution: { status: StepStatusEnum.passed, duration: 5, start_time: 1 } as any,
    steps: [],
    attachments: [attachment(`${id}-att`, `${id}.txt`)],
  }) as unknown as TestStepType;

const gherkinStep = (id: string, keyword: string, name: string): TestStepType =>
  ({
    id,
    step_type: StepType.GHERKIN,
    data: { keyword, name },
    parent_id: null,
    execution: { status: StepStatusEnum.passed, duration: 5, start_time: 1 } as any,
    steps: [],
    attachments: [],
  }) as unknown as TestStepType;

const baseResult = (overrides: Partial<TestResultType>): TestResultType =>
  ({
    id: 'res-1',
    title: 'Test',
    signature: 'sig',
    execution: { status: TestStatusEnum.passed, duration: 10 } as any,
    fields: {},
    attachments: [],
    steps: [],
    params: {},
    group_params: {},
    testops_id: null,
    relations: null,
    muted: false,
    message: '',
    tags: [],
    ...overrides,
  }) as unknown as TestResultType;

describe('ReportSerializer.serializeResult', () => {
  const s = new ReportSerializer();

  it('transforms scalar testops_id → testops_ids array', () => {
    const out = s.serializeResult(baseResult({ testops_id: 42 as any }));
    expect(out.testops_ids).toEqual([42]);
    expect(out).not.toHaveProperty('testops_id');
  });

  it('keeps array testops_id as-is under testops_ids', () => {
    const out = s.serializeResult(baseResult({ testops_id: [1, 2, 3] as any }));
    expect(out.testops_ids).toEqual([1, 2, 3]);
  });

  it('maps null testops_id to null testops_ids', () => {
    const out = s.serializeResult(baseResult({ testops_id: null as any }));
    expect(out.testops_ids).toBeNull();
  });

  it('transforms group_params map into param_groups array of keys', () => {
    const out = s.serializeResult(baseResult({ group_params: { a: '1', b: '2' } }));
    expect(out.param_groups).toEqual([['a', 'b']]);
  });

  it('emits empty param_groups when group_params is empty', () => {
    const out = s.serializeResult(baseResult({ group_params: {} }));
    expect(out.param_groups).toEqual([]);
  });

  it('serializes attachments without size and content fields', () => {
    const out = s.serializeResult(
      baseResult({ attachments: [attachment('a1', 'a1.txt')] }),
    );
    expect(out.attachments).toEqual([
      {
        id: 'a1',
        file_name: 'a1.txt',
        mime_type: 'text/plain',
        file_path: '/tmp/a1.txt',
      },
    ]);
  });

  it('excludes internal fields', () => {
    const out = s.serializeResult(
      baseResult({
        testops_id: null as any,
        group_params: {},
      }),
    );
    expect(out).not.toHaveProperty('testops_id');
    expect(out).not.toHaveProperty('group_params');
    expect(out).not.toHaveProperty('run_id');
    expect(out).not.toHaveProperty('author');
    expect(out).not.toHaveProperty('testops_project_mapping');
    expect(out).not.toHaveProperty('preparedAttachments');
  });
});

describe('ReportSerializer.serializeStep', () => {
  const s = new ReportSerializer();

  it('renames text step data.data → data.input_data', () => {
    const out = s.serializeStep(textStep('s1', 'click'));
    const data = out.data as any;
    expect(data.action).toBe('click');
    expect(data.expected_result).toBe('ok');
    expect(data.input_data).toBe('raw-input');
    expect(data).not.toHaveProperty('data');
  });

  it('moves step attachments under execution.attachments and drops top-level', () => {
    const out = s.serializeStep(textStep('s1', 'click'));
    const execution = out.execution as any;
    expect(Array.isArray(execution.attachments)).toBe(true);
    expect(execution.attachments).toHaveLength(1);
    expect(execution.attachments[0]).not.toHaveProperty('size');
    expect(out).not.toHaveProperty('attachments');
  });

  it('converts gherkin step to text format', () => {
    const out = s.serializeStep(gherkinStep('s1', 'Given', 'a user'));
    const data = out.data as any;
    expect(data.action).toBe('Given a user');
    expect(data.expected_result).toBeNull();
    expect(data.input_data).toBeNull();
  });

  it('serializes nested steps recursively', () => {
    const child = textStep('c1', 'inner');
    const parent = textStep('p1', 'outer');
    parent.steps = [child];
    const out = s.serializeStep(parent);
    const nested = (out.steps as any[])[0];
    expect(nested.id).toBe('c1');
    expect((nested.data as any).action).toBe('inner');
  });
});
