# Qase Integration in Cypress

This guide provides comprehensive instructions for integrating Qase with Cypress.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md#configuration).

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
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)
- [Running Tests](#running-tests)
- [Troubleshooting](#troubleshooting)

---

## Adding QaseID

Link your automated tests to existing test cases in Qase by specifying the test case ID.

### Single ID

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Authentication', () => {
  it(qase(1, 'User can login with valid credentials'), () => {
    cy.visit('https://example.com/login');
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Multiple IDs

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Cross-Browser Testing', () => {
  it(qase([1, 2, 3], 'Login works across Chrome, Firefox, and Edge'), () => {
    cy.visit('https://example.com/login');
    cy.get('#email').type('user@example.com');
    cy.get('button[type="submit"]').click();
  });
});
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Login Tests', () => {
  it('login test', () => {
    qase.title('User successfully logs in with valid credentials');

    cy.visit('https://example.com/login');
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
  });
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

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('User Management', () => {
  it('create new user', () => {
    qase.fields({
      severity: 'critical',
      priority: 'high',
      layer: 'e2e',
      description: 'Verifies that admin can create a new user account',
      preconditions: 'Admin user is logged in',
      postconditions: 'New user appears in user list',
    });

    cy.visit('/admin/users');
    cy.get('[data-testid="create-user-btn"]').click();
    cy.get('#username').type('newuser');
    cy.get('#email').type('newuser@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('User created successfully').should('be.visible');
  });
});
```

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Payment Tests', () => {
  it('process payment', () => {
    qase.suite('E2E Tests / Payment');

    cy.visit('/checkout');
    cy.get('#card-number').type('4242424242424242');
    cy.get('button[type="submit"]').click();
  });
});
```

### Nested Suites

```javascript
describe('User Tests', () => {
  it('user registration', () => {
    qase.suite('E2E Tests\tUser Management\tRegistration');

    cy.visit('/register');
    cy.get('#email').type('user@example.com');
    cy.get('#password').type('securePassword123');
    cy.get('button[type="submit"]').click();
  });
});
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Feature Tests', () => {
  it('test under development', () => {
    qase.ignore();

    cy.visit('/new-feature');
    cy.get('.feature-toggle').click();
  });
});
```

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Known Issues', () => {
  it('flaky test with known issue', () => {
    qase.mute();

    cy.visit('/dashboard');
    cy.get('.chart').should('be.visible');
  });
});
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('File Upload Tests', () => {
  it('upload document', () => {
    qase.attach({ paths: 'cypress/fixtures/document.pdf' });

    cy.visit('/upload');
    cy.get('input[type="file"]').selectFile('cypress/fixtures/document.pdf');
    cy.get('button[type="submit"]').click();
  });
});
```

### Attach Multiple Files

```javascript
it('test with multiple attachments', () => {
  qase.attach({
    paths: [
      'cypress/fixtures/data.json',
      'cypress/fixtures/config.yml',
      'cypress/fixtures/image.png',
    ],
  });

  cy.visit('/dashboard');
});
```

### Attach Content from Code

```javascript
it('test with log attachment', () => {
  const testLog = `
    Test execution log
    Step 1: Visited login page
    Step 2: Entered credentials
    Step 3: Clicked submit button
  `;

  qase.attach({
    name: 'execution.log',
    content: testLog,
    contentType: 'text/plain',
  });

  cy.visit('/login');
});
```

### Attach JSON Data

```javascript
it('API test with response data', () => {
  cy.request('GET', 'https://api.example.com/users/1').then((response) => {
    qase.attach({
      name: 'api-response.json',
      content: JSON.stringify(response.body, null, 2),
      contentType: 'application/json',
    });

    expect(response.status).to.equal(200);
  });
});
```

### Attach Screenshot

Cypress automatically captures screenshots on failure. To manually capture and attach:

```javascript
it('capture custom screenshot', () => {
  cy.visit('/dashboard');
  cy.wait(1000);

  cy.screenshot('dashboard-loaded', { capture: 'fullPage' });

  qase.attach({
    paths: 'cypress/screenshots/dashboard-loaded.png',
  });
});
```

### Attach to Specific Step

```javascript
it('test with step attachments', () => {
  qase.step('Load dashboard', () => {
    cy.visit('/dashboard');

    cy.screenshot('dashboard-view');
    qase.attach({
      paths: 'cypress/screenshots/dashboard-view.png',
    });
  });

  qase.step('Verify chart rendering', () => {
    cy.get('.chart').should('be.visible');
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

Define test steps for detailed reporting in Qase.

### Using Synchronous Function

Cypress steps use synchronous callbacks (no async/await needed):

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Shopping Cart', () => {
  it('add item to cart', () => {
    qase.step('Navigate to product page', () => {
      cy.visit('/products/laptop');
      cy.contains('Add to Cart').should('be.visible');
    });

    qase.step('Add product to cart', () => {
      cy.get('[data-testid="add-to-cart"]').click();
      cy.contains('Added to cart').should('be.visible');
    });

    qase.step('Verify cart count', () => {
      cy.get('[data-testid="cart-count"]').should('contain', '1');
    });
  });
});
```

### Nested Steps

```javascript
it('complete checkout process', () => {
  qase.step('Add items to cart', () => {
    qase.step('Add first item', () => {
      cy.visit('/products/laptop');
      cy.get('[data-testid="add-to-cart"]').click();
    });

    qase.step('Add second item', () => {
      cy.visit('/products/mouse');
      cy.get('[data-testid="add-to-cart"]').click();
    });
  });

  qase.step('Complete checkout', () => {
    qase.step('Enter shipping info', () => {
      cy.visit('/checkout');
      cy.get('#address').type('123 Main St');
    });

    qase.step('Submit payment', () => {
      cy.get('#card-number').type('4242424242424242');
      cy.get('button[type="submit"]').click();
    });
  });
});
```

### Steps with Expected Result

```javascript
it('form validation test', () => {
  qase.step(
    'Enter invalid email',
    () => {
      cy.get('#email').type('invalid-email');
      cy.get('#email').blur();
    },
    'Validation error message should appear',
  );

  qase.step(
    'Verify error message',
    () => {
      cy.contains('Please enter a valid email').should('be.visible');
    },
    'Error message is displayed correctly',
  );
});
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameterized Test

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Login with different users', () => {
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' },
    { username: 'guest', password: 'guest123', role: 'guest' },
  ];

  users.forEach((user) => {
    it(`login as ${user.role}`, () => {
      qase.parameters({
        username: user.username,
        role: user.role,
      });

      cy.visit('/login');
      cy.get('#username').type(user.username);
      cy.get('#password').type(user.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });
});
```

### Group Parameters

```javascript
describe('Cross-browser tests', () => {
  const browsers = ['chrome', 'firefox', 'edge'];

  browsers.forEach((browser) => {
    it(`test in ${browser}`, () => {
      qase.parameters({
        browser: browser,
        environment: 'staging',
        viewport: '1920x1080',
      });

      qase.groupParameters({
        'Test Group': 'Cross-browser',
        'Priority': 'High',
      });

      cy.visit('/');
      cy.get('.hero').should('be.visible');
    });
  });
});
```

---

## Multi-Project Support

Send test results to multiple Qase projects simultaneously with different test case IDs for each project.

For detailed configuration, examples, and troubleshooting, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Integration Patterns

### Custom Commands with Qase

Create reusable Cypress custom commands that integrate with Qase reporting:

```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginWithQase', (username, password) => {
  qase.step('Login via custom command', () => {
    cy.visit('/login');
    cy.get('#username').type(username);
    cy.get('#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// In your test
it('login using custom command', () => {
  cy.loginWithQase('testuser', 'password123');
});
```

### Intercept API Calls with Reporting

```javascript
it('verify API call during user action', () => {
  cy.intercept('POST', '/api/users').as('createUser');

  qase.step('Fill registration form', () => {
    cy.visit('/register');
    cy.get('#email').type('newuser@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
  });

  qase.step('Verify API request', () => {
    cy.wait('@createUser').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);

      qase.attach({
        name: 'api-request.json',
        content: JSON.stringify(interception.request.body, null, 2),
        contentType: 'application/json',
      });

      qase.attach({
        name: 'api-response.json',
        content: JSON.stringify(interception.response.body, null, 2),
        contentType: 'application/json',
      });
    });
  });
});
```

### Fixture-Based Test Data

```javascript
describe('User CRUD operations', () => {
  it('create user with fixture data', () => {
    cy.fixture('users/admin.json').then((userData) => {
      qase.parameters({
        'User Type': userData.role,
        'Permissions': userData.permissions.join(', '),
      });

      qase.step('Create user with fixture data', () => {
        cy.visit('/admin/users/new');
        cy.get('#email').type(userData.email);
        cy.get('#role').select(userData.role);
        cy.get('button[type="submit"]').click();
      });
    });
  });
});
```

### Before/After Hooks

```javascript
describe('Test Suite with Hooks', () => {
  before(() => {
    qase.comment('Suite-level setup: Database seeded with test data');
    cy.task('seedDatabase');
  });

  after(() => {
    qase.comment('Suite-level teardown: Test data cleaned up');
    cy.task('cleanDatabase');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('test with hooks', () => {
    cy.get('.welcome').should('be.visible');
  });
});
```

### Page Object Pattern

```javascript
// cypress/support/pages/LoginPage.js
export class LoginPage {
  visit() {
    cy.visit('/login');
  }

  fillUsername(username) {
    cy.get('#username').type(username);
  }

  fillPassword(password) {
    cy.get('#password').type(password);
  }

  submit() {
    cy.get('button[type="submit"]').click();
  }

  login(username, password) {
    qase.step(`Login as ${username}`, () => {
      this.visit();
      this.fillUsername(username);
      this.fillPassword(password);
      this.submit();
    });
  }
}

// In your test
import { LoginPage } from '../support/pages/LoginPage';

it('login using page object', () => {
  const loginPage = new LoginPage();
  loginPage.login('testuser', 'password123');

  cy.url().should('include', '/dashboard');
});
```

---

## Common Use Cases

### Report API Test Results

```javascript
describe('API Tests', () => {
  it(qase(10, 'GET request returns user data'), () => {
    cy.request('GET', 'https://api.example.com/users/1').then((response) => {
      qase.fields({
        layer: 'api',
        severity: 'critical',
      });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('id', 1);

      qase.attach({
        name: 'response.json',
        content: JSON.stringify(response.body, null, 2),
        contentType: 'application/json',
      });
    });
  });
});
```

### Attach Screenshot on Failure

```javascript
describe('Visual Tests', () => {
  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      const testName = this.currentTest.title.replace(/\s+/g, '-');
      cy.screenshot(`failure-${testName}`);
    }
  });

  it(qase(11, 'Dashboard displays correctly'), () => {
    cy.visit('/dashboard');
    cy.get('.chart').should('be.visible');
    cy.get('.stats').should('contain', 'Total Users');
  });
});
```

### Use with Cucumber Preprocessor

For Cucumber/Gherkin integration, see the [Cucumber Integration Guide](cucumber.md).

**Quick example:**

```gherkin
# features/login.feature
@QaseID=12
Feature: User Login
  As a user
  I want to log in to the application
  So I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should see the dashboard
```

### Report Visual Regression Results

```javascript
describe('Visual Regression Tests', () => {
  it(qase(13, 'Homepage matches baseline'), () => {
    cy.visit('/');

    qase.step('Capture homepage screenshot', () => {
      cy.screenshot('homepage', { capture: 'fullPage' });
    });

    qase.step('Compare with baseline', () => {
      cy.task('compareScreenshots', {
        actual: 'homepage.png',
        baseline: 'baseline/homepage.png',
      }).then((result) => {
        qase.attach({
          name: 'comparison-result.json',
          content: JSON.stringify(result, null, 2),
          contentType: 'application/json',
        });

        expect(result.mismatchPercentage).to.be.below(0.1);
      });
    });
  });
});
```

### Test with Multiple Assertions

```javascript
it(qase(14, 'User profile displays all information'), () => {
  qase.step('Navigate to profile page', () => {
    cy.visit('/profile');
  });

  qase.step('Verify profile information', () => {
    cy.get('[data-testid="user-name"]').should('contain', 'John Doe');
    cy.get('[data-testid="user-email"]').should('contain', 'john@example.com');
    cy.get('[data-testid="user-role"]').should('contain', 'Admin');
    cy.get('[data-testid="user-status"]').should('contain', 'Active');
  });

  qase.fields({
    severity: 'normal',
    priority: 'medium',
  });
});
```

### Data-Driven Testing

```javascript
describe('Form Validation', () => {
  const invalidEmails = [
    { email: 'notanemail', error: 'Please enter a valid email' },
    { email: '@example.com', error: 'Please enter a valid email' },
    { email: 'user@', error: 'Please enter a valid email' },
    { email: '', error: 'Email is required' },
  ];

  invalidEmails.forEach(({ email, error }) => {
    it(`validates email: "${email}"`, () => {
      qase.parameters({
        'Input Email': email,
        'Expected Error': error,
      });

      cy.visit('/register');
      cy.get('#email').type(email);
      cy.get('#email').blur();
      cy.contains(error).should('be.visible');
    });
  });
});
```

### Environment-Specific Testing

```javascript
describe('Environment-specific tests', () => {
  it(qase(15, 'Test runs in correct environment'), () => {
    const env = Cypress.env('ENVIRONMENT') || 'staging';

    qase.parameters({
      Environment: env,
      BaseURL: Cypress.config('baseUrl'),
    });

    qase.comment(`Test executed in ${env} environment`);

    cy.visit('/');
    cy.get('h1').should('be.visible');
  });
});
```

---

## Running Tests

### Basic Execution

```bash
# Run all tests
npx cypress run

# Run in headed mode
npx cypress open
```

### With Environment Variables

```bash
# Enable Qase reporting
QASE_MODE=testops npx cypress run

# Specify project code
QASE_MODE=testops QASE_TESTOPS_PROJECT=DEMO npx cypress run

# Use specific API token
QASE_MODE=testops QASE_TESTOPS_API_TOKEN=your_token npx cypress run
```

### With Test Plan

```bash
# Run tests linked to specific test plan
QASE_MODE=testops QASE_TESTOPS_PLAN_ID=123 npx cypress run
```

### With Existing Test Run

```bash
# Report to existing test run
QASE_MODE=testops QASE_TESTOPS_RUN_ID=456 npx cypress run
```

### Run Specific Tests

```bash
# Run specific spec file
npx cypress run --spec "cypress/e2e/login.cy.js"

# Run multiple spec files
npx cypress run --spec "cypress/e2e/login.cy.js,cypress/e2e/register.cy.js"

# Run specs matching pattern
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"
```

---

## Troubleshooting

### Tests Not Appearing in Qase

**Issue:** Tests execute but results don't appear in Qase TestOps.

**Solutions:**

1. Verify `mode` is set to `testops` (not `off` or `report`)
2. Check API token has write permissions
3. Verify project code is correct
4. Check for errors in Cypress console output
5. Enable debug logging: set `debug: true` in configuration

```javascript
// cypress.config.js
module.exports = defineConfig({
  reporterOptions: {
    debug: true,
    mode: 'testops',
  },
});
```

### setupNodeEvents Not Configured

**Issue:** Error: "Qase reporter requires setupNodeEvents configuration"

**Solution:** Add plugin and metadata initialization in `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
    },
  },
});
```

### Attachments Not Uploading

**Issue:** Screenshots or files not appearing in test results.

**Solutions:**

1. Verify file path exists and is readable
2. Check `uploadAttachments: true` in configuration
3. Ensure file size is within limits
4. Enable debug logging to see upload status

```javascript
reporterOptions: {
  testops: {
    uploadAttachments: true,
  },
}
```

### Cypress Commands in Step Callbacks

**Issue:** Steps complete immediately without waiting for Cypress commands.

**Solution:** Cypress commands are asynchronous. Steps should contain Cypress commands directly:

```javascript
// Correct
qase.step('Click button', () => {
  cy.get('button').click();
  cy.contains('Success').should('be.visible');
});

