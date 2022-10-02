> # Qase TMS Newman reporter
>
> Publish results simple and easy.

## How to integrate

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
// qase: 10
// Qase: 1, 2, 3
// qase: 4 5 6 14
pm.test("expect response be 200", function () {
  pm.response.to.be.info;
});
```

You should also have an active item in the project settings at

```
https://app.qase.io/project/QASE_PROJECT_CODE/settings/options
```

options in the `Test Runs` block:

```
Auto create test cases
```

and

```
Allow submitting results in bulk
```

### Execute rom CLI:

```
QASE_RUN_ID=34 # Specify Run ID using ENV
QASE_REPORT=true # To use send test results to qase.io
newman run \
    -r qase \ # Enable Qase logger
    --reporter-qase-logging \ # Use reporter logger (like debug)
    --reporter-qase-projectCode project_code \ # Specify Project Code
    --reporter-qase-apiToken api_token \ # Specify API token
    --reporter-qase-runId 34 \ # Specify Run ID using CLI parameters
    --reporter-qase-basePath https://api.qase.io/v1 \ # URL Qase.io
    --reporter-qase-runComplete \ # Closure of the test run after passing
    --reporter-qase-basePath https://api.qase.io/v1 \ # URL Qase.io
    --reporter-qase-runName 'API test Execution' \ # Specify Run name using CLI parameters
    --reporter-qase-runDescription 'Check API consistency' \ # Specify Run description using CLI parameters
    --reporter-qase-rootSuiteTitle 'Newman tests' \ # A parent suite for your autocreated tests
    -x # WA for issue https://github.com/postmanlabs/newman/issues/2148#issuecomment-665229759
```

<p align="center">
  <img width="65%" src="screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

<p align="center">
  <img src="screenshots/demo.gif">
</p>

You can check example setup in [example project](./example).

---

> Qase environmental variables are first class options, which means the user can change all default/static reporter options by using these variables.

```
Supported ENV variables:
```

| Variable | Description |
| -- | -- |
| `QASE_REPORT` | Same as `report` |
| `QASE_API_TOKEN` | Same as `apiToken` |
| `QASE_API_BASE_URL` | Same as `basePath` |
| `QASE_PROJECT_CODE` | Same as `projectCode` |
| `QASE_ROOT_SUITE_TITLE` | Same as `rootSuiteTitle` |
| `QASE_RUN_ID` | Same as `runId` |
| `QASE_ENVIRONMENT_ID` | Same as `environmentId` |
| `QASE_RUN_NAME` | Same as `runName` |
| `QASE_RUN_DESCRIPTION` | Same as `runDescription` |
| `QASE_RUN_COMPLETE` | Same as `runComplete` |
| `QASE_LOGGING` | Same as `logging` |


## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)

<!-- references -->

[auth]: https://developers.qase.io/#authentication

---

## Development

To build this reporter locally, you need to build the `qase-core-reporter` module first, which is a directory up.

1. Install dependencies
   ```sh
   npm install
   ```
2. Run project in dev watch mode
   ```sh
   npm run dev:watch
   ```
3. Make any needed changes to `./src/index.ts`
4. There is also the option to test with the example project, go to examples
   ```sh
   cd examples
   ```
5. Install examples dependencies
   ```sh
   npm install
   ```
6. Update reporter options in test command with API key and project code `./example/package.json`
7. Run example test
   ```sh
   npm run test
   ```
