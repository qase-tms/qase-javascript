import { describe, it, expect } from 'vitest';

describe('Simple Test Suite 1', () => {
  it('should pass 1 [Q-101]', () => {
    expect(1 + 1).toBe(2);
  });

  it('should fail 1 [Q-102]', () => {
    expect(1 + 1).toBe(3);
  });

  it.skip('should be skipped 1 [Q-103]', () => {
    expect(true).toBe(true);
  });

  it('should pass with annotation [Q-104]', () => {
    expect(2 * 2).toBe(4);
  });
});

describe('Simple Test Suite 2', () => {
  it('should pass 2 [Q-201]', () => {
    expect(1 + 1).toBe(2);
  });

  it('should fail 2 [Q-202]', () => {
    expect(1 + 1).toBe(3);
  });

  it.skip('should be skipped 2 [Q-203]', () => {
    expect(true).toBe(true);
  });
});
