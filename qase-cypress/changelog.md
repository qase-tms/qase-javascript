# cypress-qase-reporter@2.1.0

## What's new

Minor release of the Cypress reporter package

# cypress-qase-reporter@2.1.0-beta.3

## What's new

Fixed an issue with the reporter completing the test run after each file with tests.

# cypress-qase-reporter@2.1.0-beta.1

## What's new

- fixed an issue with the reporter completing the test run before all results are sent to Qase
- fixed an issue with the reporter not sending all results to Qase

Need to add the following to the `cypress.config.js` file:

```diff
...
  e2e: {
    setupNodeEvents(on, config) {
+      require('cypress-qase-reporter/plugin')(on, config);
    }
  }
...
```

# cypress-qase-reporter@2.0.3

## What's new

Cypress doesn't finish the process after the last test.
The reporter will wait for all results to be sent to Qase and will not block the process after sending.

# cypress-qase-reporter@2.0.2

## What's new

1. Cypress kills the process after the last tests. 
The reporter will wait for all results to be sent to Qase and will not block the process after sending.

2. The reporter will collect suites and add them to results.

# cypress-qase-reporter@2.0.1

## What's new

The reporter would mark the test as blocked if the test was skipped in Cypress.
Now, the reporter will mark the test as skipped.

# cypress-qase-reporter@2.0.0

## What's new

This is the first release in the 2.x series of the Cypress reporter.
It brings new and more flexible configs, uploading results in parallel with running tests,
and other powerful features.

This changelog entry will be updated soon.
For more information about the new features and a guide for migration from v1, refer to the
[reporter documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress#readme)

# cypress-qase-reporter@2.0.0-beta.3

Fixed an issue with multiple test runs created when Cypress is running 
multiple tests in parallel.

# cypress-qase-reporter@2.0.0-beta.2

First major beta release for the version 2 series of the Qase Cypress reporter.
