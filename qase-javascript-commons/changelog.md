# qase-javascript-commons@2.0.0-beta.6

## What's new
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
