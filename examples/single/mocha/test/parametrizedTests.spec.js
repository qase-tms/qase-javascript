const assert = require('assert');

describe('Parametrized test', function() {
  const params = [1, 2, 3, 4, 5];
  params.forEach((param) => {
    it(`test with parameters success ${param}`, function() {
      this.parameters({ number: param });
      assert.strictEqual(param, param);
    });
    it(`test with parameters failed ${param}`, function() {
      this.parameters({ number: param });
      assert.strictEqual(param, param + 1);
    });
  });
});
