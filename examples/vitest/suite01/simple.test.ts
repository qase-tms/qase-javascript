import { describe, it, expect } from 'vitest';
import { addQaseId } from 'vitest-qase-reporter/vitest';

describe('Suite 01 - Basic Test Examples', () => {
  it(addQaseId('should pass basic assertion', [1]), () => {
    expect(1 + 1).toBe(2);
  });

  it(addQaseId('should fail basic assertion', [2]), () => {
    expect(1 + 1).toBe(3);
  });

  it.skip(addQaseId('should be skipped', [3]), () => {
    expect(true).toBe(true);
  });

  it(addQaseId('test with multiple calculations', [4]), () => {
    expect(Math.max(1, 2, 3)).toBe(3);
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('test without qase ID - will be auto-created', () => {
    expect(2 * 2).toBe(4);
  });
});
