# Qase Integration in Vitest

This guide provides comprehensive instructions for integrating Qase with Vitest.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

---

## Table of Contents

- [Adding QaseID](#adding-qaseid)
- [Adding Title](#adding-title)
- [Adding Fields](#adding-fields)
- [Adding Suite](#adding-suite)
- [Ignoring Tests](#ignoring-tests)
- [Muting Tests](#muting-tests)
- [Working with Attachments](#working-with-attachments)
- [Working with Steps](#working-with-steps)
- [Working with Parameters](#working-with-parameters)
- [Multi-Project Support](#multi-project-support)
- [Running Tests](#running-tests)
- [Complete Examples](#complete-examples)
- [Troubleshooting](#troubleshooting)
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)

---

## Adding QaseID

Link your automated tests to existing test cases in Qase by specifying the test case ID.

### Single ID

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(qase(1, 'Test name'), () => {
  expect(true).toBe(true);
});
```

### Multiple IDs

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(qase([1, 2, 3], 'Test covering multiple cases'), () => {
  expect(true).toBe(true);
});
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with custom title', () => {
  qase.title('User can successfully complete checkout');
  expect(true).toBe(true);
});
```

---

## Adding Fields

Add metadata to your test cases using fields. Both system and custom fields are supported.

### System Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| `description` | Test case description | Any text |
| `preconditions` | Test preconditions | Any text (supports Markdown) |
| `postconditions` | Test postconditions | Any text |
| `severity` | Test severity | `blocker`, `critical`, `major`, `normal`, `minor`, `trivial` |
| `priority` | Test priority | `high`, `medium`, `low` |
| `layer` | Test layer | `e2e`, `api`, `unit` |

### Example

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with fields', () => {
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
    description: 'Tests core authentication flow',
    preconditions: 'User database must be seeded with test data',
    postconditions: 'Test user is deleted after test completion',
  });

  expect(true).toBe(true);
});
```

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test in a suite', () => {
  qase.suite('Authentication');
  expect(true).toBe(true);
});
```

### Nested Suites

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test in nested suites', () => {
  qase.suite('Application\tAuthentication\tLogin\tEdge Cases');
  expect(true).toBe(true);
});
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test not reported to Qase', () => {
  qase.ignore();
  expect(true).toBe(true);
});
```

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Muted test', () => {
  qase.mute();
  expect(true).toBe(true);
});
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with file attachment', () => {
  qase.attach({ paths: './test-data/screenshot.png' });
  expect(true).toBe(true);
});
```

### Attach Multiple Files

```typescript
test('Test with multiple attachments', () => {
  qase.attach({
    paths: [
      './test-data/log.txt',
      './test-data/config.json',
      './test-data/screenshot.png',
    ],
  });
  expect(true).toBe(true);
});
```

### Attach Content from Code

```typescript
test('Test with inline content', () => {
  qase.attach({
    name: 'test-log.txt',
    content: 'Test execution log content',
    type: 'text/plain',
  });

  qase.attach({
    name: 'data.json',
    content: JSON.stringify({ test: 'data', status: 'passed' }),
    type: 'application/json',
  });

  expect(true).toBe(true);
});
```

### Attach to Specific Step

```typescript
test('Test with step-specific attachment', async () => {
  await qase.step('Capture screenshot', async () => {
    const screenshot = Buffer.from('image-data', 'base64');
    qase.attach({
      name: 'screenshot.png',
      content: screenshot,
      type: 'image/png',
    });
  });

  expect(true).toBe(true);
});
```

### Supported MIME Types

Common MIME types are auto-detected. You can also specify explicitly:

| Extension | MIME Type |
|-----------|-----------|
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.txt` | `text/plain` |
| `.json` | `application/json` |
| `.xml` | `application/xml` |
| `.html` | `text/html` |
| `.pdf` | `application/pdf` |

> For more details, see [Attachments Guide](ATTACHMENTS.md).

---

## Working with Steps

Define test steps for detailed reporting in Qase.

### Using Async Function

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with steps', async () => {
  await qase.step('Initialize the environment', async () => {
    // Setup code
  });

  await qase.step('Test Core Functionality', async () => {
    // Test logic
  });

  await qase.step('Verify Expected Behavior', async () => {
    // Assertions
  });
});
```

### Nested Steps

```typescript
test('Test with nested steps', async () => {
  await qase.step('Parent step', async () => {
    await qase.step('Child step 1', async () => {
      // Nested step logic
    });

    await qase.step('Child step 2', async () => {
      // Another nested step
    });
  });
});
```

### Steps with Expected Result

```typescript
test('Test with step metadata', async () => {
  await qase.step(
    'Click login button',
    async () => {
      // Click action
    },
    'Button should be clicked',  // Expected result
    'Button data'                 // Data
  );
});
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameterized Test

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

const browsers = ['Chrome', 'Firefox', 'Safari'];

describe('Browser compatibility tests', () => {
  test.each(browsers)('Test on %s', (browser) => {
    qase.title(`Test on ${browser}`);
    qase.parameters({ browser });
    expect(true).toBe(true);
  });
});
```

### Group Parameters

```typescript
const testData = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
];

describe('Login tests', () => {
  test.each(testData)('Login with $username', ({ username, password }) => {
    qase.title('User login test');
    qase.groupParameters({
      Username: username,
      Password: password,
    });
    expect(true).toBe(true);
  });
});
```

---

## Multi-Project Support

Send test results to multiple Qase projects simultaneously with different test case IDs for each project.

For detailed configuration, examples, and troubleshooting, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Running Tests

### Basic Execution

```sh
npx vitest run
```

### With Environment Variables

```sh
QASE_MODE=testops QASE_TESTOPS_PROJECT=DEMO npx vitest run
```

### With Test Plan

```sh
QASE_TESTOPS_PLAN_ID=123 npx vitest run
```

### With Existing Test Run

```sh
QASE_TESTOPS_RUN_ID=456 npx vitest run
```

---

## Complete Examples

### Full Test Example

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

describe('User Authentication', () => {
  test(qase(1, 'User can login with valid credentials'), async () => {
    qase.title('Successful user login');

    qase.fields({
      severity: 'critical',
      priority: 'high',
      layer: 'e2e',
      description: 'Verifies that a user can log in with valid credentials',
    });

    qase.suite('Authentication\tLogin');

    await qase.step('Navigate to login page', async () => {
      // Navigation logic
    });

    await qase.step('Enter credentials', async () => {
      // Form filling logic
    });

    await qase.step('Submit form', async () => {
      // Submit logic
    });

    await qase.step('Verify successful login', async () => {
      qase.attach({
        name: 'login-success.png',
        content: Buffer.from('screenshot-data'),
        type: 'image/png',
      });
      expect(true).toBe(true);
    });
  });
});
```

### Example Project Structure

```
my-project/
├── qase.config.json
├── vitest.config.ts
├── tests/
│   ├── auth.test.ts
│   └── ...
└── package.json
```

---

## Troubleshooting

### Tests Not Appearing in Qase

1. Verify `mode` is set to `testops` (not `off` or `report`)
2. Check API token has write permissions
3. Verify project code is correct
4. Check for errors in console output (enable `debug: true`)

### ESM Module Resolution Errors

**Problem:** `Cannot find module 'vitest-qase-reporter/vitest'`

**Solution:**
1. Verify package is installed: `npm list vitest-qase-reporter`
2. Check `package.json` has `"type": "module"` for ESM projects
3. Use correct import syntax: `import { qase } from 'vitest-qase-reporter/vitest'`

### vitest.config.ts vs vite.config.ts

**Problem:** Reporter not loaded when using `vite.config.ts`

**Solution:** Always use `vitest.config.ts` for Vitest-specific configuration. While Vitest can use `vite.config.ts`, test reporters should be configured in `vitest.config.ts`:

```typescript
// vitest.config.ts (preferred)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'vitest-qase-reporter/vitest'],
  },
});
```

### Watch Mode vs Run Mode Reporting

**Problem:** Results not reported in watch mode

**Solution:** Qase reporter sends results after full test suite completion. In watch mode (`npx vitest`), results are sent only when you exit or trigger a full re-run. Use `npx vitest run` for CI/CD reporting.

### Attachments Not Uploading

**Problem:** Attachments missing in Qase

**Solution:**
1. Verify file path exists and is readable
2. Enable `uploadAttachments: true` in config
3. Check file size (large files may take time)
4. Enable debug logging to see upload status

### Results Going to Wrong Test Cases

**Problem:** Test results mapped to incorrect test case IDs

**Solution:**
1. Verify QaseID matches the test case ID in Qase
2. Check for duplicate IDs in your test suite
3. Verify you're using the correct project code

### TypeScript Import Errors

**Problem:** `Module '"vitest-qase-reporter"' has no exported member 'qase'`

**Solution:**
1. Ensure TypeScript version compatibility (>= 4.5)
2. Check `tsconfig.json` has `"moduleResolution": "node"` or `"bundler"`
3. Try restarting TypeScript server in your IDE

---

## Integration Patterns

### Vitest Workspace Support

For monorepo setups with Vitest workspaces:

```typescript
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: ['src/**/*.test.ts'],
      reporters: ['default', 'vitest-qase-reporter/vitest'],
    },
  },
  {
    test: {
      name: 'integration',
      include: ['tests/**/*.test.ts'],
      reporters: ['default', 'vitest-qase-reporter/vitest'],
    },
  },
]);
```

### In-Source Testing with Qase

Vitest supports in-source testing. You can use Qase with this pattern:

```typescript
// src/math.ts
export function add(a: number, b: number) {
  return a + b;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  const { qase } = await import('vitest-qase-reporter/vitest');

  test(qase(1, 'Addition works'), () => {
    expect(add(1, 2)).toBe(3);
  });
}
```

### Concurrent Tests with Qase

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

describe.concurrent('Parallel test suite', () => {
  test(qase(1, 'Test 1'), async () => {
    await qase.step('Step 1', async () => {
      expect(true).toBe(true);
    });
  });

  test(qase(2, 'Test 2'), async () => {
    await qase.step('Step 2', async () => {
      expect(true).toBe(true);
    });
  });
});
```

