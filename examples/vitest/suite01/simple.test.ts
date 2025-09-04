import { describe, it, expect } from 'vitest';
import { qase } from 'vitest-qase-reporter/vitest';

describe('Suite 01 - Simple Test Suite', () => {
  it(qase(1, 'should pass'), () => {
    expect(1 + 1).toBe(2);
  });

  it(qase(2, 'should fail'), () => {
    expect(1 + 1).toBe(3);
  });

  it.skip(qase(3, 'should be skipped'), () => {
    expect(true).toBe(true);
  });

  it(qase(4, 'test with multiple calculations'), () => {
    expect(Math.max(1, 2, 3)).toBe(3);
    expect(Math.min(1, 2, 3)).toBe(1);
  });
});
