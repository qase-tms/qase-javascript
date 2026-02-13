# [Qase TestOps](https://qase.io) Jest Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Qase Jest Reporter enables seamless integration between your Jest tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, Jest config)

## Installation

```sh
npm install --save-dev jest-qase-reporter
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

**2. Add Qase ID to your test:**

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('User Authentication', () => {
  test(qase(1, 'User can login with valid credentials'), () => {
    expect(true).toBe(true);
  });
});
```

**3. Run your tests:**

```sh
npx jest
```

## Configuration

The reporter is configured via (in order of priority):

1. **jest.config.js** (Jest-specific, highest priority)
2. **Environment variables** (`QASE_*`)
3. **Config file** (`qase.config.json`)

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
      "title": "Jest Automated Run"
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

### Example `jest.config.js`

```javascript
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        mode: 'testops',
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'YOUR_PROJECT_CODE',
          run: {
            complete: true,
          },
        },
      },
    ],
  ],
};
```

> **Full configuration reference:** See [qase-javascript-commons](../qase-javascript-commons/README.md) for all available options including logging, status mapping, execution plans, and more.

## Usage

### Link Tests with Test Cases

Associate your tests with Qase test cases using test case IDs:

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Test suite', () => {
  // Single test case ID
  test(qase(1, 'Test name'), () => {
    expect(true).toBe(true);
  });

  // Multiple test case IDs
  test(qase([1, 2, 3], 'Test covering multiple cases'), () => {
    expect(true).toBe(true);
  });
});
```

### Add Metadata

Enhance your tests with additional information:

```javascript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Test with metadata'), () => {
  qase.title('User can successfully login');
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
  });
  qase.suite('Authentication / Login');

  // Test logic
  expect(true).toBe(true);
});
```

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs, but results are not sent):

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('This test runs but is not reported to Qase', () => {
  qase.ignore();
  expect(true).toBe(true);
});
```

### Test Result Statuses

| Jest Result | Qase Status |
|-------------|-------------|
| passed      | passed      |
| failed      | failed      |
| skipped     | skipped     |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

```bash
# Run all tests with Qase reporting
QASE_MODE=testops npx jest

# Run specific test file
QASE_MODE=testops npx jest path/to/test.spec.js

# Run tests matching pattern
QASE_MODE=testops npx jest --testPathPattern="auth"

# Run with custom test run title
QASE_MODE=testops QASE_TESTOPS_RUN_TITLE="Nightly Regression" npx jest
```

## Requirements

- Node.js >= 14
- Jest >= 27.0.0

> **Note:** Testing frameworks that use Jest as a test runner, such as Puppeteer, Appium, and Detox, can also be used with Jest reporter.

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all methods and options |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Defining test steps for detailed reporting |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |

## Examples

See the [examples directory](../examples/) for complete working examples.

## License

Apache License 2.0. See [LICENSE](../LICENSE) for details.
