const assert = require('assert');


describe('Attachment tests', function() {
  it('successful test with string attachment', function() {
    this.attach({name:"attachment.log", content:"data", contentType:"text/plain"});
    assert.strictEqual(1, 1);
  });

  it('failing test with string attachment', function() {
    this.attach({name:"attachment.log", content:"data", contentType:"text/plain"});
    assert.strictEqual(1, 2);
  });
});
