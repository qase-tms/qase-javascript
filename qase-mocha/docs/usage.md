# Qase Integration in Mocha

This guide provides comprehensive instructions for integrating Qase with Mocha.

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
- [Using Extra Reporters](#using-extra-reporters)
- [Running Tests](#running-tests)
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)
- [Complete Examples](#complete-examples)

- [See Also](#see-also)
---

## Adding QaseID

Link your automated tests to existing test cases in Qase by specifying the test case ID.

### Single ID

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Authentication', function() {
  it(qase(1, 'User can login with valid credentials'), function() {
    const result = login('user@example.com', 'password123');
    expect(result.success).to.equal(true);
  });
});
```

### Multiple IDs

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Cross-Browser Testing', function() {
  it(qase([1, 2, 3], 'Login works across Chrome, Firefox, and Edge'), function() {
    const result = login('user@example.com', 'password');
    expect(result.success).to.be.true;
  });
});
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Login Tests', function() {
  it('login test', function() {
    qase.title('User successfully logs in with valid credentials');

    const user = login('user@example.com', 'password123');
    expect(user).to.exist;
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
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Management', function() {
  it('create new user', function() {
    qase.fields({
      severity: 'critical',
      priority: 'high',
      layer: 'api',
      description: 'Verifies that admin can create a new user account via API',
      preconditions: 'Admin user is authenticated with valid token',
      postconditions: 'New user record exists in database',
    });

    const user = createUser({ email: 'newuser@example.com', role: 'user' });
    expect(user.id).to.exist;
    expect(user.email).to.equal('newuser@example.com');
  });
});
```

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Payment Tests', function() {
  it('process payment', function() {
    qase.suite('API Tests / Payment');

    const payment = processPayment({ amount: 100, currency: 'USD' });
    expect(payment.status).to.equal('success');
  });
});
```

### Nested Suites

```javascript
describe('User Tests', function() {
  it('user registration', function() {
    qase.suite('API Tests\\User Management\\Registration');

    const user = registerUser('newuser@example.com', 'SecurePass123');
    expect(user.verified).to.be.false;
  });
});
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Feature Tests', function() {
  it('test under development', function() {
    qase.ignore();

    const result = testNewFeature();
    expect(result).to.be.true;
  });
});
```

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Known Issues', function() {
  it('flaky test with known issue', function() {
    qase.mute();

    const result = performFlakyOperation();
    expect(result).to.equal('expected');
  });
});
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('File Processing Tests', function() {
  it('process document', function() {
    qase.attach({ paths: './fixtures/document.pdf' });

    const result = processDocument('./fixtures/document.pdf');
    expect(result.success).to.be.true;
  });
});
```

### Attach Multiple Files

```javascript
it('test with multiple attachments', function() {
  qase.attach({
    paths: [
      './fixtures/config.json',
      './fixtures/data.csv',
      './logs/execution.log',
    ],
  });

  const result = runTest();
  expect(result).to.be.true;
});
```

### Attach Content from Code

```javascript
it('test with log attachment', function() {
  const testLog = `
    Test execution log
    Step 1: Initialize test environment
    Step 2: Execute test scenario
    Step 3: Verify results
    Step 4: Clean up
  `;

  qase.attach({
    name: 'execution.log',
    content: testLog,
    contentType: 'text/plain',
  });

  expect(true).to.be.true;
});
```

### Attach JSON Data

```javascript
it('API test with response data', function() {
  const response = {
    statusCode: 200,
    body: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  qase.attach({
    name: 'api-response.json',
    content: JSON.stringify(response, null, 2),
    contentType: 'application/json',
  });

  expect(response.statusCode).to.equal(200);
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

Mocha steps use synchronous callbacks:

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Shopping Cart', function() {
  it('add item to cart', function() {
    qase.step('Navigate to product page', function() {
      const page = navigateTo('/products/laptop');
      expect(page.loaded).to.be.true;
    });

    qase.step('Add product to cart', function() {
      const result = addToCart('laptop-123');
      expect(result.success).to.be.true;
    });

    qase.step('Verify cart count', function() {
      const cartCount = getCartItemCount();
      expect(cartCount).to.equal(1);
    });
  });
});
```

### Nested Steps

