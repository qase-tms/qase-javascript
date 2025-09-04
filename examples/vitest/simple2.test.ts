import { describe, it, expect } from 'vitest';

describe('Simple Test Suite 1', () => {
  it('should pass 1', () => {
    expect(1 + 1).toBe(2);
  });

  it('should fail 1', () => {
    expect(1 + 1).toBe(3);
  });

  it.skip('should be skipped 1', () => {
    expect(true).toBe(true);
  });

  it('should pass with annotation', () => {
    expect(2 * 2).toBe(4);
  });
});

describe('Simple Test Suite 2', () => {
  it('should pass 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('should fail 2', () => {
    expect(1 + 1).toBe(3);
  });

  it.skip('should be skipped 2', () => {
    expect(true).toBe(true);
  });
});
