const assert = require('assert');
const { qase } = require('mocha-qase-reporter/mocha');


describe('Simple tests', function() {
  it('test without qase metadata success', function() {
    assert.strictEqual(1, 1);
  });

  it('test without qase metadata failed', function() {
    assert.strictEqual(1, 2);
  });

  it.skip(qase(1, 'test with qase id success'), function() {
    assert.strictEqual(1, 1);
  });

  it(qase(2, 'test with qase id failed'), function() {
    assert.strictEqual(1, 2);
  });

  it('test with title success', function() {
    this.title('Successful test with title');
    assert.strictEqual(1, 1);
  });

  it('test with title failed', function() {
    this.title('Failing test with title');
    assert.strictEqual(1, 2);
  });

  it('test with suite success', function() {
    this.suite('Suite 1');
    assert.strictEqual(1, 1);
  });

  it('test with suite failed', function() {
    this.suite('Suite 1');
    assert.strictEqual(1, 2);
  });

  it('test with comment success', function() {
    this.comment('comment');
    assert.strictEqual(1, 1);
  });

  it('test with comment failed', function() {
    this.comment('comment');
    assert.strictEqual(1, 2);
  });

  it('test with fields success', function() {
    this.fields({ custom_field: 'value' });
    assert.strictEqual(1, 1);
  });

  it('test with fields failed', function() {
    this.fields({ custom_field: 'value' });
    assert.strictEqual(1, 2);
  });

  it('ignored test success', function() {
    this.ignore();
    assert.strictEqual(1, 1);
  });

  it('ignored test failed', function() {
    this.ignore();
    assert.strictEqual(1, 2);
  });
});

