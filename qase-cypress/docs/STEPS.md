# Test Steps in Cypress

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

Define steps using synchronous callbacks with Cypress commands:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it('Test with multiple steps', () => {
    qase.step('Navigate to example page', () => {
      cy.visit('https://example.cypress.io');
    });

    qase.step('Click on type link', () => {
      cy.contains('type').click();
    });

    qase.step('Verify URL changed', () => {
      cy.url().should('include', '/commands/actions');
    });
  });
});
```

**Important:** Cypress steps use synchronous callbacks. Do not use `async`/`await` with Cypress steps.

### Step Parameters

Steps can include parameters for dynamic naming:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it('Test with dynamic step names', () => {
    const username = 'john@example.com';

    qase.step(`Login as user ${username}`, () => {
      cy.get('#email').type(username);
      cy.get('#password').type('password');
      cy.get('button[type="submit"]').click();
    });

    qase.step(`Verify ${username} profile loaded`, () => {
      cy.get('.user-email').should('contain', username);
    });
  });
});
```

---

## Nested Steps

Create hierarchical step structures:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it('Test with nested steps', () => {
    qase.step('Complete user registration', () => {
      qase.step('Fill registration form', () => {
        cy.get('#name').type('John Doe');
        cy.get('#email').type('john@example.com');
      });

      qase.step('Submit registration', () => {
        cy.get('button[type="submit"]').click();
      });
    });

    qase.step('Verify registration success', () => {
      cy.get('.success-message').should('be.visible');
    });
  });
});
```

---

## Steps with Expected Result and Data

Define expected results and data for steps:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it('Test with expected results', () => {
    qase.step(
      'Click button',
      () => {
        cy.get('#submit-button').click();
      },
      'Button should be clicked',
      'Button data'
    );

    qase.step(
      'Fill form',
      () => {
        cy.get('#input-field').type('test value');
      },
      'Form should be filled',
      'Form input data'
    );

    qase.step(
      'Submit form',
      () => {
        cy.get('button[type="submit"]').click();
      },
      'Form should be submitted',
      'Form submission data'
    );
  });
});
```

**Signature:**
```typescript
qase.step(
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
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it('Test with step attachments', () => {
    qase.step('Capture application state', () => {
      const state = JSON.stringify({ user: 'john', status: 'active' });

      qase.attach({
        name: 'app-state.json',
        content: state,
        contentType: 'application/json',
      });
    });

    qase.step('Verify state', () => {
      cy.get('.status').should('contain', 'active');
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
qase.step('Click login button', () => {
  cy.get('#login-btn').click();
});

qase.step('Enter username', () => {
  cy.get('#username').type('user');
});

// Avoid: Multiple actions in one step
qase.step('Fill form and submit', () => {  // Too broad
  cy.get('#username').type('user');
  cy.get('#password').type('pass');
  cy.get('#submit').click();
});
```

### Use Descriptive Names

```javascript
// Good: Clear action description
qase.step('Verify user is redirected to dashboard', () => {
  cy.url().should('include', '/dashboard');
});

// Avoid: Vague names
qase.step('Check page', () => {
  cy.url().should('include', '/dashboard');
});
```

### Include Context in Step Names

```javascript
// Good: Include relevant context
qase.step(`Add product '${productName}' to cart`, () => {
  cy.get(`[data-product="${productName}"] .add-to-cart`).click();
});

// Better than generic:
qase.step('Add product', () => {
  cy.get(`[data-product="${productName}"] .add-to-cart`).click();
});
```

---

## Common Patterns

### Page Object Steps

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

class LoginPage {
  login(username, password) {
    qase.step(`Enter username: ${username}`, () => {
      cy.get('#email').type(username);
    });

    qase.step('Enter password', () => {
      cy.get('#password').type(password);
    });

    qase.step('Click login button', () => {
      cy.get('button[type="submit"]').click();
    });
  }
}

describe('Authentication', () => {
  it('User can login', () => {
    const loginPage = new LoginPage();
    cy.visit('/login');
    loginPage.login('user@example.com', 'password');
  });
});
```

### API Testing Steps

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('API tests', () => {
  it('API returns correct user data', () => {
    let response;

    qase.step('Send GET request to /api/users/1', () => {
      cy.request('GET', 'https://api.example.com/users/1').then((res) => {
        response = res;
      });
    });

    qase.step('Verify response status is 200', () => {
      expect(response.status).to.equal(200);
    });

    qase.step('Verify response contains user data', () => {
      expect(response.body.id).to.equal(1);
      expect(response.body.name).to.exist;
    });
  });
});
```

### Setup/Teardown Steps

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('User tests', () => {
  beforeEach(() => {
    qase.step('Setup: Navigate to application', () => {
      cy.visit('https://example.com');
    });

    qase.step('Setup: Authenticate user', () => {
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password');
      cy.get('button[type="submit"]').click();
    });
  });

  afterEach(() => {
    qase.step('Cleanup: Logout user', () => {
      cy.get('#logout-button').click();
    });
  });

  it('Test user operations', () => {
    qase.step('Perform user action', () => {
      cy.get('#user-action').click();
    });
  });
});
```

---

## Troubleshooting

### Steps Not Appearing

1. Verify the step function is properly imported from `cypress-qase-reporter/mocha`
2. Check that steps are executed within a test context
3. Enable debug logging to trace step recording
4. Ensure Cypress plugin is properly configured in `cypress.config.js`

### Nested Steps Flattened

Ensure you're using the synchronous callbacks correctly for nesting:

```javascript
// Correct: Nested callbacks
qase.step('Parent step', () => {
  qase.step('Child step', () => {
    // Child step logic
  });
});

// Incorrect: Sequential, not nested
qase.step('Step 1', () => {
  // Step 1 logic
});
qase.step('Step 2', () => {  // Not nested under Step 1
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
