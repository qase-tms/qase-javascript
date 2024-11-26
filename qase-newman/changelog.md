# qase-newman@2.0.4

## What's new

Resolved error when uploading results due to bad request:

```log
 Error: Error on uploading results: Bad request. Body: 
 {"message":"The execution.start time must be at least 1732623290. (and 1 more error)","errors":{"execution.start_time":["The execution.start time must be at least 1732623290."],"execution.end_time":["The execution.end time must be at least 1732623290."]}}
```

# qase-newman@2.0.3

## What's new

Added support parameters from data files in Newman on collection and folder levels.

# qase-newman@2.0.2

## What's new

Added support parameters from data files in Newman.
How to use parameters from data files in Newman, see [here](./docs/usage.md).

# qase-newman@2.0.0

## What's new

This is the first release in the 2.x series of the Newman reporter.
It brings new and more flexible configs, uploading results in parallel with running tests,
and other powerful features.

This changelog entry will be updated soon.
For more information about the new features and a guide for migration from v1, refer to the
[reporter documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-newman#readme)

# qase-newman@2.0.0-beta.2

## What's new

Add support for suites in test results.

# qase-newman@2.0.0-beta.1

## What's new

First major beta release for the version 2 series of the Qase Newman reporter.
