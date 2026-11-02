# mocha-qase-reporter@1.8.1

## Fixed

- With `--parallel`, the run is started once in the main Mocha process, before the workers, and completed once after the last worker; the workers only send their results. In `report` mode each worker cleared the report folder when it started, so the report kept only the results of the last worker. Requires `qase-javascript-commons` 2.9.10 or later for the shared report.
- With `--parallel`, extra reporters run once, in the main process. They also ran inside every worker, so `extraReporters=spec` printed each file twice, once per file with its own summary.
- Several extra reporters can be given on the command line separated by `;`: `--reporter-options "extraReporters=spec;json"`. Mocha splits `--reporter-options` on `,`, so `extraReporters=spec,json` kept only `spec`. A comma-separated string in `qase.config.json` (`"extraReporters": "spec,json"`) also works now.
- A skipped test (`it.skip`, or a test in a skipped suite) has its own start time. It got the start time of the test before it.
- `this.suite('A\\tB')` written with the two characters `\t` creates nested suites, like a real tab does.
- Attachments added with `this.attach()` have their own ids. In `report` mode they were saved as `-<name>`, so two tests attaching a file with the same name overwrote each other.

## Documentation

- Parallel execution no longer requires creating the run beforehand with `qasectl`; the docs describe that as an option.

# mocha-qase-reporter@1.8.0

## Fixed

- Console output from tests reaches the terminal again. The reporter replaced `process.stdout.write` and `process.stderr.write` for every test and kept what was written, so `console.log` in a test printed nothing, even with `captureLogs` off. Output is now recorded only when `captureLogs` is on, and it is copied, not taken over.
- A test whose `beforeEach` hook fails is reported as failed with the hook's error. Mocha sends no test-end event for it, so the test was missing from Qase, and the output capture was never removed, which also hid the console output of every later test.
- Metadata no longer carries over between tests. `this.comment()`, `this.fields()` and the other calls made in a failing `beforeEach` hook were applied to the next test that ended, even in another suite.
- `stdout.txt` and `stderr.txt` attachments contain only the test's own output, not the line the `spec` reporter prints for its result, and each one has its own id, so in the local report they no longer overwrite each other.
- A comment no longer ends with a blank line: `this.comment('a')` gives `a`, not `a\n\n`.

## Changed

- Examples: `severity` values the Qase API rejects (`low`, `high`) are replaced with valid ones. The API answers such a value with `400` and drops every result in the batch.

# mocha-qase-reporter@1.7.0

## Added

- `this.mute()` is now available in Mocha test context and marks the test result as muted in Qase, the same as `this.fields({ muted: 'true' })`. Previously the documented mute call threw `mute is not a function`; the usage docs now show `this.mute()`. Bumped `qase-javascript-commons` pin to `~2.9.7`.

## Fixed

- `this.suite('A\tB\tC')` now reports nested suites `A > B > C`, as the docs describe. The whole string was sent as a single suite title.
- An error thrown inside `this.step()` now fails the test. The reporter marked the step as failed but swallowed the error, so a failing assertion inside a step left the Mocha test green. The step is still reported as failed, and the error is rethrown.
- The docs, README and examples now use the real API. `mocha-qase-reporter/mocha` exports only `qase(id, name)` and `qase.projects()`; metadata methods (`this.title()`, `this.fields()`, `this.step()`, `this.attach()` and so on) live on the test context and need `function () {}` tests. The docs called them on the exported `qase`, where they throw `is not a function`. They also no longer describe nested steps, step-level attachments, awaited async steps or metadata set in `after`/`afterEach` hooks, none of which the reporter supports.

# mocha-qase-reporter@1.6.0

## Added

- Attachment uploads are now parallelised and paced adaptively. `testops.attachments.concurrency` (`QASE_TESTOPS_ATTACHMENTS_CONCURRENCY`, default `4`, clamped to `1`..`16`) sets how many attachment batches are uploaded at once, and `testops.attachments.timeout` (`QASE_TESTOPS_ATTACHMENTS_TIMEOUT`, default `120` seconds) caps a single upload request. The fixed pause between batches now applies only while the API is rate limiting, so runs that never see a `429` no longer pay for it. Retries of file-backed attachments also open fresh read streams and, after a connection error, use a new connection. Bumped `qase-javascript-commons` pin to `~2.9.0`.

# mocha-qase-reporter@1.5.3

## Fixed

- Added `repository.directory: "qase-mocha"` so npmjs.com correctly resolves relative links in the README. Bumped `qase-javascript-commons` pin to `~2.7.3`.

# mocha-qase-reporter@1.5.2

## Security

- Bumped `uuid` from `^9.0.1` to `^11.1.1`, closing the advisory on uuid `v3/v5/v6` missing buffer bounds check that downstream consumers (e.g. Dependabot on user repos) saw via this reporter. Only `v4` is used here, so the advisory was not exploitable through this code path, but the version pin matters for users running `npm audit` on their projects.

