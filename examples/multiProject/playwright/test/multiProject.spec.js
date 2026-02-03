const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');

test.describe('Multi-project example', () => {
  // 1) Via qase.projects() inside the test (metadata)
  test('A test reported to two projects', async () => {
    qase.projects({ PROJ1: [1], PROJ2: [2] });
    expect(true).toBe(true);
  });

  test('Another test with multiple cases per project', async () => {
    qase.projects({ PROJ1: [10, 11], PROJ2: [20] });
    expect(1 + 1).toBe(2);
  });

  // 2) Via qase.projectsTitle() in the test name (same as single-project qase(id, name))
  test(qase.projectsTitle('Multi-project via title', { PROJ1: [3,8], PROJ2: [4,7] }), async () => {
    expect(2 + 2).toBe(4);
  });

  // 3) Via annotation: type "QaseProjects", description JSON
  test(
    'Multi-project via annotation',
    { annotation: { type: 'QaseProjects', description: '{"PROJ1":[5],"PROJ2":[6]}' } },
    async () => {
      expect(true).toBe(true);
    },
  );
});
