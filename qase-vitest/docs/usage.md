# Qase Integration in Vitest

This guide provides comprehensive instructions for integrating Qase with Vitest.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

All helpers are imported from `vitest-qase-reporter/vitest`:

- `addQaseId(name, ids)` — links a test to Qase test case IDs via the test name
- `addQaseProjects(name, mapping)` — links a test to test cases in several projects (`testops_multi` mode)
- `withQase(fn)` — wraps the test function and passes a `qase` object to it. All `qase` methods (`title`, `comment`, `suite`, `fields`, `parameters`, `groupParameters`, `tags`, `mute`, `step`, `attach`) are async and must be awaited

---

## Table of Contents

- [Adding QaseID](#adding-qaseid)
- [Adding Title](#adding-title)
- [Adding Fields](#adding-fields)
- [Adding Suite](#adding-suite)
- [Tags](#tags)
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

- [See Also](#see-also)
---

## Adding QaseID

Link your automated tests to existing test cases in Qase by specifying the test case ID.

### Single ID

```typescript
import { addQaseId } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(addQaseId('Test name', [1]), () => {
  expect(true).toBe(true);
});
```

### Multiple IDs

```typescript
import { addQaseId } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(addQaseId('Test covering multiple cases', [1, 2, 3]), () => {
  expect(true).toBe(true);
});
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with custom title', withQase(async ({ qase }) => {
  await qase.title('User can successfully complete checkout');
  expect(true).toBe(true);
}));
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
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with fields', withQase(async ({ qase }) => {
  await qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
    description: 'Tests core authentication flow',
    preconditions: 'User database must be seeded with test data',
    postconditions: 'Test user is deleted after test completion',
  });

  expect(true).toBe(true);
}));
```

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test in a suite', withQase(async ({ qase }) => {
  await qase.suite('Authentication');
  expect(true).toBe(true);
}));
```

### Nested Suites

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test in nested suites', withQase(async ({ qase }) => {
  await qase.suite('Application\tAuthentication\tLogin\tEdge Cases');
  expect(true).toBe(true);
}));
```

---

## Tags

Assign tags to test cases. Tags help categorize and filter tests in Qase.

```typescript
test('Login test', withQase(async ({ qase }) => {
  await qase.tags('smoke', 'regression');
  expect(true).toBe(true);
}));
```

Multiple `qase.tags()` calls accumulate:

```typescript
test('test', withQase(async ({ qase }) => {
  await qase.tags('smoke');
  await qase.tags('regression', 'e2e');
  // Result: tags = ['smoke', 'regression', 'e2e']
}));
```

Alternative using fields:

```typescript
// Inside a withQase(async ({ qase }) => { ... }) callback
await qase.fields({ tags: 'smoke,regression' });
```

---

## Ignoring Tests

The Vitest reporter has no `ignore()` method: every test that runs is reported to Qase. To keep a test out of a run, skip it with Vitest (`test.skip`) — it is then reported with the `skipped` status — or exclude its file from the Vitest run (`include`/`exclude` in `vitest.config.ts`).

---

## Muting Tests

Mark a test as muted. The test is still reported, and its result is sent to Qase as muted, the same as setting the `muted` field to `'true'`. The test case itself is not muted:

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Muted test', withQase(async ({ qase }) => {
  await qase.mute();
  expect(true).toBe(true);
}));
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with file attachment', withQase(async ({ qase }) => {
  await qase.attach({ paths: ['./test-data/screenshot.png'] });
  expect(true).toBe(true);
}));
```

### Attach Multiple Files

```typescript
test('Test with multiple attachments', withQase(async ({ qase }) => {
  await qase.attach({
    paths: [
      './test-data/log.txt',
      './test-data/config.json',
      './test-data/screenshot.png',
    ],
  });
  expect(true).toBe(true);
}));
```

### Attach Content from Code

`content` must be a string. To attach binary data such as screenshots, save it to a file and pass the file in `paths`.

```typescript
test('Test with inline content', withQase(async ({ qase }) => {
  await qase.attach({
    name: 'test-log.txt',
    content: 'Test execution log content',
    type: 'text/plain',
  });

  await qase.attach({
    name: 'data.json',
    content: JSON.stringify({ test: 'data', status: 'passed' }),
    type: 'application/json',
  });

  expect(true).toBe(true);
}));
```

### Attach Inside a Step

The Vitest reporter does not link attachments to individual steps: an attachment added inside `qase.step()` is added to the test result.

```typescript
test('Test with attachment inside a step', withQase(async ({ qase }) => {
  await qase.step('Capture screenshot', async () => {
    await qase.attach({ paths: ['./test-data/screenshot.png'] });
  });

  expect(true).toBe(true);
}));
```

### Supported MIME Types

For `paths`, the MIME type is auto-detected from the file extension. For `content`, pass `type` explicitly (defaults to `application/octet-stream`):

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
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with steps', withQase(async ({ qase }) => {
  await qase.step('Initialize the environment', async () => {
    // Setup code
  });

  await qase.step('Test Core Functionality', async () => {
    // Test logic
  });

  await qase.step('Verify Expected Behavior', async () => {
    // Assertions
  });
}));
```

