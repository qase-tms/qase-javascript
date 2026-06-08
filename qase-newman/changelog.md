# newman-reporter-qase@2.3.2

## Fixed

- Added `repository.directory: "qase-newman"` so npmjs.com correctly resolves relative links in the README. Bumped `qase-javascript-commons` pin to `~2.7.3`.

# newman-reporter-qase@2.3.1

## Changed

- `engines.node` raised from `>=14` to `>=18`; Node 14/16 are EOL.
- Bumped `qase-javascript-commons` pin from `~2.7.0` to `~2.7.2`.

# newman-reporter-qase@2.3.0

## Changed

- Decomposed `reporter.ts` (433 LOC) into a thin event-driven orchestrator plus 3 focused modules under `src/modules/` (`MetadataExtractor`, `IterationDataParser`, `ResultBuilder`). Public contract preserved 1:1: `NewmanQaseReporter` named export, all 3 static regexps (`qaseIdRegExp`, `qaseParamRegExp`, `qaseProjectRegExp`), all 4 static methods (`getCaseIds`, `getProjectMapping`, `getParameters`, `getParentTitles`), constructor signature, and `NewmanQaseOptionsType` re-export.
- Bumped `qase-javascript-commons` peer dependency to `~2.7.0` (sync with monorepo; no helper migrations — newman doesn't import from `qase-javascript-commons/internal`).

## Internal

- Added per-module unit tests for the three new modules (37 new tests, 55 total).

# qase-newman@2.2.0

## What's new

- Added support for multi-project support.

# qase-newman@2.1.5

## What's new

- Added support for status filter in the test run.
- Improved error handling.

# qase-newman@2.1.4

## What's new

Fixed an issue where the start and end times were not properly set in the test results. Now results correctly display the
start and end times.

# qase-newman@2.1.1

## What's new

Fixed an issue where parent suite hierarchy was not properly handled in test results. Now results correctly display the
full structure of suites.

# qase-newman@2.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.

# qase-newman@2.0.5

## What's new

Enhanced handling of start and end times for tests and steps, ensuring greater accuracy in reporting.

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
