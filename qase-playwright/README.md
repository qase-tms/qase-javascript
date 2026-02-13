# [Qase TestOps](https://qase.io) Playwright Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Qase Playwright Reporter enables seamless integration between your Playwright tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, Playwright config)
- **Unique to Playwright:** Multiple API patterns (wrapper function, method-based, annotations)

## Installation

```sh
npm install --save-dev playwright-qase-reporter
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

Playwright offers **two ways** to link tests with Qase test cases:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// Option 1: Wrapper function (similar to Jest)
test(qase(1, 'User can login with valid credentials'), async ({ page }) => {
  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example Domain');
});

// Option 2: Method-based (Playwright's unique approach)
test('User can login', async ({ page }) => {
  qase.id(1);
  qase.title('User can login with valid credentials');
  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example Domain');
});
```

**3. Configure Playwright reporter in `playwright.config.ts`:**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'YOUR_PROJECT_CODE',
        },
      },
    ],
  ],
});
```

**4. Run your tests:**

```sh
npx playwright test
```

## Configuration

The reporter is configured via (in order of priority):

1. **playwright.config.ts** (Playwright-specific, highest priority)
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
      "title": "Playwright Automated Run"
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

### Example `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'YOUR_PROJECT_CODE',
          uploadAttachments: true,
          run: {
            title: 'Automated Playwright Run',
            description: 'Nightly regression tests',
            complete: true,
          },
          batch: {
            size: 100,
          },
        },
        framework: {
          browser: {
            addAsParameter: true,
            parameterName: 'Browser',
          },
          markAsFlaky: true,
        },
      },
    ],
  ],
});
```

> **Full configuration reference:** See [qase-javascript-commons](../qase-javascript-commons/README.md) for all available options including logging, status mapping, execution plans, and more.

## Usage

### Link Tests with Test Cases

Playwright provides **multiple patterns** for linking tests. Choose the one that fits your style:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

// Pattern 1: Wrapper function with single ID
test(qase(1, 'Test name'), async ({ page }) => {
  expect(true).toBe(true);
});

// Pattern 2: Wrapper function with multiple IDs
test(qase([1, 2, 3], 'Test covering multiple cases'), async ({ page }) => {
  expect(true).toBe(true);
});

// Pattern 3: Method-based ID assignment
test('Test name', async ({ page }) => {
  qase.id(1);
  expect(true).toBe(true);
});
```

### Add Metadata

Enhance your tests with additional information:

```typescript
import { qase } from 'playwright-qase-reporter';

test('Login test', async ({ page }) => {
  qase.id(1);
  qase.title('User can successfully login');
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'e2e',
  });
  qase.suite('Authentication / Login');

  // Test logic
  await page.goto('https://example.com/login');
  expect(await page.title()).toBe('Login');
});
```

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs, but results are not sent):

```typescript
import { qase } from 'playwright-qase-reporter';

test('This test runs but is not reported to Qase', async ({ page }) => {
  qase.ignore();
  expect(true).toBe(true);
});
```

### Test Result Statuses

| Playwright Result | Qase Status |
|-------------------|-------------|
| passed            | passed      |
| failed            | failed      |
| timedOut          | failed      |
| skipped           | skipped     |
| interrupted       | skipped     |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

```bash
# Run all tests with Qase reporting
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests with specific tag
npx playwright test --grep "@smoke"

# Run tests in headed mode
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium

# Run with custom test run title
QASE_TESTOPS_RUN_TITLE="Nightly Regression" npx playwright test
```

## Requirements

- Node.js >= 14
- Playwright >= 1.20.0

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

Apache License 2.0. See [LICENSE](LICENSE) for details.
