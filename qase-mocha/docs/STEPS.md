# Test Steps in Mocha

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

### Using Step Callbacks

Define steps using synchronous callbacks with the test context:

```javascript
const assert = require('assert');

describe('Test suite', function() {
  it('Test with multiple steps', function() {
    this.step('Initialize the environment', function() {
      // Set up test environment
    });

    this.step('Test Core Functionality', function() {
      // Exercise core functionality
    });

    this.step('Verify Expected Behavior', function() {
      // Assert expected behavior
      assert.strictEqual(1, 1);
    });
  });
});
```

**Important:** Mocha steps use `function()` syntax (not arrow functions) to access the test context via `this`. Steps are synchronous.

### Step Parameters

Steps can include parameters for dynamic naming:

```javascript
const assert = require('assert');

describe('Test suite', function() {
  it('Test with dynamic step names', function() {
    const username = 'john@example.com';

    this.step(`Login as user ${username}`, function() {
      // Login logic
    });

    this.step(`Verify ${username} profile loaded`, function() {
      // Verification logic
      assert.strictEqual(true, true);
    });
  });
});
```

---

## Nested Steps

Create hierarchical step structures:

```javascript
const assert = require('assert');

describe('Test suite', function() {
  it('Test with nested steps', function() {
    this.step('Complete user registration', function() {
      this.step('Fill registration form', function() {
        // Fill form fields
      });

      this.step('Submit registration', function() {
        // Click submit button
      });
    });

    this.step('Verify registration success', function() {
      assert.strictEqual(true, true);
    });
  });
});
```

---

## Steps with Expected Result and Data

Define expected results and data for steps:

```javascript
const assert = require('assert');

describe('Test suite', function() {
  it('Test with expected results', function() {
    this.step(
      'Click button',
      function() {
        // Click action
      },
      'Button should be clicked',
      'Button data'
    );

    this.step(
      'Fill form',
      function() {
        // Form filling action
      },
      'Form should be filled',
      'Form input data'
    );

    this.step(
      'Submit form',
      function() {
        // Submit action
      },
      'Form should be submitted',
      'Form submission data'
    );

    assert.strictEqual(1, 1);
  });
});
```

**Signature:**
```typescript
this.step(
  name: string,
  callback: () => void,
  expectedResult?: string,
  data?: string
): void
```

---

## Steps with Attachments

Attach content to a specific step:

```javascript
const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('Test suite', function() {
  it('Test with step attachments', function() {
    this.step('Capture application state', function() {
      const state = JSON.stringify({ user: 'john', status: 'active' });

      qase.attach({
        name: 'app-state.json',
        content: state,
        contentType: 'application/json',
      });
    });

    this.step('Verify state', function() {
      // Assertions
      assert.strictEqual(true, true);
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
this.step('Navigate to login page', function() {
  // Navigation logic
});

this.step('Enter username', function() {
  // Fill username
});

// Avoid: Multiple actions in one step
this.step('Fill form and submit', function() {  // Too broad
  // Multiple actions
});
```

### Use Descriptive Names

```javascript
// Good: Clear action description
this.step('Verify user is redirected to dashboard', function() {
  assert.strictEqual(window.location.pathname, '/dashboard');
});

// Avoid: Vague names
this.step('Check page', function() {
  assert.strictEqual(window.location.pathname, '/dashboard');
});
```

### Include Context in Step Names

```javascript
// Good: Include relevant context
this.step(`Add product '${productName}' to cart`, function() {
  // Add to cart logic
});

// Better than generic:
this.step('Add product', function() {
  // Add to cart logic
});
```

---

## Common Patterns

### Page Object Steps

```javascript
const assert = require('assert');

class LoginPage {
  constructor(testContext) {
    this.ctx = testContext;
  }

  login(username, password) {
    this.ctx.step(`Enter username: ${username}`, function() {
      // Fill username field
    });

    this.ctx.step('Enter password', function() {
      // Fill password field (don't log password)
    });

    this.ctx.step('Click login button', function() {
      // Click submit
    });
  }
}

describe('Authentication', function() {
  it('User can login', function() {
    const loginPage = new LoginPage(this);
    loginPage.login('user@example.com', 'password');
  });
});
```

### API Testing Steps

```javascript
const assert = require('assert');
const fetch = require('node-fetch');

describe('API tests', function() {
  it('API returns correct user data', function() {
    let response;

    this.step('Send GET request to /api/users/1', function() {
      response = fetch('https://api.example.com/users/1');
    });

    this.step('Verify response status is 200', function() {
      response.then(res => {
        assert.strictEqual(res.status, 200);
      });
    });

    this.step('Verify response contains user data', function() {
      response.then(res => res.json()).then(data => {
        assert.strictEqual(data.id, 1);
        assert.ok(data.name);
      });
    });
  });
});
```

### Setup/Teardown Steps

```javascript
const assert = require('assert');

describe('User tests', function() {
  beforeEach(function() {
    this.step('Setup: Create test user', function() {
      // Create user in database
    });

    this.step('Setup: Initialize session', function() {
      // Set up user session
    });
  });

  afterEach(function() {
    this.step('Cleanup: Delete test user', function() {
      // Remove user from database
    });
  });

  it('Test user operations', function() {
    this.step('Perform user action', function() {
      // Test logic
      assert.strictEqual(true, true);
    });
  });
});
```

---

## Troubleshooting

### Steps Not Appearing

1. Verify you're using `function()` syntax (not arrow functions) to access `this.step`
2. Check that steps are executed within a test context
3. Enable debug logging to trace step recording
4. Ensure the reporter is properly configured in `.mocharc.js`

```javascript
// Incorrect: Arrow function loses 'this' context
it('Test', () => {
  this.step('Step name', () => {  // 'this' is undefined
    // Logic
  });
});

// Correct: Using function() syntax
it('Test', function() {
  this.step('Step name', function() {
    // Logic
  });
});
```

### Nested Steps Flattened

Ensure you're using the synchronous callbacks correctly for nesting:

```javascript
// Correct: Nested callbacks
this.step('Parent step', function() {
  this.step('Child step', function() {
    // Child step logic
  });
});

// Incorrect: Sequential, not nested
this.step('Step 1', function() {
  // Step 1 logic
});
this.step('Step 2', function() {  // Not nested under Step 1
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
