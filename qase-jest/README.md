# Qase TestOps Jest reporter

Qase Jest reporter sends test results and metadata to Qase.io.
It can work in different test automation scenarios:

* Create new test cases in Qase from existing autotests.
* Report Jest test results to existing test cases in Qase.

Testing frameworks that use Jest as a test runner, such as Puppeteer, Appium, and Detox,
can also be used with Jest reporter.

To install the latest version, run:

```shell
npm install --save-dev jest-qase-reporter
```

# Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Getting started](#getting-started)
- [Using Reporter](#using-reporter)
- [Configuration](#configuration)
- [Requirements](#requirements)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting started

To report your tests results to Qase, install `jest-qase-reporter`,
and add a reporter config in the `jest.config.ts` file.
A minimal configuration needs just two things:

* Qase project code, for example, in https://app.qase.io/project/DEMO the code is `DEMO`.
* Qase API token, created on the [Apps page](https://app.qase.io/apps?app=jest-reporter).

```js
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        mode: 'testops',
        testops: {
          api: {
            token: 'api_token'
          },
          project: 'project_code',
        },
      },
    ],
  ],
};
```

Now, run the Jest tests as usual.
Test results will be reported to a new test run in Qase.

```console
$ npx jest
Determining test suites to run...
...
qase: Project DEMO exists
qase: Using run 42 to publish test results
...

Ran all test suites.
```

## Using Reporter

The Jest reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

### Metadata

- `qase.title` - set the title of the test case
- `qase.fields` - set the fields of the test case
- `qase.suite` - set the suite of the test case
- `qase.comment` - set the comment of the test case
- `qase.parameters` - set the parameters of the test case
- `qase.groupParameters` - set the group parameters of the test case
- `qase.ignore` - ignore the test case in Qase. The test will be executed, but the results will not be sent to Qase.
- `qase.step` - create a step in the test case
- `qase.attach` - attach a file to the test case

```typescript
const { qase } = require('jest-qase-reporter/jest');

describe('My First Test', () => {
  test(qase([1, 2], 'Several ids'), () => {
    expect(true).toBe(true);
  });

  test(qase(3, 'Correct test'), () => {
    qase.title('Title');
    expect(true).toBe(true);
  });

  test.skip(qase('4', 'Skipped test'), () => {
    expect(true).toBe(true);
  });

  test(qase(['5', '6'], 'Failed test'), () => {
    expect(true).toBe(false);
  });
});
```

To run tests and create a test run, execute the command (for example from folder examples):

```bash
QASE_MODE=testops npx jest --runInBand
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

### Multi-Project Support

Qase Jest Reporter supports sending test results to multiple Qase projects simultaneously. You can specify different test case IDs for each project using `qase.projects(mapping, name)`.

For detailed information, configuration, and examples, see the [Multi-Project Support Guide](docs/MULTI_PROJECT.md).

## Configuration

Reporter options (* - required):

- `mode` - `testops`/`off` Enables reporter, default - `off`
- `debug` - Enables debug logging, default - `false`
- `environment` - To execute with the sending of the envinroment information
- *`testops.api.token` - Token for API access, you can generate it [here](https://developers.qase.io/#authentication).
- *`testops.project` - [Your project's code](https://help.qase.io/en/articles/9787250-how-do-i-find-my-project-code)
- `testops.run.id` - Qase test run ID, used when the test run was created earlier using CLI or API call.
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
        mode: 'testops',
        testops: {
          api: {
            token: 'api_key'
          },
          project: 'project_code',
          run: {
            complete: true,
          },
        },
        debug: true,
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

We maintain the reporter on LTS versions of Node. You can find the current versions by following
the [link](https://nodejs.org/en/about/releases/)

`jest >= 28.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
