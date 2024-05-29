# qase-testcafe@2.0.0-beta.2

## What's new

Add new syntax to annotate the following fields: `QaseID`, `QaseTitle`, `QaseFields`, `QaseParameters`:

```diff
+ import { qase } from 'testcafe-reporter-qase/qase';
- test.meta('CID', '2')('Test name', async t => {...});
+ const q = qase.id(2).title('Test name').fields('field1', 'field2').parameters('param1', 'param2').create();
+ test.meta(q)('Test name', async t => {...});
```

# qase-testcafe@2.0.0-beta.1

## What's new

First major beta release for the version 2 series of the Qase TestCafe reporter.
