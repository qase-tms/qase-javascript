const assert = require('assert');


describe('test without qase metadata', function() {
  it('successful test', function() {
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    assert.strictEqual(1, 2);
  });
});

describe('test with qase id', function() {
  it('successful test', function() {
    this.qaseId(1);
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    this.qaseId(2);
    assert.strictEqual(1, 2);
  });
});

describe('test with title', function() {
  it('successful test', function() {
    this.title('Successful test with title');
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    this.title('Failing test with title');
    assert.strictEqual(1, 2);
  });
});

describe('test with suite', function() {
  it('successful test', function() {
    this.suite('Suite 1');
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    this.suite('Suite 1');
    assert.strictEqual(1, 2);
  });
});

describe('test with comment', function() {
  it('successful test', function() {
    this.comment('comment');
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    this.comment('comment');
    assert.strictEqual(1, 2);
  });
});

describe('test with parameters', function() {
  const params = [1, 2, 3, 4, 5];
  params.forEach((param) => {
    it(`successful test with parameter ${param}`, function() {
      this.parameters({ number: param });
      assert.strictEqual(param, param);
    });
    it(`failing test with parameter ${param}`, function() {
      this.parameters({ number: param });
      assert.strictEqual(param, param + 1);
    });
  });
});


describe('test with fields', function() {
  it('successful test', function() {
    this.fields({ custom_field: 'value' });
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    this.fields({ custom_field: 'value' });
    assert.strictEqual(1, 2);
  });
});

describe('ignored test', function() {
  it('successful test', function() {
    this.ignore();
    assert.strictEqual(1, 1);
  });

  it('failing test', function() {
    this.ignore();
    assert.strictEqual(1, 2);
  });
});
