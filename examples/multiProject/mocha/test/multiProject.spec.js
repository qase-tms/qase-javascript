const assert = require('assert');
const { qase } = require('mocha-qase-reporter/mocha');

describe('Multi-project example', function () {
  // Map this test to case 1 in PROJ1 and case 2 in PROJ2. Replace IDs with real case IDs in your projects.
  it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'A test reported to two projects'), function () {
    assert.strictEqual(1, 1);
  });

  it(
    qase.projects(
      { PROJ1: [10, 11], PROJ2: [20] },
      'Another test with multiple cases per project',
    ),
    function () {
      assert.strictEqual(1 + 1, 2);
    },
  );
});
