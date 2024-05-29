# Qase TMS TestCafe reporter

Publish results simple and easy.

The TestCafe reporter is currently in the closed beta stage.
To install the latest beta version, run:

```sh
npm install -D testcafe-reporter-qase@beta
```

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

test.meta({ CID: [2, 3] })(
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

Qase reporter supports passing parameters using two ways:
using `.qaserc`/`qase.config.json` file and using ENV variables.

`.qaserc` parameters, (* - required):

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

Example configuration file:

```json
{
  "debug": true,
  "environment": 1,
  "testops": {
    "api": {
      "token": "api_key"
    },
    "project": "project_code"
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

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)

`testcafe >= 2.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