### Snapshot Testing with Qase

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(qase(1, 'Component snapshot'), () => {
  qase.fields({
    layer: 'unit',
    description: 'Verifies component renders correctly',
  });

  const component = { name: 'Button', props: { label: 'Click me' } };
  expect(component).toMatchSnapshot();
});
```

### Using vi.mock with Qase Reporting

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect, vi } from 'vitest';

vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Test User' })),
}));

test(qase(1, 'Test with mocked API'), async () => {
  qase.fields({
    layer: 'unit',
    description: 'Tests component with mocked API calls',
  });

  const { fetchUser } = await import('./api');
  const user = await fetchUser();
  expect(user.name).toBe('Test User');
});
```

---

## Common Use Cases

### Use Case 1: Report with Workspace Projects

```typescript
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'backend',
      include: ['packages/backend/**/*.test.ts'],
      reporters: [
        'default',
        [
          'vitest-qase-reporter/vitest',
          {
            testops: { project: 'BACKEND' },
          },
        ],
      ],
    },
  },
  {
    test: {
      name: 'frontend',
      include: ['packages/frontend/**/*.test.ts'],
      reporters: [
        'default',
        [
          'vitest-qase-reporter/vitest',
          {
            testops: { project: 'FRONTEND' },
          },
        ],
      ],
    },
  },
]);
```