```javascript
it('complete checkout process', function() {
  qase.step('Add items to cart', function() {
    qase.step('Add first item', function() {
      addToCart('laptop-123');
    });

    qase.step('Add second item', function() {
      addToCart('mouse-456');
    });
  });

  qase.step('Complete checkout', function() {
    qase.step('Enter shipping info', function() {
      setShippingAddress('123 Main St');
    });

    qase.step('Submit payment', function() {
      const result = submitPayment({ cardNumber: '4242424242424242' });
      expect(result.success).to.be.true;
    });
  });
});
```

### Steps with Expected Result

```javascript
it('form validation test', function() {
  qase.step(
    'Enter invalid email',
    function() {
      const result = validateEmail('invalid-email');
      expect(result.valid).to.be.false;
    },
    'Validation should fail for invalid email format',
  );

  qase.step(
    'Verify error message',
    function() {
      const error = getValidationError();
      expect(error).to.equal('Please enter a valid email');
    },
    'Error message displays correctly',
  );
});
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameterized Test

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Login with different users', function() {
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'user' },
    { username: 'guest', password: 'guest123', role: 'guest' },
  ];

  users.forEach(function(user) {
    it(`login as ${user.role}`, function() {
      qase.parameters({
        username: user.username,
        role: user.role,
      });

      const result = login(user.username, user.password);
      expect(result.success).to.be.true;
      expect(result.role).to.equal(user.role);
    });
  });
});
```

### Group Parameters

```javascript
describe('Cross-environment tests', function() {
  const environments = ['development', 'staging', 'production'];

  environments.forEach(function(env) {
    it(`test in ${env}`, function() {
      qase.parameters({
        environment: env,
        baseUrl: getBaseUrl(env),
      });

      qase.groupParameters({
        'Test Group': 'Environment Testing',
        'Priority': 'High',
      });

      const health = checkHealth(env);
      expect(health.status).to.equal('ok');
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

### Mocha Hooks with Qase

Integrate Qase reporting with Mocha's before/after hooks:

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Test Suite with Hooks', function() {
  before(function() {
    qase.comment('Suite-level setup: Database initialized with test data');
    initializeDatabase();
  });

  after(function() {
    qase.comment('Suite-level teardown: Test data cleaned up');
    cleanupDatabase();
  });

  beforeEach(function() {
    resetState();
  });

  afterEach(function() {
    if (this.currentTest.state === 'failed') {
      qase.attach({
        name: 'failure-log.txt',
        content: `Test failed: ${this.currentTest.title}`,
        contentType: 'text/plain',
      });
    }
  });

  it('test with hooks', function() {
    expect(getDatabaseState()).to.equal('ready');
  });
});
```

### BDD Interface Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', function() {
  describe('Login', function() {
    it(qase(1, 'should allow valid user to login'), function() {
      qase.fields({
        severity: 'critical',
        layer: 'e2e',
      });

      const result = login('user@example.com', 'password123');
      expect(result.success).to.be.true;
    });

    it(qase(2, 'should reject invalid credentials'), function() {
      qase.fields({
        severity: 'critical',
        layer: 'e2e',
      });

      const result = login('user@example.com', 'wrongpassword');
      expect(result.success).to.be.false;
      expect(result.error).to.equal('Invalid credentials');
    });
  });
});
```

### TDD Interface Example

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

suite('User Management', function() {
  test(qase(10, 'createUser returns new user object'), function() {
    qase.fields({
      layer: 'unit',
      priority: 'high',
    });

    const user = createUser('test@example.com');
    assert.ok(user);
    assert.equal(user.email, 'test@example.com');
  });

  test(qase(11, 'deleteUser removes user from system'), function() {
    const user = createUser('temp@example.com');
    const result = deleteUser(user.id);
    assert.equal(result, true);
  });
});
```

### Chai Assertion Patterns

```javascript
const { qase } = require('mocha-qase-reporter/mocha');
const { expect } = require('chai');

describe('API Endpoint Tests', function() {
  it(qase(20, 'GET /users returns user list'), function() {
    const response = request('GET', '/users');

    expect(response).to.have.status(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.have.lengthOf.at.least(1);
    expect(response.body[0]).to.have.property('id');
    expect(response.body[0]).to.have.property('email');
  });
});
```

### Root-Level Hooks

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

before(function() {
  qase.comment('Global setup: Initialize test environment');
  global.testEnv = initializeTestEnvironment();
});

