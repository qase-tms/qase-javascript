import { describe, test, expect } from 'vitest';
import { addQaseProjects } from 'vitest-qase-reporter/vitest';

describe('Multi-project example', () => {
  // Map this test to case 1 in PROJ1 and case 2 in PROJ2. Replace IDs with real case IDs in your projects.
  test(
    addQaseProjects('A test reported to two projects', { PROJ1: [1], PROJ2: [2] }),
    () => {
      expect(true).toBe(true);
    },
  );

  test(
    addQaseProjects('Another test with multiple cases per project', {
      PROJ1: [10, 11],
      PROJ2: [20],
    }),
    () => {
      expect(1 + 1).toBe(2);
    },
  );
});
