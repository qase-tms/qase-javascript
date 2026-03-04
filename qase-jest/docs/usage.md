# Qase Integration in Jest

This guide provides comprehensive instructions for integrating Qase with Jest.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

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
const { qase } = require('jest-qase-reporter/jest');

describe('Authentication', () => {
  test(qase(1, 'User can login'), () => {
    expect(true).toBe(true);
  });
});
```

### Multiple IDs

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Authentication', () => {
  test(qase([1, 2, 3], 'Test covering multiple scenarios'), () => {
    // This test result will be reported to test cases 1, 2, and 3
    expect(true).toBe(true);
  });
});
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test method name', () => {
  qase.title('User can successfully login with valid credentials');
  expect(true).toBe(true);
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
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Login test'), () => {
  qase.fields({
    severity: 'critical',
    priority: 'high',
    layer: 'api',
    description: 'Verify user authentication flow',
    preconditions: 'User must be registered in the system',
    postconditions: 'User session is created',
  });

  // Test logic
  expect(true).toBe(true);
});
```

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Login test', () => {
  qase.suite('Authentication');
  expect(true).toBe(true);
});
```

### Nested Suites

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Login test', () => {
  qase.suite('Authentication\tLogin\tPositive Cases');
  expect(true).toBe(true);
});
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('This test runs but is not reported', () => {
  qase.ignore();
  expect(true).toBe(true);
});
```

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

```javascript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Known failing test'), () => {
  qase.mute();
  expect(false).toBe(true); // This failure won't affect the run status
});
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with file attachment', () => {
  // Single file
  qase.attach({ paths: '/path/to/screenshot.png' });

  // Multiple files
  qase.attach({
    paths: ['/path/to/log.txt', '/path/to/screenshot.png']
  });

  expect(true).toBe(true);
});
```

### Attach Content from Code

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with content attachment', () => {
  qase.attach({
    name: 'execution-log.txt',
    content: 'Test execution details...',
    contentType: 'text/plain',
  });

  expect(true).toBe(true);
});
```

### Attach Binary Content

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with screenshot', () => {
  const screenshotBuffer = Buffer.from('...', 'base64');

  qase.attach({
    name: 'screenshot.png',
    content: screenshotBuffer,
    contentType: 'image/png',
  });

  expect(true).toBe(true);
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

### Using Async Function

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with steps', async () => {
  await qase.step('Initialize environment', async () => {
    // Setup code
  });

  await qase.step('Execute main test flow', async () => {
    // Test logic
  });

  await qase.step('Verify results', async () => {
    // Assertions
    expect(true).toBe(true);
  });
});
```

### Nested Steps

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with nested steps', async () => {
  await qase.step('Parent step', async () => {
    await qase.step('Child step 1', async () => {
      // Nested logic
    });

    await qase.step('Child step 2', async () => {
      // More nested logic
    });
  });
});
```

### Steps with Expected Result

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with expected results', async () => {
  await qase.step(
    'Click login button',
    async () => {
      // Click action
    },
    'Button should be clicked',
    'Button data'
  );
});
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameterized Test

```javascript
const { qase } = require('jest-qase-reporter/jest');

const browsers = ['Chrome', 'Firefox', 'Safari'];

browsers.forEach((browser) => {
  test(`Test on ${browser}`, () => {
    qase.title('Browser compatibility test');
    qase.parameters({ Browser: browser });

    // Test logic
    expect(true).toBe(true);
  });
});
```

### Group Parameters

```javascript
const { qase } = require('jest-qase-reporter/jest');

const testData = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
];

testData.forEach(({ username, password }) => {
  test(`Login with ${username}`, () => {
    qase.title('User login test');
    qase.groupParameters({
      Username: username,
      Password: password,
    });

    // Test logic
    expect(true).toBe(true);
  });
});
```

### Using Jest test.each

```javascript
const { qase } = require('jest-qase-reporter/jest');

test.each([
  ['Chrome', 'Windows'],
  ['Firefox', 'macOS'],
  ['Safari', 'macOS'],
])('Test on %s - %s', (browser, os) => {
  qase.title('Cross-platform test');
  qase.parameters({
    Browser: browser,
    OS: os,
  });

  expect(true).toBe(true);
});
```

---

## Multi-Project Support

Send test results to multiple Qase projects simultaneously with different test case IDs for each project.

For detailed configuration, examples, and troubleshooting, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Running Tests

### Basic Execution

```bash
# Run all tests
npx jest

