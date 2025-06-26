import { expect } from '@jest/globals';
import { Qase } from '../src/global';

// Mock JestQaseReporter
const reporterMock = {
  addTitle: jest.fn(),
  addIgnore: jest.fn(),
  addComment: jest.fn(),
  addSuite: jest.fn(),
  addFields: jest.fn(),
  addParameters: jest.fn(),
  addGroupParams: jest.fn(),
  addStep: jest.fn(),
  addAttachment: jest.fn(),
};

describe('Qase', () => {
  let qase: Qase;

  beforeEach(() => {
    jest.clearAllMocks();
    qase = new Qase(reporterMock as any);
  });

  describe('constructor', () => {
    it('should initialize with reporter', () => {
      expect(qase).toBeInstanceOf(Qase);
    });
  });

  describe('title', () => {
    it('should call reporter.addTitle', () => {
      qase.title('Custom Title');
      expect(reporterMock.addTitle).toHaveBeenCalledWith('Custom Title');
    });
  });

  describe('ignore', () => {
    it('should call reporter.addIgnore', () => {
      qase.ignore();
      expect(reporterMock.addIgnore).toHaveBeenCalled();
    });
  });

  describe('comment', () => {
    it('should call reporter.addComment', () => {
      qase.comment('Custom Comment');
      expect(reporterMock.addComment).toHaveBeenCalledWith('Custom Comment');
    });
  });

  describe('suite', () => {
    it('should call reporter.addSuite', () => {
      qase.suite('Custom Suite');
      expect(reporterMock.addSuite).toHaveBeenCalledWith('Custom Suite');
    });
  });

  describe('fields', () => {
    it('should call reporter.addFields with string values', () => {
      const fields: Record<string, string> = { field1: 'value1', field2: '123', field3: 'true' };
      qase.fields(fields);
      expect(reporterMock.addFields).toHaveBeenCalledWith({
        field1: 'value1',
        field2: '123',
        field3: 'true',
      });
    });

    it('should handle empty fields object', () => {
      qase.fields({});
      expect(reporterMock.addFields).toHaveBeenCalledWith({});
    });
  });

  describe('parameters', () => {
    it('should call reporter.addParameters with string values', () => {
      const parameters: Record<string, string> = { param1: 'value1', param2: '456', param3: 'false' };
      qase.parameters(parameters);
      expect(reporterMock.addParameters).toHaveBeenCalledWith({
        param1: 'value1',
        param2: '456',
        param3: 'false',
      });
    });

    it('should handle empty parameters object', () => {
      qase.parameters({});
      expect(reporterMock.addParameters).toHaveBeenCalledWith({});
    });
  });

  describe('groupParams', () => {
    it('should call reporter.addGroupParams with string values', () => {
      const groupParams: Record<string, string> = { group1: 'value1', group2: '789', group3: 'null' };
      qase.groupParams(groupParams);
      expect(reporterMock.addGroupParams).toHaveBeenCalledWith({
        group1: 'value1',
        group2: '789',
        group3: 'null',
      });
    });

    it('should handle empty groupParams object', () => {
      qase.groupParams({});
      expect(reporterMock.addGroupParams).toHaveBeenCalledWith({});
    });
  });

  describe('step', () => {
    it('should call reporter.addStep', () => {
      const step = { id: 'step1', title: 'Step 1' } as any;
      qase.step(step);
      expect(reporterMock.addStep).toHaveBeenCalledWith(step);
    });
  });

  describe('attachment', () => {
    it('should call reporter.addAttachment', () => {
      const attachment = { file_name: 'file.txt', content: 'content' } as any;
      qase.attachment(attachment);
      expect(reporterMock.addAttachment).toHaveBeenCalledWith(attachment);
    });
  });
}); 
