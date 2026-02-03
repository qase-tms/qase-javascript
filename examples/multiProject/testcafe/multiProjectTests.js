import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Multi-project example`.page`http://devexpress.github.io/testcafe/example/`;

// Map to case 1 in PROJ1 and case 2 in PROJ2. Replace IDs with real case IDs in your projects.
test.meta(qase.projects({ PROJ1: [1], PROJ2: [2] }).create())('A test reported to two projects', async (t) => {
  await t.expect(true).ok();
});

test.meta(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }).create())('Another test with multiple cases per project', async (t) => {
  await t.expect(1 + 1).eql(2);
});
