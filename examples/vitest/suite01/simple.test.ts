import { describe, it, expect } from 'vitest';

describe('Suite 01 - Simple Test Suite', () => {
  it('should pass [Q-301]', () => {
    expect(1 + 1).toBe(2);
  });

  it('should fail [Q-302]', () => {
    expect(1 + 1).toBe(3);
  });

  it.skip('should be skipped [Q-303]', () => {
    expect(true).toBe(true);
  });

  it('test with multiple calculations [Q-304]', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
    expect(Math.min(1, 2, 3)).toBe(1);
  });
});
