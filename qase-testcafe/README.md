# [Qase TestOps](https://qase.io) TestCafe Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![npm downloads](https://img.shields.io/npm/dm/testcafe-qase-reporter.svg)](https://www.npmjs.com/package/testcafe-qase-reporter)

Qase TestCafe Reporter enables seamless integration between your TestCafe tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables)

## Installation

```bash
npm install --save-dev testcafe-reporter-qase
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

**2. Add Qase ID to your test using metadata:**

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Example Fixture`
  .page`https://example.com`;

test.meta(qase.id(1).create())(
  'Test with Qase ID',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

**3. Run your tests with Qase reporter:**

```bash
QASE_MODE=testops npx testcafe chrome tests/ -r spec,qase
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
      "title": "TestCafe Automated Run"
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

Associate your tests with Qase test cases using the `qase.id()` method:

**Single ID:**
```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test.meta(qase.id(1).create())(
  'Test with single ID',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

**Multiple IDs:**
```javascript
test.meta(qase.id([1, 2, 3]).create())(
  'Test linked to multiple cases',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

### Add Metadata

Enhance your tests with additional information:

**Custom Title:**
```javascript
test.meta(qase.title('Custom test title').create())(
  'Test with custom title',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

**Fields:**
```javascript
test.meta(
  qase.fields({
    'severity': 'critical',
    'priority': 'high',
    'layer': 'e2e',
    'description': 'Verifies critical user flow',
  }).create()
)(
  'Test with fields',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

**Combined Metadata:**
```javascript
test.meta(
  qase.id(1)
    .title('User can login successfully')
    .fields({ 'severity': 'critical', 'priority': 'high' })
    .parameters({ 'browser': 'chrome', 'environment': 'staging' })
    .create()
)(
  'Login test',
  async (t) => {
    await t.typeText('#email', 'user@example.com');
    await t.typeText('#password', 'password123');
    await t.click('#login-button');
    await t.expect('#dashboard').exists;
  }
);
```

### Add Steps

Create detailed test steps for better reporting:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with steps', async (t) => {
  await qase.step('Navigate to login page', async () => {
    await t.navigateTo('https://example.com/login');
  });

  await qase.step('Enter credentials', async (s1) => {
    await s1.step('Type email', async () => {
      await t.typeText('#email', 'user@example.com');
    });

    await s1.step('Type password', async () => {
      await t.typeText('#password', 'password123');
    });
  });

  await qase.step('Submit form', async () => {
    await t.click('#login-button');
  });
});
```

### Attach Files

Attach screenshots or other files to test results:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with attachments', async (t) => {
  const screenshot = await t.takeScreenshot();

  qase.attach({
    name: 'screenshot.png',
    content: screenshot,
    contentType: 'image/png',
  });

  qase.attach({ paths: '/path/to/log.txt' });
  qase.attach({ paths: ['/path/to/file1.txt', '/path/to/file2.log'] });
});
```

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs):

```javascript
test.meta(qase.ignore().create())(
  'Test ignored in Qase',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

### Test Result Statuses

| TestCafe Result | Qase Status |
|-----------------|-------------|
| passed | passed |
| failed | failed |
| skipped | skipped |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

### Basic Execution

```bash
# Run all tests with Qase reporter
QASE_MODE=testops npx testcafe chrome tests/ -r spec,qase

# Run specific test file
QASE_MODE=testops npx testcafe chrome tests/login.test.js -r qase

# Run in headless mode
QASE_MODE=testops npx testcafe chrome:headless tests/ -r qase
```

### Multiple Browsers

```bash
# Run in multiple browsers
QASE_MODE=testops npx testcafe chrome,firefox tests/ -r qase

# Run in all installed browsers
QASE_MODE=testops npx testcafe all tests/ -r qase
```

### Environment Variables

```bash
# Override configuration with environment variables
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
npx testcafe chrome tests/ -r qase
```

### With TestCafe Configuration File

Create `.testcaferc.json`:

```json
{
  "browsers": ["chrome:headless"],
  "src": ["tests/**/*.test.js"],
  "reporter": [
    {
      "name": "spec"
    },
    {
      "name": "qase"
    }
  ],
  "concurrency": 3,
  "quarantineMode": false
}
```

Then run:

```bash
QASE_MODE=testops npx testcafe
```

## Requirements

- Node.js >= 14
- TestCafe >= 2.0.0

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all methods and options |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Defining test steps for detailed reporting |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |
| [Configuration Reference](../qase-javascript-commons/README.md) | Full configuration options |

## Examples

See the [examples directory](../examples/single/testcafe/) for complete working examples.

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
