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
---
To run tests and create a test run, execute the command (for example from folder examples/cucumberjs):
```bash
QASE_MODE=testops cucumber-js -f cucumberjs-qase-reporter:/dev/null features -r zombie/support -r zombie/steps --publish-quiet
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
- *`testops.api.token` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`testops.projectCode` - Code of your project (can be extracted from main
  page of your project: `https://app.qase.io/project/DEMOTR` -
  `DEMOTR` is project code here)
- `testops.run.id` - Pass Run ID
- `testops.run.title` - Set custom Run name, when new run is created
- `testops.run.description` - Set custom Run description, when new run is created
- `testops.run.complete` - Whether the run should be completed
- `testops.run.environment` - To execute with the sending of the envinroment information

Example configuration file:

```json
{
  "debug": true,
  "testops": {
    "api": {
      "token": "api_key"
    },
    "projectCode": "project_code",
    "run": {
      "environment": 1
    }
  }
}
```

Supported ENV variables:

- `QASE_MODE` - Same as `mode`
- `QASE_DEBUG` - Same as `debug`
- `QASE_TESTOPS_API_TOKEN` - Same as `testops.api.token`
- `QASE_TESTOPS_PROJECT_CODE` - Same as `testops.projectCode`
- `QASE_TESTOPS_RUN_ID` - Pass Run ID from ENV and override reporter option `testops.run.id`
- `QASE_TESTOPS_RUN_TITLE` - Same as `testops.run.title`
- `QASE_TESTOPS_RUN_DESCRIPTION` - Same as `testops.run.description`
- `QASE_TESTOPS_RUN_ENVIRONMENT` - Same as `testops.run.environment`

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

**Do not forget to add `.qaserc`/`qase.config.json` file!**

## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)
<!-- references -->

`@cucumber/cucumber >= 7.0.0`

[auth]: https://developers.qase.io/#authentication
