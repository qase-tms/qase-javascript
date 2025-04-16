const assert = require('assert');
const { qase } = require('mocha-qase-reporter/mocha');


describe('Simple tests async', function() {
  // this.timeout(60000);

  it('test without qase metadata success', async function() {
    assert.strictEqual(1, 1);
  });

  it('test without qase metadata failed', async function() {
    assert.strictEqual(1, 2);
  });

  it.skip(qase(10, 'test with qase id success'), async function() {
    assert.strictEqual(1, 1);
  });

  it(qase(20, 'test with qase id failed'), async function() {
    assert.strictEqual(1, 2);
  });

  it('test with title success', async function() {
    this.title('Successful test with title');
    assert.strictEqual(1, 1);
  });

  it('test with title failed', async function() {
    this.title('Failing test with title');
    assert.strictEqual(1, 2);
  });

  it('test with suite success', async function() {
    this.suite('Suite 1 async');
    assert.strictEqual(1, 1);
  });

  it('test with suite failed', async function() {
    this.suite('Suite 1 async');
    assert.strictEqual(1, 2);
  });

  it('test with comment success', async function() {
    this.comment('comment');
    assert.strictEqual(1, 1);
  });

  it('test with comment failed', async function() {
    this.comment('comment');
    assert.strictEqual(1, 2);
  });

  it('test with fields success', async function() {
    this.fields({ custom_field: 'value' });
    assert.strictEqual(1, 1);
  });

  it('test with fields failed', async function() {
    this.fields({ custom_field: 'value' });
    assert.strictEqual(1, 2);
  });

  it('ignored test success', async function() {
    this.ignore();
    assert.strictEqual(1, 1);
  });

  it('ignored test failed', async function() {
    this.ignore();
    assert.strictEqual(1, 2);
  });
});

