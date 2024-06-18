# Qase TMS TestCafe reporter

Publish results simple and easy.

To install the latest version, run:

```sh
npm install -D testcafe-reporter-qase
```

## Updating from v1

To update a test project using testcafe-reporter-qaser@v1 to version 2:

1. Update reporter configuration in `qase.config.json` and/or environment variables —
   see the [configuration reference](#configuration) below.

## Example of usage

The TestCafe reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. Meta key should be `CID`.
You should assign list of case IDs to it, e.g.:

```js
test.meta('CID', [1])('Text typing basics', async (t) => {
  await t;
});

const q = qase.id(1)
  .title('Text typing basics')
  .field({ 'severity': 'high' })
  .parameters({ 'browser': 'chrome' })
  .create();
test.meta({ ...q })(
  'Click check boxes and then verify their state',
  async (t) => {
    await t;
  },
);
```

---

To run tests and create a test run, execute the command (for example from folder examples):

```bash
QASE_MODE=testops npx testcafe chrome test.js -r spec,qase
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

Qase Testcafe reporter can be configured in multiple ways:

- using a separate config file `qase.config.json`,
- using environment variables (they override the values from the configuration files).

For a full list of configuration options, see
the [Configuration reference](../qase-javascript-commons/README.md#configuration).

Example `qase.config.json` file:

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

We maintain the reporter on [LTS versions of Node](https://nodejs.org/en/about/releases/).

`testcafe >= 2.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
