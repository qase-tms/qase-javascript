# Qase TMS Playwright reporter

Qase Playwright reporter sends test results and metadata to Qase.io.
It can work in different test automation scenarios:

* Create new test cases in Qase from existing autotests.
* Report Playwright test results to existing test cases in Qase.
* Update existing cases with metadata, such as parameters and fields.

To install the latest version, run:

```sh
npm install -D playwright-qase-reporter
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

# Contents

- [Getting started](#getting-started)
- [Updating from v1](#updating-from-v1)
- [Example of usage](#example-of-usage)
- [Configuration](#configuration)
- [Requirements](#requirements)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

To report your tests results to Qase, install `playwright-qase-reporter`,
and add a reporter config in the `playwright.config.ts` file.
A minimal configuration needs just two things:

* Qase project code, for example, in https://app.qase.io/project/DEMO the code is `DEMO`.
* Qase API token, created on the [Apps page](https://app.qase.io/apps?app=playwright-reporter).

```js
const config: PlaywrightTestConfig = {
  // ...  
  reporter: [
    [
      'playwright-qase-reporter',
      {
        testops: {
          api: {
            token: 'api_token',
          },
          project: 'project_code',
        },
      },
    ],
  ],
  // ...  
};
module.exports = config;
```

Now run the tests as usual.
Test results will be reported to a new test run in Qase:

```console
$ npx playwright test
Running 5 tests using 1 worker
...
...
...
qase: 5 results sent to Qase
qase: run 1 completed
qase: Test run link: https://app.qase.io/run/DEMO/dashboard/1
```

## Updating from v1

To update a test project using qase-playwright-reporter@v1 to version 2:

1.  Change the import paths:

    ```diff
    - import { qase } from 'playwright-qase-reporter/dist/playwright'
    + import { qase } from 'playwright-qase-reporter'
    ```

2.  Update reporter configuration in `playwright.config.js` and/or environment variables —
    see the [configuration reference](#configuration) below.

The previous test annotation syntax is still supported, so there is no need to rewrite the tests.
However, check out the docs for the new, more flexible and powerful syntax.

## Example of usage

The Playwright reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

```typescript
import { qase } from 'playwright-qase-reporter';

describe('Test suite', () => {
  test(qase(2, 'Test with Qase ID'), () => {
    expect(true).toBe(true);
  });
  
  test('Simple test', () => {
    qase.title('Example of simple test');
    expect(true).toBe(true);
  });

  test('Test with annotated fields', () => {
    qase.fields({ 'severity': 'high', 'priority': 'medium' });
    expect(true).toBe(true);
  });
  
  test('Running, but not reported to Qase', () => {
    qase.ignore();
    expect(true).toBe(true);
  });

  test('Test with steps', async () => {
    await test.step('Step 1', async () => {
      expect(true).toBe(true);
    });
    await test.step('Step 2', async () => {
      expect(true).toBe(true);
    });
    expect(true).toBe(true);
  });
});
```

---

To run tests and create a test run, execute the command (for example from folder examples):

```bash
QASE_MODE=testops npx playwright test
```

or

```bash
npm test
```

<p align="center">
  <img width="65%" src="./screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

<p align="center">
  <img src="./screenshots/demo.gif">
</p>

## Configuration

Reporter options (\* - required):

- `mode` - `testops`/`off` Enables reporter, default - `off`
- `debug` - Enables debug logging, default - `false`
- `environment` - To execute with the sending of the environment information 
- *`testops.api.token` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`testops.project` - Code of your project (can be extracted from main
  page of your project: `https://app.qase.io/project/DEMOTR` -
  `DEMOTR` is project code here)
- `testops.uploadAttachments` - Permission to send screenshots to Qase TMS
- `testops.run.id` - Pass Run ID
- `testops.run.title` - Set custom Run name, when new run is created
- `testops.run.description` - Set custom Run description, when new run is created
- `testops.run.complete` - Whether the run should be completed

Example `playwright.config.js` config:

```js
const config = {
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
        debug: true,
        testops: {
          api: {
            token: 'api_key',
          },
          project: 'project_code',
          uploadAttachments: true,
          run: {
            complete: true,
          },
        },
      },
    ],
  ],
};
module.exports = config;
```

You can check example configuration with multiple reporters in [example project](../examples/playwright/playwright.config.js).

Supported ENV variables:

- `QASE_MODE` - Same as `mode`
- `QASE_DEBUG` - Same as `debug`
- `QASE_ENVIRONMENT` - Same as `environment` 
- `QASE_TESTOPS_API_TOKEN` - Same as `testops.api.token`
- `QASE_TESTOPS_PROJECT` - Same as `testops.project`
- `QASE_TESTOPS_RUN_ID` - Pass Run ID from ENV and override reporter option `testops.run.id`
- `QASE_TESTOPS_RUN_TITLE` - Same as `testops.run.title`
- `QASE_TESTOPS_RUN_DESCRIPTION` - Same as `testops.run.description`

## Requirements

We maintain the reporter on [LTS versions of Node.js](https://nodejs.org/en/about/releases/).

`@playwright/test >= 1.16.3`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
