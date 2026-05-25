# vitest-qase-reporter@1.4.1

## Fixed

- `execution.start_time` and `execution.end_time` are now populated for every test result. Vitest's `testCase.diagnostic()` only exposes an elapsed `duration` (ms), so we anchor `end_time` to `Date.now()` at the moment of the `onTestCaseResult` callback and derive `start_time = end_time - duration`. Timeline rendering on the Qase side no longer falls back to ingestion timestamps. Units: `start_time` / `end_time` in Unix seconds (with fractional ms), `duration` in milliseconds.
- HTTP/fetch profiler steps (via `qase-javascript-commons@2.7.1`) now emit `start_time` / `end_time` in Unix seconds instead of milliseconds.

# vitest-qase-reporter@1.4.0

## Changed

- Decomposed `index.ts` (451 LOC) into a thin orchestrator plus 3 focused modules under `src/modules/` (`MetadataAccumulator`, `ProfilerTracker`, `ResultBuilder`). Public contract preserved: default + named `VitestQaseReporter` export, all 6 lifecycle hooks (`onTestRunStart`, `onTestRunEnd`, `onTestCaseResult`, `onTestCaseAnnotate`, `onTestSuiteReady`, `onTestSuiteResult`), constructor signature, and `VitestQaseOptionsType` re-export.

## Removed

- `static qaseIdRegExp` — deprecated since Phase 1; replaced by `parseProjectMappingFromTitle` from `qase-javascript-commons` (matches mocha 1.5.0, cypress 3.6.0, jest 2.5.0 precedent).

## Internal

- Added per-module unit tests for the three new modules (~50 new tests, 76 total).

# vitest-qase-reporter@1.3.0

## Changed

- Bumped `qase-javascript-commons` to `~2.7.0`.
- Internal: replaced the local copy of `extractAndCleanStep` with the import from `qase-javascript-commons/internal`.

# vitest-qase-reporter@1.2.0

## What's new

- Added `qase.tags()` method to assign tag titles to test cases.
- Updated `qase-javascript-commons` dependency to `~2.6.0`.

# vitest-qase-reporter@1.1.3

## Bug fixes

- Moved profiler import to separate sub-path (`qase-javascript-commons/profilers`) to avoid pulling `node:` modules into bundlers.
- Updated `qase-javascript-commons` dependency to `~2.5.7`.

# qase-vitest@1.1.2

## What's new

- Added Network Profiler integration for automatic HTTP request capture during test execution.
- Updated `qase-javascript-commons` dependency to `~2.5.6`.

# qase-vitest@1.1.1

## What's new

- Fixed an issue where `qase.config.json` configuration file was ignored by the reporter. The reporter now loads configuration using `ConfigLoader`, matching the behavior of Jest, Playwright, and other reporters.
- Fixed an issue where non-string parameter values (e.g. numbers passed via `qase.parameters()`) caused API validation errors. Parameter values are now converted to strings before sending.
- Updated `qase-javascript-commons` dependency to `~2.5.4`.

# qase-vitest@1.1.0

## What's new

- Added support for multi-project support.

# qase-vitest@1.0.4

## What's new

- Fixed an issue with multi-threaded test runs.

# qase-vitest@1.0.3

## What's new

- Added support for expected results and data for steps.

# qase-vitest@1.0.2

## What's new

- Fixed an issue with attachments.

# qase-vitest@1.0.1

## What's new

- Added support for status filter in the test run.
- Improved error handling.
