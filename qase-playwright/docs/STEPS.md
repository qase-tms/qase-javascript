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

### Using Async Function

Playwright supports both `qase.step()` and native `test.step()` for defining test steps:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with multiple steps using qase.step()', async ({ page }) => {
  await qase.step('Initialize the environment', async () => {
    await page.goto('https://example.com');
  });

  await qase.step('Test Core Functionality of the app', async () => {
    await page.click('#action-button');
  });

  await qase.step('Verify Expected Behavior of the app', async () => {
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Using Native test.step()

Playwright's built-in `test.step()` is also fully supported and reported to Qase:

```typescript
import { test, expect } from '@playwright/test';

test('Test with native test.step()', async ({ page }) => {
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

**When to use which:**
- Use `test.step()` for Playwright-native integration and when you want steps to appear in Playwright's trace viewer
- Use `qase.step()` for cross-framework consistency if you're maintaining tests across multiple frameworks
- Both methods are reported to Qase with the same level of detail

### Step Parameters

Steps can include parameters for dynamic naming:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with dynamic step names', async ({ page }) => {
  const username = 'john@example.com';

  await qase.step(`Login as user ${username}`, async () => {
    await page.fill('#email', username);
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
  });

  await qase.step(`Verify ${username} profile loaded`, async () => {
    await expect(page.locator('.user-email')).toHaveText(username);
  });
});
```

---

## Nested Steps

Create hierarchical step structures with either method:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with nested steps using qase.step()', async ({ page }) => {
  await qase.step('Complete user registration', async () => {
    await qase.step('Fill registration form', async () => {
      await page.fill('#name', 'John Doe');
      await page.fill('#email', 'john@example.com');
    });

    await qase.step('Submit registration', async () => {
      await page.click('button[type="submit"]');
    });
  });

  await qase.step('Verify registration success', async () => {
    await expect(page.locator('.success-message')).toBeVisible();
  });
});

test('Test with nested steps using test.step()', async ({ page }) => {
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

Define expected results and data for steps:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with expected results', async ({ page }) => {
  await qase.step(
    'Click button',
    async () => {
      await page.click('#submit-button');
    },
    'Button should be clicked',
    'Button data'
  );

  await qase.step(
    'Fill form',
    async () => {
      await page.fill('#input-field', 'test value');
    },
    'Form should be filled',
    'Form input data'
  );

  await qase.step(
    'Submit form',
    async () => {
      await page.click('button[type="submit"]');
    },
    'Form should be submitted',
    'Form submission data'
  );
});
```

**Signature:**
```typescript
await qase.step(
  name: string,
  callback: () => Promise<void> | void,
  expectedResult?: string,
  data?: string
): Promise<void>
```

---

## Steps with Attachments

Attach content to a specific step:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with step attachments', async ({ page }) => {
  await qase.step('Capture application state', async () => {
    const screenshot = await page.screenshot();

    qase.attach({
      name: 'app-state.png',
      content: screenshot,
      contentType: 'image/png',
    });
  });

  await qase.step('Verify state', async () => {
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
await qase.step('Verify user is redirected to dashboard', async () => {
  await expect(page).toHaveURL(/.*dashboard/);
});

// Avoid: Vague names
await qase.step('Check page', async () => {
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Include Context in Step Names

```typescript
// Good: Include relevant context
await qase.step(`Add product '${productName}' to cart`, async () => {
  await page.click(`[data-product="${productName}"] .add-to-cart`);
});

// Better than generic:
await qase.step('Add product', async () => {
  await page.click(`[data-product="${productName}"] .add-to-cart`);
});
```

---

## Common Patterns

### Page Object Steps

```typescript
import { test, expect, Page } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await qase.step(`Enter username: ${username}`, async () => {
      await this.page.fill('#email', username);
    });

    await qase.step('Enter password', async () => {
      await this.page.fill('#password', password);
    });

    await qase.step('Click login button', async () => {
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
import { qase } from 'playwright-qase-reporter';

test('API returns correct user data', async ({ request }) => {
  let response;

  await qase.step('Send GET request to /api/users/1', async () => {
    response = await request.get('https://api.example.com/users/1');
  });

  await qase.step('Verify response status is 200', async () => {
    expect(response.status()).toBe(200);
  });

  await qase.step('Verify response contains user data', async () => {
    const data = await response.json();
    expect(data.id).toBe(1);
    expect(data.name).toBeDefined();
  });
});
```

### Setup/Teardown Steps

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.describe('User tests', () => {
  test.beforeEach(async ({ page }) => {
    await qase.step('Setup: Navigate to application', async () => {
      await page.goto('https://example.com');
    });

    await qase.step('Setup: Authenticate user', async () => {
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'password');
      await page.click('button[type="submit"]');
    });
  });

  test.afterEach(async ({ page }) => {
    await qase.step('Cleanup: Logout user', async () => {
      await page.click('#logout-button');
    });
  });

  test('Test user operations', async ({ page }) => {
    await qase.step('Perform user action', async () => {
      await page.click('#user-action');
    });
  });
});
```

---

## Troubleshooting

### Steps Not Appearing

1. Verify the step function is properly imported from `playwright-qase-reporter`
2. Check that steps are executed within a test context
3. Enable debug logging to trace step recording
4. **Ensure you're using `await` with async step callbacks** - Missing `await` is the most common issue

```typescript
// Incorrect: Missing await
qase.step('Step name', async () => {  // Step won't be recorded properly
  // Logic
});

// Correct: Using await
await qase.step('Step name', async () => {
  // Logic
});
```

### Nested Steps Flattened

Ensure you're using the async callbacks correctly for nesting:

```typescript
// Correct: Nested callbacks
await qase.step('Parent step', async () => {
  await qase.step('Child step', async () => {
    // Child step logic
  });
});

// Incorrect: Sequential, not nested
await qase.step('Step 1', async () => {
  // Step 1 logic
});
await qase.step('Step 2', async () => {  // Not nested under Step 1
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
