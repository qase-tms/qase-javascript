import { expect } from '@jest/globals';
import { NewmanQaseReporter } from '../src/reporter';
import { EventEmitter } from 'events';
import { TestStatusEnum } from 'qase-javascript-commons';

// Shared reporter mock
const reporterMock = {
  startTestRun: jest.fn(),
  addTestResult: jest.fn(),
  publish: jest.fn(),
};

// Mock dependencies
jest.mock('qase-javascript-commons', () => ({
  QaseReporter: {
    getInstance: jest.fn(() => reporterMock),
  },
  composeOptions: jest.fn(() => ({})),
  TestStatusEnum: {
    passed: 'passed',
    failed: 'failed',
  },
  generateSignature: jest.fn(() => 'mock-signature'),
  ConfigLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(() => ({})),
  })),
  getPackageVersion: jest.fn(() => '5.0.0'),
}));

jest.mock('semver', () => ({
  lt: jest.fn(),
}));

describe('NewmanQaseReporter', () => {
  let reporter: NewmanQaseReporter;
  let emitter: EventEmitter;
  let mockOptions: any;
  let mockCollectionOptions: any;

  beforeEach(() => {
    emitter = new EventEmitter();
    mockOptions = {};
    mockCollectionOptions = {
      iterationData: [],
    };
    reporter = new NewmanQaseReporter(emitter, mockOptions, mockCollectionOptions);
  });

  describe('static getCaseIds', () => {
    it('should extract case IDs from test script', () => {
      const eventList = {
        each: jest.fn((callback) => {
          callback({
            listen: 'test',
            script: {
              exec: [
                '// qase: 123',
                '// qase: 456, 789',
                'some other code',
              ],
            },
          });
        }),
      } as any;

      const result = NewmanQaseReporter.getCaseIds(eventList);
      expect(result).toEqual([123, 456, 789]);
    });

    it('should return empty array for non-test events', () => {
      const eventList = {
        each: jest.fn((callback) => {
          callback({
            listen: 'prerequest',
            script: { exec: ['// qase: 123'] },
          });
        }),
      } as any;

      const result = NewmanQaseReporter.getCaseIds(eventList);
      expect(result).toEqual([]);
    });

    it('should handle events without script.exec', () => {
      const eventList = {
        each: jest.fn((callback) => {
          callback({
            listen: 'test',
            script: {},
          });
        }),
      } as any;

      const result = NewmanQaseReporter.getCaseIds(eventList);
      expect(result).toEqual([]);
    });
  });

  describe('static getParameters', () => {
    it('should extract parameters from test script', () => {
      const item = {
        events: {
          each: jest.fn((callback) => {
            callback({
              listen: 'test',
              script: {
                exec: [
                  'qase.parameters: param1, param2',
                  'qase.parameters: param3',
                ],
              },
            });
          }),
        },
        parent: jest.fn(() => null),
      } as any;

      const result = NewmanQaseReporter.getParameters(item);
      expect(result).toEqual(['param1', 'param2', 'param3']);
    });

    it('should get parameters from parent items', () => {
      const parentItem = {
        events: {
          each: jest.fn((callback) => {
            callback({
              listen: 'test',
              script: {
                exec: ['qase.parameters: parentParam'],
              },
            });
          }),
        },
        parent: jest.fn(() => null),
      } as any;

      const item = {
        events: {
          each: jest.fn((callback) => {
            callback({
              listen: 'test',
              script: {
                exec: ['qase.parameters: childParam'],
              },
            });
          }),
        },
        parent: jest.fn(() => parentItem),
      } as any;

      const result = NewmanQaseReporter.getParameters(item);
      expect(result).toEqual(['childParam', 'parentParam']);
    });
  });

  describe('static getParentTitles', () => {
    it('should return titles from parent hierarchy', () => {
      const grandparent = {
        name: 'Grandparent',
        parent: jest.fn(() => null),
      } as any;

      const parent = {
        name: 'Parent',
        parent: jest.fn(() => grandparent),
      } as any;

      const item = {
        name: 'Item',
        parent: jest.fn(() => parent),
      } as any;

      const result = NewmanQaseReporter.getParentTitles(item);
      expect(result).toEqual(['Grandparent', 'Parent', 'Item']);
    });

    it('should handle items without name', () => {
      const item = {
        parent: jest.fn(() => null),
      } as any;

      const result = NewmanQaseReporter.getParentTitles(item);
      expect(result).toEqual([]);
    });
  });

  describe('constructor', () => {
    it('should initialize reporter with correct options', () => {
      const { QaseReporter } = require('qase-javascript-commons');
      expect(QaseReporter.getInstance).toHaveBeenCalledWith({
        frameworkPackage: 'newman',
        frameworkName: 'newman',
        reporterName: 'newman-reporter-qase',
      });
    });

    it('should set autoCollectParams from config', () => {
      const mockConfigLoader = {
        load: jest.fn(() => ({
          framework: {
            newman: {
              autoCollectParams: true,
            },
          },
        })),
      };

      const newReporter = new NewmanQaseReporter(
        emitter,
        mockOptions,
        mockCollectionOptions,
        mockConfigLoader as any,
      );

      expect((newReporter as any).autoCollectParams).toBe(true);
    });
  });

  describe('addRunnerListeners', () => {
    it('should add start listener', () => {
      const { QaseReporter } = require('qase-javascript-commons');
      const mockReporter = QaseReporter.getInstance();
      
      emitter.emit('start');
      
      expect(mockReporter.startTestRun).toHaveBeenCalled();
    });

    it('should handle beforeItem event', () => {
      const mockItem = {
        id: 'item-1',
        name: 'Test Item',
        events: {
          each: jest.fn((callback) => {
            callback({
              listen: 'test',
              script: { exec: ['// qase: 123'] },
            });
          }),
        },
        parent: jest.fn(() => null),
      };

      const mockExec = {
        item: mockItem,
      };

      emitter.emit('beforeItem', undefined, mockExec);

      expect((reporter as any).pendingResultMap.get('item-1')).toBeDefined();
      expect((reporter as any).timerMap.get('item-1')).toBeDefined();
    });

    it('should handle assertion event with error', () => {
      const mockItem = {
        id: 'item-1',
        name: 'Test Item',
        events: { each: jest.fn() },
        parent: jest.fn(() => null),
      };

      const mockExec = { item: mockItem };
      const mockError = new Error('Test error');

      // First add item to pending results
      emitter.emit('beforeItem', undefined, mockExec);
      
      // Then trigger assertion error
      emitter.emit('assertion', mockError, mockExec);

      const pendingResult = (reporter as any).pendingResultMap.get('item-1');
      expect(pendingResult.execution.status).toBe(TestStatusEnum.failed);
      expect(pendingResult.message).toBe('Test error');
    });

    it('should handle item completion', () => {
      const mockItem = {
        id: 'item-1',
        name: 'Test Item',
        events: { each: jest.fn() },
        parent: jest.fn(() => null),
      };

      const mockExec = {
        item: mockItem,
        cursor: { iteration: 0 },
      };

      const { QaseReporter } = require('qase-javascript-commons');
      const mockReporter = QaseReporter.getInstance();

      // Add item to pending results
      emitter.emit('beforeItem', undefined, mockExec);
      
      // Complete item
      emitter.emit('item', undefined, mockExec);

      expect(mockReporter.addTestResult).toHaveBeenCalled();
    });

    it('should handle beforeDone and done events', () => {
      const { QaseReporter } = require('qase-javascript-commons');
      const mockReporter = QaseReporter.getInstance();

      emitter.emit('beforeDone');
      emitter.emit('done');

      expect(mockReporter.publish).toHaveBeenCalled();
    });
  });

  describe('prepareParameters', () => {
    it('should return empty object when no parameters available', () => {
      const item = {
        events: { each: jest.fn() },
        parent: jest.fn(() => null),
      } as any;

      const result = (reporter as any).prepareParameters(item, 0);
      expect(result).toEqual({});
    });

    it('should return available parameters when autoCollectParams is true', () => {
      (reporter as any).autoCollectParams = true;
      (reporter as any).parameters = [{ param1: 'value1', param2: 'value2' }];

      const item = {
        events: { each: jest.fn() },
        parent: jest.fn(() => null),
      } as any;

      const result = (reporter as any).prepareParameters(item, 0);
      expect(result).toEqual({ param1: 'value1', param2: 'value2' });
    });

    it('should filter parameters based on item parameters', () => {
      (reporter as any).parameters = [{ param1: 'value1', param2: 'value2', param3: 'value3' }];

      const item = {
        events: {
          each: jest.fn((callback) => {
            callback({
              listen: 'test',
              script: { exec: ['qase.parameters: param1, param3'] },
            });
          }),
        },
        parent: jest.fn(() => null),
      } as any;

      const result = (reporter as any).prepareParameters(item, 0);
      expect(result).toEqual({ param1: 'value1', param3: 'value3' });
    });
  });

  describe('getParameters', () => {
    it('should return empty array for null iterationData', () => {
      const result = (reporter as any).getParameters(null);
      expect(result).toEqual([]);
    });

    it('should convert array of objects to records', () => {
      const iterationData = [
        { key1: 'value1', key2: 'value2' },
        { key3: 'value3' },
      ];

      const result = (reporter as any).getParameters(iterationData);
      expect(result).toEqual([
        { key1: 'value1', key2: 'value2' },
        { key3: 'value3' },
      ]);
    });

    it('should return empty array for non-array data', () => {
      const result = (reporter as any).getParameters('not an array');
      expect(result).toEqual([]);
    });
  });

  describe('convertToRecord', () => {
    it('should convert simple object to record', () => {
      const obj = { key1: 'value1', key2: 123 };
      const result = (reporter as any).convertToRecord(obj);
      expect(result).toEqual({ key1: 'value1', key2: '123' });
    });

    it('should handle nested objects', () => {
      const obj = {
        parent: {
          child1: 'value1',
          child2: 'value2',
        },
        simple: 'value3',
      };

      const result = (reporter as any).convertToRecord(obj);
      expect(result).toEqual({
        'parent.child1': 'value1',
        'parent.child2': 'value2',
        simple: 'value3',
      });
    });

    it('should convert keys to lowercase', () => {
      const obj = { Key1: 'value1', KEY2: 'value2' };
      const result = (reporter as any).convertToRecord(obj);
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should handle non-object input', () => {
      const result = (reporter as any).convertToRecord('string');
      expect(result).toEqual({});
    });
  });

  describe('isRecord', () => {
    it('should return true for objects', () => {
      expect((reporter as any).isRecord({})).toBe(true);
      expect((reporter as any).isRecord({ key: 'value' })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect((reporter as any).isRecord(null)).toBe(false);
      expect((reporter as any).isRecord(undefined)).toBe(false);
      expect((reporter as any).isRecord('string')).toBe(false);
      expect((reporter as any).isRecord(123)).toBe(false);
      expect((reporter as any).isRecord([])).toBe(true);
    });
  });

  describe('getSignature', () => {
    it('should call generateSignature with correct parameters', () => {
      const { generateSignature } = require('qase-javascript-commons');
      
      const result = (reporter as any).getSignature(['Suite1', 'Suite2'], 'Test Title', [123, 456]);
      
      expect(generateSignature).toHaveBeenCalledWith([123, 456], ['Suite1', 'Suite2', 'Test Title'], {});
      expect(result).toBe('mock-signature');
    });
  });

  describe('preventExit', () => {
    it('should not modify process.exit for newer newman versions', () => {
      const { getPackageVersion } = require('qase-javascript-commons');
      const { lt } = require('semver');
      
      getPackageVersion.mockReturnValue('5.4.0');
      lt.mockReturnValue(false);

      const originalExit = process.exit;
      (reporter as any).preventExit();
      
      expect(process.exit).toBe(originalExit);
    });

    it('should modify process.exit for older newman versions', () => {
      const { getPackageVersion } = require('qase-javascript-commons');
      const { lt } = require('semver');
      
      getPackageVersion.mockReturnValue('5.0.0');
      lt.mockReturnValue(true);

      const originalExit = process.exit;
      (reporter as any).preventExit();
      
      expect(process.exit).not.toBe(originalExit);
      expect(typeof process.exit).toBe('function');
      
      // Restore original exit
      process.exit = originalExit;
    });
  });

  describe('static regex patterns', () => {
    it('should match qase ID patterns', () => {
      expect(NewmanQaseReporter.qaseIdRegExp.test('// qase: 123')).toBe(true);
      expect(NewmanQaseReporter.qaseIdRegExp.test('// Qase: 456, 789')).toBe(true);
      expect(NewmanQaseReporter.qaseIdRegExp.test('// qase: 123, 456, 789')).toBe(true);
      expect(NewmanQaseReporter.qaseIdRegExp.test('// some other comment')).toBe(false);
    });

    it('should match parameter patterns', () => {
      expect(NewmanQaseReporter.qaseParamRegExp.test('qase.parameters: param1, param2')).toBe(true);
      expect(NewmanQaseReporter.qaseParamRegExp.test('Qase.Parameters: param1')).toBe(true);
      expect(NewmanQaseReporter.qaseParamRegExp.test('qase.parameters: param1, param2, param3')).toBe(true);
      expect(NewmanQaseReporter.qaseParamRegExp.test('some other text')).toBe(false);
    });
  });
}); 
