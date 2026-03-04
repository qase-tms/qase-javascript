# Test Steps in TestCafe

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

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with steps', async (t) => {
  await qase.step('Navigate to login page', async () => {
    await t.navigateTo('https://example.com/login');
  });

  await qase.step('Enter credentials', async () => {
    await t.typeText('#email', 'user@example.com');
    await t.typeText('#password', 'password123');
  });

  await qase.step('Submit form', async () => {
    await t.click('#login-button');
  });

  await qase.step('Verify login success', async () => {
    await t.expect('#dashboard').exists;
  });
});
```

### Step Parameters

Steps can include parameters for dynamic naming:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with parameterized steps', async (t) => {
  const username = 'testuser';
  const email = 'user@example.com';

  await qase.step(`Login as ${username}`, async () => {
    await t.typeText('#email', email);
    await t.typeText('#password', 'password123');
    await t.click('#login-button');
  });

  await qase.step(`Verify ${username} is logged in`, async () => {
    await t.expect('#user-profile').innerText).contains(username);
  });
});
```

---

## Nested Steps

Create hierarchical step structures using the step callback parameter:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with nested steps', async (t) => {
  await qase.step('Complete user registration', async (s1) => {
    await s1.step('Fill personal information', async (s2) => {
      await s2.step('Enter name', async () => {
        await t.typeText('#firstName', 'John');
        await t.typeText('#lastName', 'Doe');
      });

      await s2.step('Enter email', async () => {
        await t.typeText('#email', 'john.doe@example.com');
      });
    });

    await s1.step('Fill address information', async () => {
      await t.typeText('#address', '123 Main St');
      await t.typeText('#city', 'New York');
    });

    await s1.step('Submit registration form', async () => {
      await t.click('#submit-button');
    });
  });

  await qase.step('Verify registration success', async () => {
    await t.expect('#success-message').exists;
  });
});
```

**Note:** TestCafe nested steps use the step callback parameter (s, s1, s2, etc.) for nesting, not `qase.step()` directly.

---

## Steps with Attachments

Attach content to a specific step:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with step attachments', async (t) => {
  await qase.step('Navigate to page', async (s) => {
    await t.navigateTo('https://example.com');

    s.attach({
      name: 'page-loaded.png',
      content: await t.takeScreenshot(),
      type: 'image/png',
    });
  });

  await qase.step('Perform action', async (s) => {
    await t.click('#action-button');

    s.attach({
      name: 'action-log.txt',
      content: 'Button clicked successfully',
      type: 'text/plain',
    });
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

```javascript
// Good: One action per step
await qase.step('Click login button', async () => {
  await t.click('#login-btn');
});

await qase.step('Enter username', async () => {
  await t.typeText('#username', 'user');
});

// Avoid: Multiple actions in one step
await qase.step('Fill form and submit', async () => {  // Too broad
  await t.typeText('#username', 'user');
  await t.typeText('#password', 'pass');
  await t.click('#submit');
});
```

### Use Descriptive Names

```javascript
// Good: Clear action description
await qase.step('Verify user is redirected to dashboard', async () => {
  await t.expect(window.location.href).contains('/dashboard');
});

// Avoid: Vague names
await qase.step('Check page', async () => {
  await t.expect(window.location.href).contains('/dashboard');
});
```

### Include Context in Step Names

```javascript
// Good: Include relevant context
const productName = 'Laptop';
await qase.step(`Add product '${productName}' to cart`, async () => {
  await t.click(`#product-${productName} .add-to-cart`);
});

// Better than generic:
await qase.step('Add product', async () => {
  await t.click(`#product-${productName} .add-to-cart`);
});
```

---

## Common Patterns

### Fixture-level Organization

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Shopping Cart Tests`
  .page`https://example.com/shop`;

test('Add item to cart', async (t) => {
  await qase.step('Browse products', async () => {
    await t.navigateTo('/products');
    await t.expect('.product-list').exists;
  });

  await qase.step('Select product', async () => {
    await t.click('#product-1 .view-details');
  });

  await qase.step('Add to cart', async () => {
    await t.click('#add-to-cart-button');
    await t.expect('.cart-badge').innerText).eql('1');
  });
});
```

### TestCafe Selector Steps

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with selector-based steps', async (t) => {
  await qase.step('Verify header elements', async (s1) => {
    await s1.step('Check logo is visible', async () => {
      await t.expect('.header-logo').exists;
    });

    await s1.step('Check navigation menu', async () => {
      await t.expect('.nav-menu').exists;
      await t.expect('.nav-menu li').count).gte(3);
    });
  });

  await qase.step('Interact with elements', async () => {
    await t.hover('.dropdown-trigger');
    await t.click('.dropdown-menu .first-item');
  });
});
```

### Setup/Teardown Steps

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with setup and teardown', async (t) => {
  await qase.step('Setup: Create test data', async () => {
    // Create test user, seed database, etc.
    await t.eval(() => {
      localStorage.setItem('testData', JSON.stringify({ userId: 123 }));
    });
  });

  await qase.step('Execute main test flow', async () => {
    await t.navigateTo('/dashboard');
    await t.expect('#user-id').innerText).eql('123');
  });

  await qase.step('Teardown: Clean up test data', async () => {
    await t.eval(() => {
      localStorage.removeItem('testData');
    });
  });
});
```

---

## Troubleshooting

### Steps Not Appearing

1. Verify the step function is properly imported from `testcafe-reporter-qase/qase`
2. Check that steps are executed within a test context
3. Enable debug logging to trace step recording
4. Ensure you're using `await` with async step callbacks

### Nested Steps Flattened

Ensure you're using the callback parameter correctly for nesting:

```javascript
// Correct: Nested via callback parameter
await qase.step('Parent step', async (s1) => {
  await s1.step('Child step', async () => {
    // Child step logic
  });
});

// Incorrect: This creates sequential steps, not nested
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
