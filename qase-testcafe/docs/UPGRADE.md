# Upgrade Guide: TestCafe Reporter

This guide covers migration steps between major versions of the Qase TestCafe Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 2.2.0 | January 2026 | >= 14 | Current stable release with improved metadata support |
| 2.1.0 | December 2025 | >= 14 | Enhanced builder pattern and multi-project support |
| 2.0.0 | August 2025 | >= 14 | Complete rewrite with new architecture |

---

## Upgrading to 2.x

### Breaking Changes

The testcafe-reporter-qase started with the v2.x architecture, leveraging the unified qase-javascript-commons library for consistent reporting across all test frameworks. If you are using v2.x, you are already on the latest architecture.

**No migration from a previous major version is required for testcafe-reporter-qase.**

### Current Version Features

Version 2.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Builder pattern for test metadata: `.meta(qase.id(1).create())`
- Rich metadata support: titles, fields, suites, parameters, comments
- Nested test steps with callback-based API
- File and content-based attachments
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `qase.config.json` or environment variables

---

## Configuration

### Current Format (v2.x)

Configuration uses the modern qase-javascript-commons format:

**qase.config.json:**

```json
{
  "mode": "testops",
  "debug": false,
  "testops": {
    "api": {
      "token": "api_token_here"
    },
    "project": "DEMO",
    "run": {
      "title": "TestCafe Automated Run",
      "description": "Test run from CI/CD pipeline",
      "complete": true
    },
    "batch": {
      "size": 100
    }
  }
}
```

**Environment Variables:**

```bash
export QASE_MODE=testops
export QASE_TESTOPS_API_TOKEN=your_api_token
export QASE_TESTOPS_PROJECT=DEMO
```

**Command Line:**

```bash
QASE_MODE=testops npx testcafe chrome tests/ --reporter qase
```

---

## Import Pattern

### Current Import (v2.x)

```javascript
import { qase } from 'testcafe-reporter-qase/qase';
```

**CommonJS:**

```javascript
const { qase } = require('testcafe-reporter-qase/qase');
```

**Note:** TestCafe uses the `/qase` subpath to access the builder API.

---

## API Reference

### Test Case ID Linking with Builder Pattern

TestCafe uses a builder pattern with `.meta()` for test metadata:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

fixture('User Authentication')
  .page('https://example.com');

test
  .meta(qase.id(1).create())
  ('User can login with valid credentials', async (t) => {
    await t
      .typeText('#username', 'user@example.com')
      .typeText('#password', 'password123')
      .click('#login-button')
      .expect(Selector('.dashboard').exists).ok();
  });

// Multiple test case IDs
test
  .meta(qase.id(1, 2, 3).create())
  ('Test with multiple IDs', async (t) => {
    // Test code
  });
```

### Metadata Methods

```javascript
test
  .meta(
    qase
      .id(1)
      .title('Custom test title')
      .fields({ severity: 'critical', priority: 'high', layer: 'e2e' })
      .suite('Authentication / Login')
      .create()
  )
  ('Test with rich metadata', async (t) => {
    // Test code
  });
```

**Builder Pattern Methods:**

- `.id(...ids)` - Set test case ID(s)
- `.title(string)` - Set custom title
- `.fields(object)` - Set custom fields
- `.suite(string)` - Set suite hierarchy
- `.create()` - **Required** - Finalize and create metadata object

### Steps with Nested Callbacks

TestCafe steps use a callback-based pattern with step parameters:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test
  .meta(qase.id(1).create())
  ('Test with steps', async (t) => {
    await qase.step(t, 'Navigate to login page', async (s) => {
      await s.navigateTo('https://example.com/login');
    });

    await qase.step(t, 'Enter credentials', async (s) => {
      await s.typeText('#username', 'user@example.com');
      await s.typeText('#password', 'password123');
    });

    await qase.step(t, 'Verify login success', async (s) => {
      await s.expect(Selector('.dashboard').exists).ok();
    });
  });
```

**Nested Steps:**

```javascript
await qase.step(t, 'Parent step', async (s) => {
  await qase.step(s, 'Child step 1', async (s1) => {
    // Use s1 for TestCafe controller
    await s1.typeText('#field1', 'value1');
  });

  await qase.step(s, 'Child step 2', async (s2) => {
    await s2.typeText('#field2', 'value2');
  });
});
```

