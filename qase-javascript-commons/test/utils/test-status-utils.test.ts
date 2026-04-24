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

  describe('when Cypress-specific failure', () => {
    // Helper: simulate real Cypress stack trace with browser URLs
    const cypressStack = (msg: string) =>
      `CypressError: ${msg}\n` +
      '    at cypressErr (https://localhost:3000/__cypress/runner/cypress_runner.js:180818:16)\n' +
      '    at Context.runnable.fn (https://localhost:3000/__cypress/runner/cypress_runner.js:190234:20)';

    // Real Cypress messages use backticks around commands and include docs URLs.
    // These tests use actual Cypress error message format captured from Cypress 15.x.

    it('should return failed for cy.click() on non-interactable element (0x0 dimensions)', () => {
      const error = new Error(
        'Timed out retrying after 4000ms: `cy.click()` failed because this element is not visible:\n\n' +
        '`<button id="zero-size" style="width:0;height:0;padding:0;border:0;overflow:hidden;">Hidden</button>`\n\n' +
        'This element `<button#zero-size>` is not visible because it has an effective width and height of: `0 x 0` pixels.\n\n' +
        'Fix this problem, or use `{force: true}` to disable error checking.\n\n' +
        'https://on.cypress.io/element-cannot-be-interacted-with'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for cy.wait() on intercepted route that never fires', () => {
      const error = new Error(
        'Timed out retrying after 4000ms: `cy.wait()` timed out waiting `4000ms` for the 1st request to the route: `neverFires`. No request ever occurred.\n\n' +
        'https://on.cypress.io/wait'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for cy.click() on detached DOM element', () => {
      const error = new Error(
        'Timed out retrying after 4000ms: `cy.click()` failed because this element is detached from the DOM.\n\n' +
        'https://on.cypress.io/element-has-detached-from-dom'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for Cypress retry-ability prefix with Expected...but never found', () => {
      const error = new Error(
        "Timed out retrying after 4000ms: Expected to find element: '.foo', but never found it.\n\n" +
        'https://on.cypress.io/element-not-found'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for Cypress .should() assertion timeout', () => {
      const error = new Error(
        "Timed out retrying after 4000ms: expected '<div>' to be visible\n\n" +
        'https://on.cypress.io/assertions'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should still return invalid for cy.request() timeout (real infrastructure failure)', () => {
      const error = new Error(
        '`cy.request()` timed out waiting `4000ms` for a response from your server.\n\n' +
        'The request we sent was:\n\n' +
        'Method: GET\n' +
        'URL: http://192.0.2.1:1/\n\n' +
        'No response was received within the timeout.\n\n' +
        'https://on.cypress.io/request'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });

    it('should still return invalid for cy.request() with ECONNREFUSED', () => {
      const error = new Error(
        '`cy.request()` failed trying to load:\n\n' +
        'https://unreachable.example.com\n\n' +
        'We attempted to make an http request to this URL but the request failed without a response.\n\n' +
        'We received this error at the network level:\n\n' +
        '  > Error: connect ECONNREFUSED 127.0.0.1:8080\n\n' +
        'https://on.cypress.io/request'
      );
      error.stack = cypressStack(error.message);
      const result = determineTestStatus(error, 'failed');
      expect(result).toBe(TestStatusEnum.invalid);
    });
  });

  describe('when runner reports timedOut or interrupted status', () => {
    it('should return failed for timedOut with timeout error (Playwright test timeout)', () => {
      const error = new Error('Test timeout of 2000ms exceeded.');
      const result = determineTestStatus(error, 'timedOut');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for timedOut with navigation timeout error', () => {
      const error = new Error('page.waitForTimeout: Timeout 5000ms exceeded.');
      const result = determineTestStatus(error, 'timedOut');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should return failed for interrupted with error', () => {
      const error = new Error('Test was interrupted due to maxFailures limit');
      const result = determineTestStatus(error, 'interrupted');
      expect(result).toBe(TestStatusEnum.failed);
    });

    it('should handle case-insensitive timedOut status', () => {
      const error = new Error('Test timeout of 2000ms exceeded.');
      const result = determineTestStatus(error, 'TIMEDOUT');
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
