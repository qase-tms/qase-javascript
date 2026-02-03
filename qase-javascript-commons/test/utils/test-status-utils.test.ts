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

    it('should return failed when no error but original status is failed', () => {
      const result = determineTestStatus(null, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed when no error but original status is timedOut', () => {
      const result = determineTestStatus(null, 'timedOut');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed when no error but original status is interrupted', () => {
      const result = determineTestStatus(null, 'interrupted');
      expect(result).toBe(TestStatusEnum.failed);
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

    it('should return failed for TypeError from expect.objectContaining on null (deep matcher)', () => {
      const error = new Error("TypeError: Cannot read properties of null (reading 'id')");
      error.stack = 'Error: Cannot read properties of null\n    at ObjectContaining (expect.js:10:5)\n    at expect (matcher.js:5:10)';
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for TypeError with expect in stack (assertion context)', () => {
      const error = new Error('TypeError: Cannot read properties of undefined (reading "createdBy")');
      error.stack = 'TypeError: Cannot read properties of undefined\n    at toEqual (node_modules/expect/build/index.js:1:1)\n    at expect (test.spec.ts:42:10)';
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed when error has "not found" in message but assertion context and runner failed (Playwright diff case)', () => {
      const error = new Error('Expected: ObjectContaining {...}\nReceived: {... field: "not found" ...}');
      error.stack = 'at expect (body.spec.js:97:71)';
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed when error has "forbidden" in message but expect in stack and runner failed', () => {
      const error = new Error('Received: 403 Forbidden');
      error.stack = 'at expect (test.spec.ts:10:5)\n    at toEqual (expect.js:1:1)';
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

    it('should return invalid when error has "not found" and "expected" but runner status is passed (no override)', () => {
      const error = new Error('Expected: X\nReceived: not found');
      error.stack = 'at expect (test.js:1:1)';
      const result = determineTestStatus(error, 'passed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should return invalid for "internal error" without assertion context', () => {
      const error = new Error('Internal error: something went wrong');
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });
  });
});
