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
