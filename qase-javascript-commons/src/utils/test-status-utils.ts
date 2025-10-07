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
  if (isAssertionError(error)) {
    return TestStatusEnum.failed;
  }

  // For all other errors, return invalid
  return TestStatusEnum.invalid;
}

/**
 * Checks if error is an assertion error
 * @param error - Error object
 * @returns boolean - true if assertion error
 */
function isAssertionError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';
  
  // Common assertion error patterns
  const assertionPatterns = [
    'expect',
    'assert',
    'matcher',
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

  if (hasNonAssertionPattern) {
    return false;
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
  const statusMap: Record<string, TestStatusEnum> = {
    'passed': TestStatusEnum.passed,
    'failed': TestStatusEnum.failed,
    'skipped': TestStatusEnum.skipped,
    'disabled': TestStatusEnum.disabled,
    'pending': TestStatusEnum.skipped,
    'todo': TestStatusEnum.disabled,
    'focused': TestStatusEnum.passed,
    'timedOut': TestStatusEnum.failed,
    'interrupted': TestStatusEnum.failed,
  };

  // Convert to lowercase for case-insensitive matching
  const normalizedStatus = originalStatus.toLowerCase();
  return statusMap[normalizedStatus] || TestStatusEnum.skipped;
}
