# [Qase TestOps](https://qase.io) Vitest Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![npm downloads](https://img.shields.io/npm/dm/vitest-qase-reporter.svg)](https://www.npmjs.com/package/vitest-qase-reporter)

Qase Vitest Reporter enables seamless integration between your Vitest tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, Vitest config)

## Installation

```sh
npm install --save-dev vitest-qase-reporter
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

```typescript
import { qase } from 'vitest-qase-reporter';
import { test, expect } from 'vitest';

test(qase(1, 'Test name'), () => {
  expect(true).toBe(true);
});
```

**3. Run your tests:**

```sh
npx vitest run
```

## Configuration

The reporter is configured via (in order of priority):

1. **vitest.config.ts** (Vitest-specific, highest priority)
2. **Environment variables** (`QASE_*`)
3. **Config file** (`qase.config.json`)

### Vitest Configuration

Add the reporter to your `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default',
      [
        'vitest-qase-reporter',
        {
          mode: 'testops',
          testops: {
            api: {
              token: 'api_token'
            },
            project: 'project_code',
          },
        },
      ],
    ],
  },
});
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
      "title": "Vitest Automated Run"
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
```typescript
import { qase } from 'vitest-qase-reporter';
import { test, expect } from 'vitest';

test(qase(1, 'Test name'), () => {
  expect(true).toBe(true);
});
```

**Multiple IDs:**
```typescript
test(qase([1, 2], 'Test covering multiple cases'), () => {
  expect(true).toBe(true);
});
```

### Add Metadata

Enhance your tests with additional information:

```typescript
import { qase } from 'vitest-qase-reporter';
import { test, expect } from 'vitest';

test('Test with metadata', async () => {
  qase.title('Custom test title');

  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
    description: 'Tests core authentication flow',
  });

  qase.suite('Authentication / Login');

  expect(true).toBe(true);
});
```

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs, but results are not sent):

```typescript
test('Test not reported to Qase', () => {
  qase.ignore();
  expect(true).toBe(true);
});
```

### Test Result Statuses

| Vitest Result | Qase Status |
|---------------|-------------|
| Passed | Passed |
| Failed | Failed |
| Skipped | Skipped |

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

**Basic test execution:**
```sh
npx vitest run
```

**With environment variables:**
```sh
QASE_MODE=testops npx vitest run
```

**With reporter enabled via config:**
```sh
npx vitest run --reporter=vitest-qase-reporter
```

**Watch mode (note: reporting happens on full run completion):**
```sh
npx vitest
```

> **Note:** Vitest is ESM-first and uses Jest-compatible API. If you're migrating from Jest, the Qase wrapper syntax is identical.

## Requirements

- Node.js >= 14
- Vitest >= 3.0.0

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
