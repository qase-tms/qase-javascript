# [Qase TestOps](https://qase.io) WebdriverIO Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Qase WebdriverIO Reporter enables seamless integration between your WebdriverIO (WDIO) tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, wdio.conf.js)
- Support for both Mocha/Jasmine and Cucumber test frameworks

## Installation

```bash
npm install --save-dev wdio-qase-reporter
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

**2. Configure reporter in `wdio.conf.js`:**

```javascript
const WDIOQaseReporter = require('wdio-qase-reporter').default;
const { afterRunHook, beforeRunHook } = require('wdio-qase-reporter');

exports.config = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: true,
    useCucumber: false,
  }]],

  // Hooks
  onPrepare: async function() {
    await beforeRunHook();
  },
  onComplete: async function() {
    await afterRunHook();
  },

  // ... other options
};
```

**3. Add Qase ID to your test:**

**For Mocha/Jasmine:**
```javascript
import { qase } from 'wdio-qase-reporter';

describe('Authentication', () => {
  it(qase(1, 'User can log in'), () => {
    expect(true).to.equal(true);
  });
});
```

**For Cucumber:**
```gherkin
Feature: User Authentication

  @QaseId=1
  Scenario: User can log in
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

**4. Run your tests:**

```bash
QASE_MODE=testops npx wdio run wdio.conf.js
```

## Configuration

The reporter is configured via (in order of priority):

1. **`wdio.conf.js` reporter options** (WDIO-specific, highest priority)
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
      "title": "WDIO Automated Run"
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

### WDIO Reporter Options

Configure in `wdio.conf.js`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `disableWebdriverStepsReporting` | boolean | `false` | Disable automatic step reporting for WebDriver commands |
| `disableWebdriverScreenshotsReporting` | boolean | `false` | Disable automatic screenshot attachments |
| `useCucumber` | boolean | `false` | Enable Cucumber integration (set to `true` if using Cucumber) |

> **Full configuration reference:** See [qase-javascript-commons](../qase-javascript-commons/README.md) for all available options including logging, status mapping, execution plans, and more.

## Usage

### Link Tests with Test Cases

**Mocha/Jasmine - Single ID:**
```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it(qase(1, 'Test with single ID'), () => {
    expect(true).to.equal(true);
  });
});
```

**Mocha/Jasmine - Multiple IDs:**
```javascript
it(qase([1, 2, 3], 'Test linked to multiple cases'), () => {
  expect(true).to.equal(true);
});
```

**Cucumber - Tags:**
```gherkin
@QaseId=1
Scenario: Single test case

@QaseId=2,3,4
Scenario: Multiple test cases
```

### Add Metadata

**Mocha/Jasmine:**
```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with metadata', () => {
  qase.title('Custom test title');
  qase.fields({
    'severity': 'critical',
    'priority': 'high',
    'layer': 'api',
  });
  qase.suite('Authentication\tLogin');

  expect(true).to.equal(true);
});
```

**Cucumber:**
```gherkin
@QaseId=1
@Title=Custom Test Title
@Suite=Authentication
Scenario: Login with metadata
  Given I am on the login page
```

### Add Steps

**Mocha/Jasmine:**
```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with steps', async () => {
  await qase.step('Navigate to login page', async (step) => {
    await browser.url('/login');
  });

  await qase.step('Enter credentials', async (step) => {
    await step.step('Type email', async () => {
      await $('#email').setValue('user@example.com');
    });

    await step.step('Type password', async () => {
      await $('#password').setValue('password123');
    });
  });

  await qase.step('Submit form', async () => {
    await $('#login-button').click();
  });
});
```

**Cucumber:** Cucumber steps are automatically reported as Qase steps.

### Attach Files

**Mocha/Jasmine:**
```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with attachments', async () => {
  const screenshot = await browser.takeScreenshot();

  qase.attach({
    name: 'screenshot.png',
    content: screenshot,
    type: 'image/png',
  });

  qase.attach({ paths: '/path/to/log.txt' });
});
```

**Cucumber:** Use step attachments or configure automatic screenshot capture.

### Ignore Tests

**Mocha/Jasmine:**
```javascript
it('Ignored test', () => {
  qase.ignore();
  expect(true).to.equal(true);
});
```

**Cucumber:** No direct support - use tags to filter tests.

### Test Result Statuses

| WDIO Result | Qase Status |
|-------------|-------------|
| passed | passed |
| failed | failed |
| skipped | skipped |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

### Basic Execution

```bash
# Run all tests
QASE_MODE=testops npx wdio run wdio.conf.js

# Run specific spec file
QASE_MODE=testops npx wdio run wdio.conf.js --spec ./tests/login.spec.js

# Run specific suite
QASE_MODE=testops npx wdio run wdio.conf.js --suite smoke
```

### Cucumber

```bash
# Run Cucumber tests
QASE_MODE=testops npx wdio run wdio.conf.js
```

### Environment Variables

```bash
# Override configuration
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
npx wdio run wdio.conf.js
```

### Parallel Execution

```bash
# Run with max instances
QASE_MODE=testops npx wdio run wdio.conf.js --maxInstances 5
```

## Multi-Project Support

Qase WebdriverIO Reporter supports sending test results to multiple Qase projects simultaneously using `qase.projects()`:

**Mocha/Jasmine:**
```javascript
import { qase } from 'wdio-qase-reporter';

it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'Multi-project test'), () => {
  expect(true).to.equal(true);
});
```

**Configuration:**
```json
{
  "mode": "testops",
  "testops": {
    "multiproject": {
      "enabled": true
    }
  }
}
```

For detailed information, see the [Multi-Project Support Guide](docs/MULTI_PROJECT.md).

## Requirements

- Node.js >= 14
- WebdriverIO >= 8.40.0

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all methods and options |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Configuration Reference](../qase-javascript-commons/README.md) | Full configuration options |

## Examples

See the [examples directory](../examples/) for complete working examples:
- [Mocha/Jasmine example](../examples/multiProject/wdio/)
- Cucumber examples (check examples directory)

## License

Apache License 2.0. See [LICENSE](../LICENSE) for details.