after(function() {
  qase.comment('Global teardown: Clean up test environment');
  cleanupTestEnvironment(global.testEnv);
});

describe('Test Suite 1', function() {
  it('test 1', function() {
    expect(global.testEnv).to.exist;
  });
});

describe('Test Suite 2', function() {
  it('test 2', function() {
    expect(global.testEnv).to.exist;
  });
});
```

---

## Common Use Cases

### Report with Chai Assertions

```javascript
const { qase } = require('mocha-qase-reporter/mocha');
const { expect } = require('chai');

describe('User Service', function() {
  it(qase(30, 'creates user with valid data'), function() {
    qase.fields({
      layer: 'api',
      severity: 'critical',
    });

    const userData = {
      email: 'newuser@example.com',
      name: 'New User',
      role: 'user',
    };

    const user = createUser(userData);

    expect(user).to.be.an('object');
    expect(user).to.have.property('id');
    expect(user.email).to.equal(userData.email);
    expect(user.name).to.equal(userData.name);
    expect(user.role).to.equal(userData.role);

    qase.attach({
      name: 'created-user.json',
      content: JSON.stringify(user, null, 2),
      contentType: 'application/json',
    });
  });
});
```

### Use BDD Interface

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Feature: User Login', function() {
  context('Given a registered user', function() {
    context('When user enters valid credentials', function() {
      it(qase(31, 'Then user should be logged in'), function() {
        const result = login('user@example.com', 'password123');
        expect(result.authenticated).to.be.true;
      });
    });

    context('When user enters invalid credentials', function() {
      it(qase(32, 'Then user should see error message'), function() {
        const result = login('user@example.com', 'wrongpassword');
        expect(result.authenticated).to.be.false;
        expect(result.error).to.exist;
      });
    });
  });
});
```

### Timeout Handling with Qase

```javascript
describe('Long Running Operations', function() {
  it(qase(33, 'processes large dataset'), function() {
    this.timeout(10000); // Set timeout for specific test

    qase.parameters({
      timeout: '10000ms',
      datasetSize: 'large',
    });

    const startTime = Date.now();
    const result = processLargeDataset();
    const duration = Date.now() - startTime;

    qase.comment(`Processing completed in ${duration}ms`);

    expect(result.processed).to.be.true;
    expect(duration).to.be.below(10000);
  });
});
```

### Dynamic Test Generation with Reporting

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('API Endpoint Tests', function() {
  const endpoints = [
    { path: '/users', method: 'GET', qaseId: 40 },
    { path: '/posts', method: 'GET', qaseId: 41 },
    { path: '/comments', method: 'GET', qaseId: 42 },
  ];

  endpoints.forEach(function(endpoint) {
    it(qase(endpoint.qaseId, `${endpoint.method} ${endpoint.path} returns 200`), function() {
      qase.parameters({
        method: endpoint.method,
        path: endpoint.path,
      });

      const response = request(endpoint.method, endpoint.path);
      expect(response.statusCode).to.equal(200);

      qase.attach({
        name: `${endpoint.method}-${endpoint.path.replace('/', '')}.json`,
        content: JSON.stringify(response.body, null, 2),
        contentType: 'application/json',
      });
    });
  });
});
```

### Async/Await Pattern

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Async Operations', function() {
  it(qase(50, 'fetches user data asynchronously'), async function() {
    qase.step('Fetch user from API', function() {
      // Step implementation
    });

    const user = await fetchUserAsync(1);

    expect(user).to.exist;
    expect(user.id).to.equal(1);
  });
});
```

### Error Handling and Reporting

```javascript
describe('Error Scenarios', function() {
  it(qase(51, 'handles invalid input gracefully'), function() {
    qase.fields({
      severity: 'major',
      layer: 'unit',
    });

    try {
      const result = processInput(null);
      expect.fail('Should have thrown an error');
    } catch (error) {
      qase.attach({
        name: 'error-details.txt',
        content: error.stack,
        contentType: 'text/plain',
      });

      expect(error.message).to.equal('Invalid input');
    }
  });
});
```

### Data-Driven Testing with CSV