### Use Case 2: Run in CI with Coverage

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx vitest run --coverage
        env:
          QASE_MODE: testops
          QASE_TESTOPS_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
          QASE_TESTOPS_PROJECT: DEMO
```

### Use Case 3: Use Concurrent Tests for Performance

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

describe.concurrent('API performance tests', () => {
  const endpoints = ['/users', '/posts', '/comments'];

  endpoints.forEach((endpoint, index) => {
    test(qase(index + 1, `Test ${endpoint} endpoint`), async () => {
      qase.parameters({ endpoint });
      qase.fields({ layer: 'api', priority: 'high' });

      await qase.step(`Call ${endpoint}`, async () => {
        // API call logic
        expect(true).toBe(true);
      });
    });
  });
});
```

### Use Case 4: Migrate from Jest Reporter

Vitest uses Jest-compatible API, so migration is straightforward:

**Before (Jest):**
```typescript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Test name'), () => {
  expect(true).toBe(true);
});
```

**After (Vitest):**
```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(qase(1, 'Test name'), () => {
  expect(true).toBe(true);
});
```

### Use Case 5: Dynamic Test Generation with Parameters

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

const testMatrix = [
  { browser: 'Chrome', os: 'Windows', viewport: '1920x1080' },
  { browser: 'Firefox', os: 'macOS', viewport: '1920x1080' },
  { browser: 'Safari', os: 'macOS', viewport: '1440x900' },
];

describe('Cross-browser compatibility', () => {
  testMatrix.forEach(({ browser, os, viewport }, index) => {
    test(qase(index + 1, `Test on ${browser}`), () => {
      qase.title(`Compatibility test: ${browser} on ${os}`);
      qase.groupParameters({ Browser: browser, OS: os, Viewport: viewport });
      qase.fields({
        severity: 'normal',
        priority: 'medium',
        layer: 'e2e',
      });

      expect(true).toBe(true);
    });
  });
});
```

### Use Case 6: Test with Rich Metadata and Attachments

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(qase(1, 'E2E checkout flow'), async () => {
  qase.title('User completes checkout successfully');

  qase.fields({
    severity: 'blocker',
    priority: 'high',
    layer: 'e2e',
    description: 'Tests the complete checkout flow from cart to confirmation',
    preconditions: '- User logged in\n- Cart has items\n- Payment method configured',
    postconditions: 'Order created in database',
  });

  qase.suite('E2E\tCheckout\tHappy Path');

  await qase.step('Add items to cart', async () => {
    qase.attach({
      name: 'cart-items.json',
      content: JSON.stringify({ items: ['item1', 'item2'] }),
      type: 'application/json',
    });
  });

  await qase.step('Proceed to checkout', async () => {
    // Checkout logic
  });

  await qase.step('Complete payment', async () => {
    qase.attach({
      name: 'payment-confirmation.png',
      content: Buffer.from('screenshot-data'),
      type: 'image/png',
    });
  });

  expect(true).toBe(true);
});
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
