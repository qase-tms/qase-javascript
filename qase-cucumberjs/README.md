# Qase TMS Cucumber JS reporter

Publish results simple and easy.

## How to install

```sh
npm install -D cucumberjs-qase-reporter
```

## Updating from v1

To update a test project using cucumberjs-qase-reporter@v1 to version 2:

1. Update reporter configuration in `qase.config.json` and/or environment variables —
   see the [configuration reference](#configuration) below.

## Getting started

The Cucumber JS reporter can auto-generate test cases
and suites from your test data.
Test results of subsequent test runs will match the same test cases
as long as their names and file paths don't change.

You can also annotate the tests with the IDs of existing test cases
from Qase.io before executing tests. It's a more reliable way to bind
autotests to test cases, that persists when you rename, move, or
parameterize your tests.

For example:

```gherkin
Feature: Cucumber documentation
  As a user of cucumber.js
  I want to have documentation on cucumber
  So I can write better applications

  @QaseID=1
  Scenario: Usage documentation
    Given I am on the cucumber.js GitHub repository
    When I go to the README file
    Then I should see a "Cool" section

  @QaseID=2
  @QaseFields={'severity':'high'}
  Scenario: Status badges 2
    Given I am on the cucumber.js GitHub repository
    When I go to the README file
    Then I should see a "Build Status" badge
    And I should see a "Dependencies" badge
```

To execute Cucumber JS tests and report them to Qase.io, run the command:

```bash
QASE_MODE=testops cucumber-js -f cucumberjs-qase-reporter features -r step_definitions --publish-quiet
```

or

```bash
npm test
```

You can try it with the example project at [`examples/cucumberjs`](../examples/cucumberjs/).

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

Qase Cucumber JS reporter can be configured in multiple ways:

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

To run using ENV you have to execute:

```bash
cucumber-js -f cucumberjs-qase-reporter features -r step_definitions --publish-quiet
```

## Requirements

We maintain the reporter on [LTS versions of Node](https://nodejs.org/en/about/releases/).

`@cucumber/cucumber >= 7.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
