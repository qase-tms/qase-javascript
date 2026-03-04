# Test Steps in WebdriverIO

This guide covers how to define and report test steps for detailed execution tracking in Qase.

---

## Overview

Test steps provide granular visibility into test execution. Each step is reported separately, showing:

- Step name and description
- Step status (passed/failed)
- Step duration
- Attachments (if any)
- Error details (on failure)

**Framework Support:**
- **Mocha/Jasmine:** Programmatic steps via `qase.step()`
- **Cucumber:** Gherkin steps (Given/When/Then) are automatically reported as Qase steps

---

## Defining Steps (Mocha/Jasmine)

### Using Async Function

Define steps as async functions with callbacks:

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with steps', async () => {
    await qase.step('Navigate to login page', async () => {
      await browser.url('https://example.com/login');
    });

    await qase.step('Enter credentials', async () => {
      await $('#email').setValue('user@example.com');
      await $('#password').setValue('password123');
    });

    await qase.step('Submit form', async () => {
      await $('#login-button').click();
    });

    await qase.step('Verify login success', async () => {
      await expect($('#dashboard')).toExist();
    });
  });
});
```

### Step Parameters

Steps can include parameters for dynamic naming:

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with parameterized steps', async () => {
    const username = 'testuser';
    const email = 'user@example.com';

    await qase.step(`Login as ${username}`, async () => {
      await $('#email').setValue(email);
      await $('#password').setValue('password123');
      await $('#login-button').click();
    });

    await qase.step(`Verify ${username} is logged in`, async () => {
      await expect($('#user-profile')).toHaveText(username);
    });
  });
});
```

---

## Nested Steps (Mocha/Jasmine)

Create hierarchical step structures using the step callback parameter:

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with nested steps', async () => {
    await qase.step('Complete user registration', async (step) => {
      await step.step('Fill personal information', async (step2) => {
        await step2.step('Enter name', async () => {
          await $('#firstName').setValue('John');
          await $('#lastName').setValue('Doe');
        });

        await step2.step('Enter email', async () => {
          await $('#email').setValue('john.doe@example.com');
        });
      });

      await step.step('Fill address information', async () => {
        await $('#address').setValue('123 Main St');
        await $('#city').setValue('New York');
      });

      await step.step('Submit registration form', async () => {
        await $('#submit-button').click();
      });
    });

    await qase.step('Verify registration success', async () => {
      await expect($('#success-message')).toExist();
    });
  });
});
```

**Note:** WebdriverIO nested steps use the step callback parameter for nesting, not `qase.step()` directly.

---

## Cucumber Steps

In Cucumber, Gherkin steps (Given/When/Then) are automatically reported as Qase test steps:

```gherkin
Feature: User Authentication

  Scenario: User can log in
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should see the dashboard
```

Each Gherkin step is automatically captured and reported to Qase with:
- Step name (from Gherkin step text)
- Step status (passed/failed/skipped)
- Step duration

**No programmatic step API is needed for Cucumber** — Qase reporter automatically captures all Gherkin steps.

---

## Steps with Attachments (Mocha/Jasmine)

Attach content to a specific step:

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with step attachments', async () => {
    await qase.step('Navigate to page', async (step) => {
      await browser.url('https://example.com');

      step.attach({
        name: 'page-loaded.png',
        content: await browser.takeScreenshot(),
        type: 'image/png',
      });
    });

    await qase.step('Perform action', async (step) => {
      await $('#action-button').click();

      step.attach({
        name: 'action-log.txt',
        content: 'Button clicked successfully',
        type: 'text/plain',
      });
    });
  });
});
```

---

## Automatic WebDriver Step Reporting

WebdriverIO can be configured to automatically report WebDriver commands as steps:

```javascript
// wdio.conf.js
const WDIOQaseReporter = require('wdio-qase-reporter').default;

exports.config = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverStepsReporting: false, // Enable automatic WebDriver step reporting
  }]],

  // ... other options
};
```

When `disableWebdriverStepsReporting` is `false`, WebDriver commands (e.g., `browser.url()`, `$('#element').click()`) are automatically reported as Qase steps.

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
  await $('#login-btn').click();
});

