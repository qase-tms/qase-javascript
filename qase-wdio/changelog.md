# wdio-qase-reporter@1.5.4

## Fixed

- Qase test case IDs that are `<= 0` passed to `qase.id(0)` are now dropped with a warning instead of being emitted as a metadata event. Previously this call bypassed the parser-level filter introduced in 1.5.3 and could still produce HTTP 400 from the API. Bumped `qase-javascript-commons` pin to `~2.7.4`.

# wdio-qase-reporter@1.5.3

## Fixed

- Added `repository.directory: "qase-wdio"` so npmjs.com correctly resolves relative links in the README. Bumped `qase-javascript-commons` pin to `~2.7.3`.

# wdio-qase-reporter@1.5.2

## Security

- Bumped `uuid` from `^9.0.1` to `^11.1.1`, closing the advisory on uuid `v3/v5/v6` missing buffer bounds check that downstream consumers (e.g. Dependabot on user repos) saw via this reporter. Only `v4` is used here, so the advisory was not exploitable through this code path, but the version pin matters for users running `npm audit` on their projects.

## Changed

- `engines.node` raised from `>=14` to `>=18` to match uuid 11+ requirements; Node 14/16 are EOL.
- Bumped `qase-javascript-commons` pin from `~2.7.0` to `~2.7.2`.

# wdio-qase-reporter@1.5.1

## Fixed

- Test `execution.duration` is now reported in milliseconds (multiplied by 1000) instead of seconds, matching the Qase API spec. Previously a 10-second test was uploaded as `duration: 10` (ms), making it look like 10 milliseconds on timelines.
- Test `execution.end_time` is now set in `ResultFinalizer.finalize` (previously it was always `null`).
- Step `execution.duration` is now populated in `TestLifecycle.endStep` (previously it stayed `null` even though both `start_time` and `end_time` were available).
- HTTP/fetch profiler steps (via `qase-javascript-commons@2.7.1`) now emit `start_time` / `end_time` in Unix seconds instead of milliseconds.

# wdio-qase-reporter@1.5.0

## Changed

- Internal: decomposed `WDIOQaseReporter` into focused modules — `TestLifecycle`, `MetadataApplier`, `CucumberTagAdapter`, `IpcBridge`, `CommandTracker`, `ResultFinalizer`. The reporter class now acts as a composition root with thin facades. Public contract unchanged: the default-exported `WDIOQaseReporter` class, all `WDIOReporter` lifecycle overrides, and the 11 instance methods used for `process.on` IPC bindings continue to work identically.
- Added 50+ new unit tests covering each extracted module.

## Fixed

- After WebDriver commands, `Response` payloads are now correctly attached to the surrounding step and the step's `end_time` is now set. Previously `TestStepType` instances were created as object literals (cast to type), which caused `Storage.getCurrentStep()` (an `instanceof` check) to never find the step — so the `onAfterCommand` guard `!getCurrentStep()` silently early-returned and skipped both the `Response` attachment and `endStep` calls. The decomposition surfaced this latent bug; `TestLifecycle` now constructs steps via `new TestStepType(...)`, restoring the intended behavior.

# wdio-qase-reporter@1.4.0

## Changed

- Bumped `qase-javascript-commons` to `~2.7.0`.
- Internal: replaced the local copy of `removeQaseIdsFromTitle` with the import from `qase-javascript-commons/internal`. Note: `removeQaseIdsFromTitle` is now case-insensitive, requires the id segment at the end of the title (anchored), and accepts `(Qase ID 1)` without colon.
- Internal: `@qaseid` tag handling now delegates id-string parsing to `parseQaseIdsFromString` (tolerates whitespace; non-numeric entries are skipped).

# wdio-qase-reporter@1.3.0

## What's new

- Added `qase.tags()` method and Cucumber `@tags=` tag to assign tag titles to test cases.
- Updated `qase-javascript-commons` dependency to `~2.6.0`.

# wdio-qase-reporter@1.2.3

## Bug fixes

- Moved profiler import to separate sub-path (`qase-javascript-commons/profilers`) to avoid pulling `node:` modules into bundlers.
- Updated `qase-javascript-commons` dependency to `~2.5.7`.

# qase-wdio@1.2.2

## What's new

- Added Network Profiler integration for automatic HTTP request capture during test execution.
- Updated `qase-javascript-commons` dependency to `~2.5.6`.

# qase-wdio@1.2.1

## What's new

- Added `qase.comment()` method to set a comment for the test case. The comment is included in the test result message, prepended before any error message.

```ts
it('should work', () => {
  qase.comment('This test verifies login flow');
  // test code
});
```

# qase-wdio@1.2.0

## What's new

- Added support for multi-project support.

# qase-wdio@1.1.4

## What's new

- Added support for status filter in the test run.
- Improved error handling.

# qase-wdio@1.1.2

## What's new

- Fixed an issue where the test result was not uploaded to the Qase TMS when the test has skipped status.
- Added a new function `Qase` to set the test case ID.
- Marked the function `qase.id` as deprecated.

# qase-wdio@1.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.

# qase-wdio@1.0.2

## What's new

Resolved an issue where a custom suite set via `qase.suite` was not included in the test results.

# qase-wdio@1.0.1

## What's new

Resolved an issue with handling parent test suites, ensuring proper structure and reporting.

# qase-wdio@1.0.0

## What's new

Major release of the WDIO reporter package.

# qase-wdio@1.0.0-beta.4

## What's new

Fix an issue with attaching the screenshot to the test case. Now, the reporter will correctly handle the screenshots and
will attach them to the test case in the Qase TMS.

```log
The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received an instance of Object
```

# qase-wdio@1.0.0-beta.3

## What's new

- Fix an issue with `cucumber` steps. Now, the reporter will correctly handle the `cucumber` steps and will report them
  to the Qase TMS.
- Fix an issue with duplicate test runs. Now, the reporter will correctly handle the test runs and will not create
  duplicate test runs in the Qase TMS.

  You need to add `beforeRunHook` hook to the `onPrepare` and `afterRunHook` hook to the `onComplete` in the
  `wdio.conf.ts` configuration file:

  ```ts
    import type { Options } from '@wdio/types'
    import WDIOQaseReporter from "wdio-qase-reporter";
    import { afterRunHook, beforeRunHook } from "wdio-qase-reporter";

    export const config: Options.Testrunner = {
    // ...
    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: async function() {
      await beforeRunHook();
    },

    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {object} exitCode 0 - success, 1 - fail
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: async function() {
      await afterRunHook();
    },
  }
  ```

# qase-wdio@1.0.0-beta.2

## What's new

Support group parameters for test cases. You can specify the group parameters in the test case using the following
format:

```ts
  it('test', () => {
  qase.groupParameters({ 'param01': 'value01', 'param02': 'value02' });
  expect(true).to.equal(true);
});
```

# qase-wdio@1.0.0-beta.1

## What's new

First major beta release for the version 1 series of the Qase WebDriverIO reporter.
