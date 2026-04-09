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