### Nested Steps

```typescript
test('Test with nested steps', withQase(async ({ qase }) => {
  await qase.step('Parent step', async () => {
    await qase.step('Child step 1', async () => {
      // Nested step logic
    });

    await qase.step('Child step 2', async () => {
      // Another nested step
    });
  });
}));
```

### Steps with Expected Result

```typescript
test('Test with step metadata', withQase(async ({ qase }) => {
  await qase.step(
    'Click login button',
    async () => {
      // Click action
    },
    'Button should be clicked',  // Expected result
    'Button data'                 // Data
  );
}));
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase. Parameter values must be strings.

### Basic Parameterized Test

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

const browsers = ['Chrome', 'Firefox', 'Safari'];

describe('Browser compatibility tests', () => {
  browsers.forEach((browser) => {
    test(`Test on ${browser}`, withQase(async ({ qase }) => {
      await qase.title(`Test on ${browser}`);
      await qase.parameters({ browser });
      expect(true).toBe(true);
    }));
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
  testData.forEach(({ username, password }) => {
    test(`Login with ${username}`, withQase(async ({ qase }) => {
      await qase.title('User login test');
      await qase.groupParameters({
        Username: username,
        Password: password,
      });
      expect(true).toBe(true);
    }));
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
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

describe('User Authentication', () => {
  test(addQaseId('User can login with valid credentials', [1]), withQase(async ({ qase }) => {
    await qase.title('Successful user login');

    await qase.fields({
      severity: 'critical',
      priority: 'high',
      layer: 'e2e',
      description: 'Verifies that a user can log in with valid credentials',
    });

    await qase.suite('Authentication\tLogin');

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
      await qase.attach({ paths: ['./screenshots/login-success.png'] });
      expect(true).toBe(true);
    });
  }));
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

1. Verify `mode` is set to `TestOps` (not `off` or `report`)
2. Check API token has write permissions
3. Verify project code is correct
4. Check for errors in console output (enable `debug: true`)

### ESM Module Resolution Errors

**Problem:** `Cannot find module 'vitest-qase-reporter/vitest'`

**Solution:**
1. Verify package is installed: `npm list vitest-qase-reporter`
2. Check `package.json` has `"type": "module"` for ESM projects
3. Use correct import syntax: `import { addQaseId, withQase } from 'vitest-qase-reporter/vitest'`

### vitest.config.ts vs vite.config.ts

**Problem:** Reporter not loaded when using `vite.config.ts`

**Solution:** Always use `vitest.config.ts` for Vitest-specific configuration. While Vitest can use `vite.config.ts`, test reporters should be configured in `vitest.config.ts`:

```typescript
// vitest.config.ts (preferred)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', 'vitest-qase-reporter'],
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

**Problem:** `Module '"vitest-qase-reporter/vitest"' has no exported member 'qase'`

