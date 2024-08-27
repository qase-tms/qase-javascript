# qase-mocha@1.0.0-beta.3

## What's new

Support group parameters for test cases. You can specify the group parameters in the test case using the following format: 

```ts
  it('test', () => {
    this.groupParameters({ param1: 'value1', param2: 'value2' });
    expect(true).to.equal(true);
  });
```

# qase-mocha@1.0.0-beta.2

## What's new

Support parallel execution of tests.

# qase-mocha@1.0.0-beta.1

## What's new

First major beta release for the version 1 series of the Qase Mocha reporter.