**Note:** The step callback parameter (`s`, `s1`, `s2`) is the TestCafe controller for that step scope.

### Attachments

**Path-based Attachment:**

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test
  .meta(qase.id(1).create())
  ('Test with attachment', async (t) => {
    // Test code
    await qase.attach(t, { paths: '/path/to/log.txt' });
  });
```

**Content-based Attachment:**

```javascript
await qase.attach(t, {
  name: 'test-data.json',
  content: JSON.stringify({ key: 'value' }),
  type: 'application/json', // Note: 'type' not 'contentType'
});
```

**Screenshot Attachment:**

```javascript
await qase.attach(t, {
  name: 'screenshot.png',
  content: await t.takeScreenshot(),
  type: 'image/png',
});
```

**Important:** TestCafe uses `type` parameter (not `contentType`) for attachment MIME type.

---

## Running Tests

### Command Line Usage

**Basic:**

```bash
QASE_MODE=testops npx testcafe chrome tests/ --reporter qase
```

**With Custom Run Title:**

```bash
QASE_MODE=testops \
QASE_TESTOPS_RUN_TITLE="E2E Tests - Chrome" \
npx testcafe chrome tests/ --reporter qase
```

**Multiple Browsers:**

```bash
QASE_MODE=testops npx testcafe chrome,firefox tests/ --reporter qase
```

**Combined with other reporters:**

```bash
QASE_MODE=testops npx testcafe chrome tests/ --reporter spec,qase
```

---

## Compatibility Notes

### Node.js Version Support

- **Current (2.2.0):** Node.js >= 14

### TestCafe Version Support

- **Current (2.2.0):** TestCafe >= 2.0.0
- Tested with TestCafe 3.x

### Framework Compatibility

- ES Modules recommended
- CommonJS supported
- TypeScript support with full type definitions
- Works with TestCafe's Page Object Model
- Compatible with TestCafe Studio
- Supports parallel test execution

---

## Troubleshooting

### Common Issues

#### Issue: Builder pattern not recognized

**Solution:** Ensure you're calling `.create()` at the end of the builder chain:

```javascript
// Correct
test.meta(qase.id(1).create())('Test name', async (t) => { /* ... */ });

// Incorrect - missing .create()
test.meta(qase.id(1))('Test name', async (t) => { /* ... */ });
```

#### Issue: Steps not working

**Solution:** Pass the TestCafe controller (`t`) as the first parameter:

```javascript
// Correct
await qase.step(t, 'Step name', async (s) => {
  await s.click('#button');
});

// Incorrect - missing t parameter
await qase.step('Step name', async (s) => {
  await s.click('#button');
});
```

#### Issue: Attachments not appearing

**Solution:** Use `type` parameter (not `contentType`):

```javascript
// Correct
await qase.attach(t, {
  name: 'file.txt',
  content: 'content',
  type: 'text/plain',
});

// Incorrect - contentType not supported in TestCafe
await qase.attach(t, {
  name: 'file.txt',
  content: 'content',
  contentType: 'text/plain',
});
```

Also ensure you're passing `t` as first parameter:

```javascript
// Correct
await qase.attach(t, { paths: 'file.txt' });

// Incorrect - missing t parameter
await qase.attach({ paths: 'file.txt' });
```

#### Issue: Reporter not running

**Solution:** Verify the reporter flag and environment variables:

```bash
# Check reporter is specified
npx testcafe chrome tests/ --reporter qase

# Check QASE_MODE is set
QASE_MODE=testops npx testcafe chrome tests/ --reporter qase
```

#### Issue: Configuration not recognized

**Solution:** Verify `qase.config.json` structure:

```json
{
  "mode": "testops",
  "testops": {
    "api": { "token": "your_token" },
    "project": "YOUR_PROJECT_CODE"
  }
}
```

Or use environment variables:

```bash
export QASE_MODE=testops
export QASE_TESTOPS_API_TOKEN=your_token
export QASE_TESTOPS_PROJECT=YOUR_PROJECT_CODE
```

---

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the CHANGELOG
3. Open a new issue with:
   - Current version (2.2.0)
   - TestCafe version
   - Error messages
   - Configuration file (without sensitive data)
   - Test code example
   - Command used to run tests
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
- [TestCafe Documentation](https://testcafe.io/documentation/)
