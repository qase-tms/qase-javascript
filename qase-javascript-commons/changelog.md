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

* Update the config of reporters. Added `captureLogs` field. If it is set to `true`, the reporter will capture logs from the test framework.
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
