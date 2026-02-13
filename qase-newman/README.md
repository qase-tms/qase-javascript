# [Qase TestOps](https://qase.io) Newman Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![npm downloads](https://img.shields.io/npm/dm/newman-qase-reporter.svg)](https://www.npmjs.com/package/newman-qase-reporter)

Qase Newman Reporter enables seamless integration between your Newman/Postman collection tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID using special comments
- Auto-create test cases from your Postman test scripts
- Report test results with parameterized data
- Multi-project reporting support
- Flexible configuration (file, environment variables)

> **Note:** Newman integration is unique - tests are defined in Postman collections, and Qase IDs are specified via special comments in test scripts, not via programmatic API imports.

## Installation

```bash
npm install --save-dev newman-reporter-qase
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

**2. Add Qase ID to your Postman test using special comments:**

In your Postman collection test script:

```javascript
// qase: 1
pm.test('Response status is 200', function() {
  pm.response.to.have.status(200);
});
```

**3. Run your Newman tests with Qase reporter:**

```bash
QASE_MODE=testops newman run ./collection.json -r qase
```

## Configuration

The reporter is configured via (in order of priority):

1. **Environment variables** (`QASE_*`)
2. **Config file** (`qase.config.json`)

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
      "title": "Newman Automated Run"
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

Associate your Postman tests with Qase test cases using special comments in your test scripts:

**Single ID:**
```javascript
// qase: 10
pm.test('Response is successful', function() {
  pm.response.to.be.info;
});
```

**Multiple IDs:**
```javascript
// Qase: 1, 2, 3
pm.test('Verify user data', function() {
  pm.expect(pm.response.json()).to.have.property('user');
});
```

**Alternative formats:**
```javascript
// qase: 4 5 6 14
pm.test('Check multiple conditions', function() {
  pm.response.to.have.status(200);
});
```

> **Important:** The comment must be on the line immediately before the `pm.test()` call.

### Add Parameters

Newman supports parameterized tests when using data files. Specify which parameters to report using special comments:

```javascript
// qase.parameters: userId, user.name
pm.test('User ID is correct', function() {
  var jsonData = pm.response.json();
  pm.expect(jsonData.userId).to.eql(pm.iterationData.get('userid'));
});
```

You can also specify parameters at the collection or folder level:

```json
{
  "item": [{
    "name": "Folder Name",
    "event": [{
      "listen": "test",
      "script": {
        "exec": [
          "// qase.parameters: userId, user.name"
        ]
      }
    }]
  }]
}
```

### Auto-collect All Parameters

To automatically report all parameters from data files without specifying them:

```json
{
  "framework": {
    "newman": {
      "autoCollectParams": true
    }
  }
}
```

### Ignore Tests

Newman does not support ignoring individual tests. All tests in the collection will be executed and reported (unless filtered by Newman's own mechanisms like `--folder` flag).

### Test Result Statuses

| Newman Result | Qase Status |
|---------------|-------------|
| Passed | passed |
| Failed | failed |
| Skipped | skipped |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

### Basic Execution with CLI

```bash
# Run with Qase reporter
QASE_MODE=testops newman run ./collection.json -r qase

# Run with multiple reporters
QASE_MODE=testops newman run ./collection.json -r cli,qase

# Run specific folder
QASE_MODE=testops newman run ./collection.json -r qase --folder "API Tests"
```

### Using Data Files

```bash
# Run with JSON data file
newman run ./collection.json -r qase -d ./data.json

# Run with CSV data file
newman run ./collection.json -r qase -d ./users.csv
```

### Using Environment Variables

```bash
# Set environment variables
newman run ./collection.json -r qase -e ./environment.json

# Override config with environment variables
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
newman run ./collection.json -r qase
```

### Programmatic Usage

```javascript
const newman = require('newman');

newman.run({
  collection: require('./collection.json'),
  reporters: ['qase'],
  reporter: {
    qase: {
      // Reporter options can be passed here
      // But prefer using qase.config.json for consistency
    }
  }
}, function(err) {
  if (err) { throw err; }
  console.log('Collection run complete');
});
```

## Requirements

- Node.js >= 14
- Newman >= 5.3.0

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with parameters and examples |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Defining test steps for detailed reporting |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |
| [Configuration Reference](../qase-javascript-commons/README.md) | Full configuration options |

## Examples

See the [examples directory](../examples/single/newman/) for complete working examples.

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