```javascript
const { qase } = require('mocha-qase-reporter/mocha');
const fs = require('fs');
const path = require('path');

describe('Email Validation', function() {
  const csvData = fs.readFileSync(path.join(__dirname, 'test-data.csv'), 'utf-8');
  const rows = csvData.split('\n').slice(1); // Skip header

  rows.forEach(function(row, index) {
    const [email, expected] = row.split(',');

    it(`validates email: ${email}`, function() {
      qase.parameters({
        email: email,
        expected: expected,
        row: index + 2,
      });

      const result = validateEmail(email.trim());
      expect(result.valid.toString()).to.equal(expected.trim());
    });
  });
});
```

### Integration with Database

```javascript
describe('Database Operations', function() {
  let db;

  before(function() {
    db = connectToDatabase();
  });

  after(function() {
    db.close();
  });

  it(qase(60, 'inserts record into database'), function() {
    qase.step('Insert user record', function() {
      const user = { email: 'dbuser@example.com', name: 'DB User' };
      const insertId = db.insert('users', user);

      qase.parameters({
        insertId: insertId,
        table: 'users',
      });

      expect(insertId).to.be.a('number');
    });

    qase.step('Verify record exists', function() {
      const user = db.findOne('users', { email: 'dbuser@example.com' });
      expect(user).to.exist;
      expect(user.name).to.equal('DB User');
    });
  });
});
```

---

## Using Extra Reporters

The Qase reporter supports additional reporters alongside the main Qase reporter. This is useful when you need multiple output formats (e.g., console output and JSON reports) without using `mocha-multi-reporters`, which can cause hanging issues in parallel mode.

### Configuration

You can configure extra reporters using the `extraReporters` option in the `qase.config.json` file or via command line:

#### Command Line

```bash
# Single extra reporter
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec

# Multiple extra reporters
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec,json

# With parallel execution
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec --parallel
```

#### qase.config.json

```json
{
  "extraReporters": [
    "spec",
    {
      "name": "json",
      "options": {
        "output": "results.json"
      }
    }
  ],
  "testops": {
    "api": {
      "token": "your-api-token"
    },
    "project": "your-project"
  }
}
```

### Parallel Mode Compatibility

Some reporters are incompatible with parallel mode and will be automatically filtered out with a warning:

- `markdown`
- `progress`
- `json-stream`
- `mocha-multi-reporters`
- `mocha-jenkins-reporter`
- `mocha-junit-reporter`

### Example Usage

```bash
# Basic usage with spec reporter
npm run test:extra

# Parallel execution with spec reporter
npm run test:extra-parallel

# Multiple reporters
QASE_MODE=testops npx mocha --reporter mocha-qase-reporter --reporter-options extraReporters=spec,json --parallel
```

---

## Running Tests

### Basic Execution

```bash
# Run all tests
QASE_MODE=testops npx mocha

# Run with spec pattern
QASE_MODE=testops npx mocha "tests/**/*.spec.js"
```

### With Environment Variables

```bash
# Enable Qase reporting
QASE_MODE=testops npx mocha

# Specify project code
QASE_MODE=testops QASE_TESTOPS_PROJECT=DEMO npx mocha

# Use specific API token
QASE_MODE=testops QASE_TESTOPS_API_TOKEN=your_token npx mocha
```

### With Test Plan

```bash
# Run tests linked to specific test plan
QASE_MODE=testops QASE_TESTOPS_PLAN_ID=123 npx mocha
```

### With Existing Test Run

```bash
# Report to existing test run
QASE_MODE=testops QASE_TESTOPS_RUN_ID=456 npx mocha
```

### Run with Filters

```bash
# Run tests matching grep pattern
QASE_MODE=testops npx mocha --grep "authentication"

# Run tests not matching grep pattern
QASE_MODE=testops npx mocha --grep "integration" --invert

# Run tests in specific file
QASE_MODE=testops npx mocha tests/auth.spec.js
```

### Parallel Execution

```bash
# Create test run
qasectl testops run create --project DEMO --token token --title 'Mocha test run'

# Save run ID
export QASE_TESTOPS_RUN_ID=$(< qase.env grep QASE_TESTOPS_RUN_ID | cut -d'=' -f2)

# Run tests in parallel
QASE_MODE=testops npx mocha --parallel

# Complete the run
qasectl testops run complete --project DEMO --token token --id $(echo $QASE_TESTOPS_RUN_ID)
```

---

## Troubleshooting

