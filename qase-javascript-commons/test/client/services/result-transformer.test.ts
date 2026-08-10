/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import { expect } from '@jest/globals';
import { ResultTransformer } from '../../../src/client/services/result-transformer';
import {
  StepStatusEnum,
  StepType,
  TestStatusEnum,
  TestStepType,
} from '../../../src/models';

jest.mock('qase-api-v2-client', () => ({
  ResultStepStatus: {
    PASSED: 'passed',
    FAILED: 'failed',
    BLOCKED: 'blocked',
    SKIPPED: 'skipped',
  },
}));

const silentLogger = (): any => ({
  log: jest.fn(),
  logDebug: jest.fn(),
  logError: jest.fn(),
});

function makeResult(overrides: Partial<any> = {}): any {
  return {
    title: 'Test case',
    testops_id: 1,
    execution: {
      status: TestStatusEnum.passed,
      start_time: 1000,
      end_time: 2000,
      duration: 1000,
      stacktrace: null,
      thread: 'main',
    },
    attachments: [],
    preparedAttachments: [],
    steps: [],
    params: {},
    group_params: {},
    relations: null,
    message: null,
    fields: {},
    tags: [],
    signature: 'sig-1',
    ...overrides,
  };
}

function makeStep(overrides: Partial<TestStepType> = {}): TestStepType {
  return {
    step_type: StepType.TEXT,
    data: { action: 'Click button', expected_result: 'Button clicked' },
    execution: { status: StepStatusEnum.passed, duration: 100 },
    attachments: [],
    steps: [],
    ...overrides,
  } as TestStepType;
}

