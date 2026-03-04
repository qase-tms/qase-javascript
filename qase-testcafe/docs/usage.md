# Qase Integration in TestCafe

This guide provides comprehensive instructions for integrating Qase with TestCafe.

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
- [Running Tests](#running-tests)
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)
- [Complete Examples](#complete-examples)

- [See Also](#see-also)
---

## Adding QaseID

Link your TestCafe tests to existing test cases in Qase by specifying the test case ID using the `qase.id()` method with `.meta()`.

### Single ID

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture\`User Authentication\`
  .page\`https://example.com\`;

test.meta(qase.id(1).create())(
  'User can log in',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

### Multiple IDs

```javascript
test.meta(qase.id([1, 2, 3]).create())(
  'Test linked to multiple cases',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test.meta(qase.title('User can successfully log in with valid credentials').create())(
  'Login test',
  async (t) => {
    await t.expect(true).ok();
  }
);
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
import { qase } from 'testcafe-reporter-qase/qase';

test.meta(
  qase.fields({
    'severity': 'critical',
    'priority': 'high',
    'layer': 'e2e',
    'description': 'Tests the core login functionality',
    'preconditions': 'User account must exist in the database',
  }).create()
)(
  'Login test with fields',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

---

## Adding Suite

Organize tests into suites and sub-suites. TestCafe uses fixture for organization, but you can also set suite explicitly:

### Using Fixture (Recommended)

```javascript
fixture\`Authentication Suite\`
  .page\`https://example.com\`;

test('Login test', async (t) => {
  // This test belongs to "Authentication Suite"
  await t.expect(true).ok();
});
```

### Explicit Suite

```javascript
test.meta(qase.suite('Authentication').create())(
  'Login test',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

### Nested Suites

```javascript
test.meta(qase.suite('Authentication\tLogin\tValid Credentials').create())(
  'Login with email and password',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test.meta(qase.ignore().create())(
  'Ignored test',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test.meta(qase.id(1).create())(
  'Known failing test',
  async (t) => {
    qase.mute();
    await t.expect(false).ok(); // This failure won't affect the run status
  }
);
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with file attachment', async (t) => {
  qase.attach({ paths: '/path/to/log.txt' });
  await t.expect(true).ok();
});
```

### Attach Multiple Files

```javascript
test('Test with multiple attachments', async (t) => {
  qase.attach({
    paths: [
      '/path/to/log1.txt',
      '/path/to/log2.txt',
      '/path/to/screenshot.png',
    ]
  });
  await t.expect(true).ok();
});
```

### Attach Content from Code

```javascript
test('Test with content attachment', async (t) => {
  qase.attach({
    name: 'test-data.json',
    content: JSON.stringify({ key: 'value' }),
    type: 'application/json',
  });
  await t.expect(true).ok();
});
```

### Attach TestCafe Screenshot

```javascript
test('Test with screenshot', async (t) => {
  const screenshot = await t.takeScreenshot();

  qase.attach({
    name: 'page-screenshot.png',
    content: screenshot,
    type: 'image/png',
  });

  await t.expect(true).ok();
});
```

### Attach to Specific Step

```javascript
test('Test with step attachments', async (t) => {
  await qase.step('Capture state', async (step) => {
    const screenshot = await t.takeScreenshot();

    step.attach({
      name: 'current-state.png',
      content: screenshot,
      type: 'image/png',
    });
  });
});
```

---

## Working with Steps

Define test steps for detailed reporting in Qase.

### Basic Steps

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

  await qase.step('Click login button', async () => {
    await t.click('#login-button');
  });

  await qase.step('Verify successful login', async () => {
    await t.expect('#dashboard').exists;
  });
});
```

### Nested Steps

```javascript
test('Test with nested steps', async (t) => {
  await qase.step('User registration flow', async (s1) => {
    await s1.step('Fill registration form', async (s2) => {
      await s2.step('Enter email', async () => {
        await t.typeText('#email', 'user@example.com');
      });

      await s2.step('Enter password', async () => {
        await t.typeText('#password', 'password123');
      });

      await s2.step('Confirm password', async () => {
        await t.typeText('#confirm-password', 'password123');
      });
    });

    await s1.step('Submit form', async () => {
      await t.click('#submit-button');
    });

    await s1.step('Verify registration success', async () => {
      await t.expect('#success-message').exists;
    });
  });
});
```

### Steps with Attachments

```javascript
test('Test with step attachments', async (t) => {
  await qase.step('Capture application state', async (step) => {
    const screenshot = await t.takeScreenshot();

    step.attach({
      name: 'application-state.png',
      content: screenshot,
      type: 'image/png',
    });

    await t.expect(true).ok();
  });
});
```

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameters

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test.meta(
  qase.parameters({
    'browser': 'chrome',
    'environment': 'staging',
    'resolution': '1920x1080',
  }).create()
)(
  'Parameterized test',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

### Group Parameters

```javascript
test.meta(
  qase.parameters({
    'browser': 'chrome',
    'os': 'macOS',
    'environment': 'staging',
  }).groupParameters(['environment']).create()
)(
  'Test with grouped parameters',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

### Combined with Other Metadata

```javascript
test.meta(
  qase.id(1)
    .title('Cross-browser test')
    .fields({ 'severity': 'high' })
    .parameters({ 'browser': 'firefox', 'os': 'Windows' })
    .create()
)(
  'Test with full metadata',
  async (t) => {
    await t.expect(true).ok();
  }
);
```

---

## Running Tests

### Basic Execution

```bash
# Run all tests with Qase reporter
QASE_MODE=testops npx testcafe chrome tests/

# Run specific test file
QASE_MODE=testops npx testcafe chrome tests/login.test.js

# Run with multiple reporters
QASE_MODE=testops npx testcafe chrome tests/ -r spec,qase
```

### Multiple Browsers

```bash
# Run in multiple browsers
QASE_MODE=testops npx testcafe chrome,firefox tests/ -r qase

# Run in headless mode
QASE_MODE=testops npx testcafe chrome:headless tests/ -r qase

# Run in all installed browsers
QASE_MODE=testops npx testcafe all tests/ -r qase
```

### With Environment Variables

```bash
# Override configuration
QASE_MODE=testops \
QASE_TESTOPS_PROJECT=DEMO \
QASE_TESTOPS_API_TOKEN=your_token \
npx testcafe chrome tests/
```

### With TestCafe Configuration

Create `.testcaferc.json`:

```json
{
  "browsers": ["chrome:headless"],
  "src": ["tests/**/*.test.js"],
  "reporter": ["spec", "qase"],
  "concurrency": 3,
  "quarantineMode": false,
  "skipJsErrors": true,
  "stopOnFirstFail": false
}
```

Run with configuration:

```bash
QASE_MODE=testops npx testcafe
```

---

## Troubleshooting

### Reporter Not Found

**Problem:** `Error: Reporter "Qase" not found` or tests run without Qase reporting.

**Solutions:**

1. **Verify installation:**
   ```bash
   npm list testcafe-reporter-Qase
   ```

2. **Reinstall if needed:**
   ```bash
   npm install --save-dev testcafe-reporter-Qase
   ```

3. **Check reporter name in command:**
   ```bash
   # Correct
   npx testcafe chrome tests/ -r Qase

   # Incorrect
   npx testcafe chrome tests/ -r testcafe-reporter-Qase
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
     "mode": "TestOps"
   }
   ```

4. **Verify API token and project code:**
   - Token has write permissions
   - Project code matches your Qase project

### Metadata Not Applied

**Problem:** `qase.id()`, `qase.fields()`, or other metadata not working.

**Solutions:**

1. **Verify `.create()` is called:**
   ```javascript
   // Correct
   test.meta(qase.id(1).create())('Test', async (t) => {});

   // Incorrect (missing .create())
   test.meta(qase.id(1))('Test', async (t) => {});
   ```

2. **Check import path:**
   ```javascript
   // Correct
   import { Qase } from 'testcafe-reporter-qase/qase';

   // Incorrect
   import { Qase } from 'testcafe-reporter-Qase';
   ```

### Steps Not Reporting

**Problem:** `qase.step()` calls not appearing in Qase results.

**Solutions:**

1. **Ensure async/await is used:**
   ```javascript
   // Correct
   await qase.step('Step name', async () => {
     await t.click('#button');
   });

   // Incorrect (missing await)
   qase.step('Step name', async () => {
     await t.click('#button');
   });
   ```

2. **Check step callback is async:**
   ```javascript
   // Correct
   await qase.step('Step', async () => { ... });

   // Incorrect
   await qase.step('Step', () => { ... });
   ```

### Attachments Not Uploading

**Problem:** Files or screenshots not appearing in Qase.

**Solutions:**

1. **Verify file path exists:**
   ```bash
   ls -la /path/to/file
   ```

2. **Check file permissions:**
   ```bash
   # File should be readable
   chmod 644 /path/to/file
   ```

3. **Use absolute paths:**
   ```javascript
   const path = require('path');
   qase.attach({
     paths: path.resolve(__dirname, '../screenshots/test.png')
   });
   ```

4. **Verify content type:**
   ```javascript
   qase.attach({
     name: 'log.txt',
     content: 'Log content',
     type: 'text/plain',  // Must be specified for content
   });
   ```

### Browser Issues

**Problem:** Tests fail to start or browser-related errors.

**Solutions:**

1. **List available browsers:**
   ```bash
   npx testcafe --list-browsers
   ```

2. **Use specific browser version:**
   ```bash
   npx testcafe "chrome:headless" tests/
   ```

3. **Check browser installation:**
   ```bash
   which google-chrome
   which firefox
   ```

---

## Integration Patterns

### Pattern 1: Page Object Model with Qase

```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(t) {
    this.t = t;
  }

  async login(email, password) {
    await qase.step('Enter email', async () => {
      await this.t.typeText('#email', email);
    });

    await qase.step('Enter password', async () => {
      await this.t.typeText('#password', password);
    });

    await qase.step('Click login button', async () => {
      await this.t.click('#login-button');
    });
  }
}

// tests/login.test.js
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';
import { LoginPage } from '../pages/LoginPage';

fixture\`Login Tests\`
  .page\`https://example.com/login\`;

test.meta(qase.id(1).create())(
  'User can login',
  async (t) => {
    const loginPage = new LoginPage(t);
    await loginPage.login('user@example.com', 'password123');
    await t.expect('#dashboard').exists;
  }
);
```

### Pattern 2: Data-Driven Testing

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

const users = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'user@example.com', password: 'user123', role: 'user' },
  { email: 'guest@example.com', password: 'guest123', role: 'guest' },
];

fixture\`Role-based Tests\`
  .page\`https://example.com\`;

users.forEach((user) => {
  test.meta(
    qase.id(1)
      .parameters({ role: user.role, email: user.email })
      .create()
  )(
    \`Login as \${user.role}\`,
    async (t) => {
      await t.typeText('#email', user.email);
      await t.typeText('#password', user.password);
      await t.click('#login-button');
      await t.expect(\`#role-\${user.role}\`).exists;
    }
  );
});
```

### Pattern 3: Before/After Hooks with Reporting

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture\`E2E Tests\`
  .page\`https://example.com\`
  .beforeEach(async (t) => {
    await qase.step('Setup: Clear cookies', async () => {
      await t.eval(() => {
        document.cookie.split(';').forEach((c) => {
          document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC';
        });
      });
    });
  })
  .afterEach(async (t) => {
    await qase.step('Teardown: Capture screenshot', async (step) => {
      const screenshot = await t.takeScreenshot();
      step.attach({
        name: 'final-state.png',
        content: screenshot,
        type: 'image/png',
      });
    });
  });

test.meta(qase.id(1).create())('Test with hooks', async (t) => {
  await t.expect(true).ok();
});
```

---

## Common Use Cases

### Use Case 1: Basic Test with QaseID

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture\`Smoke Tests\`
  .page\`https://example.com\`;

test.meta(qase.id(101).create())(
  'Homepage loads',
  async (t) => {
    await t.expect('#header').exists;
  }
);
```

### Use Case 2: Visual Regression with Screenshots

```javascript
test.meta(qase.id(201).create())(
  'Visual: Login page',
  async (t) => {
    const screenshot = await t.takeScreenshot();

    qase.attach({
      name: 'login-page.png',
      content: screenshot,
      type: 'image/png',
    });

    await t.expect('#login-form').exists;
  }
);
```

### Use Case 3: API Integration Test

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';
import { RequestLogger } from 'testcafe';

const apiLogger = RequestLogger(/api\.example\.com/, {
  logRequestBody: true,
  logResponseBody: true,
});

fixture\`API Tests\`
  .page\`https://example.com\`
  .requestHooks(apiLogger);

test.meta(qase.id(301).create())(
  'API: Fetch user data',
  async (t) => {
    await t.click('#load-data-button');

    await qase.step('Verify API call', async () => {
      await t.expect(apiLogger.contains((r) => r.response.statusCode === 200)).ok();
    });

    qase.attach({
      name: 'api-response.json',
      content: JSON.stringify(apiLogger.requests[0].response.body, null, 2),
      type: 'application/json',
    });
  }
);
```

### Use Case 4: Cross-Browser Testing

```javascript
const browsers = ['chrome', 'firefox', 'safari'];

browsers.forEach((browser) => {
  test.meta(
    qase.id(401)
      .parameters({ browser })
      .create()
  )(
    \`Test on \${browser}\`,
    async (t) => {
      await t.expect(true).ok();
    }
  );
});
```

### Use Case 5: Mobile Viewport Testing

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture\`Mobile Tests\`
  .page\`https://example.com\`;

test.meta(
  qase.id(501)
    .parameters({ viewport: 'mobile', width: 375, height: 667 })
    .create()
)(
  'Mobile: iPhone 8',
  async (t) => {
    await t.resizeWindow(375, 667);
    await t.expect('#mobile-menu').exists;
  }
);
```

### Use Case 6: Form Validation Testing

```javascript
test.meta(qase.id(601).create())(
  'Form: Email validation',
  async (t) => {
    await qase.step('Enter invalid email', async () => {
      await t.typeText('#email', 'invalid-email');
    });

    await qase.step('Submit form', async () => {
      await t.click('#submit-button');
    });

    await qase.step('Verify error message', async () => {
      await t.expect('#email-error').exists;
      await t.expect('#email-error').contains('Invalid email');
    });
  }
);
```

### Use Case 7: File Upload Testing

```javascript
test.meta(qase.id(701).create())(
  'File upload',
  async (t) => {
    await qase.step('Select file', async () => {
      await t.setFilesToUpload('#file-input', ['./fixtures/test-file.pdf']);
    });

    await qase.step('Upload file', async () => {
      await t.click('#upload-button');
    });

    await qase.step('Verify upload success', async () => {
      await t.expect('#upload-success').exists;
    });
  }
);
```

### Use Case 8: Authentication Flow

```javascript
test.meta(
  qase.id(801)
    .title('Complete authentication flow')
    .fields({ severity: 'critical', priority: 'high' })
    .create()
)(
  'Auth flow',
  async (t) => {
    await qase.step('Navigate to login', async () => {
      await t.navigateTo('/login');
    });

    await qase.step('Enter credentials', async () => {
      await t.typeText('#email', 'user@example.com');
      await t.typeText('#password', 'password123');
    });

    await qase.step('Submit login', async () => {
      await t.click('#login-button');
    });

    await qase.step('Verify dashboard loads', async () => {
      await t.expect('#dashboard').exists;
    });

    await qase.step('Logout', async () => {
      await t.click('#logout-button');
    });
  }
);
```

### Use Case 9: Performance Testing

```javascript
test.meta(qase.id(901).create())(
  'Performance: Page load time',
  async (t) => {
    const startTime = Date.now();

    await t.navigateTo('https://example.com');

    const loadTime = Date.now() - startTime;

    qase.attach({
      name: 'performance-metrics.json',
      content: JSON.stringify({ loadTime, threshold: 3000 }, null, 2),
      type: 'application/json',
    });

    await t.expect(loadTime).lt(3000, 'Page load time exceeds 3 seconds');
  }
);
```

### Use Case 10: CI/CD Integration

**.github/workflows/testcafe.yml:**
```yaml
name: TestCafe Tests

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
    "test": "testcafe chrome:headless tests/ -r spec,qase"
  }
}
```

---

## Complete Examples

### Full Test Example

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

fixture('Complete Example')
  .page('https://example.com');

test.meta(
  qase
    .id(1)
    .title('User can complete full registration flow')
    .fields({
      severity: 'critical',
      priority: 'high',
      layer: 'e2e',
      description: 'Tests complete user registration flow from start to finish',
      preconditions: 'Application is running and database is accessible',
    })
    .suite('Registration\tEnd-to-End')
    .parameters({ Browser: 'Chrome', Environment: 'staging' })
    .create()
)(
  'Comprehensive test with all features',
  async (t) => {
    await qase.step('Navigate to registration page', async () => {
      await t.navigateTo('/register');
      qase.attach({
        name: 'page-load.txt',
        content: 'Page loaded successfully',
        type: 'text/plain',
      });
    });

    await qase.step('Fill registration form', async () => {
      await t
        .typeText('#username', 'testuser')
        .typeText('#email', 'test@example.com')
        .typeText('#password', 'SecurePass123!');
    });

    await qase.step('Submit form', async () => {
      await t.click('button[type="submit"]');
      await t.expect(Selector('.success-message').exists).ok();
    });

    await qase.step('Verify email confirmation', async () => {
      await t.expect(Selector('.email-sent').innerText)
        .contains('Verification email sent');
    });
  }
);
```

### Example Project Structure

```
my-project/
├── qase.config.json
├── tests/
│   ├── auth.test.js
│   ├── checkout.test.js
│   └── ...
├── pages/
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   └── ...
└── package.json
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [TestCafe Documentation](https://testcafe.io/documentation)
- [Example Tests](../../examples/single/testcafe/)
