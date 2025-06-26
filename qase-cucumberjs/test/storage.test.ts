import { expect } from '@jest/globals';
import { Storage } from '../src/storage';
import { Status } from '@cucumber/cucumber';
import { TestStatusEnum, StepStatusEnum } from 'qase-javascript-commons';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new Storage();
  });

  describe('addPickle', () => {
    it('should add pickle to storage', () => {
      const pickle = { id: 'pickle-1', name: 'Test Pickle' } as any;
      storage.addPickle(pickle);
      expect(storage['pickles']['pickle-1']).toBe(pickle);
    });
  });

  describe('addScenario', () => {
    it('should add scenario with parameters to storage', () => {
      const document = {
        feature: {
          name: 'Test Feature',
          children: [
            {
              scenario: {
                id: 'scenario-1',
                examples: [
                  {
                    tableHeader: {
                      cells: [{ value: 'param1' }, { value: 'param2' }],
                    },
                    tableBody: [
                      {
                        id: 'row-1',
                        cells: [{ value: 'value1' }, { value: 'value2' }],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      } as any;

      storage.addScenario(document);

      expect(storage['scenarios']['scenario-1']).toEqual({
        name: 'Test Feature',
        parameters: {
          'row-1': { param1: 'value1', param2: 'value2' },
        },
      });
    });

    it('should handle scenario without examples', () => {
      const document = {
        feature: {
          name: 'Test Feature',
          children: [
            {
              scenario: {
                id: 'scenario-1',
              },
            },
          ],
        },
      } as any;

      storage.addScenario(document);

      expect(storage['scenarios']['scenario-1']).toEqual({
        name: 'Test Feature',
        parameters: {},
      });
    });
  });

  describe('addAttachment', () => {
    it('should add attachment for test step', () => {
      const attachment = {
        testStepId: 'step-1',
        mediaType: 'text/plain',
        body: 'test content',
      } as any;

      storage.addAttachment(attachment);

      expect(storage['attachments']['step-1']).toHaveLength(1);
      expect(storage['attachments']['step-1']?.[0]).toEqual({
        file_name: 'file.txt',
        mime_type: 'text/plain',
        file_path: null,
        content: 'test content',
        size: 0,
        id: 'mock-uuid',
      });
    });

    it('should add attachment for test case', () => {
      const attachment = {
        testCaseStartedId: 'case-1',
        mediaType: 'image/png',
        body: 'image data',
      } as any;

      storage.addAttachment(attachment);

      expect(storage['attachments']['case-1']).toHaveLength(1);
      expect(storage['attachments']['case-1']?.[0]).toEqual({
        file_name: 'file.png',
        mime_type: 'image/png',
        file_path: null,
        content: 'image data',
        size: 0,
        id: 'mock-uuid',
      });
    });

    it('should handle multiple attachments for same id', () => {
      const attachment1 = {
        testStepId: 'step-1',
        mediaType: 'text/plain',
        body: 'content1',
      } as any;
      const attachment2 = {
        testStepId: 'step-1',
        mediaType: 'application/json',
        body: 'content2',
      } as any;

      storage.addAttachment(attachment1);
      storage.addAttachment(attachment2);

      expect(storage['attachments']['step-1']).toHaveLength(2);
    });
  });

  describe('addTestCase', () => {
    it('should add test case to storage', () => {
      const testCase = { id: 'case-1', testSteps: [] } as any;
      storage.addTestCase(testCase);
      expect(storage['testCases']['case-1']).toBe(testCase);
    });
  });

  describe('addTestCaseStarted', () => {
    it('should add test case started to storage', () => {
      const testCaseStarted = { id: 'started-1', testCaseId: 'case-1' } as any;
      storage.addTestCaseStarted(testCaseStarted);

      expect(storage['testCaseStarts']['started-1']).toBe(testCaseStarted);
      expect(storage['testCaseStartedResult']['started-1']).toBe(TestStatusEnum.passed);
    });
  });

  describe('addTestCaseStep', () => {
    it('should add test case step and update status to failed', () => {
      const testCaseStarted = { id: 'started-1', testCaseId: 'case-1' } as any;
      storage.addTestCaseStarted(testCaseStarted);

      const testStepFinished = {
        testCaseStartedId: 'started-1',
        testStepId: 'step-1',
        testStepResult: {
          status: Status.FAILED,
          message: 'Test failed',
        },
      } as any;

      storage.addTestCaseStep(testStepFinished);

      expect(storage['testCaseSteps']['step-1']).toBe(testStepFinished);
      expect(storage['testCaseStartedResult']['started-1']).toBe(TestStatusEnum.failed);
      expect(storage['testCaseStartedErrors']['started-1']).toContain('Test failed');
    });

    it('should not change status if already failed', () => {
      const testCaseStarted = { id: 'started-1', testCaseId: 'case-1' } as any;
      storage.addTestCaseStarted(testCaseStarted);

      // First failure
      const testStepFinished1 = {
        testCaseStartedId: 'started-1',
        testStepId: 'step-1',
        testStepResult: {
          status: Status.FAILED,
          message: 'First failure',
        },
      } as any;

      storage.addTestCaseStep(testStepFinished1);

      // Second failure
      const testStepFinished2 = {
        testCaseStartedId: 'started-1',
        testStepId: 'step-2',
        testStepResult: {
          status: Status.FAILED,
          message: 'Second failure',
        },
      } as any;

      storage.addTestCaseStep(testStepFinished2);

      expect(storage['testCaseStartedResult']['started-1']).toBe(TestStatusEnum.failed);
      expect(storage['testCaseStartedErrors']['started-1']).toContain('First failure');
      expect(storage['testCaseStartedErrors']['started-1']).toContain('Second failure');
    });
  });

  describe('convertTestCase', () => {
    it('should return undefined if test case started not found', () => {
      const testCaseFinished = { testCaseStartedId: 'not-found' } as any;
      const result = storage.convertTestCase(testCaseFinished);
      expect(result).toBeUndefined();
    });

    it('should return undefined if test case not found', () => {
      const testCaseStarted = { id: 'started-1', testCaseId: 'case-1' } as any;
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished = { testCaseStartedId: 'started-1' } as any;
      const result = storage.convertTestCase(testCaseFinished);
      expect(result).toBeUndefined();
    });

    it('should return undefined if pickle not found', () => {
      const testCaseStarted = { id: 'started-1', testCaseId: 'case-1' } as any;
      const testCase = { id: 'case-1', pickleId: 'pickle-1', testSteps: [] } as any;
      storage.addTestCaseStarted(testCaseStarted);
      storage.addTestCase(testCase);

      const testCaseFinished = { testCaseStartedId: 'started-1' } as any;
      const result = storage.convertTestCase(testCaseFinished);
      expect(result).toBeUndefined();
    });

    it('should return undefined if test is ignored', () => {
      const testCaseStarted = { id: 'started-1', testCaseId: 'case-1' } as any;
      const testCase = { id: 'case-1', pickleId: 'pickle-1', testSteps: [] } as any;
      const pickle = {
        id: 'pickle-1',
        name: 'Test Pickle',
        tags: [{ name: '@QaseIgnore' }],
        astNodeIds: [],
        steps: [],
        uri: 'test.feature',
      } as any;

      storage.addTestCaseStarted(testCaseStarted);
      storage.addTestCase(testCase);
      storage.addPickle(pickle);

      const testCaseFinished = { testCaseStartedId: 'started-1' } as any;
      const result = storage.convertTestCase(testCaseFinished);
      expect(result).toBeUndefined();
    });

    it('should convert test case successfully', () => {
      const testCaseStarted = {
        id: 'started-1',
        testCaseId: 'case-1',
        timestamp: { seconds: 1000 },
      } as any;
      const testCase = {
        id: 'case-1',
        pickleId: 'pickle-1',
        testSteps: [],
      } as any;
      const pickle = {
        id: 'pickle-1',
        name: 'Test Pickle',
        tags: [{ name: '@Q-123' }],
        astNodeIds: [],
        steps: [],
        uri: 'test.feature',
      } as any;

      storage.addTestCaseStarted(testCaseStarted);
      storage.addTestCase(testCase);
      storage.addPickle(pickle);

      const testCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 2000 },
      } as any;

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      expect(result?.id).toBe('started-1');
      expect(result?.title).toBe('Test Pickle');
      expect(result?.testops_id).toEqual([123]);
      expect(result?.execution.status).toBe(TestStatusEnum.passed);
      expect(result?.execution.duration).toBe(1000000); // (2000 - 1000) * 1000
    });
  });

  describe('convertTestCase (relations and params)', () => {
    it('should set relations and params if scenario and astNodeIds exist', () => {
      const testCaseStarted = {
        id: 'started-2',
        testCaseId: 'case-2',
        timestamp: { seconds: 100 },
      } as any;
      const testCase = {
        id: 'case-2',
        pickleId: 'pickle-2',
        testSteps: [],
      } as any;
      const pickle = {
        id: 'pickle-2',
        name: 'Test Pickle 2',
        tags: [{ name: '@Q-456' }],
        astNodeIds: ['node-1', 'row-1'],
        steps: [],
        uri: 'test.feature',
      } as any;
      storage.addTestCaseStarted(testCaseStarted);
      storage.addTestCase(testCase);
      storage.addPickle(pickle);
      // add scenario with parameters
      storage['scenarios']['node-1'] = {
        name: 'Scenario Name',
        parameters: {
          'row-1': { paramA: 'A', paramB: 'B' },
        },
      };
      const testCaseFinished = {
        testCaseStartedId: 'started-2',
        timestamp: { seconds: 200 },
      } as any;
      const result = storage.convertTestCase(testCaseFinished);
      expect(result?.relations).toEqual({
        suite: {
          data: [
            { title: 'Scenario Name', public_id: null },
          ],
        },
      });
      expect(result?.params).toEqual({ paramA: 'A', paramB: 'B' });
    });
  });

  describe('convertSteps (step not found)', () => {
    it('should skip testStep if step not found', () => {
      const testCase = {
        testSteps: [
          { id: 'step-1', pickleStepId: 'not-exist' },
        ],
      } as any;
      storage['testCaseSteps']['step-1'] = {
        testStepResult: { status: Status.PASSED, duration: { seconds: 1 } },
        testStepId: 'step-1',
      } as any;
      const steps: any[] = [];
      const result = (storage as any).convertSteps(steps, testCase);
      expect(result).toEqual([]);
    });
  });

  describe('getError', () => {
    it('should return undefined if no errors', () => {
      expect((storage as any).getError('no-errors')).toBeUndefined();
    });
    it('should return CompoundError with all messages', () => {
      storage['testCaseStartedErrors']['err-case'] = ['msg1', 'msg2'];
      const error = (storage as any).getError('err-case');
      expect(error).toBeInstanceOf(Object.getPrototypeOf(error).constructor); // CompoundError
      const values = Object.values(error).flat();
      expect(values.some(str => String(str).includes('msg1'))).toBe(true);
      expect(values.some(str => String(str).includes('msg2'))).toBe(true);
    });
  });

  describe('parseTags', () => {
    it('should parse Q-123 tag', () => {
      (storage as any).constructor.prototype.constructor.qaseIdRegExp?.lastIndex && ((storage as any).constructor.prototype.constructor.qaseIdRegExp.lastIndex = 0);
      const tags = [{ name: '@Q-123', astNodeId: '' }] as any;
      const result = storage['parseTags'](tags);
      expect(result.ids).toEqual([123]);
      expect(result.isIgnore).toBe(false);
    });

    it('should parse QaseID=123,456 tag', () => {
      const tags = [{ name: '@QaseID=123,456', astNodeId: '' }] as any;
      const result = storage['parseTags'](tags);
      expect(result.ids).toEqual([123, 456]);
    });

    it('should parse QaseTitle tag', () => {
      const tags = [{ name: '@QaseTitle=Custom Title', astNodeId: '' }] as any;
      const result = storage['parseTags'](tags);
      expect(result.title).toBe('Custom Title');
    });

    it('should parse QaseFields tag', () => {
      const tags = [{ name: '@QaseFields={"field1":"value1","field2":"value2"}', astNodeId: '' }] as any;
      const result = storage['parseTags'](tags);
      expect(result.fields).toEqual({ field1: 'value1', field2: 'value2' });
    });

    it('should handle invalid JSON in QaseFields', () => {
      const tags = [{ name: '@QaseFields=invalid-json', astNodeId: '' }] as any;
      const result = storage['parseTags'](tags);
      expect(result.fields).toEqual({});
    });

    it('should parse QaseIgnore tag', () => {
      const tags = [{ name: '@QaseIgnore', astNodeId: '' }] as any;
      const result = storage['parseTags'](tags);
      expect(result.isIgnore).toBe(true);
    });
  });

  describe('parseTags (combinations)', () => {
    it('should parse both QaseID and QaseIgnore', () => {
      const tags = [{ name: '@Q-789', astNodeId: '' }, { name: '@QaseIgnore', astNodeId: '' }];
      const result = storage['parseTags'](tags);
      expect(result.ids).toEqual([789]);
      expect(result.isIgnore).toBe(true);
    });
  });

  describe('getSignature', () => {
    it('should return a string signature', () => {
      const pickle = { uri: 'a/b/c.feature', name: 'TestName' } as any;
      const ids = [1, 2];
      const signature = (storage as any).getSignature(pickle, ids);
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });
  });

  describe('static statusMap', () => {
    it('should map cucumber statuses to test statuses correctly', () => {
      expect(Storage.statusMap[Status.PASSED]).toBe(TestStatusEnum.passed);
      expect(Storage.statusMap[Status.FAILED]).toBe(TestStatusEnum.failed);
      expect(Storage.statusMap[Status.SKIPPED]).toBe(TestStatusEnum.skipped);
      expect(Storage.statusMap[Status.AMBIGUOUS]).toBe(TestStatusEnum.failed);
      expect(Storage.statusMap[Status.PENDING]).toBe(TestStatusEnum.skipped);
      expect(Storage.statusMap[Status.UNDEFINED]).toBe(TestStatusEnum.skipped);
      expect(Storage.statusMap[Status.UNKNOWN]).toBe(TestStatusEnum.skipped);
    });
  });

  describe('static stepStatusMap', () => {
    it('should map cucumber statuses to step statuses correctly', () => {
      expect(Storage.stepStatusMap[Status.PASSED]).toBe(StepStatusEnum.passed);
      expect(Storage.stepStatusMap[Status.FAILED]).toBe(StepStatusEnum.failed);
      expect(Storage.stepStatusMap[Status.SKIPPED]).toBe(StepStatusEnum.skipped);
      expect(Storage.stepStatusMap[Status.AMBIGUOUS]).toBe(StepStatusEnum.failed);
      expect(Storage.stepStatusMap[Status.PENDING]).toBe(StepStatusEnum.skipped);
      expect(Storage.stepStatusMap[Status.UNDEFINED]).toBe(StepStatusEnum.skipped);
      expect(Storage.stepStatusMap[Status.UNKNOWN]).toBe(StepStatusEnum.skipped);
    });
  });

  describe('getFileNameFromMediaType', () => {
    it('should return correct file extensions', () => {
      expect(storage['getFileNameFromMediaType']('text/plain')).toBe('file.txt');
      expect(storage['getFileNameFromMediaType']('application/json')).toBe('file.json');
      expect(storage['getFileNameFromMediaType']('image/png')).toBe('file.png');
      expect(storage['getFileNameFromMediaType']('image/jpeg')).toBe('file.jpg');
      expect(storage['getFileNameFromMediaType']('text/html')).toBe('file.html');
      expect(storage['getFileNameFromMediaType']('application/pdf')).toBe('file.pdf');
    });

    it('should return default filename for unknown media type', () => {
      expect(storage['getFileNameFromMediaType']('unknown/type')).toBe('file');
    });
  });
}); 
