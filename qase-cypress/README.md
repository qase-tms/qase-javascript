# [Qase TestOps](https://qase.io) Cypress Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Qase Cypress Reporter enables seamless integration between your Cypress tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, Cypress config)
- Cucumber/Gherkin integration support
- Automatic screenshot and video attachments

## Installation

```sh
npm install --save-dev cypress-qase-reporter
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

**2. Configure Cypress to use the reporter in `cypress.config.js`:**

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
  },
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
    },
  },
});
```

**3. Add Qase ID to your test:**

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Login Suite', () => {
  it(qase(1, 'User can login with valid credentials'), () => {
    cy.visit('https://example.com/login');
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

**4. Run your tests:**

```sh
npx cypress run
```

## Configuration

The reporter is configured via (in order of priority):

1. **cypress.config.js** (Cypress-specific, highest priority)
2. **Environment variables** (`QASE_*`)
3. **Config file** (`qase.config.json`)

### Minimal Configuration

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| `mode` | `QASE_MODE` | Set to `testops` to enable reporting |
| `testops.project` | `QASE_TESTOPS_PROJECT` | Your Qase project code |
| `testops.api.token` | `QASE_TESTOPS_API_TOKEN` | Your Qase API token |

### Example `cypress.config.js`

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    debug: false,
    testops: {
      api: {
        token: process.env.QASE_API_TOKEN,
      },
      project: 'DEMO',
      uploadAttachments: true,
      run: {
        title: 'Cypress Automated Run',
        complete: true,
      },
      batch: {
        size: 100,
      },
    },
    framework: {
      cypress: {
        screenshotsFolder: 'cypress/screenshots',
        videosFolder: 'cypress/videos',
      },
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
    },
  },
});
```

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
      "title": "Cypress Automated Run"
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
  },
  "framework": {
    "cypress": {
      "screenshotsFolder": "cypress/screenshots",
      "videosFolder": "cypress/videos"
    }
  }
}
```

> **Full configuration reference:** See [qase-javascript-commons](../qase-javascript-commons/README.md) for all available options including logging, status mapping, execution plans, and more.

## Usage

### Link Tests with Test Cases

Associate your tests with Qase test cases using test case IDs:

**Single ID:**

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Authentication', () => {
  it(qase(1, 'Login with valid credentials'), () => {
    cy.visit('/login');
    cy.get('#email').type('user@example.com');
    cy.get('button').click();
  });
});
```

**Multiple IDs:**

```javascript
describe('Authentication', () => {
  it(qase([1, 2, 3], 'Login works across multiple browsers'), () => {
    cy.visit('/login');
    cy.get('#email').type('user@example.com');
    cy.get('button').click();
  });
});
```

### Add Metadata

Enhance your tests with additional information:

```javascript
it('User can login', () => {
  qase.title('User successfully logs in with valid credentials');
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'e2e',
    description: 'Tests the core login flow',
  });
  qase.suite('Authentication / Login');

  cy.visit('/login');
  cy.get('#email').type('user@example.com');
  cy.get('#password').type('password123');
  cy.get('button').click();
});
```

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs, but results are not sent):

```javascript
it('Test under development', () => {
  qase.ignore();
  cy.visit('/new-feature');
  cy.get('.coming-soon').should('be.visible');
});
```

### Test Result Statuses

| Cypress Result | Qase Status |
|----------------|-------------|
| Passed | Passed |
| Failed | Failed |
| Pending | Skipped |
| Skipped | Skipped |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

Run Cypress tests with Qase reporting:

```bash
# Run all tests
npx cypress run

# Run specific spec file
npx cypress run --spec "cypress/e2e/login.cy.js"

# Run in headed mode
npx cypress open

# Run with environment variables
QASE_MODE=testops QASE_TESTOPS_PROJECT=DEMO npx cypress run
```

## Requirements

- Node.js >= 14
- Cypress >= 10.0.0

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all methods and options |
| [Cucumber Integration](docs/cucumber.md) | Gherkin/Cucumber support with preprocessors |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Defining test steps for detailed reporting |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |

## Examples

See the [examples directory](../examples/) for complete working examples:

- [Single project example](../examples/cypress/)
- [Cucumber (badeball) example](../examples/cypressBadeballCucumber/)
- [Cucumber (legacy) example](../examples/cypressCucumber/)

## License

Apache License 2.0. See [LICENSE](../LICENSE) for details.