// Incorrect - don't use await
qase.step('Click button', async () => {
  await cy.get('button').click(); // Don't do this
});
```

### Results Going to Wrong Test Cases

**Issue:** Test results appear under incorrect test case IDs.

**Solutions:**

1. Verify QaseID matches the test case ID in Qase
2. Check for duplicate IDs in your test suite
3. Verify you're using the correct project code
4. Ensure test names haven't changed significantly

### Headless Mode Issues

**Issue:** Tests pass in headed mode but fail in headless mode.

**Solutions:**

1. Add explicit waits for elements:
   ```javascript
   cy.get('.button', { timeout: 10000 }).should('be.visible').click();
   ```

2. Wait for network requests:
   ```javascript
   cy.intercept('GET', '/api/data').as('getData');
   cy.visit('/');
   cy.wait('@getData');
   ```

3. Increase viewport size:
   ```javascript
   cy.viewport(1920, 1080);
   ```

### Screenshot Attachment Failures

**Issue:** Screenshots not attaching properly.

**Solution:** Ensure screenshots folder is configured correctly:

```javascript
// cypress.config.js
module.exports = defineConfig({
  screenshotsFolder: 'cypress/screenshots',
  reporterOptions: {
    framework: {
      cypress: {
        screenshotsFolder: 'cypress/screenshots',
      },
    },
  },
});
```

### Import Path Issues

**Issue:** Error: "Cannot find module 'cypress-qase-reporter/mocha'"

**Solution:** Ensure you're using the correct import path:

```javascript
// Correct
import { qase } from 'cypress-qase-reporter/mocha';

// Incorrect
import { qase } from 'cypress-qase-reporter';
import { qase } from 'cypress-qase-reporter/cypress';
```

### Multi-Reporter Configuration Conflicts

**Issue:** Using cypress-multi-reporters causes conflicts.

**Solution:** Configure Qase reporter directly in `cypress.config.js`:

```javascript
module.exports = defineConfig({
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
  },
});
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Cucumber Integration Guide](cucumber.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
