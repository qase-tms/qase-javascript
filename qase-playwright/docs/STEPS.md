# Test Steps in Playwright

This guide covers how to define and report test steps for detailed execution tracking in Qase.

---

## Overview

Test steps provide granular visibility into test execution. Each step is reported separately, showing:

- Step name and description
- Step status (passed/failed)
- Step duration
- Attachments (if any)
- Error details (on failure)

---

## Defining Steps

In Playwright, steps are defined with the native `test.step()` API. The reporter listens to Playwright's step events and reports them to Qase automatically — no extra wrapper is required for ordinary steps.

`qase.step()` is a string helper that adds **expected result** and **data** markers to a step title; it does **not** execute a callback itself. See [Steps with Expected Result and Data](#steps-with-expected-result-and-data) below.

### Using test.step()

```typescript
import { test, expect } from '@playwright/test';

test('Test with multiple steps', async ({ page }) => {
  await test.step('Initialize the environment', async () => {
    await page.goto('https://example.com');
  });

  await test.step('Test Core Functionality of the app', async () => {
    await page.click('#action-button');
  });

  await test.step('Verify Expected Behavior of the app', async () => {
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Step Parameters

Steps can include parameters for dynamic naming:

```typescript
import { test, expect } from '@playwright/test';

test('Test with dynamic step names', async ({ page }) => {
  const username = 'john@example.com';

  await test.step(`Login as user ${username}`, async () => {
    await page.fill('#email', username);
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
  });

  await test.step(`Verify ${username} profile loaded`, async () => {
    await expect(page.locator('.user-email')).toHaveText(username);
  });
});
```

---

## Nested Steps

Create hierarchical step structures by nesting `test.step()` calls:

```typescript
import { test, expect } from '@playwright/test';

test('Test with nested steps', async ({ page }) => {
  await test.step('Complete user registration', async () => {
    await test.step('Fill registration form', async () => {
      await page.fill('#name', 'John Doe');
      await page.fill('#email', 'john@example.com');
    });

    await test.step('Submit registration', async () => {
      await page.click('button[type="submit"]');
    });
  });

  await test.step('Verify registration success', async () => {
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

## Steps with Expected Result and Data

When you need to attach an **expected result** or **input data** to a step, wrap the step name with `qase.step()`. It returns a formatted string with internal markers that the reporter parses and converts into structured fields in Qase.

**Signature:**
```typescript
qase.step(
  action: string,
  expectedResult: string | undefined,
  data: string | undefined,
): string
```

**Usage — pass the result of `qase.step()` as the step name to `test.step()`:**

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with expected results', async ({ page }) => {
  await test.step(
    qase.step('Click button', 'Button should be clicked', 'Button data'),
    async () => {
      await page.click('#submit-button');
    },
  );

  await test.step(
    qase.step('Fill form', 'Form should be filled', 'Form input data'),
    async () => {
      await page.fill('#input-field', 'test value');
    },
  );

  await test.step(
    qase.step('Submit form', 'Form should be submitted', undefined),
    async () => {
      await page.click('button[type="submit"]');
    },
  );
});
```

> All three positional arguments are required. Pass `undefined` for `expectedResult` or `data` when you don't need them.

---

## Steps with Attachments

Attach content to a specific step by calling `qase.attach()` from inside the step callback:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with step attachments', async ({ page }) => {
  await test.step('Capture application state', async () => {
    const screenshot = await page.screenshot();

    qase.attach({
      name: 'app-state.png',
      content: screenshot,
      contentType: 'image/png',
    });
  });

  await test.step('Verify state', async () => {
    await expect(page.locator('.status')).toHaveText('active');
  });
});
```

---

## Step Status

Steps automatically inherit status from execution:

| Execution | Step Status |
|-----------|-------------|
| Completes normally | Passed |
| Throws Error/AssertionError | Failed |
| Other exception | Invalid |

---

## Best Practices

### Keep Steps Atomic

Each step should represent a single action:

```typescript
// Good: One action per step
await test.step('Click login button', async () => {
  await page.click('#login-btn');
});

await test.step('Enter username', async () => {
  await page.fill('#username', 'user');
});

// Avoid: Multiple actions in one step
await test.step('Fill form and submit', async () => {  // Too broad
  await page.fill('#username', 'user');
  await page.fill('#password', 'pass');
  await page.click('#submit');
});
```

### Use Descriptive Names

```typescript
// Good: Clear action description
await test.step('Verify user is redirected to dashboard', async () => {
  await expect(page).toHaveURL(/.*dashboard/);
});

// Avoid: Vague names
await test.step('Check page', async () => {
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Include Context in Step Names

```typescript
// Good: Include relevant context
await test.step(`Add product '${productName}' to cart`, async () => {
  await page.click(`[data-product="${productName}"] .add-to-cart`);
});

// Better than generic:
await test.step('Add product', async () => {
  await page.click(`[data-product="${productName}"] .add-to-cart`);
});
```

---

## Common Patterns

### Page Object Steps

```typescript
import { test, expect, Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await test.step(`Enter username: ${username}`, async () => {
      await this.page.fill('#email', username);
    });

    await test.step('Enter password', async () => {
      await this.page.fill('#password', password);
    });

    await test.step('Click login button', async () => {
      await this.page.click('button[type="submit"]');
    });
  }
}

test('User can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('https://example.com/login');
  await loginPage.login('user@example.com', 'password');
});
```

### API Testing Steps

```typescript
import { test, expect } from '@playwright/test';

test('API returns correct user data', async ({ request }) => {
  let response;

  await test.step('Send GET request to /api/users/1', async () => {
    response = await request.get('https://api.example.com/users/1');
  });

  await test.step('Verify response status is 200', async () => {
    expect(response.status()).toBe(200);
  });

  await test.step('Verify response contains user data', async () => {
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.name).toBeDefined();
  });
});
```

### Setup/Teardown Steps

```typescript
import { test, expect } from '@playwright/test';

test.describe('User tests', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('Setup: Navigate to application', async () => {
      await page.goto('https://example.com');
    });

    await test.step('Setup: Authenticate user', async () => {
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'password');
      await page.click('button[type="submit"]');
    });
  });

  test.afterEach(async ({ page }) => {
    await test.step('Cleanup: Logout user', async () => {
      await page.click('#logout-button');
    });
  });

  test('Test user operations', async ({ page }) => {
    await test.step('Perform user action', async () => {
      await page.click('#user-action');
    });
  });
});
```

---

## Troubleshooting

### Steps Not Appearing

1. Check that steps are executed within a test context
2. Enable debug logging to trace step recording
3. **Ensure you're using `await` with `test.step()` callbacks** — missing `await` is the most common issue

```typescript
// Incorrect: Missing await
test.step('Step name', async () => {  // Step won't be recorded properly
  // Logic
});

// Correct: Using await
await test.step('Step name', async () => {
  // Logic
});
```

### Nested Steps Flattened

Ensure callbacks are nested, not chained sequentially:

```typescript
// Correct: Nested callbacks
await test.step('Parent step', async () => {
  await test.step('Child step', async () => {
    // Child step logic
  });
});

// Incorrect: Sequential, not nested
await test.step('Step 1', async () => {
  // Step 1 logic
});
await test.step('Step 2', async () => {  // Not nested under Step 1
  // Step 2 logic
});
```

### Step Duration Shows 0

Steps need measurable execution time. Very fast steps may show 0ms duration.

---

## See Also

- [Usage Guide](usage.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