### Tests Not Appearing in Qase

**Issue:** Tests execute but results don't appear in Qase TestOps.

**Solutions:**

1. Verify `mode` is set to `TestOps` (not `off` or `report`)
2. Check API token has write permissions
3. Verify project code is correct
4. Check for errors in console output
5. Enable debug logging: set `debug: true` in configuration

```json
{
  "mode": "testops",
  "debug": true,
  "testops": {
    "project": "DEMO"
  }
}
```

### Reporter Not Configured

**Issue:** Error: "No reporter configured"

**Solution:** Add reporter configuration to `.mocharc.js`:

```javascript
module.exports = {
  reporter: 'mocha-qase-reporter',
  // ... other options
};
```

Or use command line:

```bash
npx mocha --reporter mocha-qase-reporter
```

### Attachments Not Uploading

**Issue:** Files not appearing in test results.

**Solutions:**

1. Verify file path exists and is readable
2. Check file size is within limits
3. Enable debug logging to see upload status

### This Context Issues with Arrow Functions

**Issue:** Cannot access `Qase` methods when using arrow functions.

**Solution:** Use regular `function()` syntax (not arrow functions) for Mocha tests:

```javascript
// Correct
it('test', function() {
  qase.title('Title');
  expect(true).to.be.true;
});

// Incorrect - arrow function loses this context
it('test', () => {
  qase.title('Title'); // May not work
  expect(true).to.be.true;
});
```

### Results Going to Wrong Test Cases

**Issue:** Test results appear under incorrect test case IDs.

**Solutions:**

1. Verify QaseID matches the test case ID in Qase
2. Check for duplicate IDs in your test suite
3. Verify you're using the correct project code
4. Ensure test names haven't changed significantly

### Timeout Issues

**Issue:** Long-running tests timing out.

**Solutions:**

1. Increase timeout for specific test:
   ```javascript
   it('long running test', function() {
     this.timeout(10000);
     // Test code
   });
   ```

2. Increase timeout globally in `.mocharc.js`:
   ```javascript
   module.exports = {
     timeout: 5000,
   };
   ```

### BDD vs TDD Interface Confusion

**Issue:** Tests not recognized with different interfaces.

**Solution:** Ensure you're using correct interface methods:

**BDD (default):**
- `describe()`, `context()`, `it()`, `specify()`
- `before()`, `after()`, `beforeEach()`, `afterEach()`

**TDD:**
- `suite()`, `test()`
- `setup()`, `teardown()`, `suiteSetup()`, `suiteTeardown()`

### Import Path Issues

**Issue:** Error: "Cannot find module 'mocha-qase-reporter/mocha'"

**Solution:** Ensure you're using the correct import path:

```javascript
// Correct
const { qase } = require('mocha-qase-reporter/mocha');

// Incorrect
const { qase } = require('mocha-qase-reporter');
```

### Parallel Mode Hangs

**Issue:** Tests hang when running in parallel mode.

**Solutions:**

1. Use extra reporters instead of mocha-multi-reporters
2. Create test run before parallel execution
3. Ensure all tests are independent (no shared state)

### Steps Not Showing in Qase

**Issue:** Step definitions not appearing in test results.

**Solution:** Ensure you're using `qase.step()` with proper syntax:

```javascript
qase.step('Step name', function() {
  // Step implementation
});
```

---

## Complete Examples

### Full Test Example

```javascript
const { qase } = require('mocha-qase-reporter');

describe('Complete Example', function() {
  it(qase([1, 2], 'Comprehensive test with all features'), async function() {
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
      Browser: 'Chrome',
      Environment: 'staging',
    });

    // Execute test with steps
    await qase.step('Navigate to registration page', async function() {
      // Navigation logic
      qase.attach({
        name: 'page-load.txt',
        content: 'Page loaded successfully',
        contentType: 'text/plain',
      });
    });

    await qase.step('Fill registration form', async function() {
      // Form filling logic
    });

    await qase.step('Submit form', async function() {
      // Submit logic
    });

    await qase.step('Verify email confirmation', async function() {
      // Verification logic
    });
  });
});
```

### Example Project Structure

```
my-project/
├── qase.config.json
├── test/
│   ├── auth.test.js
│   ├── checkout.test.js
│   └── ...
├── helpers/
│   └── ...
└── package.json
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