**Solution:** There is no `qase` export. Import `addQaseId`, `addQaseProjects` and `withQase` from `vitest-qase-reporter/vitest`; the `qase` object is passed to the callback of `withQase`. If the helpers themselves are not found:
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
      reporters: ['default', 'vitest-qase-reporter'],
    },
  },
  {
    test: {
      name: 'integration',
      include: ['tests/**/*.test.ts'],
      reporters: ['default', 'vitest-qase-reporter'],
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
  const { addQaseId } = await import('vitest-qase-reporter/vitest');

  test(addQaseId('Addition works', [1]), () => {
    expect(add(1, 2)).toBe(3);
  });
}
```

### Concurrent Tests with Qase

```typescript
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

describe.concurrent('Parallel test suite', () => {
  test(addQaseId('Test 1', [1]), withQase(async ({ qase }) => {
    await qase.step('Step 1', async () => {
      expect(true).toBe(true);
    });
  }));

  test(addQaseId('Test 2', [2]), withQase(async ({ qase }) => {
    await qase.step('Step 2', async () => {
      expect(true).toBe(true);
    });
  }));
});
```

### Snapshot Testing with Qase

```typescript
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(addQaseId('Component snapshot', [1]), withQase(async ({ qase }) => {
  await qase.fields({
    layer: 'unit',
    description: 'Verifies component renders correctly',
  });

  const component = { name: 'Button', props: { label: 'Click me' } };
  expect(component).toMatchSnapshot();
}));
```

### Using vi.mock with Qase Reporting

```typescript
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect, vi } from 'vitest';

vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Test User' })),
}));

test(addQaseId('Test with mocked API', [1]), withQase(async ({ qase }) => {
  await qase.fields({
    layer: 'unit',
    description: 'Tests component with mocked API calls',
  });

  const { fetchUser } = await import('./api');
  const user = await fetchUser();
  expect(user.name).toBe('Test User');
}));
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
          'vitest-qase-reporter',
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
          'vitest-qase-reporter',
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
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

describe.concurrent('API performance tests', () => {
  const endpoints = ['/users', '/posts', '/comments'];

  endpoints.forEach((endpoint, index) => {
    test(addQaseId(`Test ${endpoint} endpoint`, [index + 1]), withQase(async ({ qase }) => {
      await qase.parameters({ endpoint });
      await qase.fields({ layer: 'api', priority: 'high' });

      await qase.step(`Call ${endpoint}`, async () => {
        // API call logic
        expect(true).toBe(true);
      });
    }));
  });
});
```

### Use Case 4: Migrate from Jest Reporter

Vitest uses a Jest-compatible test API, but the Qase helpers differ: IDs are added with `addQaseId()` and metadata methods are called on the `qase` object passed by `withQase()`.

**Before (Jest):**
```typescript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Test name'), () => {
  expect(true).toBe(true);
});
```

**After (Vitest):**
```typescript
import { addQaseId } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(addQaseId('Test name', [1]), () => {
  expect(true).toBe(true);
});
```

### Use Case 5: Dynamic Test Generation with Parameters

```typescript
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect, describe } from 'vitest';

const testMatrix = [
  { browser: 'Chrome', os: 'Windows', viewport: '1920x1080' },
  { browser: 'Firefox', os: 'macOS', viewport: '1920x1080' },
  { browser: 'Safari', os: 'macOS', viewport: '1440x900' },
];

describe('Cross-browser compatibility', () => {
  testMatrix.forEach(({ browser, os, viewport }, index) => {
    test(addQaseId(`Test on ${browser}`, [index + 1]), withQase(async ({ qase }) => {
      await qase.title(`Compatibility test: ${browser} on ${os}`);
      await qase.groupParameters({ Browser: browser, OS: os, Viewport: viewport });
      await qase.fields({
        severity: 'normal',
        priority: 'medium',
        layer: 'e2e',
      });

      expect(true).toBe(true);
    }));
  });
});
```

### Use Case 6: Test with Rich Metadata and Attachments

```typescript
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test(addQaseId('E2E checkout flow', [1]), withQase(async ({ qase }) => {
  await qase.title('User completes checkout successfully');

  await qase.fields({
    severity: 'blocker',
    priority: 'high',
    layer: 'e2e',
    description: 'Tests the complete checkout flow from cart to confirmation',
    preconditions: '- User logged in\n- Cart has items\n- Payment method configured',
    postconditions: 'Order created in database',
  });

  await qase.suite('E2E\tCheckout\tHappy Path');

  await qase.step('Add items to cart', async () => {
    await qase.attach({
      name: 'cart-items.json',
      content: JSON.stringify({ items: ['item1', 'item2'] }),
      type: 'application/json',
    });
  });

  await qase.step('Proceed to checkout', async () => {
    // Checkout logic
  });

  await qase.step('Complete payment', async () => {
    await qase.attach({ paths: ['./screenshots/payment-confirmation.png'] });
  });

  expect(true).toBe(true);
}));
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
