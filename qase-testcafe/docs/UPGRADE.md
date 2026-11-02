# Upgrade Guide: TestCafe Reporter

This guide covers migration steps between major versions of the Qase TestCafe Reporter.

---

## Version History

See [changelog.md](../changelog.md) for the changes in each release.

---

## Upgrading to 2.x

### Breaking Changes

The testcafe-reporter-qase started with the v2.x architecture, leveraging the unified qase-javascript-commons library for consistent reporting across all test frameworks. If you are using v2.x, you are already on the latest architecture.

**No migration from a previous major version is required for testcafe-reporter-qase.**

### Current Version Features

Version 2.x includes:

- Full support for Qase TestOps API with batch result upload
- Builder pattern for test metadata: `.meta(qase.id(1).create())`
- Rich metadata support: titles, fields, suites, parameters, group parameters, tags
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
import { Selector } from 'testcafe';
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
  .meta(qase.id([1, 2, 3]).create())
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
      .suite('Authentication\tLogin')
      .create()
  )
  ('Test with rich metadata', async (t) => {
    // Test code
  });
```

**Builder Pattern Methods:**

- `.id(number | number[])` - Set test case ID(s)
- `.title(string)` - Set custom title
- `.fields(object)` - Set custom fields
- `.suite(string)` - Set suite hierarchy (levels separated by `\t`)
- `.parameters(object)` / `.groupParameters(object)` - Set parameters
- `.tags(...string)` - Set tags
- `.projects(object)` - Map the test to cases in several projects
- `.ignore()` / `.mute()` - Do not report the test / report it as muted
- `.create()` - **Required** - Finalize and create metadata object

### Steps with Nested Callbacks

`qase.step(name, body)` takes the step name and a callback. Inside the callback keep using the
test controller `t`; the callback receives the step object, which can attach files to the step:

```javascript
import { Selector } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

test
  .meta(qase.id(1).create())
  ('Test with steps', async (t) => {
    await qase.step('Navigate to login page', async () => {
      await t.navigateTo('https://example.com/login');
    });

    await qase.step('Enter credentials', async () => {
      await t.typeText('#username', 'user@example.com');
      await t.typeText('#password', 'password123');
    });

    await qase.step('Verify login success', async (s) => {
      await t.expect(Selector('.dashboard').exists).ok();
      s.attach({ paths: await t.takeScreenshot() });
    });
  });
```

**Nested Steps:**

```javascript
await qase.step('Parent step', async () => {
  await qase.step('Child step 1', async () => {
    await t.typeText('#field1', 'value1');
  });

  await qase.step('Child step 2', async () => {
    await t.typeText('#field2', 'value2');
  });
});
```

### Attachments

**Path-based Attachment:**

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test
  .meta(qase.id(1).create())
  ('Test with attachment', async (t) => {
    // Test code
    qase.attach({ paths: '/path/to/log.txt' });
    qase.attach({ paths: ['/path/to/a.log', '/path/to/b.log'] });
  });
```

**Content-based Attachment:**

```javascript
qase.attach({
  name: 'test-data.json',
  content: JSON.stringify({ key: 'value' }),
  contentType: 'application/json',
});
```

**Screenshot Attachment:**

`t.takeScreenshot()` saves the screenshot and returns its path, so attach it by path:

```javascript
qase.attach({ paths: await t.takeScreenshot() });
```

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

- Node.js >= 18

### TestCafe Version Support

- TestCafe >= 2.0.0
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

**Solution:** Import `qase` from the `/qase` subpath, pass the step name and a callback, and `await` the call:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

await qase.step('Step name', async () => {
  await t.click('#button');
});
```

#### Issue: Attachments not appearing

**Solution:** Attach files with `paths` and in-memory data with `content`. `t.takeScreenshot()` returns a file path, so pass it as `paths`:

```javascript
qase.attach({ paths: await t.takeScreenshot() });

qase.attach({
  name: 'file.txt',
  content: 'content',
  contentType: 'text/plain',
});
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
   - Reporter version
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
