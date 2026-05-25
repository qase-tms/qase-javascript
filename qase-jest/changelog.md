# jest-qase-reporter@2.5.1

## Fixed

- `execution.start_time` and `execution.end_time` are now populated using Jest's `onTestCaseStart` hook (Jest 29+). The reporter records `TestCaseStartInfo.startedAt` per test in `onTestCaseStart` and derives `end_time = start_time + duration` in `onTestCaseResult`. Previously both fields were left `null`, so the Qase timeline fell back to ingestion timestamps. Units: `start_time` / `end_time` in Unix seconds (with fractional ms), `duration` in milliseconds.
- HTTP/fetch profiler steps (via `qase-javascript-commons@2.7.1`) now emit `start_time` / `end_time` in Unix seconds instead of milliseconds.

## Added

- `onTestCaseStart` lifecycle hook implementation. The hook is optional in the Jest reporter contract, and the public API surface of `JestQaseReporter` is unchanged otherwise.

# jest-qase-reporter@2.5.0

## Changed

- Decomposed `reporter.ts` (433 LOC) into a thin orchestrator plus 3 focused modules under `src/modules/` (`MetadataApplier`, `ProfilerTracker`, `ResultBuilder`). Public contract preserved: `JestQaseReporter` default export, `static statusMap`, all 5 lifecycle hooks (`onRunStart`, `onTestCaseResult`, `onTestResult`, `onRunComplete`, `onRunnerEnd`), `getLastError`, 10 `add*` mutators, `JestQaseOptionsType` re-export.

## Removed

- `static qaseIdRegExp` — deprecated since Phase 1; replaced by an internal helper inside `ResultBuilder`. Matches mocha 1.5.0 and cypress 3.6.0 precedent.

## Internal

- Extracted `STATUS_MAP` to a top-level `const`; `static statusMap` now references it. No change in behavior.
- Added per-module unit tests for the three new modules (~32 new tests, 82 total).

# jest-qase-reporter@2.4.0

## Changed

- Bumped `qase-javascript-commons` to `~2.7.0`.
- Internal: replaced local copies of `removeQaseIdsFromTitle`, `extractAndCleanStep`, and the suite-part normalizer with imports from `qase-javascript-commons/internal`. Note: `removeQaseIdsFromTitle` is now case-insensitive and also accepts `(Qase ID 1)` without colon (previously rejected).

# jest-qase-reporter@2.3.0

## What's new

- Added `qase.tags()` method to assign tag titles to test cases.
- Updated `qase-javascript-commons` dependency to `~2.6.0`.

# jest-qase-reporter@2.2.2

## Bug fixes

- Moved profiler import to separate sub-path (`qase-javascript-commons/profilers`) to avoid pulling `node:` modules into bundlers.
- Updated `qase-javascript-commons` dependency to `~2.5.7`.

# jest-qase-reporter@2.2.1

## What's new

- Added Network Profiler integration for automatic HTTP request capture during test execution.
- Updated `qase-javascript-commons` dependency to `~2.5.6`.

# jest-qase-reporter@2.2.0

## What's new

- Added support for multi-project support.

# jest-qase-reporter@2.1.4

## What's new

- Added support for expected results and data for steps.

# jest-qase-reporter@2.1.3

## What's new

- Added support for status filter in the test run.
- Improved error handling.

# jest-qase-reporter@2.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.

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
