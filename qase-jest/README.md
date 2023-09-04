> # Qase TMS Jest reporter
>
> Publish results simple and easy.

## How to integrate

```
npm install jest-qase-reporter
```

## Using Reporter

The Jest reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

```typescript
import { qase } from 'jest-qase-reporter/jest';

describe('My First Test', () => {
    test(qase([1,2], 'Several ids'), () => {
        expect(true).toBe(true);
    })

    test(qase(3, 'Correct test'), () => {
        expect(true).toBe(true);
    })

    test.skip(qase("4", 'Skipped test'), () => {
        expect(true).toBe(true);
    })

    test(qase(["5", "6"], 'Failed test'), () => {
        expect(true).toBe(false);
    })
});
```
To run tests and create a test run, execute the command (for example from folder examples):
```bash
QASE_MODE=testops npx jest
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

## Configuration

Reporter options (* - required):

- `mode` - `testops`/`off` Enables reporter, default - `off`
- `debug` - Enables debug logging, defaule - `false`
- `environment` - To execute with the sending of the envinroment information 
- *`testops.api.token` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`testops.project` - Code of your project (can be extracted from main
  page of your project: `https://app.qase.io/project/DEMOTR` -
  `DEMOTR` is project code here)
- `testops.run.id` - Pass Run ID
- `testops.run.title` - Set custom Run name, when new run is created
- `testops.run.description` - Set custom Run description, when new run is created
- `testops.run.complete` - Whether the run should be completed

Example `jest.config.js` config:

```js
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        debug: true,
        environment: 1,
        testops: {
          api: {
            token: 'api_key'
          },
          project: 'project_code',
          run: {
            id: 45,
            complete: true,
          },
        },
      },
    ],
  ],
  ...
};
```

You can check example configuration with multiple reporters in [example project](../examples/jest/jest.config.js).

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

`jest >= 28.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