# Run with Qase reporting enabled
QASE_MODE=testops npx jest
```

### With Environment Variables

```bash
# Set project and token via environment
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
npx jest
```

### With Test Plan

```bash
# Execute tests from a specific test plan
QASE_MODE=testops \
QASE_TESTOPS_PLAN_ID=123 \
npx jest
```

### With Existing Test Run

```bash
# Report results to an existing test run
QASE_MODE=testops \
QASE_TESTOPS_RUN_ID=456 \
npx jest
```

### Run Specific Tests

```bash
# Run specific test file
npx jest path/to/test.spec.js

# Run tests matching pattern
npx jest --testPathPattern="auth"

# Run tests in specific describe block
npx jest --testNamePattern="Login"
```

---

## Integration Patterns

### Jest Lifecycle Hooks

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Test Suite', () => {
  beforeAll(async () => {
    await qase.step('Suite setup', async () => {
      // Setup code
    });
  });

  afterAll(async () => {
    await qase.step('Suite teardown', async () => {
      // Cleanup code
    });
  });

  beforeEach(async () => {
    await qase.step('Test setup', async () => {
      // Before each test
    });
  });

  afterEach(async () => {
    await qase.step('Test cleanup', async () => {
      // After each test
    });
  });

  test(qase(1, 'Test case'), async () => {
    await qase.step('Test execution', async () => {
      expect(true).toBe(true);
    });
  });
});
```

### Jest Config Reporter Options

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'DEMO',
          run: {
            title: 'Automated Jest Run',
            description: 'CI/CD execution',
            complete: true,
          },
          batch: {
            size: 100,
          },
        },
      },
    ],
  ],
};
```

### Puppeteer Integration

```javascript
const { qase } = require('jest-qase-reporter/jest');
const puppeteer = require('puppeteer');

describe('Puppeteer Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test(qase(1, 'Navigate and screenshot'), async () => {
    await qase.step('Navigate to page', async () => {
      await page.goto('https://example.com');
    });

    await qase.step('Take screenshot', async () => {
      const screenshot = await page.screenshot();
      qase.attach({
        name: 'page-screenshot.png',
        content: screenshot,
        contentType: 'image/png',
      });
    });

    expect(await page.title()).toBe('Example Domain');
  });
});
```

---

## Common Use Cases

### Report a Smoke Test Suite

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Smoke Tests', () => {
  test(qase(101, 'Application loads'), () => {
    qase.suite('Smoke Tests');
    qase.fields({
      severity: 'critical',
      priority: 'high',
      layer: 'e2e',
    });

    expect(true).toBe(true);
  });

  test(qase(102, 'User can access homepage'), () => {
    qase.suite('Smoke Tests');
    qase.fields({
      severity: 'critical',
      priority: 'high',
      layer: 'e2e',
    });

    expect(true).toBe(true);
  });
});
```

### Attach Screenshot on Failure

```javascript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Test with failure screenshot'), async () => {
  try {
    // Test logic that might fail
    expect(false).toBe(true);
  } catch (error) {
    // Capture and attach screenshot on failure
    const screenshot = Buffer.from('...', 'base64');
    qase.attach({
      name: 'failure-screenshot.png',
      content: screenshot,
      contentType: 'image/png',
    });
    throw error;
  }
});
```

### Run Subset with Qase Test Plan

```javascript
// Use qasectl to filter tests by test plan
// See: https://github.com/qase-tms/qasectl

// Run tests:
// npx jest --testNamePattern="$(cat qase.env | grep QASE_FILTERED_RESULTS | cut -d'=' -f2)"
```

### Report API Test Results

```javascript
const { qase } = require('jest-qase-reporter/jest');
const axios = require('axios');

describe('API Tests', () => {
  test(qase(201, 'GET /users returns 200'), async () => {
    qase.suite('API Tests');
    qase.fields({ layer: 'api' });

    await qase.step('Send GET request', async () => {
      const response = await axios.get('https://api.example.com/users');

      qase.attach({
        name: 'response.json',
        content: JSON.stringify(response.data, null, 2),
        contentType: 'application/json',
      });

      expect(response.status).toBe(200);
    });
  });
});
```

