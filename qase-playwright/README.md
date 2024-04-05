# Qase TMS Playwright reporter

Publish results simple and easy.

## How to install

```
npm install playwright-qase-reporter@beta
```

## Example of usage

The Playwright reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

```typescript
import { qase } from 'playwright-qase-reporter';

describe('Test suite', () => {
  test('Simple test', () => {
    qase.id(1);
    qase.title('Example of simple test')
    expect(true).toBe(true);
  });

  test('Test with annotated fields', () => {
    qase.id(2);
    qase.fields({ 'severity': 'high', 'priority': 'medium' })
    expect(true).toBe(true);
  });
  
  test(qase(3, 'This syntax is supported, but deprecated'), () => {
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
- `debug` - Enables debug logging, defaule - `false`
- `environment` - To execute with the sending of the envinroment information 
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

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)

`@playwright/test >= 1.16.3`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
