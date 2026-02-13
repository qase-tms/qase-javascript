# Test Steps in Vitest

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

Define steps as async functions with callbacks:

```typescript
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('Test suite', () => {
  test('Test with multiple steps', withQase(async ({ qase }) => {
    await qase.step('Initialize the environment', async () => {
      // Set up test environment
    });

    await qase.step('Test Core Functionality of the app', async () => {
      // Exercise core functionality
    });

    await qase.step('Verify Expected Behavior of the app', async () => {
      // Assert expected behavior
      expect(true).toBe(true);
    });
  }));
});
```

### Step Parameters

Steps can include parameters for dynamic naming:

```typescript
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('Test suite', () => {
  test('Test with dynamic step names', withQase(async ({ qase }) => {
    const username = 'john@example.com';

    await qase.step(`Login as user ${username}`, async () => {
      // Login logic
    });

    await qase.step(`Verify ${username} profile loaded`, async () => {
      expect(username).toBe('john@example.com');
    });
  }));
});
```

---

## Nested Steps

Create hierarchical step structures:

```typescript
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('Test suite', () => {
  test('Test with nested steps', withQase(async ({ qase }) => {
    await qase.step('Complete user registration', async () => {
      await qase.step('Fill registration form', async () => {
        // Fill form fields
      });

      await qase.step('Submit registration', async () => {
        // Click submit button
      });
    });

    await qase.step('Verify registration success', async () => {
      expect(true).toBe(true);
    });
  }));
});
```

---

## Steps with Expected Result and Data

Define expected results and data for steps:

```typescript
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('Test suite', () => {
  test('Test with expected results', withQase(async ({ qase }) => {
    await qase.step(
      'Click button',
      async () => {
        // Click action
      },
      'Button should be clicked',
      'Button data'
    );

    await qase.step(
      'Fill form',
      async () => {
        // Form filling action
      },
      'Form should be filled',
      'Form input data'
    );

    await qase.step(
      'Submit form',
      async () => {
        // Submit action
      },
      'Form should be submitted',
      'Form submission data'
    );
  }));
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
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('Test suite', () => {
  test('Test with step attachments', withQase(async ({ qase }) => {
    await qase.step('Capture application state', async () => {
      const state = JSON.stringify({ user: 'john', status: 'active' });

      qase.attach({
        name: 'app-state.json',
        content: state,
        type: 'application/json',
      });
    });

    await qase.step('Verify state', async () => {
      expect(true).toBe(true);
    });
  }));
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
await qase.step('Navigate to login page', async () => {
  // Navigation logic
});

await qase.step('Enter username', async () => {
  // Fill username
});

// Avoid: Multiple actions in one step
await qase.step('Fill form and submit', async () => {  // Too broad
  // Multiple actions
});
```

### Use Descriptive Names

```typescript
// Good: Clear action description
await qase.step('Verify user is redirected to dashboard', async () => {
  expect(window.location.pathname).toBe('/dashboard');
});

// Avoid: Vague names
await qase.step('Check page', async () => {
  expect(window.location.pathname).toBe('/dashboard');
});
```

### Include Context in Step Names

```typescript
// Good: Include relevant context
await qase.step(`Add product '${productName}' to cart`, async () => {
  await addToCart(productName);
});

// Better than generic:
await qase.step('Add product', async () => {
  await addToCart(productName);
});
```

---

## Common Patterns

### Page Object Steps

```typescript
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

class LoginPage {
  async login(qase, username: string, password: string) {
    await qase.step(`Enter username: ${username}`, async () => {
      // Fill username field
    });

    await qase.step('Enter password', async () => {
      // Fill password field (don't log password)
    });

    await qase.step('Click login button', async () => {
      // Click submit
    });
  }
}

describe('Authentication', () => {
  test('User can login', withQase(async ({ qase }) => {
    const loginPage = new LoginPage();
    await loginPage.login(qase, 'user@example.com', 'password');
  }));
});
```

### API Testing Steps

```typescript
import { describe, test, expect } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('API tests', () => {
  test('API returns correct user data', withQase(async ({ qase }) => {
    let response;

    await qase.step('Send GET request to /api/users/1', async () => {
      response = await fetch('https://api.example.com/users/1');
    });

    await qase.step('Verify response status is 200', async () => {
      expect(response.status).toBe(200);
    });

    await qase.step('Verify response contains user data', async () => {
      const data = await response.json();
      expect(data.id).toBe(1);
      expect(data.name).toBeDefined();
    });
  }));
});
```

### Setup/Teardown Steps

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { withQase } from 'vitest-qase-reporter/vitest';

describe('User tests', () => {
  beforeEach(async (context) => {
    // Note: Steps in hooks may require special handling
  });

  afterEach(async (context) => {
    // Cleanup logic
  });

  test('Test user operations', withQase(async ({ qase }) => {
    await qase.step('Setup: Create test user', async () => {
      // Create user in database
    });

    await qase.step('Perform user action', async () => {
      // Test logic
      expect(true).toBe(true);
    });

    await qase.step('Cleanup: Delete test user', async () => {
      // Remove user from database
    });
  }));
});
```

---

## Troubleshooting

### Steps Not Appearing

1. Verify you're using `withQase` wrapper for tests with steps
2. Check that steps are executed within a test context with `Qase` parameter
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
