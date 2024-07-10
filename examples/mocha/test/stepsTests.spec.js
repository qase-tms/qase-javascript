const assert = require('assert');


describe('tests with steps', function() {
  it('successful test with steps', function() {
    this.step('step 1', function() {
      this.attach({name:"attachment.log", content:"data", contentType:"text/plain"});
    });
    this.step('step 2', function() {});
    this.attach({name:"attachment111.log", content:"data", contentType:"text/plain"});
    assert.strictEqual(1, 1);
  });

  it('failing test with steps', function() {
    this.step('step 1', function() {});
    this.step('step 2', function() {});
    assert.strictEqual(1, 2);
  });
});
