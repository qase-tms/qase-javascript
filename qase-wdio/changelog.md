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
