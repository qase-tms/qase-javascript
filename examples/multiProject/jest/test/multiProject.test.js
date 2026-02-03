const { qase } = require('jest-qase-reporter/jest');
const { describe, test, expect } = require('@jest/globals');

describe('Multi-project example', () => {
  // Map this test to case 1 in PROJ1 and case 2 in PROJ2. Replace IDs with real case IDs in your projects.
  test(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'A test reported to two projects'), () => {
    expect(true).toBe(true);
  });

  test(
    qase.projects(
      { PROJ1: [10, 11], PROJ2: [20] },
      'Another test with multiple cases per project',
    ),
    () => {
      expect(1 + 1).toBe(2);
    },
  );
});
