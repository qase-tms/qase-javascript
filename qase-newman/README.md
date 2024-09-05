# Qase TMS Newman reporter

Publish results simple and easy.

To install the latest version, run:

```bash
npm install newman-reporter-qase
```

## Example of usage

### Define in tests

The Newman reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests.
Example:

```js
//qase: 10
// Qase: 1, 2, 3
// qase: 4 5 6 14
pm.test('expect response be 200', function () {
    pm.response.to.be.info
})
```
### Execute rom CLI:
```
QASE_MODE=testops newman run ./sample-collection.json -r qase
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
- `testops.run.id` - Pass Run ID
- `testops.run.title` - Set custom Run name, when new run is created
- `testops.run.description` - Set custom Run description, when new run is created
- `testops.run.complete` - Whether the run should be completed

Example configuration file:

```json
{
  "mode": "testops",
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

`newman >= 5.3.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
