> # Qase TMS Cucumber JS reporter
>
> Publish results simple and easy.

## How to integrate

```
npm install cucumberjs-qase-reporter
```

## Example of usage

The Cucumber JS reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. You can decorate your scenarios with Qase TMS case IDs in format `Q-<case id>` or `Q123`, also `q` can be in any case:

```gherkin
Feature: Cucumber documentation
    As a user of cucumber.js
    I want to have documentation on cucumber
    So I can write better applications

    @sections @Q-2
    Scenario: Usage documentation
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "Cool" section
        When I go to the README file

    @ignore @q4
    Scenario: Status badges 2
        Given I am on the cucumber.js GitHub repository
        When I go to the README file
        Then I should see a "Build Status" badge
        And I should see a "Dependencies" badge
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

---

To run tests and create a test run, execute the command (for example from folder examples):

```bash
cucumber-js -f cucumberjs-qase-reporter --format-options='{\"qaseConfig\": \"./.qaserc\"}' features -r examples/zombie/support -r examples/zombie/steps
```

or

```bash
npm test
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

## Configuration

Qase reporter supports passing parameters using two ways:
using `.qaserc` file and using ENV variables.

```
 .qaserc parameters:
```

| Param | Type  | Required | Description |
| --| --------- | -------- | ------------------ |
| `report`   | _boolean_  | no |   Enable reporter   |
| `apiToken`  | _string_ | __yes__ | Token for API access, you can find more information [here](https://developers.qase.io/#authentication) |
| `basePath` | _string_ | no | URL Qase.io |
| `projectCode` | _string_ | __yes__  | Code of your project (can be extracted from main page of your project: `https://app.qase.io/project/TP` - `TP` is project code here) |
| `rootSuiteTitle` | _string_ | no | A parent suite for your autocreated tests |
| `runId` | _string_ | no | Pass Run ID |
| `environmentId` | _string_ | no | To execute with the sending of the envinroment information |
| `runName` | _string_ | no | Set custom Run name, when new run is created. Supported parameter - `%DATE%` |
| `runDescription` | _string_ | no | Set custom Run description, when new run is created |
| `runComplete` | _boolean_ | no | Closure of the test run after passing |
| `logging` | _boolean_ | no | Enabled debug logging from reporter or not |
| `uploadAttachments` | _boolean_ | no | Uploading attachment to results |


Example configuration file:

```json
{
  "report": true,
  "logging": true,
  "apiToken": "api_key",
  "projectCode": "project_code",
  "runName": "CucumberJS run %DATE%",
  "environmentId": 1,
  "basePath": "https://api.qase.io/v1"
}
```

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
| `QASE_UPLOAD_ATTACHMENTS` | Same as `uploadAttachments` |

To run using ENV you have to execute:

```bash
cucumber-js -f cucumberjs-qase-reporter features
```

## Setup with Protractor

Due to different configurations of protractor and cucumber itself you should install a bit more libraries:

```bash
npm install cucumberjs-qase-reporter @cucumber/cucumber @cucumber/messages
```

After that you will be able to use reporter like this (`protractor.conf.js`):

```js
exports.config = {
  ...
  cucumberOpts: {
    require: [
      './tests/e2e/specs/*.js',
    ],  // require step definition files before executing features
    tags: [],
    'dry-run': false,
    compiler: [],
    format: ["node_modules/cucumberjs-qase-reporter"],
  },
  ...
}
```

**Do not forget to add .qaserc file!**

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
6. Update config file with API key and project code `./examples/.qaserc`
7. Run example test
   ```sh
   npm run test
   ```