await qase.step('Enter username', async () => {
  await $('#username').setValue('user');
});

// Avoid: Multiple actions in one step
await qase.step('Fill form and submit', async () => {  // Too broad
  await $('#username').setValue('user');
  await $('#password').setValue('pass');
  await $('#submit').click();
});
```

### Use Descriptive Names

```javascript
// Good: Clear action description
await qase.step('Verify user is redirected to dashboard', async () => {
  await expect(browser).toHaveUrl('https://example.com/dashboard');
});

// Avoid: Vague names
await qase.step('Check page', async () => {
  await expect(browser).toHaveUrl('https://example.com/dashboard');
});
```

### Include Context in Step Names

```javascript
// Good: Include relevant context
const productName = 'Laptop';
await qase.step(`Add product '${productName}' to cart`, async () => {
  await $(`#product-${productName} .add-to-cart`).click();
});

// Better than generic:
await qase.step('Add product', async () => {
  await $(`#product-${productName} .add-to-cart`).click();
});
```

---

## Common Patterns

### Page Object Steps

```javascript
import { qase } from 'wdio-qase-reporter';

class LoginPage {
  get emailInput() { return $('#email'); }
  get passwordInput() { return $('#password'); }
  get loginButton() { return $('#login-button'); }

  async login(email, password) {
    await qase.step('Navigate to login page', async () => {
      await browser.url('/login');
    });

    await qase.step(`Enter email: ${email}`, async () => {
      await this.emailInput.setValue(email);
    });

    await qase.step('Enter password', async () => {
      await this.passwordInput.setValue(password);
    });

    await qase.step('Click login button', async () => {
      await this.loginButton.click();
    });
  }
}

describe('Login Tests', () => {
  it('User can log in', async () => {
    const loginPage = new LoginPage();
    await loginPage.login('user@example.com', 'password123');

    await qase.step('Verify login success', async () => {
      await expect($('#dashboard')).toExist();
    });
  });
});
```

### Browser Interaction Steps

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with browser interaction steps', async () => {
    await qase.step('Navigate to page', async () => {
      await browser.url('https://example.com');
    });

    await qase.step('Interact with dropdown', async (step) => {
      await step.step('Open dropdown', async () => {
        await $('.dropdown-trigger').click();
      });

      await step.step('Select option', async () => {
        await $('.dropdown-menu .first-item').click();
      });
    });

    await qase.step('Verify selection', async () => {
      await expect($('.selected-value')).toHaveText('First Item');
    });
  });
});
```

### Setup/Teardown Steps

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with setup and teardown', async () => {
    await qase.step('Setup: Create test data', async () => {
      await browser.execute(() => {
        localStorage.setItem('testData', JSON.stringify({ userId: 123 }));
      });
    });

    await qase.step('Execute main test flow', async () => {
      await browser.url('/dashboard');
      await expect($('#user-id')).toHaveText('123');
    });

    await qase.step('Teardown: Clean up test data', async () => {
      await browser.execute(() => {
        localStorage.removeItem('testData');
      });
    });
  });
});
```

---

## Troubleshooting

### Steps Not Appearing (Mocha/Jasmine)

1. Verify the step function is properly imported from `wdio-qase-reporter`
2. Check that steps are executed within a test context
3. Enable debug logging to trace step recording
4. Ensure you're using `await` with async step callbacks

### Steps Not Appearing (Cucumber)

1. Verify reporter is configured correctly in `wdio.conf.js`
2. Check that `useCucumber: true` is set in reporter options
3. Ensure Gherkin steps are properly defined in feature files
4. Enable debug logging to see step capture

### Nested Steps Flattened

Ensure you're using the callback parameter correctly for nesting:

```javascript
// Correct: Nested via callback parameter
await qase.step('Parent step', async (step) => {
  await step.step('Child step', async () => {
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

### Too Many Automatic Steps

If automatic WebDriver step reporting creates too many steps, disable it:

```javascript
// wdio.conf.js
exports.config = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverStepsReporting: true, // Disable automatic steps
  }]],
};
```

### Step Duration Shows 0

Steps need measurable execution time. Very fast steps may show 0ms duration.

---

## See Also

- [Usage Guide](usage.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
