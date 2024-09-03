# Qase TMS WebDriverIO reporter

Publish results simple and easy.

To install the latest beta version, run:

```sh
npm install -D wdio-qase-reporter@beta
```

## Getting started

The WebDriverIO reporter can auto-generate test cases
and suites from your test data.
Test results of subsequent test runs will match the same test cases
as long as their names and file paths don't change.

You can also annotate the tests with the IDs of existing test cases
from Qase.io before executing tests. It's a more reliable way to bind
autotests to test cases, that persists when you rename, move, or
parameterize your tests.

For example:

### Mocha/Jasmine

```typescript
import {qase} from "wdio-qase-reporter";

describe('My First Test', () => {
  it('Several ids', () => {
    qase.id(1);
    expect(true).to.equal(true);
  });

  // a test can check multiple test cases
  it('Correct test', () => {
    qase.id([2, 3]);
    expect(true).to.equal(true);
  });

  it('With steps',async  () => {
    await qase.step('Step 1', async (s1) => {
      await s1.step('Step 1.1', async () => {
        // do something
        s1.attach({name: 'screenshot.png', type: 'image/png', content: await browser.takeScreenshot()})
      })

      qase.attach({name: 'log.txt', content: 'test', type: 'text/plain'})

      await s1.step('Step 1.2', async () => {
        // do something
      })
    })
    expect(true).to.equal(true);
  });
});
```

### Cucumber

```gherkin
Feature: Test user role

  @QaseId=3
  Scenario: Login
    Given I test login
```

To execute WebDriverIO tests and report them to Qase.io, run the command:

```bash
QASE_MODE=testops wdio run ./wdio.conf.ts
```

<p align="center">
  <img width="65%" src="./screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

Qase WebDriverIO reporter can be configured in multiple ways:

- using a separate config file `qase.config.json`,
- using environment variables (they override the values from the configuration files).

For a full list of configuration options, see
the [Configuration reference](../qase-javascript-commons/README.md#configuration).

Example `qase.config.json` config:

```json
{
  "mode": "testops",
  "debug": true,
  "testops": {
    "api": {
      "token": "api_key"
    },
    "project": "project_code",
    "run": {
      "complete": true
    }
  }
}
```

Also, you need to configure the reporter using the `wdio.conf.ts` file:

```ts
// wdio.conf.ts
import WDIOQaseReporter from 'wdio-qase-reporter';
import type { Options } from '@wdio/types';
import { afterRunHook, beforeRunHook } from 'wdio-qase-reporter';

export const config: Options.Testrunner = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: true,
    useCucumber: false,
  }]],

  // ...
  // =====
  // Hooks
  // =====
  onPrepare: async function() {
    await beforeRunHook();
  },
  onComplete: async function() {
    await afterRunHook();
  },
  // ... other options
};
```

Additional options of the reporter in the `wdio.conf.ts` file:

- `disableWebdriverStepsReporting` - optional parameter(`false` by default), in order to log only custom steps to the reporter.
- `disableWebdriverScreenshotsReporting` - optional parameter(`false` by default), in order to not attach screenshots to the reporter.
- `useCucumber` - optional parameter (`false` by default), if you use Cucumber, set it to true

## Requirements

We maintain the reporter on [LTS versions of Node](https://nodejs.org/en/about/releases/).

`wdio >= 8.40.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