describe('ResultTransformer', () => {
  const mockResolveHash = jest.fn().mockReturnValue('hash123');
  let transformer: ResultTransformer;

  beforeEach(() => {
    mockResolveHash.mockClear();
    transformer = new ResultTransformer(silentLogger(), undefined);
  });

  describe('transform', () => {
    it('should transform a basic result', () => {
      const model = transformer.transform(makeResult(), mockResolveHash);
      expect(model.title).toBe('Test case');
      expect(model.execution.status).toBe('passed');
      expect(model.testops_ids).toEqual([1]);
      expect(model.signature).toBe('sig-1');
    });

    it('should handle array testops_id', () => {
      const model = transformer.transform(
        makeResult({ testops_id: [1, 2, 3] }),
        mockResolveHash,
      );
      expect(model.testops_ids).toEqual([1, 2, 3]);
    });

    it('should carry execution.error_context through to the API model', () => {
      const content = '# Test info\n\n- Name: a >> b\n';
      const result = makeResult({
        execution: { ...makeResult().execution, error_context: content },
      });

      const model = transformer.transform(result, mockResolveHash);

      expect(model.execution.error_context).toBe(content);
    });

    it('should send a null error_context when the framework produced none', () => {
      const model = transformer.transform(makeResult(), mockResolveHash);

      expect(model.execution.error_context).toBeNull();
    });

    it('should handle null testops_id', () => {
      const model = transformer.transform(
        makeResult({ testops_id: null }),
        mockResolveHash,
      );
      expect(model.testops_ids).toBeNull();
    });

    it('should map empty-array testops_id to null (API rejects []) ', () => {
      const model = transformer.transform(
        makeResult({ testops_id: [] }),
        mockResolveHash,
      );
      expect(model.testops_ids).toBeNull();
    });

    it('should handle undefined tags', () => {
      const result = makeResult();
      delete result.tags;
      const model = transformer.transform(result, mockResolveHash);
      expect(model.fields.tags).toBeUndefined();
    });

    it('should merge tags into fields', () => {
      const model = transformer.transform(
        makeResult({ tags: ['smoke', 'regression', 'smoke'] }),
        mockResolveHash,
      );
      expect(model.fields.tags).toBe('smoke,regression');
    });

    it('should upload attachments and include prepared ones', () => {
      mockResolveHash.mockReturnValue('uploaded-hash');
      const result = makeResult({
        attachments: [{ file_name: 'a.png' }],
        preparedAttachments: ['existing-hash'],
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.attachments).toEqual(['uploaded-hash', 'existing-hash']);
    });
  });

  describe('steps', () => {
    it('should transform TEXT step', () => {
      const result = makeResult({
        steps: [makeStep()],
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.steps).toHaveLength(1);
      expect(model.steps![0]!.data!.action).toBe('Click button');
      expect(model.steps![0]!.data!.expected_result).toBe('Button clicked');
    });

    it('should transform GHERKIN step', () => {
      const result = makeResult({
        steps: [
          makeStep({
            step_type: StepType.GHERKIN,
            data: { keyword: 'Given user exists' },
          }),
        ],
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.steps![0]!.data!.action).toBe('Given user exists');
    });

    it('should transform REQUEST step', () => {
      const result = makeResult({
        steps: [
          makeStep({
            step_type: StepType.REQUEST,
            data: { request_method: 'GET', request_url: '/api/test' },
          }),
        ],
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.steps![0]!.data!.action).toBe('GET /api/test');
    });

    it('should handle nested steps', () => {
      const result = makeResult({
        steps: [
          makeStep({
            steps: [makeStep({ data: { action: 'Nested action' } })],
          }),
        ],
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.steps![0]!.steps).toHaveLength(1);
      expect(model.steps![0]!.steps![0]!.data!.action).toBe('Nested action');
    });

    it('should mark empty action as "Unnamed step"', () => {
      const result = makeResult({
        steps: [makeStep({ data: { action: '' } })],
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.steps![0]!.data!.action).toBe('Unnamed step');
    });
  });

  describe('params', () => {
    it('should transform params to strings', () => {
      const model = transformer.transform(
        makeResult({ params: { key: 'value', num: 42 as any } }),
        mockResolveHash,
      );
      expect(model.params).toEqual({ key: 'value', num: '42' });
    });

    it('should build param_groups from group_params', () => {
      const model = transformer.transform(
        makeResult({
          group_params: { browser: 'chrome', os: 'linux' },
          params: {},
        }),
        mockResolveHash,
      );
      expect(model.param_groups).toEqual([['browser', 'os']]);
      expect(model.params).toEqual({ browser: 'chrome', os: 'linux' });
    });
  });

  describe('relations', () => {
    it('should use default suite relation with rootSuite', () => {
      transformer = new ResultTransformer(silentLogger(), 'Root Suite');
      const model = transformer.transform(makeResult(), mockResolveHash);
      expect(model.relations?.suite?.data).toEqual([
        { public_id: null, title: 'Root Suite' },
      ]);
    });

    it('should prepend rootSuite to existing suite relation', () => {
      transformer = new ResultTransformer(silentLogger(), 'Root');
      const result = makeResult({
        relations: { suite: { data: [{ title: 'Child' }] } },
      });
      const model = transformer.transform(result, mockResolveHash);
      expect(model.relations?.suite?.data).toEqual([
        { public_id: null, title: 'Root' },
        { public_id: null, title: 'Child' },
      ]);
    });

    it('should return empty relations when no rootSuite and no relation', () => {
      const model = transformer.transform(makeResult(), mockResolveHash);
      expect(model.relations).toEqual({});
    });
  });

  describe('collectAttachments', () => {
    it('should collect result-level attachments', () => {
      const a1 = { file_name: 'a1.png' } as any;
      const result = makeResult({ attachments: [a1] });
      expect(transformer.collectAttachments(result)).toEqual([a1]);
    });

    it('should collect attachments from steps and nested steps', () => {
      const a1 = { file_name: 'a1.png' } as any;
      const sa = { file_name: 'step.png' } as any;
      const na = { file_name: 'nested.png' } as any;
      const result = makeResult({
        attachments: [a1],
        steps: [
          makeStep({
            attachments: [sa],
            steps: [makeStep({ attachments: [na] })],
          }),
        ],
      });
      expect(transformer.collectAttachments(result)).toEqual([a1, sa, na]);
    });

    it('should not collect preparedAttachments (already hashes)', () => {
      const a1 = { file_name: 'a1.png' } as any;
      const result = makeResult({ attachments: [a1], preparedAttachments: ['existing-hash'] });
      expect(transformer.collectAttachments(result)).toEqual([a1]);
    });
  });
});
