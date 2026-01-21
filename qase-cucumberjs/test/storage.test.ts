/* eslint-disable */
import { expect } from '@jest/globals';
import { Storage } from '../src/storage';
import { Status } from '@cucumber/cucumber';
import { TestStatusEnum } from 'qase-javascript-commons';
import { Pickle, GherkinDocument, Attachment, TestCase, TestCaseStarted, TestStepFinished, TestCaseFinished, AttachmentContentEncoding } from '@cucumber/messages';

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
      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [],
        astNodeIds: [],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);
      expect((storage as any).pickles['pickle-1']).toBe(pickle);
    });
  });

  describe('addScenario', () => {
    it('should add scenario with parameters to storage', () => {
      const document: GherkinDocument = {
        uri: 'test.feature',
        feature: {
          location: { line: 1, column: 1 },
          language: 'en',
          keyword: 'Feature',
          name: 'Test Feature',
          description: '',
          children: [
            {
              scenario: {
                id: 'scenario-1',
                location: { line: 2, column: 1 },
                keyword: 'Scenario',
                name: 'Test Scenario',
                description: '',
                steps: [],
                tags: [],
                examples: [
                  {
                    id: 'examples-1',
                    location: { line: 3, column: 1 },
                    keyword: 'Examples',
                    name: '',
                    description: '',
                    tags: [],
                    tableHeader: {
                      id: 'header-1',
                      location: { line: 4, column: 1 },
                      cells: [{ location: { line: 4, column: 1 }, value: 'param1' }, { location: { line: 4, column: 8 }, value: 'param2' }],
                    },
                    tableBody: [
                      {
                        id: 'row-1',
                        location: { line: 5, column: 1 },
                        cells: [{ location: { line: 5, column: 1 }, value: 'value1' }, { location: { line: 5, column: 8 }, value: 'value2' }],
                      },
                    ],
                  },
                ],
              },
            },
          ],
          tags: [],
        },
        comments: [],
      };

      storage.addScenario(document);

      expect((storage as any).scenarios['scenario-1']).toEqual({
        name: 'Test Feature',
        parameters: {
          'row-1': { param1: 'value1', param2: 'value2' },
        },
      });
    });

    it('should handle scenario without examples', () => {
      const document: GherkinDocument = {
        uri: 'test.feature',
        feature: {
          location: { line: 1, column: 1 },
          language: 'en',
          keyword: 'Feature',
          name: 'Test Feature',
          description: '',
          children: [
            {
              scenario: {
                id: 'scenario-1',
                location: { line: 2, column: 1 },
                keyword: 'Scenario',
                name: 'Test Scenario',
                description: '',
                steps: [],
                tags: [],
                examples: [],
              },
            },
          ],
          tags: [],
        },
        comments: [],
      };

      storage.addScenario(document);

      expect((storage as any).scenarios['scenario-1']).toEqual({
        name: 'Test Feature',
        parameters: {},
      });
    });
  });

  describe('addAttachment', () => {
    it('should add attachment for test step', () => {
      const attachment: Attachment = {
        testStepId: 'step-1',
        mediaType: 'text/plain',
        body: 'test content',
        contentEncoding: AttachmentContentEncoding.IDENTITY,
      };

      storage.addAttachment(attachment);

      expect((storage as any).attachments['step-1']).toHaveLength(1);
      expect((storage as any).attachments['step-1']?.[0]).toEqual({
        file_name: 'file.txt',
        mime_type: 'text/plain',
        file_path: null,
        content: 'test content',
        size: 0,
        id: 'mock-uuid',
      });
    });

    it('should add attachment for test case', () => {
      const attachment: Attachment = {
        testCaseStartedId: 'case-1',
        mediaType: 'image/png',
        body: 'image data',
        contentEncoding: AttachmentContentEncoding.IDENTITY,
      };

      storage.addAttachment(attachment);

      expect((storage as any).attachments['case-1']).toHaveLength(1);
      expect((storage as any).attachments['case-1']?.[0]).toEqual({
        file_name: 'file.png',
        mime_type: 'image/png',
        file_path: null,
        content: 'image data',
        size: 0,
        id: 'mock-uuid',
      });
    });

    it('should handle multiple attachments for same id', () => {
      const attachment1: Attachment = {
        testStepId: 'step-1',
        mediaType: 'text/plain',
        body: 'content1',
        contentEncoding: AttachmentContentEncoding.IDENTITY,
      };
      const attachment2: Attachment = {
        testStepId: 'step-1',
        mediaType: 'application/json',
        body: 'content2',
        contentEncoding: AttachmentContentEncoding.IDENTITY,
      };

      storage.addAttachment(attachment1);
      storage.addAttachment(attachment2);

      expect((storage as any).attachments['step-1']).toHaveLength(2);
    });
  });

  describe('addTestCase', () => {
    it('should add test case to storage', () => {
      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);
      expect((storage as any).testCases['case-1']).toBe(testCase);
    });
  });

  describe('addTestCaseStarted', () => {
    it('should add test case started to storage', () => {
      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      expect((storage as any).testCaseStarts['started-1']).toBe(testCaseStarted);
      expect((storage as any).testCaseStartedResult['started-1']).toBe(TestStatusEnum.passed);
    });
  });

  describe('addTestCaseStep', () => {
    it('should add test case step and update status to failed', () => {
      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testStepFinished: TestStepFinished = {
        testStepId: 'step-1',
        testCaseStartedId: 'started-1',
        testStepResult: {
          status: Status.FAILED,
          message: 'Test failed',
          duration: { seconds: 1, nanos: 0 },
        },
        timestamp: { seconds: 1, nanos: 0 },
      };

      storage.addTestCaseStep(testStepFinished);

      expect((storage as any).testCaseSteps['step-1']).toBe(testStepFinished);
      expect((storage as any).testCaseStartedResult['started-1']).toBe(TestStatusEnum.failed);
      expect((storage as any).testCaseStartedErrors['started-1']).toContain('Test failed');
    });

    it('should handle multiple failures for same test case', () => {
      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testStepFinished1: TestStepFinished = {
        testStepId: 'step-1',
        testCaseStartedId: 'started-1',
        testStepResult: {
          status: Status.FAILED,
          message: 'First failure',
          duration: { seconds: 1, nanos: 0 },
        },
        timestamp: { seconds: 1, nanos: 0 },
      };

      const testStepFinished2: TestStepFinished = {
        testStepId: 'step-2',
        testCaseStartedId: 'started-1',
        testStepResult: {
          status: Status.FAILED,
          message: 'Second failure',
          duration: { seconds: 1, nanos: 0 },
        },
        timestamp: { seconds: 2, nanos: 0 },
      };

      storage.addTestCaseStep(testStepFinished1);
      storage.addTestCaseStep(testStepFinished2);

      expect((storage as any).testCaseStartedResult['started-1']).toBe(TestStatusEnum.invalid);
      expect((storage as any).testCaseStartedErrors['started-1']).toContain('First failure');
      expect((storage as any).testCaseStartedErrors['started-1']).toContain('Second failure');
    });
  });

  describe('convertTestCase', () => {
    it('should convert test case to test result', () => {
      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [],
        astNodeIds: [],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.id).toBe('started-1');
        expect(result.title).toBe('Test Pickle');
        expect(result.execution.status).toBe(TestStatusEnum.passed);
      }
    });

    it('should return undefined for non-existent test case', () => {
      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'non-existent',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);
      expect(result).toBeUndefined();
    });

    it('should include parameters from QaseParameters tag in test result', () => {
      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [
          { name: '@QaseParameters={"browser":"chrome","environment":"staging"}' },
        ],
        astNodeIds: [],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.params).toEqual({ browser: 'chrome', environment: 'staging' });
      }
    });

    it('should include group_params from QaseGroupParameters tag in test result', () => {
      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [
          { name: '@QaseGroupParameters={"test_group":"authentication","test_type":"smoke"}' },
        ],
        astNodeIds: [],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.group_params).toEqual({ test_group: 'authentication', test_type: 'smoke' });
      }
    });

    it('should include suite from QaseSuite tag in test result', () => {
      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [
          { name: '@QaseSuite=Authentication' },
        ],
        astNodeIds: [],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.relations).toBeDefined();
        expect(result.relations?.suite).toBeDefined();
        expect(result.relations?.suite?.data).toHaveLength(1);
        expect(result.relations?.suite?.data[0]?.title).toBe('Authentication');
        expect(result.relations?.suite?.data[0]?.public_id).toBeNull();
      }
    });

    it('should include suite with sub-suites from QaseSuite tag in test result', () => {
      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [
          { name: '@QaseSuite=Authentication\tLogin\tEdge Cases' },
        ],
        astNodeIds: [],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.relations).toBeDefined();
        expect(result.relations?.suite).toBeDefined();
        expect(result.relations?.suite?.data).toHaveLength(3);
        expect(result.relations?.suite?.data[0]?.title).toBe('Authentication');
        expect(result.relations?.suite?.data[1]?.title).toBe('Login');
        expect(result.relations?.suite?.data[2]?.title).toBe('Edge Cases');
      }
    });

    it('should use feature name as suite when QaseSuite tag is not present', () => {
      const document: GherkinDocument = {
        uri: 'test.feature',
        feature: {
          location: { line: 1, column: 1 },
          language: 'en',
          keyword: 'Feature',
          name: 'Test Feature',
          description: '',
          children: [
            {
              scenario: {
                id: 'scenario-1',
                location: { line: 2, column: 1 },
                keyword: 'Scenario',
                name: 'Test Scenario',
                description: '',
                steps: [],
                tags: [],
              },
            },
          ],
        },
      };
      storage.addScenario(document);

      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [],
        astNodeIds: ['scenario-1'],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.relations).toBeDefined();
        expect(result.relations?.suite).toBeDefined();
        expect(result.relations?.suite?.data).toHaveLength(1);
        expect(result.relations?.suite?.data[0]?.title).toBe('Test Feature');
      }
    });

    it('should prioritize QaseSuite tag over feature name', () => {
      const document: GherkinDocument = {
        uri: 'test.feature',
        feature: {
          location: { line: 1, column: 1 },
          language: 'en',
          keyword: 'Feature',
          name: 'Test Feature',
          description: '',
          children: [
            {
              scenario: {
                id: 'scenario-1',
                location: { line: 2, column: 1 },
                keyword: 'Scenario',
                name: 'Test Scenario',
                description: '',
                steps: [],
                tags: [],
              },
            },
          ],
        },
      };
      storage.addScenario(document);

      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [
          { name: '@QaseSuite=Custom Suite' },
        ],
        astNodeIds: ['scenario-1'],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        expect(result.relations).toBeDefined();
        expect(result.relations?.suite).toBeDefined();
        expect(result.relations?.suite?.data).toHaveLength(1);
        expect(result.relations?.suite?.data[0]?.title).toBe('Custom Suite');
        expect(result.relations?.suite?.data[0]?.title).not.toBe('Test Feature');
      }
    });

    it('should merge parameters from tags with parameters from Gherkin examples', () => {
      const document: GherkinDocument = {
        uri: 'test.feature',
        feature: {
          location: { line: 1, column: 1 },
          language: 'en',
          keyword: 'Feature',
          name: 'Test Feature',
          description: '',
          children: [
            {
              scenario: {
                id: 'scenario-1',
                location: { line: 2, column: 1 },
                keyword: 'Scenario',
                name: 'Test Scenario',
                description: '',
                steps: [],
                tags: [],
                examples: [
                  {
                    id: 'examples-1',
                    location: { line: 3, column: 1 },
                    keyword: 'Examples',
                    name: '',
                    description: '',
                    tags: [],
                    tableHeader: {
                      id: 'header-1',
                      location: { line: 4, column: 1 },
                      cells: [{ location: { line: 4, column: 1 }, value: 'param1' }],
                    },
                    tableBody: [
                      {
                        id: 'row-1',
                        location: { line: 5, column: 1 },
                        cells: [{ location: { line: 5, column: 1 }, value: 'value1' }],
                      },
                    ],
                  },
                ],
              },
            },
          ],
          tags: [],
        },
        comments: [],
      };
      storage.addScenario(document);

      const pickle: Pickle = { 
        id: 'pickle-1', 
        name: 'Test Pickle',
        language: 'en',
        steps: [],
        tags: [
          { name: '@QaseParameters={"param2":"value2"}' },
        ],
        astNodeIds: ['scenario-1', 'row-1'],
        uri: 'test.feature'
      };
      storage.addPickle(pickle);

      const testCase: TestCase = { 
        id: 'case-1', 
        testSteps: [],
        pickleId: 'pickle-1'
      };
      storage.addTestCase(testCase);

      const testCaseStarted: TestCaseStarted = { 
        id: 'started-1', 
        testCaseId: 'case-1',
        timestamp: { seconds: 0, nanos: 0 },
        attempt: 1
      };
      storage.addTestCaseStarted(testCaseStarted);

      const testCaseFinished: TestCaseFinished = {
        testCaseStartedId: 'started-1',
        timestamp: { seconds: 1, nanos: 0 },
        willBeRetried: false,
      };

      const result = storage.convertTestCase(testCaseFinished);

      expect(result).toBeDefined();
      if (result) {
        // Parameters from tags should merge with parameters from Gherkin examples
        expect(result.params).toEqual({ param1: 'value1', param2: 'value2' });
      }
    });
  });

  describe('private methods', () => {
    it('should parse tags correctly', () => {
      const tags = [
        { name: '@Q-123' },
        { name: '@QaseTitle=Test Title' },
        { name: '@QaseFields={"field1":"value1"}' },
        { name: '@QaseIgnore' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.ids).toEqual([123]);
      expect(result.title).toBe('Test Title');
      expect(result.fields).toEqual({ field1: 'value1' });
      expect(result.isIgnore).toBe(true);
    });

    it('should parse new format qase IDs', () => {
      const tags = [
        { name: '@QaseID=123,456,789' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.ids).toEqual([123, 456, 789]);
    });

    it('should handle invalid JSON in fields', () => {
      const tags = [
        { name: '@QaseFields=invalid json' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.fields).toEqual({});
    });

    it('should parse QaseParameters tag', () => {
      const tags = [
        { name: '@QaseParameters={"browser":"chrome","environment":"staging"}' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.parameters).toEqual({ browser: 'chrome', environment: 'staging' });
    });

    it('should parse QaseGroupParameters tag', () => {
      const tags = [
        { name: '@QaseGroupParameters={"test_group":"authentication","test_type":"smoke"}' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.group_params).toEqual({ test_group: 'authentication', test_type: 'smoke' });
    });

    it('should parse QaseParameters tag with single quotes', () => {
      const tags = [
        { name: "@QaseParameters={'browser':'chrome','environment':'staging'}" },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.parameters).toEqual({ browser: 'chrome', environment: 'staging' });
    });

    it('should parse QaseGroupParameters tag with single quotes', () => {
      const tags = [
        { name: "@QaseGroupParameters={'group':'regression'}" },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.group_params).toEqual({ group: 'regression' });
    });

    it('should parse QaseSuite tag', () => {
      const tags = [
        { name: '@QaseSuite=Authentication' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.suite).toBe('Authentication');
    });

    it('should parse QaseSuite tag with sub-suites', () => {
      const tags = [
        { name: '@QaseSuite=Authentication\tLogin\tEdge Cases' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.suite).toBe('Authentication\tLogin\tEdge Cases');
    });

    it('should parse both QaseParameters and QaseGroupParameters', () => {
      const tags = [
        { name: '@QaseParameters={"browser":"chrome"}' },
        { name: '@QaseGroupParameters={"test_group":"authentication"}' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.parameters).toEqual({ browser: 'chrome' });
      expect(result.group_params).toEqual({ test_group: 'authentication' });
    });

    it('should handle invalid JSON in parameters', () => {
      const tags = [
        { name: '@QaseParameters=invalid json' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.parameters).toEqual({});
    });

    it('should handle invalid JSON in group parameters', () => {
      const tags = [
        { name: '@QaseGroupParameters=invalid json' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.group_params).toEqual({});
    });

    it('should merge multiple QaseParameters tags', () => {
      const tags = [
        { name: '@QaseParameters={"browser":"chrome"}' },
        { name: '@QaseParameters={"environment":"staging"}' },
      ];

      const result = (storage as any).parseTags(tags);

      expect(result.parameters).toEqual({ browser: 'chrome', environment: 'staging' });
    });

    it('should get file name from media type', () => {
      expect((storage as any).getFileNameFromMediaType('text/plain')).toBe('file.txt');
      expect((storage as any).getFileNameFromMediaType('application/json')).toBe('file.json');
      expect((storage as any).getFileNameFromMediaType('image/png')).toBe('file.png');
      expect((storage as any).getFileNameFromMediaType('image/jpeg')).toBe('file.jpg');
      expect((storage as any).getFileNameFromMediaType('text/html')).toBe('file.html');
      expect((storage as any).getFileNameFromMediaType('application/pdf')).toBe('file.pdf');
    });

    it('should return default file name for unknown media type', () => {
      expect((storage as any).getFileNameFromMediaType('unknown/type')).toBe('file');
    });
  });
}); 
