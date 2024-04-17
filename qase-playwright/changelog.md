# playwright-qase-reporter@2.0.0-beta.11

## What's new

- Using the `qase` annotation in a chain

```js
test('Ultimate Question of Life, The Universe, and Everything', async ({ page }) => {
    qase.id(42)
      .title('Ultimate Question of Life, The Universe, and Everything')
      .fields({ severity: high, priority: medium })
      .attach({ paths: '/path/to/file'});
    ...
})
```

# playwright-qase-reporter@2.0.0-beta.10

## What's new

- Reporting no longer fails when a test has failed but no stacktrace was collected.
  ("TypeError: Cannot read properties of undefined (reading 'toString')").

# playwright-qase-reporter@2.0.0-beta.9

## What's new

### Collect test suite information

Collect the following information as the test's suite:

- path to the file which contains the test;
- value of the `test.describe()` declaration, if it exists.

The resulting test suite will be added to the test metadata.
If Qase workspace is configured to update test cases from reported
tests results, the newly created cases will be structured by their
suites, derived from file path and `test.describe()`.


# playwright-qase-reporter@2.0.0-beta.8

## What's new

Fix the problem with dependencies, introduced in `2.0.0-beta.7`


# playwright-qase-reporter@2.0.0-beta.7

## What's new

Previously, we logged a message about the use of an outdated annotation immediately when running the test. 
Now we will log the message after all tests are completed. Like this:

```log
qase: qase(caseId) is deprecated. Use qase.id() and qase.title() inside the test body
The following tests are using the old annotation:
at /Users/gda/Documents/github/qase-javascript/examples/playwright/test/arith.test.js:12:8
at /Users/gda/Documents/github/qase-javascript/examples/playwright/test/arith.test.js:16:7
at /Users/gda/Documents/github/qase-javascript/examples/playwright/test/arith.test.js:7:7

```

# playwright-qase-reporter@2.0.0-beta.6

## What's new

Capture `stdout` and `stderr` logs as attachments.
To enable this feature, set environment variable `QASE_CAPTURE_LOGS=true` or
add `captureLogs: true` to the reporter configuration:

```diff
[
  'playwright-qase-reporter',
  {
    mode: 'testops', 
+   captureLogs: true,
    ...
  },
];
```

# playwright-qase-reporter@2.0.0-beta.5

## What's new

Upload test attachments to Qase:
```js
test('test', async ({ page }) => {
  // upload files by path
  qase.attach({ paths: '/path/to/file'});
  // list multiple files at once
  qase.attach({ paths: ['/path/to/file', '/path/to/another/file']});
  // upload contents directly from your code
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
  await page.goto('https://example.com');
});
```

# playwright-qase-reporter@2.0.0-beta.4

## What's new

Annotate parameterized tests to see the complete data in the Qase.io test report:

```js
const people = ['Alice', 'Bob'];
for (const name of people) {
    test(`testing with ${name}`, async () => {
        qase.id(1)
        qase.parameters({ 'name': name });
        // ...
    });
}

```

# playwright-qase-reporter@2.0.0-beta.3

## What's new

*   Change module exports for simpler importing.

    New syntax:
    
    ```js
    import { qase } from 'playwright-qase-reporter';
    ```
    
    instead of:
    ```js
    import { qase } from 'playwright-qase-reporter/playwright';
    ```
    
* Update the readme with examples of new imports and annotations.


# playwright-qase-reporter@2.0.0-beta.2

## Overview
Qase reporter for the Playwright test framework.

This is a beta channel release.
To try the new features, install it with:

```bash
npm install playwright-qase-reporter@beta
```

To switch back to the stable releases, run:

```bash
npm install playwright-qase-reporter@latest
```

## What's new
### New syntax for annotating tests

This release brings a major syntax change for specifying more test parameters.

Old syntax allowed only test ID and title, and wasn't improving code readability:

```js
test(qase(42, 'Ultimate Question of Life, The Universe, and Everything'), async ({ page }) => {
    ...  
})
```

New syntax allows for adding information on separate lines, keeping the code readable:

```js
test('Ultimate Question of Life, The Universe, and Everything', async ({ page }) => {
    qase.id(42);
    qase.fields({ severity: high, priority: medium });
    qase.attach({ paths: '/path/to/file'});
    ...
})
```
