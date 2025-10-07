import { expect } from '@jest/globals';
import { determineTestStatus } from '../../src/utils/test-status-utils';
import { TestStatusEnum } from '../../src/models/test-execution';

describe('determineTestStatus', () => {
  describe('when no error', () => {
    it('should return original status for passed test', () => {
      const result = determineTestStatus(null, 'passed');
      expect(result).toBe(TestStatusEnum.passed);
    });

    it('should return original status for skipped test', () => {
      const result = determineTestStatus(null, 'skipped');
      expect(result).toBe(TestStatusEnum.skipped);
    });

    it('should return original status for disabled test', () => {
      const result = determineTestStatus(null, 'disabled');
      expect(result).toBe(TestStatusEnum.disabled);
    });

    it('should handle case-insensitive status matching', () => {
      const result = determineTestStatus(null, 'PASSED');
      expect(result).toBe(TestStatusEnum.passed);
    });

    it('should return skipped as default for unknown status', () => {
      const result = determineTestStatus(null, 'unknown_status');
      expect(result).toBe(TestStatusEnum.skipped);
    });
  });

  describe('when assertion error', () => {
    it('should return failed for expect error', () => {
      const error = new Error('expect(received).toBe(expected)');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for assertion error', () => {
      const error = new Error('Assertion failed: expected 1 to equal 2');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for matcher error', () => {
      const error = new Error('Matcher error: toBe');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for test failed message', () => {
      const error = new Error('Test failed: expected true to be false');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for Chai AssertionError', () => {
      const error = new Error('Assertion failed');
      error.name = 'AssertionError';
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for error with assertion in stack', () => {
      const error = new Error('Some error');
      error.stack = 'Error: Some error\n    at expect (test.js:10:5)';
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for timeout error with expect assertion', () => {
      const error = new Error('Error: Timed out 5000ms waiting for expect(locator).toBeVisible()');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for timeout error with expect and toBe', () => {
      const error = new Error('Timeout of 5000ms exceeded waiting for expect(element).toBe(true)');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });
  });

  describe('when non-assertion error', () => {
    it('should return invalid for network error', () => {
      const error = new Error('Network request failed');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for timeout error without assertion patterns', () => {
      const error = new Error('Timeout of 5000ms exceeded');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for timeout error with network context', () => {
      const error = new Error('Timeout waiting for network request');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for timeout error with toBe pattern (no expect)', () => {
      const error = new Error('Timeout waiting for element.toBe(true)');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for timeout error with matcher pattern (no expect)', () => {
      const error = new Error('Timed out 5000ms waiting for element.toContain("text")');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for syntax error', () => {
      const error = new Error('SyntaxError: Unexpected token');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for reference error', () => {
      const error = new Error('ReferenceError: variable is not defined');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for type error', () => {
      const error = new Error('TypeError: Cannot read property of undefined');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });
  });
});
