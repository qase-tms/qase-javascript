# Qase Integration in Playwright

This guide provides comprehensive instructions for integrating Qase with Playwright.

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
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)
- [Complete Examples](#complete-examples)

---

## Adding QaseID

Playwright offers **three flexible patterns** for linking automated tests to existing test cases in Qase.

### Pattern 1: Wrapper Function (Single ID)

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'User can login'), async ({ page }) => {
  await page.goto('https://example.com/login');
  expect(await page.title()).toBe('Login');
});
```

### Pattern 2: Wrapper Function (Multiple IDs)

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase([1, 2, 3], 'Test covering multiple scenarios'), async ({ page }) => {
  // This test result will be reported to test cases 1, 2, and 3
  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example Domain');
});
```

### Pattern 3: Method-based ID Assignment

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('User can login', async ({ page }) => {
  qase.id(1);
  await page.goto('https://example.com/login');
  expect(await page.title()).toBe('Login');
});
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Login test', async ({ page }) => {
  qase.title('User can successfully login with valid credentials');
  await page.goto('https://example.com/login');
  expect(await page.title()).toBe('Login');
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
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'Login test'), async ({ page }) => {
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'e2e',
    description: 'Verify user authentication flow',
    preconditions: 'User must be registered in the system',
    postconditions: 'User session is created',
  });

  // Test logic
  await page.goto('https://example.com/login');
  expect(await page.title()).toBe('Login');
});
```

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Login test', async ({ page }) => {
  qase.suite('Authentication');
  await page.goto('https://example.com/login');
});
```

### Nested Suites

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Login test', async ({ page }) => {
  qase.suite('Authentication\tLogin\tPositive Cases');
  await page.goto('https://example.com/login');
});
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('This test runs but is not reported', async ({ page }) => {
  qase.ignore();
  expect(true).toBe(true);
});
```

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'Known failing test'), async ({ page }) => {
  qase.mute();
  expect(false).toBe(true); // This failure won't affect the run status
});
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with file attachment', async ({ page }) => {
  // Single file
  qase.attach({ paths: '/path/to/screenshot.png' });

  // Multiple files
  qase.attach({
    paths: ['/path/to/log.txt', '/path/to/screenshot.png']
  });

  await page.goto('https://example.com');
});
```

### Attach Content from Code

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with content attachment', async ({ page }) => {
  qase.attach({
    name: 'execution-log.txt',
    content: 'Test execution details...',
    contentType: 'text/plain',
  });

  await page.goto('https://example.com');
});
```

### Attach Playwright Screenshot

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with screenshot', async ({ page }) => {
  await page.goto('https://example.com');

  const screenshot = await page.screenshot();
  qase.attach({
    name: 'page-screenshot.png',
    content: screenshot,
    contentType: 'image/png',
  });
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

Define test steps for detailed reporting in Qase. Playwright supports **both** native `test.step()` and `qase.step()`.

### Using qase.step (Async)

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with qase.step', async ({ page }) => {
  await qase.step('Navigate to login page', async () => {
    await page.goto('https://example.com/login');
  });

  await qase.step('Fill login form', async () => {
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password123');
  });

  await qase.step('Submit form', async () => {
    await page.click('button[type="submit"]');
  });

  await qase.step('Verify successful login', async () => {
    await expect(page.locator('.dashboard')).toBeVisible();
  });
});
```

### Using Native test.step

```typescript
import { test, expect } from '@playwright/test';

test('Test with native test.step', async ({ page }) => {
  await test.step('Navigate to page', async () => {
    await page.goto('https://example.com');
  });

  await test.step('Verify title', async () => {
    await expect(page).toHaveTitle('Example Domain');
  });
});
```

### Nested Steps

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with nested steps', async ({ page }) => {
  await qase.step('Authentication flow', async () => {
    await qase.step('Open login page', async () => {
      await page.goto('https://example.com/login');
    });

    await qase.step('Enter credentials', async () => {
      await page.fill('#email', 'user@example.com');
      await page.fill('#password', 'password123');
    });

    await qase.step('Click login button', async () => {
      await page.click('button[type="submit"]');
    });
  });
});
```

### Steps with Expected Result

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with expected results', async ({ page }) => {
  await qase.step(
    'Click login button',
    async () => {
      await page.click('button[type="submit"]');
    },
    'Button should be clicked',
    'Login button data'
  );
});
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameterized Test

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

const browsers = ['chromium', 'firefox', 'webkit'];

for (const browser of browsers) {
  test(`Test on ${browser}`, async ({ page }) => {
    qase.title('Browser compatibility test');
    qase.parameters({ Browser: browser });

    // Test logic
    await page.goto('https://example.com');
  });
}
```

### Group Parameters

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

const testData = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
];

for (const data of testData) {
  test(`Login with ${data.username}`, async ({ page }) => {
    qase.title('User login test');
    qase.groupParameters({
      Username: data.username,
      Password: data.password,
    });

    // Test logic
    await page.goto('https://example.com/login');
  });
}
```

### Using Playwright Projects as Parameters

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Cross-browser test', async ({ page, browserName }) => {
  qase.title('Browser compatibility test');
  qase.parameters({ Browser: browserName });

  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example Domain');
});
```

