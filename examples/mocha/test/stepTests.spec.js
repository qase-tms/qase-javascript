const assert = require('assert');


describe('Step tests', function() {
  it('successful test with steps', function() {
    this.step('step 1', function() {});
    this.step('step 2', function() {});
    assert.strictEqual(1, 1);
  });

  it('failing test with steps', function() {
    this.step('step 1', function() {});
    this.step('step 2', function() {});
    assert.strictEqual(1, 2);
  });
});
