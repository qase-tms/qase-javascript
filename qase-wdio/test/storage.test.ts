/* eslint-disable */
import { expect } from '@jest/globals';
import { Storage, findLast } from '../src/storage';
import { TestResultType, TestStepType } from 'qase-javascript-commons';

// Mock TestResultType and TestStepType
const MockTestResult = class extends TestResultType {
  constructor() {
    super('Mock Test');
  }
};

const MockTestStep = class extends TestStepType {
  constructor() {
    super();
  }
};

describe('Storage', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = new Storage();
  });

  describe('clear', () => {
    it('should clear currentFile and items', () => {
      storage.currentFile = '/path/to/test.js';
      storage.items = [new MockTestResult()];
      storage.ignore = true;
      storage.suites = ['Suite 1', 'Suite 2'];

      storage.clear();

      expect(storage.currentFile).toBeUndefined();
      expect(storage.items).toEqual([]);
      expect(storage.ignore).toBe(false);
      expect(storage.suites).toEqual(['Suite 1']);
    });

    it('should clear all suites when empty', () => {
      storage.suites = [];

      storage.clear();

      expect(storage.suites).toEqual([]);
    });
  });

  describe('push', () => {
    it('should add item to items array', () => {
      const testResult = new MockTestResult();
      const testStep = new MockTestStep();

      storage.push(testResult);
      storage.push(testStep);

      expect(storage.items).toHaveLength(2);
      expect(storage.items[0]).toBe(testResult);
      expect(storage.items[1]).toBe(testStep);
    });
  });

  describe('pop', () => {
    it('should remove and return last item', () => {
      const testResult = new MockTestResult();
      const testStep = new MockTestStep();

      storage.push(testResult);
      storage.push(testStep);

      const popped = storage.pop();

      expect(popped).toBe(testStep);
      expect(storage.items).toHaveLength(1);
      expect(storage.items[0]).toBe(testResult);
    });

    it('should return undefined when items array is empty', () => {
      const popped = storage.pop();

      expect(popped).toBeUndefined();
      expect(storage.items).toHaveLength(0);
    });
  });

  describe('getCurrentTest', () => {
    it('should return last TestResultType from items', () => {
      const testResult1 = new MockTestResult();
      const testStep = new MockTestStep();
      const testResult2 = new MockTestResult();

      storage.push(testResult1);
      storage.push(testStep);
      storage.push(testResult2);

      const currentTest = storage.getCurrentTest();

      expect(currentTest).toBe(testResult2);
    });

    it('should return undefined when no TestResultType found', () => {
      const testStep = new MockTestStep();
      storage.push(testStep);

      const currentTest = storage.getCurrentTest();

      expect(currentTest).toBeUndefined();
    });

    it('should return undefined when items array is empty', () => {
      const currentTest = storage.getCurrentTest();

      expect(currentTest).toBeUndefined();
    });
  });

  describe('getCurrentStep', () => {
    it('should return last TestStepType from items', () => {
      const testResult = new MockTestResult();
      const testStep1 = new MockTestStep();
      const testStep2 = new MockTestStep();

      storage.push(testResult);
      storage.push(testStep1);
      storage.push(testStep2);

      const currentStep = storage.getCurrentStep();

      expect(currentStep).toBe(testStep2);
    });

    it('should return undefined when no TestStepType found', () => {
      const testResult = new MockTestResult();
      storage.push(testResult);

      const currentStep = storage.getCurrentStep();

      expect(currentStep).toBeUndefined();
    });

    it('should return undefined when items array is empty', () => {
      const currentStep = storage.getCurrentStep();

      expect(currentStep).toBeUndefined();
    });
  });

  describe('getLastItem', () => {
    it('should return last item from items array', () => {
      const testResult = new MockTestResult();
      const testStep = new MockTestStep();

      storage.push(testResult);
      storage.push(testStep);

      const lastItem = storage.getLastItem();

      expect(lastItem).toBe(testStep);
    });

    it('should return undefined when items array is empty', () => {
      const lastItem = storage.getLastItem();

      expect(lastItem).toBeUndefined();
    });
  });
});

describe('findLast', () => {
  it('should find last element matching predicate', () => {
    const arr = [1, 2, 3, 4, 5];
    const predicate = (num: number) => num % 2 === 0; // even numbers

    const result = findLast(arr, predicate);

    expect(result).toBe(4);
  });

  it('should return undefined when no element matches predicate', () => {
    const arr = [1, 3, 5, 7];
    const predicate = (num: number) => num % 2 === 0; // even numbers

    const result = findLast(arr, predicate);

    expect(result).toBeUndefined();
  });

  it('should return undefined for empty array', () => {
    const arr: number[] = [];
    const predicate = (num: number) => num > 0;

    const result = findLast(arr, predicate);

    expect(result).toBeUndefined();
  });

  it('should find last element in array with one element', () => {
    const arr = [1];
    const predicate = (num: number) => num > 0;

    const result = findLast(arr, predicate);

    expect(result).toBe(1);
  });

  it('should work with complex objects', () => {
    const arr = [
      { id: 1, type: 'test' },
      { id: 2, type: 'step' },
      { id: 3, type: 'test' },
      { id: 4, type: 'step' },
    ];
    const predicate = (item: any) => item.type === 'test';

    const result = findLast(arr, predicate);

    expect(result).toEqual({ id: 3, type: 'test' });
  });
}); 