### Organize Tests by Feature

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Authentication Feature', () => {
  test(qase(1, 'User registration'), () => {
    qase.suite('Authentication\tRegistration');
    qase.fields({ priority: 'high' });
    expect(true).toBe(true);
  });

  test(qase(2, 'User login'), () => {
    qase.suite('Authentication\tLogin');
    qase.fields({ priority: 'high' });
    expect(true).toBe(true);
  });

  test(qase(3, 'Password reset'), () => {
    qase.suite('Authentication\tPassword Reset');
    qase.fields({ priority: 'medium' });
    expect(true).toBe(true);
  });
});
```

---

## Troubleshooting

### Tests Not Appearing in Qase

**Problem:** Tests run successfully but results are not visible in Qase.

**Solutions:**

1. Verify `mode` is set to `TestOps`:
   ```bash
   QASE_MODE=testops npx jest
   ```

2. Check API token has write permissions:
   - Go to https://app.qase.io/apps
   - Regenerate token if needed

3. Verify project code is correct:
   ```javascript
   // Should match your project code in Qase
   TestOps: {
     project: 'DEMO', // Check this matches your project
   }
   ```

4. Enable debug logging:
   ```javascript
   {
     debug: true,
     TestOps: { ... }
   }
   ```

### Reporter Not Found Error

**Problem:** `Cannot find module 'jest-qase-reporter'`

**Solutions:**

1. Install the package:
   ```bash
   npm install --save-dev jest-qase-reporter
   ```

2. Verify jest.config.js reporter configuration:
   ```javascript
   reporters: [
     'default',
     ['jest-qase-reporter', { /* config */ }],
   ]
   ```

### Qase Object Not Available in Tests

**Problem:** `Qase is not defined` or `Cannot read property 'title' of undefined`

**Solutions:**

1. Import Qase at the top of your test file:
   ```javascript
   const { qase } = require('jest-qase-reporter/jest');
   ```

2. Ensure correct import path (note `/jest` suffix):
   ```javascript
   // Correct
   require('jest-qase-reporter/jest');

   // Incorrect
   require('jest-qase-reporter');
   ```

### Results Not Grouped Correctly

**Problem:** Test results appear in separate test runs instead of grouping together.

**Solutions:**

1. Use `--runInBand` to run tests serially:
   ```bash
   npx jest --runInBand
   ```

2. Or configure jest for serial execution:
   ```javascript
   // jest.config.js
   module.exports = {
     maxWorkers: 1,
   };
   ```

### Attachments Not Uploading

**Problem:** Files or content attachments are not visible in Qase.

**Solutions:**

1. Verify file path exists and is readable:
   ```javascript
   const fs = require('fs');
   if (fs.existsSync('/path/to/file')) {
     qase.attach({ paths: '/path/to/file' });
   }
   ```

2. Check file size (large files may take time to upload)

3. Enable debug logging to see upload status:
   ```javascript
   { debug: true }
   ```

4. Verify content type is specified:
   ```javascript
   qase.attach({
     name: 'file.txt',
     content: 'content',
     contentType: 'text/plain', // Always specify
   });
   ```

### Steps Not Appearing

**Problem:** Test steps are not visible in Qase test results.

**Solutions:**

1. Ensure you're using async/await with steps:
   ```javascript
   // Correct
   await qase.step('Step name', async () => {});

   // Incorrect
   qase.step('Step name', () => {});
   ```

2. Verify test function is async:
   ```javascript
   // Correct
   test('test', async () => {
     await qase.step('step', async () => {});
   });

   // Incorrect
   test('test', () => {
     qase.step('step', async () => {});
   });
   ```

---

## Complete Examples

### Full Test Example

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Complete Example', () => {
  test(qase([1, 2], 'Comprehensive test with all features'), async () => {
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
    await qase.step('Navigate to registration page', async () => {
      // Navigation logic
      qase.attach({
        name: 'page-load.txt',
        content: 'Page loaded successfully',
        contentType: 'text/plain',
      });
    });

    await qase.step('Fill registration form', async () => {
      // Form filling logic
    });

    await qase.step('Submit form', async () => {
      // Submit logic
    });

    await qase.step('Verify registration success', async () => {
      // Verification logic
      expect(true).toBe(true);
    });

    // Add final comment
    qase.comment('Test completed successfully with all validations passing');
  });
});
```

### Example Project Structure

```
my-project/
├── qase.config.json
├── jest.config.js
├── tests/
│   ├── auth.test.js
│   ├── api.test.js
│   └── integration.test.js
└── package.json
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
