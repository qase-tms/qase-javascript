# [Qase TestOps](https://qase.io) Mocha Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![npm downloads](https://img.shields.io/npm/dm/mocha-qase-reporter.svg)](https://www.npmjs.com/package/mocha-qase-reporter)

Qase Mocha Reporter enables seamless integration between your Mocha tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, Mocha config)
- Parallel execution support
- Extra reporters support (spec, json, etc.)

## Installation

```sh
npm install --save-dev mocha-qase-reporter
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

**2. Configure Mocha to use the reporter in `.mocharc.js`:**

```javascript
module.exports = {
  reporter: 'mocha-qase-reporter',
  // ... other mocha options
};
```

**3. Add Qase ID to your test:**

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Authentication', function() {
  it(qase(1, 'User can login with valid credentials'), function() {
    expect(login('user@example.com', 'password123')).to.equal(true);
  });
});
```

**4. Run your tests:**

```sh
QASE_MODE=testops npx mocha
```

## Configuration

The reporter is configured via (in order of priority):

1. **Environment variables** (`QASE_*`, highest priority)
2. **Config file** (`qase.config.json`)

### Minimal Configuration

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| `mode` | `QASE_MODE` | Set to `testops` to enable reporting |
| `testops.project` | `QASE_TESTOPS_PROJECT` | Your Qase project code |
| `testops.api.token` | `QASE_TESTOPS_API_TOKEN` | Your Qase API token |

### Example `.mocharc.js`

```javascript
module.exports = {
  reporter: 'mocha-qase-reporter',
  require: ['@babel/register'],
  spec: 'tests/**/*.spec.js',
  timeout: 5000,
};
```

### Example `qase.config.json`

```json
{
  "mode": "testops",
  "fallback": "report",
  "debug": false,
  "testops": {
    "project": "YOUR_PROJECT_CODE",
    "api": {
      "token": "YOUR_API_TOKEN"
    },
    "run": {
      "title": "Mocha Automated Run",
      "complete": true
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

Associate your tests with Qase test cases using test case IDs:

**Single ID:**

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Management', function() {
  it(qase(1, 'Create new user'), function() {
    const user = createUser('john@example.com');
    expect(user.email).to.equal('john@example.com');
  });
});
```

**Multiple IDs:**

```javascript
describe('Login Tests', function() {
  it(qase([1, 2, 3], 'Login works across different browsers'), function() {
    const result = login('user@example.com', 'password');
    expect(result.success).to.be.true;
  });
});
```

### Add Metadata

Enhance your tests with additional information:

```javascript
it('User registration', function() {
  qase.title('User can register with valid email and password');
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
    description: 'Tests user registration flow with validation',
  });
  qase.suite('Authentication / Registration');

  const user = register('newuser@example.com', 'SecurePass123');
  expect(user.id).to.exist;
});
```

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs, but results are not sent):

```javascript
it('Test under development', function() {
  qase.ignore();

  expect(true).to.be.true;
});
```

### Test Result Statuses

| Mocha Result | Qase Status |
|--------------|-------------|
| Passed | Passed |
| Failed | Failed |
| Pending | Skipped |
| Skipped | Skipped |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

Run Mocha tests with Qase reporting:

```bash
# Run all tests
QASE_MODE=testops npx mocha

# Run with specific spec pattern
QASE_MODE=testops npx mocha "tests/**/*.spec.js"

# Run with grep filter
QASE_MODE=testops npx mocha --grep "authentication"

# Run with .mocharc.js configuration
QASE_MODE=testops npx mocha

# Run in parallel
QASE_MODE=testops npx mocha --parallel

# Run with extra reporters
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec
```

## Parallel Execution

The reporter supports parallel execution of tests. First, create a new run in Qase.io using the [Qase CLI](https://github.com/qase-tms/qasectl):

```bash
# Create a new test run
qasectl testops run create --project DEMO --token token --title 'Mocha test run'

# Save the run ID to the environment variable
export QASE_TESTOPS_RUN_ID=$(< qase.env grep QASE_TESTOPS_RUN_ID | cut -d'=' -f2)

# Run tests in parallel
QASE_MODE=testops npx mocha --parallel

# Complete the run after tests finish
qasectl testops run complete --project DEMO --token token --id $(echo $QASE_TESTOPS_RUN_ID)
```

## Extra Reporters

The reporter supports additional reporters alongside the main Qase reporter. This allows you to use multiple output formats (e.g., console output and JSON reports) without the hanging issues that can occur with `mocha-multi-reporters` in parallel mode.

```bash
# Single extra reporter
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec

# Multiple extra reporters
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec,json

# With parallel execution
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec --parallel
```

For detailed configuration options and examples, see the [Extra Reporters section](docs/usage.md#using-extra-reporters) in the usage guide.

## Requirements

- Node.js >= 14
- Mocha >= 8.0.0

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all methods and options |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Defining test steps for detailed reporting |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |

## Examples

See the [examples directory](../examples/) for complete working examples:

- [Single project example](../examples/single/mocha/)
- [Multi-project example](../examples/multiProject/mocha/)

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
