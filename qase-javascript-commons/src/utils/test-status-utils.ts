import { TestStatusEnum } from '../models/test-execution';

/**
 * Determines test status based on error type
 * @param error - Error object or null
 * @param originalStatus - Original test status from test runner
 * @returns TestStatusEnum - failed for assertion errors, invalid for other errors
 */
export function determineTestStatus(error: Error | null, originalStatus: string): TestStatusEnum {
  // If no error, return the original status
  if (!error) {
    return mapOriginalStatus(originalStatus);
  }

  // Check if it's an assertion error
  if (isAssertionError(error, originalStatus)) {
    return TestStatusEnum.failed;
  }

  // For all other errors, return invalid
  return TestStatusEnum.invalid;
}

/**
 * Checks if error is an assertion error
 * @param error - Error object
 * @param originalStatus - Original test status from test runner
 * @returns boolean - true if assertion error
 */
function isAssertionError(error: Error, originalStatus: string): boolean {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';
  const normalizedOriginalStatus = originalStatus.toLowerCase();
  
  // Common assertion error patterns
  const assertionPatterns = [
    'expect',
    'assert',
    'matcher',
    'objectcontaining',
    'assertion',
    'expected',
    'actual',
    'to be',
    'to equal',
    'to contain',
    'to match',
    'to throw',
    'to be called',
    'to have been called',
    'test failed',
    'expectation failed',
    'assertion failed'
  ];

  // Non-assertion error patterns that should be invalid
  const nonAssertionPatterns = [
    'syntaxerror',
    'referenceerror',
    'typeerror',
    'network',
    'timeout',
    'connection',
    'http',
    'fetch',
    'axios',
    'cors',
    'permission',
    'access denied',
    'unauthorized',
    'forbidden',
    'not found',
    'server error',
    'internal error'
  ];

  // Special case: timeout errors with expect should be treated as assertion errors
  const isTimeoutWithExpect = errorMessage.includes('timeout') && 
    errorMessage.includes('expect');

  if (isTimeoutWithExpect) {
    return true;
  }

  // Check for non-assertion patterns (excluding timeout for special handling above)
  const nonAssertionPatternsWithoutTimeout = nonAssertionPatterns.filter(pattern => pattern !== 'timeout');
  const hasNonAssertionPattern = nonAssertionPatternsWithoutTimeout.some(pattern =>
    errorMessage.includes(pattern) || errorStack.includes(pattern)
  );

  // Cypress-specific failure patterns (computed early — needed in multiple branches).
  // "Timed out retrying after Nms" is Cypress' retry-ability prefix for DOM commands.
  // "cy.<cmd>() failed" / "cy.<cmd>() timed out" is Cypress' command failure syntax.
  const isCypressRetryTimeout = /timed out retrying after \d+ms/.test(errorMessage);
  const isCypressCommandFailure = /cy\.\w+\(\)\s+(failed|timed out)/.test(errorMessage);

  if (hasNonAssertionPattern) {
    const hasAssertionContext = assertionPatterns.some(pattern =>
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
    const isRunnerFailed = normalizedOriginalStatus === 'failed' || normalizedOriginalStatus === 'timedout' || normalizedOriginalStatus === 'interrupted';
    const isSyntaxError = errorMessage.includes('syntaxerror') || errorStack.includes('syntaxerror');
    // When runner reported failure and error has assertion context (expect, ObjectContaining, diff),
    // treat as Failed. Exception: SyntaxError (e.g. "Unexpected token") contains "expected" as false positive.
    if (isRunnerFailed && hasAssertionContext && !isSyntaxError) {
      return true;
    }

    // Cypress override: Cypress stack traces contain browser URLs
    // (https://localhost/__cypress/runner/...) which false-positive on the "http"
    // pattern above. When the error MESSAGE itself has a Cypress retry-ability
    // prefix or command failure, and the message doesn't contain a real
    // infrastructure marker (network, connection, etc.), this is a genuine
    // application failure, not an environment issue.
    if ((isCypressRetryTimeout || isCypressCommandFailure) && isRunnerFailed) {
      const hasMessageInfraMarker = nonAssertionPatternsWithoutTimeout.some(pattern =>
        errorMessage.includes(pattern)
      );
      if (!hasMessageInfraMarker) {
        return true;
      }
    }

    return false;
  }

  // Cypress failure without any non-assertion pattern at all (clean stack trace)
  if (isCypressRetryTimeout || isCypressCommandFailure) {
    return true;
  }

  // For timeout errors without expect, treat as invalid
  if (errorMessage.includes('timeout')) {
    return false;
  }

  // Check error message and stack for assertion patterns
  const hasAssertionPattern = assertionPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorStack.includes(pattern)
  );

  // Check for specific error types that indicate assertions
  const isJestMatcherError = error.name === 'Error' && 
    (errorMessage.includes('expect') || errorMessage.includes('matcher'));
  
  const isChaiAssertionError = error.name === 'AssertionError';
  
  const isPlaywrightAssertionError = error.name === 'Error' && 
    (errorMessage.includes('expect') || errorMessage.includes('assert'));

  return hasAssertionPattern || isJestMatcherError || isChaiAssertionError || isPlaywrightAssertionError;
}

/**
 * Maps original test runner status to TestStatusEnum
 * @param originalStatus - Original status from test runner
 * @returns TestStatusEnum
 */
function mapOriginalStatus(originalStatus: string): TestStatusEnum {
  // Keys must be lowercase to match normalizedStatus (case-insensitive matching)
  const statusMap: Record<string, TestStatusEnum> = {
    'passed': TestStatusEnum.passed,
    'failed': TestStatusEnum.failed,
    'skipped': TestStatusEnum.skipped,
    'disabled': TestStatusEnum.disabled,
    'pending': TestStatusEnum.skipped,
    'todo': TestStatusEnum.disabled,
    'focused': TestStatusEnum.passed,
    'timedout': TestStatusEnum.failed,
    'interrupted': TestStatusEnum.failed,
  };

  const normalizedStatus = originalStatus.toLowerCase();
  return statusMap[normalizedStatus] || TestStatusEnum.skipped;
}
