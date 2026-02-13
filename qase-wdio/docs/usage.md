# Qase Integration in WebdriverIO

This guide provides comprehensive instructions for integrating Qase with WebdriverIO (WDIO), covering both Mocha/Jasmine and Cucumber frameworks.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

---

## Table of Contents

- [Adding QaseID](#adding-qaseid)
- [Adding Title](#adding-title)
- [Adding Fields](#adding-fields)
- [Adding Suite](#adding-suite)
- [Ignoring Tests](#ignoring-tests)
- [Adding Comments](#adding-comments)
- [Working with Attachments](#working-with-attachments)
- [Working with Steps](#working-with-steps)
- [Working with Parameters](#working-with-parameters)
- [Cucumber Integration](#cucumber-integration)
- [Running Tests](#running-tests)
- [Troubleshooting](#troubleshooting)
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)

---

## Adding QaseID

Link your WebdriverIO tests to existing test cases in Qase by specifying the test case ID.

### Mocha/Jasmine - Single ID

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Authentication', () => {
  it(qase(1, 'User can log in'), () => {
    expect(true).to.equal(true);
  });
});
```

### Mocha/Jasmine - Multiple IDs

```javascript
describe('User Management', () => {
  it(qase([1, 2, 3], 'CRUD operations'), () => {
    expect(true).to.equal(true);
  });
});
```

### Cucumber - Tags

```gherkin
Feature: User Authentication

  @QaseId=1
  Scenario: User can log in
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard

  @QaseId=2,3,4
  Scenario: Multiple test cases
    Given I am logged in
    When I perform actions
    Then I should see results
```

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title).

### Mocha/Jasmine

```javascript
import { qase } from 'wdio-qase-reporter';

it('Login test', () => {
  qase.title('User can successfully log in with valid email and password');
  browser.url('/login');
  expect(true).to.equal(true);
});
```

### Cucumber

```gherkin
@QaseId=1
@Title=User can successfully log in with valid credentials
Scenario: Login test
  Given I am on the login page
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

### Mocha/Jasmine Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('Critical login test', () => {
  qase.fields({
    description: 'Verifies that users can log in with valid credentials',
    preconditions: 'User account must exist in the system',
    severity: 'critical',
    priority: 'high',
    layer: 'e2e',
  });

  browser.url('/login');
  expect(true).to.equal(true);
});
```

### Cucumber Example

Cucumber does not support fields via tags. Use fields in step definitions:

```javascript
// In step definition file
import { qase } from 'wdio-qase-reporter';

Given('I have set test metadata', () => {
  qase.fields({
    severity: 'high',
    priority: 'critical',
  });
});
```

---

## Adding Suite

Organize tests into suites and sub-suites.

### Simple Suite

```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with suite', () => {
  qase.suite('Authentication');
  expect(true).to.equal(true);
});
```

### Nested Suites

```javascript
it('Test with nested suite', () => {
  qase.suite('Authentication\tLogin\tValid Credentials');
  expect(true).to.equal(true);
});
```

### Cucumber

```gherkin
@QaseId=1
@Suite=Authentication
Scenario: Login test
  Given I am on the login page
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase.

### Mocha/Jasmine

```javascript
import { qase } from 'wdio-qase-reporter';

it('Ignored test', () => {
  qase.ignore();
  expect(true).to.equal(true);
});
```

### Cucumber

Cucumber does not support ignore functionality via tags. Filter tests using standard Cucumber tag filtering.

---

## Adding Comments

Attach comments to test results in Qase.

### Mocha/Jasmine

```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with comment', () => {
  qase.comment('This test verifies edge case behavior for special characters in input');
  expect(true).to.equal(true);
});
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with file attachment', () => {
  qase.attach({ paths: '/path/to/log.txt' });
  expect(true).to.equal(true);
});
```

### Attach Multiple Files

```javascript
it('Test with multiple attachments', () => {
  qase.attach({
    paths: [
      '/path/to/log1.txt',
      '/path/to/log2.txt',
      '/path/to/screenshot.png',
    ]
  });
  expect(true).to.equal(true);
});
```

### Attach Content from Code

```javascript
it('Test with content attachment', async () => {
  const screenshot = await browser.takeScreenshot();

  qase.attach({
    name: 'screenshot.png',
    content: screenshot,
    type: 'image/png',
  });

  expect(true).to.equal(true);
});
```

### Attach to Specific Step

```javascript
it('Test with step attachments', async () => {
  await qase.step('Capture state', async (step) => {
    const screenshot = await browser.takeScreenshot();

    step.attach({
      name: 'current-state.png',
      content: screenshot,
      type: 'image/png',
    });
  });
});
```

### Automatic WebDriver Screenshots

Configure automatic screenshot attachment in `wdio.conf.js`:

```javascript
exports.config = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverScreenshotsReporting: false,  // Enable auto-screenshots
  }]],
};
```

---

## Working with Steps

Define test steps for detailed reporting in Qase.

### Basic Steps

```javascript
import { qase } from 'wdio-qase-reporter';

it('Test with steps', async () => {
  await qase.step('Navigate to login page', async () => {
    await browser.url('/login');
  });

  await qase.step('Enter credentials', async () => {
    await $('#email').setValue('user@example.com');
    await $('#password').setValue('password123');
  });

  await qase.step('Click login button', async () => {
    await $('#login-button').click();
  });

  await qase.step('Verify successful login', async () => {
    await expect($('#dashboard')).toExist();
  });
});
```

### Nested Steps

```javascript
it('Test with nested steps', async () => {
  await qase.step('Complete registration flow', async (s1) => {
    await s1.step('Fill registration form', async (s2) => {
      await s2.step('Enter email', async () => {
        await $('#email').setValue('user@example.com');
      });

      await s2.step('Enter password', async () => {
        await $('#password').setValue('password123');
      });
    });

    await s1.step('Submit form', async () => {
      await $('#submit-button').click();
    });

    await s1.step('Verify registration', async () => {
      await expect($('#success-message')).toExist();
    });
  });
});
```

### Disable Automatic WebDriver Steps

By default, WebDriver commands are automatically reported as steps. To disable this:

```javascript
// wdio.conf.js
exports.config = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverStepsReporting: true,  // Only report custom steps
  }]],
};
```

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameters

```javascript
import { qase } from 'wdio-qase-reporter';

it('Parameterized test', () => {
  qase.parameters({
    'browser': 'chrome',
    'environment': 'staging',
    'resolution': '1920x1080',
  });

  expect(true).to.equal(true);
});
```

### Group Parameters

```javascript
it('Test with grouped parameters', () => {
  qase.parameters({
    'browser': 'chrome',
    'os': 'macOS',
    'environment': 'staging',
  });

  qase.groupParameters({
    'environment': 'staging',
  });

  expect(true).to.equal(true);
});
```

---

## Cucumber Integration

WebdriverIO Qase reporter fully supports Cucumber integration.

### Enable Cucumber Support

```javascript
// wdio.conf.js
const WDIOQaseReporter = require('wdio-qase-reporter').default;

exports.config = {
  reporters: [[WDIOQaseReporter, {
    useCucumber: true,  // Enable Cucumber support
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false,
  }]],
  framework: 'cucumber',
  // ... other options
};
```

### Feature File Example

```gherkin
Feature: User Authentication

  @QaseId=1
  @Title=User can log in with valid credentials
  @Suite=Authentication
  Scenario: Successful login
    Given I am on the login page
    When I enter email "user@example.com"
    And I enter password "password123"
    And I click the login button
    Then I should see the dashboard

  @QaseId=2,3
  Scenario: Login with multiple test cases
    Given I am on the login page
    When I enter invalid credentials
    Then I should see an error message
```

### Supported Cucumber Tags

- `@QaseId=<id>` - Set Qase test case ID(s). Multiple IDs separated by commas: `@QaseId=1,2,3`
- `@Title=<title>` - Set custom test title
- `@Suite=<suite>` - Set test suite name

### Cucumber Step Definitions

```javascript
// step-definitions/login.steps.js
import { Given, When, Then } from '@wdio/cucumber-framework';

Given('I am on the login page', async () => {
  await browser.url('/login');
});

When('I enter email {string}', async (email) => {
  await $('#email').setValue(email);
});

When('I enter password {string}', async (password) => {
  await $('#password').setValue(password);
});

When('I click the login button', async () => {
  await $('#login-button').click();
});

Then('I should see the dashboard', async () => {
  await expect($('#dashboard')).toExist();
});
```

---

## Running Tests

### Basic Execution

```bash
# Run all tests
QASE_MODE=testops npx wdio run wdio.conf.js

# Run specific spec file
QASE_MODE=testops npx wdio run wdio.conf.js --spec ./test/specs/login.spec.js

# Run specific suite
QASE_MODE=testops npx wdio run wdio.conf.js --suite smoke
```

### Cucumber

```bash
# Run all Cucumber features
QASE_MODE=testops npx wdio run wdio.conf.js

# Run specific feature file
QASE_MODE=testops npx wdio run wdio.conf.js --spec ./test/features/login.feature

# Run scenarios with specific tag
QASE_MODE=testops npx wdio run wdio.conf.js --cucumberOpts.tagExpression='@smoke'
```

### Multiple Browsers

Configure in `wdio.conf.js`:

```javascript
exports.config = {
  capabilities: [
    {
      browserName: 'chrome',
    },
    {
      browserName: 'firefox',
    },
  ],
};
```

### Parallel Execution

```bash
# Run with max instances
QASE_MODE=testops npx wdio run wdio.conf.js --maxInstances 5
```

Configure in `wdio.conf.js`:

```javascript
exports.config = {
  maxInstances: 5,
};
```

### With Environment Variables

```bash
# Override configuration
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
npx wdio run wdio.conf.js
```

---

## Troubleshooting

### Reporter Not Found

**Problem:** Reporter not loading or tests run without Qase reporting.

**Solutions:**

1. **Verify installation:**
   ```bash
   npm list wdio-qase-reporter
   ```

2. **Check wdio.conf.js configuration:**
   ```javascript
   const WDIOQaseReporter = require('wdio-qase-reporter').default;

   exports.config = {
     reporters: [[WDIOQaseReporter, {}]],
   };
   ```

3. **Ensure hooks are configured:**
   ```javascript
   const { beforeRunHook, afterRunHook } = require('wdio-qase-reporter');

   exports.config = {
     onPrepare: async function() {
       await beforeRunHook();
     },
     onComplete: async function() {
       await afterRunHook();
     },
   };
   ```

### Tests Not Appearing in Qase

**Problem:** Tests run successfully but don't appear in Qase TestOps.

**Solutions:**

1. **Verify mode is set:**
   ```bash
   echo $QASE_MODE  # Should output: testops
   ```

2. **Check configuration file:**
   ```bash
   cat qase.config.json
   ```

3. **Enable debug logging:**
   ```json
   {
     "debug": true,
     "mode": "testops"
   }
   ```

4. **Verify hooks are called:**
   - Check console output for "Qase" messages
   - Ensure `beforeRunHook` and `afterRunHook` are configured

### Steps Not Reporting

**Problem:** `qase.step()` calls not appearing in Qase results.

**Solutions:**

1. **Ensure async/await is used:**
   ```javascript
   // Correct
   await qase.step('Step name', async () => { ... });

   // Incorrect
   qase.step('Step name', () => { ... });
   ```

2. **Check if WebDriver steps are disabled:**
   ```javascript
   // If you want only custom steps
   exports.config = {
     reporters: [[WDIOQaseReporter, {
       disableWebdriverStepsReporting: true,
     }]],
   };
   ```

### Cucumber Tags Not Working

**Problem:** Cucumber `@QaseId` tags not linking to test cases.

**Solutions:**

1. **Verify `useCucumber` is enabled:**
   ```javascript
   exports.config = {
     reporters: [[WDIOQaseReporter, {
       useCucumber: true,
     }]],
   };
   ```

2. **Check tag syntax:**
   ```gherkin
   # Correct
   @QaseId=1
   Scenario: Test

   # Incorrect
   @QaseID=1
   @qaseId=1
   ```

3. **Ensure framework is set to cucumber:**
   ```javascript
   exports.config = {
     framework: 'cucumber',
   };
   ```

### Attachments Not Uploading

**Problem:** Screenshots or files not appearing in Qase.

**Solutions:**

1. **Verify file path exists:**
   ```bash
   ls -la /path/to/file
   ```

2. **Check attachment type:**
   ```javascript
   qase.attach({
     name: 'screenshot.png',
     content: screenshot,
     type: 'image/png',  // Must specify type for content
   });
   ```

3. **Enable auto-screenshots:**
   ```javascript
   exports.config = {
     reporters: [[WDIOQaseReporter, {
       disableWebdriverScreenshotsReporting: false,
     }]],
   };
   ```

### Browser Launch Issues

**Problem:** Browser fails to start or connection issues.

**Solutions:**

1. **Check browser driver installation:**
   ```bash
   npx wdio config  # Re-run config wizard
   ```

2. **Verify browser is installed:**
   ```bash
   which google-chrome
   which firefox
   ```

3. **Use headless mode:**
   ```javascript
   exports.config = {
     capabilities: [{
       browserName: 'chrome',
       'goog:chromeOptions': {
         args: ['--headless', '--disable-gpu'],
       },
     }],
   };
   ```

---

## Integration Patterns

### Pattern 1: Page Object Model with Qase

```javascript
// pageobjects/Login.page.js
import Page from './Page';
import { qase } from 'wdio-qase-reporter';

class LoginPage extends Page {
  get inputEmail() { return $('#email'); }
  get inputPassword() { return $('#password'); }
  get btnSubmit() { return $('#login-button'); }

  async login(email, password) {
    await qase.step('Enter email', async () => {
      await this.inputEmail.setValue(email);
    });

    await qase.step('Enter password', async () => {
      await this.inputPassword.setValue(password);
    });

    await qase.step('Click login button', async () => {
      await this.btnSubmit.click();
    });
  }

  open() {
    return super.open('/login');
  }
}

export default new LoginPage();

// test/specs/login.spec.js
import { qase } from 'wdio-qase-reporter';
import LoginPage from '../pageobjects/Login.page';

describe('Authentication', () => {
  it(qase(1, 'User can log in'), async () => {
    await LoginPage.open();
    await LoginPage.login('user@example.com', 'password123');
    await expect($('#dashboard')).toExist();
  });
});
```

### Pattern 2: Service-Based Architecture

```javascript
// services/api.service.js
import { qase } from 'wdio-qase-reporter';

class ApiService {
  async makeRequest(endpoint, data) {
    return await qase.step(\`API: \${endpoint}\`, async (step) => {
      const response = await browser.call(async () => {
        return await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      });

      step.attach({
        name: 'api-response.json',
        content: JSON.stringify(response, null, 2),
        type: 'application/json',
      });

      return response;
    });
  }
}

export default new ApiService();
```

### Pattern 3: Hooks with Reporting

```javascript
// wdio.conf.js
import { qase } from 'wdio-qase-reporter';

exports.config = {
  beforeTest: async function(test, context) {
    await qase.step('Setup: Clear browser storage', async () => {
      await browser.deleteAllCookies();
      await browser.execute(() => localStorage.clear());
    });
  },

  afterTest: async function(test, context, { passed }) {
    if (!passed) {
      await qase.step('Teardown: Capture failure screenshot', async (step) => {
        const screenshot = await browser.takeScreenshot();
        step.attach({
          name: 'failure-screenshot.png',
          content: screenshot,
          type: 'image/png',
        });
      });
    }
  },
};
```

---

## Common Use Cases

### Use Case 1: Basic Mocha Test with QaseID

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Smoke Tests', () => {
  it(qase(101, 'Homepage loads'), async () => {
    await browser.url('/');
    await expect($('#header')).toExist();
  });
});
```

### Use Case 2: Cucumber Feature with Tags

```gherkin
Feature: Shopping Cart

  @QaseId=201
  Scenario: Add item to cart
    Given I am on the product page
    When I click add to cart
    Then I should see the item in my cart
```

### Use Case 3: Visual Testing with Screenshots

```javascript
it(qase(301, 'Visual: Login page'), async () => {
  await browser.url('/login');

  const screenshot = await browser.takeScreenshot();

  qase.attach({
    name: 'login-page.png',
    content: screenshot,
    type: 'image/png',
  });

  await expect($('#login-form')).toExist();
});
```

### Use Case 4: API Integration Test

```javascript
it(qase(401, 'API: Fetch user data'), async () => {
  await browser.url('/dashboard');

  const apiResponse = await browser.call(async () => {
    return await fetch('https://api.example.com/user', {
      headers: { Authorization: 'Bearer token' },
    });
  });

  qase.attach({
    name: 'api-response.json',
    content: JSON.stringify(apiResponse, null, 2),
    type: 'application/json',
  });

  await expect($('#user-name')).toHaveText('John Doe');
});
```

### Use Case 5: Cross-Browser Testing

Configure multiple browsers:

```javascript
// wdio.conf.js
exports.config = {
  capabilities: [
    { browserName: 'chrome' },
    { browserName: 'firefox' },
    { browserName: 'safari' },
  ],
};

// Test automatically runs in all browsers
it(qase(501, 'Cross-browser test'), async () => {
  qase.parameters({ browser: browser.capabilities.browserName });
  await browser.url('/');
  await expect($('#header')).toExist();
});
```

### Use Case 6: Mobile Viewport Testing

```javascript
it(qase(601, 'Mobile: Responsive layout'), async () => {
  await browser.setWindowSize(375, 667);

  qase.parameters({
    viewport: 'mobile',
    width: 375,
    height: 667,
  });

  await browser.url('/');
  await expect($('#mobile-menu')).toExist();
});
```

### Use Case 7: File Upload Testing

```javascript
it(qase(701, 'File upload'), async () => {
  await browser.url('/upload');

  await qase.step('Select file', async () => {
    const filePath = require('path').join(__dirname, '../fixtures/test-file.pdf');
    await $('#file-input').setValue(filePath);
  });

  await qase.step('Upload file', async () => {
    await $('#upload-button').click();
  });

  await qase.step('Verify upload success', async () => {
    await expect($('#upload-success')).toExist();
  });
});
```

### Use Case 8: Authentication Flow with Steps

```javascript
it(qase(801, 'Complete authentication flow'), async () => {
  qase.fields({ severity: 'critical', priority: 'high' });

  await qase.step('Navigate to login', async () => {
    await browser.url('/login');
  });

  await qase.step('Enter credentials', async () => {
    await $('#email').setValue('user@example.com');
    await $('#password').setValue('password123');
  });

  await qase.step('Submit login', async () => {
    await $('#login-button').click();
  });

  await qase.step('Verify dashboard', async () => {
    await expect($('#dashboard')).toExist();
  });
});
```

### Use Case 9: Parallel Execution

```javascript
// wdio.conf.js
exports.config = {
  maxInstances: 5,
  capabilities: [{
    browserName: 'chrome',
    maxInstances: 5,
  }],
};

// Tests run in parallel automatically
describe('Parallel Tests', () => {
  it(qase(901, 'Test 1'), async () => {
    await browser.url('/page1');
  });

  it(qase(902, 'Test 2'), async () => {
    await browser.url('/page2');
  });
});
```

### Use Case 10: CI/CD Integration

**.github/workflows/wdio.yml:**
```yaml
name: WDIO Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
        env:
          QASE_MODE: testops
          QASE_TESTOPS_PROJECT: DEMO
          QASE_TESTOPS_API_TOKEN: \${{ secrets.QASE_TOKEN }}
```

**package.json:**
```json
{
  "scripts": {
    "test": "wdio run wdio.conf.js"
  }
}
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [WebdriverIO Documentation](https://webdriver.io/)
- [Example Tests](../../examples/multiProject/wdio/)
