# [Qase TestOps](https://qase.io) CucumberJS Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Qase CucumberJS Reporter enables seamless integration between your CucumberJS tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID using Gherkin tags
- Auto-create test cases from your Gherkin scenarios
- Report test results with rich metadata (fields, attachments, steps)
- Native Gherkin step reporting (Given/When/Then automatically mapped)
- Multi-project reporting support
- Flexible configuration (file, environment variables, CucumberJS formatter)

## Installation

```sh
npm install --save-dev cucumberjs-qase-reporter
```

## Quick Start

**1. Create `qase.config.json` in your project root:**

```json
{
  "mode": "testops",
  "testops": {
    "project": "YOUR_PROJECT_CODE",
    "api": {
      "token": "YOUR_API_TOKEN"
    }
  }
}
```

**2. Add Qase ID tag to your Gherkin scenario:**

```gherkin
Feature: User Authentication

  @QaseID=1
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

**3. Run your tests with the reporter:**

```sh
QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter
```

## Configuration

The reporter is configured via (in order of priority):

1. **CucumberJS CLI flags** (highest priority)
2. **Environment variables** (`QASE_*`)
3. **Config file** (`qase.config.json`)

### CucumberJS Formatter Configuration

Run CucumberJS with the Qase formatter:

```sh
npx cucumber-js -f cucumberjs-qase-reporter features -r step_definitions
```

Or configure in your `cucumber.js` profile:

```javascript
// cucumber.js
module.exports = {
  default: {
    format: ['progress', 'cucumberjs-qase-reporter'],
    requireModule: ['ts-node/register'],
    require: ['step_definitions/**/*.js'],
  },
};
```

### Minimal Configuration

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| `mode` | `QASE_MODE` | Set to `testops` to enable reporting |
| `testops.project` | `QASE_TESTOPS_PROJECT` | Your Qase project code |
| `testops.api.token` | `QASE_TESTOPS_API_TOKEN` | Your Qase API token |

### Example `qase.config.json`

```json
{
  "mode": "testops",
  "fallback": "report",
  "testops": {
    "project": "YOUR_PROJECT_CODE",
    "api": {
      "token": "YOUR_API_TOKEN"
    },
    "run": {
      "title": "CucumberJS Automated Run"
    },
    "batch": {
      "size": 100
    }
  },
  "report": {
    "driver": "local",
    "connection": {
      "local": {
        "path": "./build/qase-report",
        "format": "json"
      }
    }
  }
}
```

> **Full configuration reference:** See [qase-javascript-commons](../qase-javascript-commons/README.md) for all available options including logging, status mapping, execution plans, and more.

## Usage

### Link Tests with Test Cases

Associate your scenarios with Qase test cases using Gherkin tags:

**Single ID:**
```gherkin
Feature: User Authentication

  @QaseID=1
  Scenario: Valid login
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

**Multiple IDs:**
```gherkin
Feature: User Authentication

  @QaseID=1,2,3
  Scenario: Multiple test case coverage
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

> **Note:** Unlike other frameworks, CucumberJS uses Gherkin tags (`@QaseID=N`) instead of programmatic wrapper functions. Test case linking happens at the scenario level in feature files.

### Add Metadata

Enhance your scenarios with additional information using tags:

**Using Gherkin Tags:**
```gherkin
Feature: User Authentication

  @QaseID=1
  @QaseTitle=Custom Test Title
  @QaseFields={"severity":"critical","priority":"high","layer":"e2e"}
  Scenario: Login with metadata
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

**Programmatic Metadata (in Before hooks):**
```javascript
// support/hooks.js
const { Before } = require('@cucumber/cucumber');

Before(function() {
  // Note: programmatic metadata requires custom implementation
  // Most metadata is set via Gherkin tags
});
```

### Ignore Tests

Exclude specific scenarios from Qase reporting (scenario still runs, but results are not sent):

```gherkin
Feature: User Authentication

  @QaseIgnore
  Scenario: Test not reported to Qase
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

### Test Result Statuses

| CucumberJS Result | Qase Status |
|-------------------|-------------|
| Passed | Passed |
| Failed | Failed |
| Pending | Blocked |
| Skipped | Skipped |
| Undefined | Blocked |
| Ambiguous | Failed |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

**Basic test execution with reporter:**
```sh
QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter
```

**With specific features:**
```sh
QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter features/login.feature
```

**With tags filtering:**
```sh
npx cucumber-js -f cucumberjs-qase-reporter --tags "@smoke and not @skip"
```

**Using cucumber.js profile:**
```sh
npx cucumber-js --profile default
```

> **Note:** The reporter formatter should be specified with `-f cucumberjs-qase-reporter` flag or in your cucumber.js configuration.

## Requirements

- Node.js >= 14
- @cucumber/cucumber >= 8.0.0

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all tags and patterns |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Understanding native Gherkin step mapping |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |

## Examples

See the [examples directory](../examples/) for complete working examples.

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
