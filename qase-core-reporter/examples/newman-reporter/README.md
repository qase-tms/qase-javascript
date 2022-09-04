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
    --reporter-qase-runName 'API test Execution' \ # Specify Run name using CLI parameters
    --reporter-qase-runDescription 'Check API consistency' \ # Specify Run description using CLI parameters
    --reporter-qase-rootSuiteTitle 'Newman tests' \ # A parent suite for your autocreated tests
    -x # WA for issue https://github.com/postmanlabs/newman/issues/2148#issuecomment-665229759
```

<p align="center">
  <img width="65%" src="./examples/screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

<p align="center">
  <img src="./examples/screenshots/demo.gif">
</p>

You can check example setup in [example project](./example).

Supported ENV variables:

- `QASE_REPORT` - You **should** pass this ENV if you want to use qase reporter
- `QASE_API_TOKEN` - API token
- `QASE_PROJECT_CODE` - Code of your project (can be extracted from main page of your project: https://app.qase.io/project/TP - TP is project code here)
- `QASE_API_BASE_URL` - Qase.io url
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_ENVIRONMENT_ID` - Pass Environment ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created
- `QASE_RUN_COMPLETE` - Complete run after all tests are finished
- `QASE_ROOT_SUITE_TITLE` - Same as `--reporter-qase-rootSuiteTitle`

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
