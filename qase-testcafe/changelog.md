# qase-testcafe@2.1.3

## What's new

- Added support for status filter in the test run.
- Improved error handling.

# qase-testcafe@2.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.

# qase-testcafe@2.0.6

## What's new

Enhanced handling of start and end times for tests and steps, ensuring greater accuracy in reporting.

# qase-testcafe@2.0.4

## What's new

Support `step` and `attach` methods for test cases. 

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

test('test', async (t) => {
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
  
  await qase.step('Step 1', async (s1) => {
    await s1.step('Step 1.1', async (s11) => {
      await s11.step('Step 1.1.1', async (s111) => {
        s11.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
        await s111.expect(true).ok();
      });
    });
    await t.expect(true).ok();
  });
  await t.expect(true).ok();
});
```

# qase-testcafe@2.0.3

## What's new

Support `ignore` metadata for test cases. If the test case has the `ignore` tag, the reporter will not send the result to the Qase
TMS.

```ts
const q = qase.ignore().create();
test.meta({ ...q })(
  'test',
  async (t) => {
    await t;
  },
);
```

# qase-testcafe@2.0.2

## What's new

Improved error collection. The error stack trace contains more useful debugging information: browser, code, etc.

# qase-testcafe@2.0.1

## What's new

Support group parameters for test cases. You can specify the group parameters in the test case using the following
format:

```ts
const q = qase.groupParameters({ 'param01': 'value01', 'param02': 'value02' }).create();
test.meta({ ...q })(
  'test',
  async (t) => {
    await t;
  },
);
```

# qase-testcafe@2.0.0

## What's new

This is the first release in the 2.x series of the TestCafe reporter.
It brings a new annotation syntax with test parametrization and field values,
new and more flexible configs, uploading results in parallel with running tests,
and other powerful features.

This changelog entry will be updated soon.
For more information about the new features and a guide for migration from v1, refer to the
[reporter documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-testcafe#readme)

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
