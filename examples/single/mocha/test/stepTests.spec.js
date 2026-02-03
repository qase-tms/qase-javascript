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

  it('test with steps including expected results and data', function() {
    this.step('Click button', function() {
      // Click action
    }, 'Button should be clicked', 'Button data');
    
    this.step('Fill form', function() {
      // Form filling action
    }, 'Form should be filled', 'Form input data');
    
    assert.strictEqual(1, 1);
  });
});
