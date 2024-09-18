# qase-javascript-commons@2.2.1

## What's new

Support `author` field in the test result data.
You can specify author name or email in fields.

# qase-javascript-commons@2.1.3

## What's new

Reporters will send all data on the results of the autotests. Including the data of the title, the description, etc.

# qase-javascript-commons@2.1.1

## What's new

Fixed an issue where the state file was not deleted. This resulted in results being uploaded into the same test run.

# qase-javascript-commons@2.1.0

## What's new

Minor release of the commons package

# qase-javascript-commons@2.1.0-beta.1

## What's new

- update a `InternalReporterInterface`. Added a new methods `sendResults` and `complete` to send the results and
  complete the test run.
- add `StateManager` class to manage and share the state of the reporter between the different instances of the
  reporter.

# qase-javascript-commons@2.0.13

## What's new

- If a plan ID is specified then when creating a test run it also specifies the plan ID.
- If a test run ID is specified then the reporter won't check for the existence of a test run.

# qase-javascript-commons@2.0.12

## What's new

Support qaseio package version 2.2.0

# qase-javascript-commons@2.0.11

## What's new

- Improved logging for better debugging and error reporting.

- Show the link to the test run in the console output when the test is failed.

```text
[INFO] qase: See why this test failed: https://app.qase.io/run/DEMO/dashboard/123?status=%5B2%5D&search=5%20-%206%20=%20-2
```

# qase-javascript-commons@2.0.10

## What's new

Fixed an issue with sending test results duplicates when we use the `qase-cypress` reporter.
Now the reporter will send the test results only once.

The Cypress calls the `publish` method multiple times for the same test results because of the Cypress architecture.
It calls the `publish` method for each test file.

# qase-javascript-commons@2.0.9

## What's new

Added new configuration option `rootSuite` to specify a root suite.
This option is available in the config file and the `QASE_ROOT_SUITE` env variable

```diff
{
  "mode": "testops",
  "fallback": "report",
  "environment": "local",
+ "rootSuite": "Root Suite",
  ...
}
```

# qase-javascript-commons@2.0.8

## What's new

Fixed an issue with creating a test run with environment when the reporter ignored the `environment` parameter in the
configuration.

# qase-javascript-commons@2.0.7

## What's new

Fixed an issue with creating a defect for failed tests when the reporter ignored the `defect` parameter in the
configuration.

# qase-javascript-commons@2.0.6

## What's new

Fixed an issue with a race condition when the reporter added test results to the test run.

# qase-javascript-commons@2.0.5

## What's new

Improved logging for better debugging and error reporting.

# qase-javascript-commons@2.0.4

## What's new

Fixed an issue when the reporter created a test run:
`The start time does not match the format Y-m-d H:i:s.`

# qase-javascript-commons@2.0.3

## What's new

Fixed an issue when the reporter would run tests before creating a test run.
Now the reporter will create a test run before running tests.

# qase-javascript-commons@2.0.2

## What's new

Add new step status `skipped` to the test result data.
Before this fix, the reporter didn't support the `skipped` status for test steps.

For ApiV1 the `skipped` status will be converted to `blocked` status.
For ApiV2 the `skipped` status will be converted to `skipped` status.

# qase-javascript-commons@2.0.1

## What's new

Remove ANSI escape codes from the message and stack trace.
Before this fix, the reporter added ANSI escape codes to the message and stack trace.

```diff
- Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m
+ Error: expect(received).toBe(expected) // Object.is equality
```

# qase-javascript-commons@2.0.0

## What's new

This is the first release version of the Qase JavaScript SDK.
It is numbered `2.0.0` (and not `1.0.0`) to match the release series of
test reporters for Playwright, Cypress, Jest, and other frameworks.

### Annotating test with field data

Tests can now be annotated with data for the system and custom fields in Qase.
This feature is already implemented in the Playwright reporter:

```js
test('Test with annotated fields', () => {
  qase.id(1);
  qase.fields({ 'severity': 'high', 'priority': 'medium' })
  // ...
});
```

### Parametrized tests

Qase JavaScript SDK enables annotating tests with parameters, and passing parameter values to Qase.
Parameterized tests can report to a single test case, but each parameter variation is registered as
a standalone result, with its own run history.

### Attachments from files and variables

Reporters can now upload attachments of various data types to Qase,
both from files and variables.
It enables flexible and meticulous logging, such as collecting full HTTP request data,
including URL, headers, and payload.

### Uploading results in flexible batches, asynchronously

Test reporters can now upload results in batches, while tests are still running.
It helps bring test results faster and enables acting on them long before the test run is complete.

### Uniform configuration

Qase JavaScript SDK brings configuration with config files and environment variables
to a common standard, used with Qase reporters in all languages and frameworks.

For details, see
the [Configuration](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration)
section in the README.

### Latest API