---

## Multi-Project Support

Send test results to multiple Qase projects simultaneously with different test case IDs for each project.

For detailed configuration, examples, and troubleshooting, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Running Tests

### Basic Execution

```bash
# Run all tests
npx playwright test

# Run with Qase reporting enabled (if mode not in config)
QASE_MODE=testops npx playwright test
```

### With Environment Variables

```bash
# Set project and token via environment
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
npx playwright test
```

### With Test Plan

```bash
# Execute tests from a specific test plan
QASE_MODE=testops \
QASE_TESTOPS_PLAN_ID=123 \
npx playwright test
```

### With Existing Test Run

```bash
# Report results to an existing test run
QASE_MODE=testops \
QASE_TESTOPS_RUN_ID=456 \
npx playwright test
```

### Run Specific Tests

```bash
# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests with specific tag
npx playwright test --grep "@smoke"

# Run specific project (browser)
npx playwright test --project=chromium
```

---

## Integration Patterns

### Playwright Test Fixtures

```typescript
import { test as base, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

type MyFixtures = {
  authenticatedPage: Page;
};

const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await qase.step('Setup authenticated page', async () => {
      await page.goto('https://example.com/login');
      await page.fill('#email', 'user@example.com');
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');
    });

    await use(page);

    await qase.step('Cleanup authenticated page', async () => {
      await page.click('#logout');
    });
  },
});

test(qase(1, 'Test with authenticated page'), async ({ authenticatedPage }) => {
  await authenticatedPage.goto('https://example.com/dashboard');
  await expect(authenticatedPage.locator('.dashboard')).toBeVisible();
});
```

### Page Object Pattern with Qase

```typescript
import { test, expect, Page } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await qase.step('Navigate to login page', async () => {
      await this.page.goto('https://example.com/login');
    });
  }

  async login(email: string, password: string) {
    await qase.step('Enter credentials', async () => {
      await this.page.fill('#email', email);
      await this.page.fill('#password', password);
    });

    await qase.step('Click login button', async () => {
      await this.page.click('button[type="submit"]');
    });
  }
}

test(qase(1, 'User can login'), async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('user@example.com', 'password123');

  await expect(page.locator('.dashboard')).toBeVisible();
});
```

### Parallel Test Execution

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.describe.configure({ mode: 'parallel' });

test.describe('Parallel tests', () => {
  test(qase(1, 'Test 1'), async ({ page }) => {
    await page.goto('https://example.com');
  });

  test(qase(2, 'Test 2'), async ({ page }) => {
    await page.goto('https://example.com/about');
  });

  test(qase(3, 'Test 3'), async ({ page }) => {
    await page.goto('https://example.com/contact');
  });
});
```

### Project-Based Test Organization

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'DEMO',
        },
        framework: {
          browser: {
            addAsParameter: true,
            parameterName: 'Browser',
          },
        },
      },
    ],
  ],
});
```

### Using test.describe for Suites

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.describe('Authentication', () => {
  test(qase(1, 'User registration'), async ({ page }) => {
    qase.suite('Authentication\tRegistration');
    await page.goto('https://example.com/register');
  });

  test(qase(2, 'User login'), async ({ page }) => {
    qase.suite('Authentication\tLogin');
    await page.goto('https://example.com/login');
  });

  test(qase(3, 'Password reset'), async ({ page }) => {
    qase.suite('Authentication\tPassword Reset');
    await page.goto('https://example.com/reset');
  });
});
```

---

## Common Use Cases

### Attach Screenshot on Failure

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'Test with failure screenshot'), async ({ page }) => {
  try {
    await page.goto('https://example.com');
    await expect(page.locator('.non-existent')).toBeVisible();
  } catch (error) {
    const screenshot = await page.screenshot();
    qase.attach({
      name: 'failure-screenshot.png',
      content: screenshot,
      contentType: 'image/png',
    });
    throw error;
  }
});
```

### Report Visual Comparison Results

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'Visual regression test'), async ({ page }) => {
  await page.goto('https://example.com');

  const screenshot = await page.screenshot();
  qase.attach({
    name: 'actual-screenshot.png',
    content: screenshot,
    contentType: 'image/png',
  });

  await expect(page).toHaveScreenshot('homepage.png');
});
```

### Use with Multiple Browsers

```typescript
import { test, devices } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

for (const browserType of ['chromium', 'firefox', 'webkit']) {
  test(`Test on ${browserType}`, async ({ playwright }) => {
    qase.title('Cross-browser compatibility test');
    qase.parameters({ Browser: browserType });

    const browser = await playwright[browserType].launch();
    const page = await browser.newPage();

    await page.goto('https://example.com');
    await page.close();
    await browser.close();
  });
}
```

### Group by test.describe as Qase Suite

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.describe('User Management', () => {
  test.describe('Registration', () => {
    test(qase(1, 'User can register'), async ({ page }) => {
      qase.suite('User Management\tRegistration');
      await page.goto('https://example.com/register');
    });
  });

  test.describe('Authentication', () => {
    test(qase(2, 'User can login'), async ({ page }) => {
      qase.suite('User Management\tAuthentication');
      await page.goto('https://example.com/login');
    });
  });
});
```

