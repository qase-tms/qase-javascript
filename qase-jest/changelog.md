# jest-qase-reporter@2.0.4

## What's new

Improved test name processing: Qase IDs are now automatically removed when uploading results

# jest-qase-reporter@2.0.3

## What's new

Added the ability to specify a test metadata in tests:

- `qase.title` - set the test title
- `qase.fields` - set the test fields
- `qase.suite` - set the test suite
- `qase.comment` - set the test comment
- `qase.parameters` - set the test parameters
- `qase.groupParameters` - set the test group parameters
- `qase.ignore` - ignore the test in Qase
- `qase.attach` - attach a file to the test
- `qase.steps` - add the test steps

```ts
const { qase } = require('jest-qase-reporter/jest');

test('test', () => {
  qase.title('Title');
  qase.fields({ custom_field: 'value' });
  qase.suite('Suite');
  qase.comment('Comment');
  qase.parameters({ param01: 'value' });
  qase.groupParameters({ param02: 'value' });
  qase.ignore();
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', type: 'text/plain' });

  qase.step('Step 1', () => {
    expect(true).toBe(true);
  });

  expect(true).toBe(true);
});
```

# jest-qase-reporter@2.0.1

## What's new

Fixed a bug when a test was marked as skipped.
This reporter has uploaded this test as blocked.
Right now the reporter will upload this test as skipped.

# jest-qase-reporter@2.0.0

## What's new

This is the first release in the 2.x series of the Jest reporter.
It brings new and more flexible configs, uploading results in parallel with running tests,
and other powerful features.

This changelog entry will be updated soon.
For more information about the new features and a guide for migration from v1, refer to the
[reporter documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-jest#readme)

# jest-qase-reporter@2.0.0-beta.2

## What's new

* This release brings support for multiple changes made in the Qase API client
  and the qase-javascript-commons library.

# jest-qase-reporter@2.0.0-beta.2

The v2 series of the Jest reporter has significant interface changes:

* New import path.
* New configuration data scheme.

See the README for reference and instructions on upgrading from v1.