Qase JavaScript SDK is using the latest Qase API client,
employing the full power of the stable v1 API version,
and enabling the use of experimental v2 API, tailored for uploading
huge amounts of test results.

# qase-javascript-commons@2.0.0-beta.12

## What's new

Fixed an issue when the result has empty step action. Now the reporter will mark such steps as "Unnamed step" and will
log a warning message.

# qase-javascript-commons@2.0.0-beta.11

## What's new

* The `useV2` option in the reporter's configuration will now enable using the experimental v2 API.
  Before this fix, v1 API was used despite the configuration.

* Attachments from test steps will now be uploaded to Qase.
  Before this fix, the reporter uploaded only the attachments made outside of any step scope.

# qase-javascript-commons@2.0.0-beta.10

## What's new

Fixed an issue when the results published before the test run creation.

# qase-javascript-commons@2.0.0-beta.9

## What's new

Improved debug logging for better testing and reporting errors.

- Separate `logger` class for use in reporters, supporting logging to console and files.
- Extra debug logs in both reporter modes: TestOps and Local.

Fixed an issue with duplicate test runs created when the testing framework
(such as Cypress) uses more than one instance of the Qase reporter.
Now reporter handles Qase test runs in the following way:

1. The first instance of the reporter creates a Qase test run and stores the run ID
   in the ENV variable `QASE_TESTOPS_RUN_ID`.
2. Other instances of the reporter read this variable and report test results
   to the existing test run.

Nothing has changed in cases when there is a single instance of a reporter or
when it is using a test run, created with other tools, such as with an API request
or manually in the Qase app.

# qase-javascript-commons@2.0.0-beta.8

## What's new

Renamed the `QASE_TESTOPS_CHUNK` environment variable to `QASE_TESTOPS_BATCH_SIZE`.
Renamed the `chunk` field in the reporter's configuration to `batch.size`.

```diff
{
  ...
  "testops": {
-   "chunk": 10
+   "batch": {
+      "size": 10
+    }
    ...
  },
  ...
}
```

# qase-javascript-commons@2.0.0-beta.7

## What's new

TestOps reporter supports uploading test result in real-time.
It can be useful for long-running tests, where you want to see the results as soon as they are available.
You can use chunk size to control the size of the data sent to the Qase.

To enable real-time reporting, set an environment variable before running the tests or use the reporter's configuration:

```bash
QASE_TESTOPS_CHUNK=10
```

```diff
{
  ...
  "testops": {
+   "chunk": 10
    ...
  },
  ...
}
```

where `10` is the size of the chunk in test result's count.

# qase-javascript-commons@2.0.0-beta.6

## What's new

### Select the API version to use for reporting

Qase TestOps API has two endpoints for reporting test results:

- Version 1, stable and used my most test reporters.
  https://developers.qase.io/reference/create-result-bulk
- Version 2, currently in beta access, and currently supported only
  in the `playwright-qase-reporter`.
  https://developers.qase.io/v2.0/reference/create-results-v2

This commit introduces a way to select the API version to use.
It enables using all new features of v2 JS reporters with the stable v1 API,
and elso experimenting with the new v2 API.

**Warning**: v2 API is still in beta.
If you want to try the v2 JS reporters, you don't have to enable the new API.

To enable using API v2, set an environment variable before running the tests:

```bash
QASE_TESTOPS_API_V2=true
```

### Support adding test suite description to a test report.

Test reporters can now test suite description to test results.
Such description can be collected from test's location and attributes
or explicitly declared in the test.

Add new data models:

- Relation
- Suite
- SuiteData

# qase-javascript-commons@2.0.0-beta.5

## What's new

* Update the config of reporters. Added `captureLogs` field. If it is set to `true`, the reporter will capture logs from
  the test framework.
* Added `getMimeType` function to the commons package. It returns the MIME type of the file by its extension.

# qase-javascript-commons@2.0.0-beta.4

## What's new

* Added support for uploading attachments from strings and buffers in the testops reporter.
* Changed data type of `content` in the attachment data from `any` to `string | Buffer`.

# qase-javascript-commons@2.0.0-beta.3

## What's new

* Changed data type of `fields` and `parameters` in the test result data
  from `Map<string, string>` to `Record<string, string>`.

# qase-javascript-commons@2.0.0-beta.2

## Overview

Package `qase-javascript-commons` contains common functions, used by all Qase JavaScript reporters.

This is a beta channel release.
Don't install this package explicitly.
Instead, install the test reporter for your framework, for example:

```bash
npm install playwright-qase-reporter@beta
```

## What's new

* Set a fallback reporter when the primary reporter can't be used,
  such as when the `testops` reporter can't authenticate with the Qase API.
* Rename some environment variables to keep naming consistent between reporters in all languages.
* Add several environment variables for new config options.
* Write outputs in JSONP format, which can be used with
  [Qase Report](https://github.com/qase-tms/qase-report).
* Logic for handling test with multiple case IDs moved to the commons package.
