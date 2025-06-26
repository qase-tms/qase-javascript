/* eslint-disable */
import { expect } from '@jest/globals';

// Mock Playwright test functions
const testInfoMock = {
  attach: jest.fn().mockResolvedValue(undefined),
};

const testStepMock = jest.fn().mockImplementation((_, fn) => {
  if (fn) {
    return fn().catch(() => {});
  }
  return Promise.resolve();
});

const testMock = {
  info: jest.fn(() => testInfoMock),
  step: testStepMock,
};

// Mock the entire playwright module
jest.mock('playwright/test', () => ({
  __esModule: true,
  default: testMock,
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Mock qase-javascript-commons
jest.mock('qase-javascript-commons', () => ({
  getMimeTypes: jest.fn(() => 'text/plain'),
  TestStatusEnum: {
    passed: 'passed',
    failed: 'failed',
    skipped: 'skipped',
    disabled: 'disabled',
    timedOut: 'failed',
    interrupted: 'failed',
    invalid: 'invalid',
  },
  StepStatusEnum: {
    passed: 'passed',
    failed: 'failed',
  },
  StepType: {
    TEXT: 'text',
  },
}));

// Mock path
jest.mock('path', () => ({
  basename: jest.fn((filePath) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  }),
}));

// Now import the qase function
import { qase } from '../src/playwright';

describe('qase API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('qase', () => {
    it('should return test name with single number ID', () => {
      const result = qase(123, 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123)');
    });

    it('should return test name with multiple number IDs', () => {
      const result = qase([123, 456], 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123,456)');
    });

    it('should return test name with string IDs', () => {
      const result = qase('123', 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123)');
    });

    it('should log warning for invalid string ID', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = qase('invalid', 'Test Name');
      expect(result).toBe('Test Name (Qase ID: invalid)');
      expect(logSpy).toHaveBeenCalledWith('qase: qase ID invalid should be a number');
      logSpy.mockRestore();
    });
  });

  describe('qase.title', () => {
    it('should call test.info().attach with title metadata', () => {
      qase.title('Custom Title');
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ title: 'Custom Title' }), 'utf8'),
      });
    });
  });

  describe('qase.fields', () => {
    it('should call test.info().attach with fields metadata', () => {
      qase.fields({ field1: 'value1', field2: '2' });
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ fields: { field1: 'value1', field2: '2' } }), 'utf8'),
      });
    });
  });

  describe('qase.parameters', () => {
    it('should call test.info().attach with parameters metadata', () => {
      qase.parameters({ param1: 'value1', param2: '2' });
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ parameters: { param1: 'value1', param2: '2' } }), 'utf8'),
      });
    });
  });

  describe('qase.groupParameters', () => {
    it('should call test.info().attach with groupParams metadata', () => {
      qase.groupParameters({ group1: 'value1', group2: '2' });
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ groupParams: { group1: 'value1', group2: '2' } }), 'utf8'),
      });
    });
  });

  describe('qase.attach', () => {
    it('should call test.step and test.info().attach for content', () => {
      qase.attach({ name: 'file.txt', content: 'data', contentType: 'text/plain' });
      expect(testStepMock).toHaveBeenCalledWith('step_attach_body_mock-uuid_file.txt', expect.any(Function));
    });

    it('should call test.step and test.info().attach for file path', () => {
      qase.attach({ paths: '/path/to/file.txt' });
      expect(testStepMock).toHaveBeenCalledWith('step_attach_file_mock-uuid_file.txt', expect.any(Function));
    });

    it('should call test.step and test.info().attach for multiple file paths', () => {
      qase.attach({ paths: ['/path/to/file1.txt', '/path/to/file2.pdf'] });
      expect(testStepMock).toHaveBeenCalledWith('step_attach_file_mock-uuid_file1.txt', expect.any(Function));
      expect(testStepMock).toHaveBeenCalledWith('step_attach_file_mock-uuid_file2.pdf', expect.any(Function));
    });
  });

  describe('qase.ignore', () => {
    it('should call test.info().attach with ignore metadata', () => {
      qase.ignore();
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ ignore: true }), 'utf8'),
      });
    });
  });

  describe('qase.suite', () => {
    it('should call test.info().attach with suite metadata', () => {
      qase.suite('Test Suite');
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ suite: 'Test Suite' }), 'utf8'),
      });
    });
  });

  describe('qase.comment', () => {
    it('should call test.info().attach with comment metadata', () => {
      qase.comment('Test Comment');
      expect(testInfoMock.attach).toHaveBeenCalledWith('qase-metadata.json', {
        contentType: 'application/qase.metadata+json',
        body: Buffer.from(JSON.stringify({ comment: 'Test Comment' }), 'utf8'),
      });
    });
  });

  describe('qase.step', () => {
    it('should return formatted step string with action only', () => {
      const result = qase.step('Click button', undefined, undefined);
      expect(result).toBe('Click button QaseExpRes: QaseData:');
    });

    it('should return formatted step string with action and expected result', () => {
      const result = qase.step('Click button', 'Button should be clicked', undefined);
      expect(result).toBe('Click button QaseExpRes:: Button should be clicked QaseData:');
    });

    it('should return formatted step string with action, expected result and data', () => {
      const result = qase.step('Click button', 'Button should be clicked', 'Button data');
      expect(result).toBe('Click button QaseExpRes:: Button should be clicked QaseData:: Button data');
    });
  });
}); 
