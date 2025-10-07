const assert = require('assert');
const { qase } = require('mocha-qase-reporter/mocha');

describe('Multi-Reporter Demo Tests', function() {
  it('simple test without qase metadata', function() {
    assert.strictEqual(1, 1);
  });

  it(qase(1, 'test with qase id'), function() {
    assert.strictEqual(2, 2);
  });

  it(qase(2, 'test with custom title'), function() {
    assert.strictEqual(3, 3);
  });

  it(qase(3, 'test with custom suite'), function() {
    assert.strictEqual(4, 4);
  });

  it(qase(4, 'test with comment'), function() {
    assert.strictEqual(5, 5);
  });

  it(qase(5, 'test with fields'), function() {
    assert.strictEqual(6, 6);
  });

  it(qase(6, 'test with attachment'), function() {
    assert.strictEqual(7, 7);
  });

  it(qase(7, 'test with steps'), function() {
    assert.strictEqual(8, 8);
  });

  it(qase(8, 'failing test for demonstration'), function() {
    assert.strictEqual(1, 2); // This will fail
  });

  it.skip(qase(9, 'skipped test'), function() {
    assert.strictEqual(1, 1);
  });
});