## Changed

- `engines.node` raised from `>=14` to `>=18` to match uuid 11+ requirements; Node 14/16 are EOL.
- Bumped `qase-javascript-commons` pin from `~2.7.0` to `~2.7.2`.

# mocha-qase-reporter@1.5.1

## Fixed

- `StepRunner` now emits step `execution.start_time` / `end_time` in Unix seconds (with fractional ms) instead of raw `Date.now()` milliseconds, matching the parent test's units and the Qase API spec. Step `execution.duration` is also populated (was always `null` previously).
- HTTP/fetch profiler steps (via `qase-javascript-commons@2.7.1`) now emit `start_time` / `end_time` in Unix seconds instead of milliseconds.

# mocha-qase-reporter@1.5.0

## Changed

- Decomposed `reporter.ts` (465 LOC) into a thin orchestrator plus 5 focused modules under `src/modules/`: `MetadataApplier`, `OutputCapture`, `StepRunner`, `ProfilerTracker`, `ResultBuilder`. Public contract preserved: `MochaQaseReporter` named export, constructor signature, `static statusMap`, all 11 user-API methods bound to test context (`qaseId`, `title`, `parameters`, `groupParameters`, `fields`, `suite`, `ignore`, `attach`, `comment`, `tags`, `step`), Mocha lifecycle hooks, and parallel mode behavior.

## Internal

- Added Jest + ts-jest test infrastructure; introduced 43 unit tests across the new modules.

# mocha-qase-reporter@1.4.0

## Changed

- Bumped `qase-javascript-commons` to `~2.7.0`.
- Internal: replaced local copies of `removeQaseIdsFromTitle`, `extractAndCleanStep`, `getFile`, and the suite-part normalizer with imports from `qase-javascript-commons/internal`. Removed the deprecated static `qaseIdRegExp`. Note: `removeQaseIdsFromTitle` is now case-insensitive, requires the id segment at the end of the title, and accepts `(Qase ID 1)` without colon.

# mocha-qase-reporter@1.3.0

## What's new

- Added `tags()` method to the test context API. You can now assign tags to test cases at runtime:

```ts
it('test', function() {
  this.tags('smoke', 'regression');
  expect(true).to.equal(true);
});
```

- Updated `qase-javascript-commons` dependency to `~2.6.0`.

# mocha-qase-reporter@1.2.3

## Bug fixes

- Fixed leading `\n\n` in error messages when `metadata.comment` is empty.
- Updated `qase-javascript-commons` dependency to `~2.5.9`.

# mocha-qase-reporter@1.2.2

## Bug fixes

- Moved profiler import to separate sub-path (`qase-javascript-commons/profilers`) to avoid pulling `node:` modules into bundlers.
- Updated `qase-javascript-commons` dependency to `~2.5.7`.

# qase-mocha@1.2.1

## What's new

- Added Network Profiler integration for automatic HTTP request capture during test execution.
- Updated `qase-javascript-commons` dependency to `~2.5.6`.

# qase-mocha@1.2.0

## What's new

- Added support for multi-project support.

# qase-mocha@1.1.8

## What's new

- Added support for expected results and data for steps.

# qase-mocha@1.1.6

## What's new

- Improved the handling of extra reporters in the reporter.

# qase-mocha@1.1.5

## What's new

- Added support for extra reporters in the reporter. You can find more information in the [usage guide](docs/usage.md#using-extra-reporters).

# qase-mocha@1.1.4

## What's new

- Fixed an issue with the parallel mode compatibility with Mocha 11.0.0.

# qase-mocha@1.1.3

## What's new

- Added support for status filter in the test run.
- Improved error handling.

# qase-mocha@1.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.
- Resolved an issue that prevented proper execution of async tests

# qase-mocha@1.0.2

## What's new

Enhanced handling of start and end times for tests and steps, ensuring greater accuracy in reporting.

# qase-mocha@1.0.0

## What's new

Major release of the Mocha reporter package

# qase-mocha@1.0.0-beta.5

## What's new

- Added a `Qase` function to allow specifying QaseID for tests.
- Marked the old syntax for QaseID as deprecated.
- Implemented functionality to capture console logs and include them as attachments in tests.

# qase-mocha@1.0.0-beta.4

## What's new

Fixed the issue with async tests not being reported correctly.

# qase-mocha@1.0.0-beta.3

## What's new

Support group parameters for test cases. You can specify the group parameters in the test case using the following format: 

```ts
  it('test', () => {
    this.groupParameters({ param1: 'value1', param2: 'value2' });
    expect(true).to.equal(true);
  });
```

# qase-mocha@1.0.0-beta.2

## What's new

Support parallel execution of tests.

# qase-mocha@1.0.0-beta.1

## What's new

First major beta release for the version 1 series of the Qase Mocha reporter.
