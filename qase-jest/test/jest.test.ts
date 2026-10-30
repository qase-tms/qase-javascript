/* eslint-disable */
import { expect } from '@jest/globals';
import { qase } from '../src/jest';
import { QaseStep } from 'qase-javascript-commons';

jest.mock('../src/metadataChannel', () => {
  const writer = {
    title: jest.fn(),
    ignore: jest.fn(),
    mute: jest.fn(),
    comment: jest.fn(),
    suite: jest.fn(),
    fields: jest.fn(),
    parameters: jest.fn(),
    groupParams: jest.fn(),
    tags: jest.fn(),
    step: jest.fn(),
    attachment: jest.fn(),
  };
  return { MetadataWriter: jest.fn(() => writer), writer };
});

jest.mock('qase-javascript-commons', () => ({
  getMimeTypes: jest.fn(() => 'text/plain'),
  QaseStep: jest.fn().mockImplementation(() => ({
    run: jest.fn().mockResolvedValue(undefined),
  })),
}));

const qaseMock = jest.requireMock<{ writer: Record<string, jest.Mock> }>('../src/metadataChannel').writer;

describe('qase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('main function', () => {
    it('should create test name with single Qase ID', () => {
      const result = qase(123, 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123)');
    });

    it('should create test name with multiple Qase IDs', () => {
      const result = qase([123, 456, 789], 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123,456,789)');
    });

    it('should handle string Qase IDs', () => {
      const result = qase('123', 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123)');
    });

    it('should handle array of string Qase IDs', () => {
      const result = qase(['123', '456'], 'Test Name');
      expect(result).toBe('Test Name (Qase ID: 123,456)');
    });
  });

  describe('qase.title', () => {
    it('should pass the call to the metadata writer: title', () => {
      qase.title('Custom Title');
      expect(qaseMock.title).toHaveBeenCalledWith('Custom Title');
    });
  });

  describe('qase.ignore', () => {
    it('should pass the call to the metadata writer: ignore', () => {
      qase.ignore();
      expect(qaseMock.ignore).toHaveBeenCalled();
    });
  });

  describe('qase.mute', () => {
    it('should pass the call to the metadata writer: mute', () => {
      qase.mute();
      expect(qaseMock.mute).toHaveBeenCalled();
    });
  });

  describe('qase.comment', () => {
    it('should pass the call to the metadata writer: comment', () => {
      qase.comment('Custom Comment');
      expect(qaseMock.comment).toHaveBeenCalledWith('Custom Comment');
    });
  });

  describe('qase.suite', () => {
    it('should pass the call to the metadata writer: suite', () => {
      qase.suite('Custom Suite');
      expect(qaseMock.suite).toHaveBeenCalledWith('Custom Suite');
    });
  });

  describe('qase.fields', () => {
    it('should pass the call to the metadata writer: fields', () => {
      const fields = { field1: 'value1', field2: 'value2' };
      qase.fields(fields);
      expect(qaseMock.fields).toHaveBeenCalledWith(fields);
    });
  });

  describe('qase.parameters', () => {
    it('should pass the call to the metadata writer: parameters', () => {
      const parameters = { param1: 'value1', param2: 'value2' };
      qase.parameters(parameters);
      expect(qaseMock.parameters).toHaveBeenCalledWith(parameters);
    });
  });

  describe('qase.groupParameters', () => {
    it('should pass the call to the metadata writer: groupParams', () => {
      const groupParams = { group1: 'value1', group2: 'value2' };
      qase.groupParameters(groupParams);
      expect(qaseMock.groupParams).toHaveBeenCalledWith(groupParams);
    });
  });

  describe('qase.tags', () => {
    it('should pass the call to the metadata writer: tags', () => {
      qase.tags('smoke', 'regression');
      expect(qaseMock.tags).toHaveBeenCalledWith(['smoke', 'regression']);
    });
  });

  describe('qase.step', () => {
    it('should create QaseStep and run it', async () => {
      const stepBody = jest.fn();
      
      await qase.step('Step Name', stepBody);
      
      expect(QaseStep).toHaveBeenCalledWith('Step Name');
    });
  });

  describe('qase.attach', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should attach file from path', () => {
      const { getMimeTypes } = require('qase-javascript-commons');
      getMimeTypes.mockReturnValue('text/plain');

      qase.attach({
        paths: ['/path/to/file.txt', '/path/to/another.pdf'],
      });

      expect(getMimeTypes).toHaveBeenCalledWith('/path/to/file.txt');
      expect(getMimeTypes).toHaveBeenCalledWith('/path/to/another.pdf');
      expect(qaseMock.attachment).toHaveBeenCalledTimes(2);
      
      const firstCall = qaseMock.attachment.mock.calls[0][0];
      expect(firstCall.file_name).toBe('file.txt');
      expect(firstCall.mime_type).toBe('text/plain');
      expect(firstCall.file_path).toBe('/path/to/file.txt');
    });

    it('should attach content with name and type', () => {
      qase.attach({
        name: 'test.txt',
        content: 'Hello, World!',
        type: 'text/plain',
      });

      expect(qaseMock.attachment).toHaveBeenCalledWith({
        file_path: null,
        size: 13,
        id: expect.any(String),
        file_name: 'test.txt',
        mime_type: 'text/plain',
        content: 'Hello, World!',
      });
    });

    it('should attach content with default name and type', () => {
      qase.attach({
        content: 'Hello, World!',
      });

      expect(qaseMock.attachment).toHaveBeenCalledWith({
        file_path: null,
        size: 13,
        id: expect.any(String),
        file_name: 'attachment',
        mime_type: 'application/octet-stream',
        content: 'Hello, World!',
      });
    });

    it('should not call attachment if no paths or content provided', () => {
      qase.attach({});
      expect(qaseMock.attachment).not.toHaveBeenCalled();
    });
  });
}); 
