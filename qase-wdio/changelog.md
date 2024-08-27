# qase-wdio@1.0.0-beta.2

## What's new

Support group parameters for test cases. You can specify the group parameters in the test case using the following
format:

```ts
  it('test', () => {
  qase.groupParameters({ 'param01': 'value01', 'param02': 'value02' });
  expect(true).to.equal(true);
});
```

# qase-wdio@1.0.0-beta.1

## What's new

First major beta release for the version 1 series of the Qase WebDriverIO reporter.