### Report API Test Results

```typescript
import { test, expect, request } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase(201, 'GET /users returns 200'), async () => {
  qase.suite('API Tests');
  qase.fields({ layer: 'api' });

  await qase.step('Send GET request', async () => {
    const context = await request.newContext();
    const response = await context.get('https://api.example.com/users');

    qase.attach({
      name: 'response.json',
      content: JSON.stringify(await response.json(), null, 2),
      contentType: 'application/json',
    });

    expect(response.status()).toBe(200);
  });
});
```

---

## Troubleshooting

### Tests Not Appearing in Qase

**Problem:** Tests run successfully but results are not visible in Qase.

**Solutions:**

1. Verify `mode` is set to `testops` in playwright.config.ts:
   ```typescript
   reporter: [
     [
       'playwright-qase-reporter',
       { mode: 'testops', testops: { ... } }
     ],
   ]
   ```

2. Check API token has write permissions:
   - Go to https://app.qase.io/apps
   - Regenerate token if needed

3. Verify project code is correct:
   ```typescript
   testops: {
     project: 'DEMO', // Check this matches your project
   }
   ```

4. Enable debug logging:
   ```typescript
   {
     debug: true,
     testops: { ... }
   }
   ```

### Reporter Not Found Error

**Problem:** `Cannot find module 'playwright-qase-reporter'`

**Solutions:**

1. Install the package:
   ```bash
   npm install --save-dev playwright-qase-reporter
   ```

2. Verify playwright.config.ts reporter configuration:
   ```typescript
   reporter: [
     ['playwright-qase-reporter', { /* config */ }],
   ]
   ```

### Qase Object Not Available in Tests

**Problem:** `qase is not defined` or `Cannot read property 'id' of undefined`

**Solutions:**

1. Import qase at the top of your test file:
   ```typescript
   import { qase } from 'playwright-qase-reporter';
   ```

2. Ensure correct import path:
   ```typescript
   // Correct
   import { qase } from 'playwright-qase-reporter';

   // Incorrect
   import { qase } from 'playwright-qase-reporter/dist/playwright';
   ```

### Parallel Execution Issues

**Problem:** Test results not grouped correctly when running in parallel.

**Solutions:**

1. Qase reporter handles parallel execution automatically.

2. If issues persist, check that each test has unique ID or title:
   ```typescript
   test(qase(1, 'Unique test name'), async ({ page }) => {});
   ```

3. Ensure you're using the latest version of the reporter.

### Screenshots Not Attaching

**Problem:** Screenshots are not visible in Qase test results.

**Solutions:**

1. Verify `uploadAttachments` is enabled:
   ```typescript
   testops: {
     uploadAttachments: true,
   }
   ```

2. Check screenshot buffer is valid:
   ```typescript
   const screenshot = await page.screenshot();
   console.log('Screenshot size:', screenshot.length);
   qase.attach({
     name: 'screenshot.png',
     content: screenshot,
     contentType: 'image/png',
   });
   ```

3. Enable debug logging to see upload status.

### Browser Parameter Not Appearing

**Problem:** Browser name not showing as parameter in Qase.

**Solutions:**

1. Enable browser parameter in config:
   ```typescript
   framework: {
     browser: {
       addAsParameter: true,
       parameterName: 'Browser',
     },
   }
   ```

2. Verify you're using Playwright projects with different browsers.

---

## Complete Examples

### Full Test Example

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test(qase([1, 2], 'Comprehensive test with all features'), async ({ page, browserName }) => {
  // Set metadata
  qase.title('User can complete full registration flow');
  qase.suite('Registration\tEnd-to-End');
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'e2e',
    description: 'Tests complete user registration flow from start to finish',
    preconditions: 'Application is running and database is accessible',
  });
  qase.parameters({
    Browser: browserName,
    Environment: 'staging',
  });

  // Execute test with steps
  await qase.step('Navigate to registration page', async () => {
    await page.goto('https://example.com/register');

    const screenshot = await page.screenshot();
    qase.attach({
      name: 'registration-page.png',
      content: screenshot,
      contentType: 'image/png',
    });
  });

  await qase.step('Fill registration form', async () => {
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
  });

  await qase.step('Submit form', async () => {
    await page.click('button[type="submit"]');
  });

  await qase.step('Verify registration success', async () => {
    await expect(page.locator('.success-message')).toBeVisible();

    const finalScreenshot = await page.screenshot();
    qase.attach({
      name: 'success-page.png',
      content: finalScreenshot,
      contentType: 'image/png',
    });
  });

  // Add final comment
  qase.comment('Test completed successfully with all validations passing');
});
```

### Example Project Structure

```
my-project/
├── qase.config.json
├── playwright.config.ts
├── tests/
│   ├── auth.spec.ts
│   ├── api.spec.ts
│   └── e2e.spec.ts
├── pages/
│   ├── login.page.ts
│   └── dashboard.page.ts
└── package.json
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
