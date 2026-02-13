# Upgrade Guide: Mocha Reporter

This guide covers migration steps between major versions of the Qase Mocha Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 1.2.0 | January 2026 | >= 14 | Current stable release with enhanced metadata support |
| 1.1.0 | December 2025 | >= 14 | Multi-project support and improved step handling |
| 1.0.0 | August 2025 | >= 14 | Initial release with unified qase-javascript-commons |

---

## Upgrading to 1.x

### Breaking Changes

The mocha-qase-reporter is currently in its first major version series (1.x). No migration from a previous major version is required.

### Current Version Features

Version 1.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Test case linking via wrapper function pattern: `it(qase(id, 'name'), callback)`
- Rich metadata support: titles, fields, suites, parameters, comments
- Synchronous test steps with `qase.step()` (Mocha-style)
- File and content-based attachments with `qase.attach()`
- Multi-project support for reporting to multiple Qase projects
- Extra reporters support for combining with other Mocha reporters
- Flexible configuration via `qase.config.json` or `.mocharc.js`

---

## Configuration

### Current Format (v1.x)

Configuration uses the modern qase-javascript-commons format:

```javascript
// .mocharc.js
module.exports = {
  reporters: [
    'spec', // Keep default Mocha spec reporter
    [
      'mocha-qase-reporter',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'DEMO',
          run: {
            title: 'Mocha Automated Run',
            description: 'Test run from CI/CD pipeline',
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

**Alternative: qase.config.json**

```json
{
  "mode": "testops",
  "testops": {
    "api": {
      "token": "api_token_here"
    },
    "project": "DEMO",
    "run": {
      "complete": true
    }
  }
}
```

**Command Line:**

```bash
QASE_MODE=testops npx mocha
```

---

## Import Pattern

### Current Import (v1.x)

```javascript
const { qase } = require('mocha-qase-reporter/mocha');
```

**ES Modules:**

```javascript
import { qase } from 'mocha-qase-reporter/mocha';
```

**Note:** The `/mocha` subpath is required to access the `Qase` helper function.

---

## API Reference

### Test ID Linking

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('User Authentication', () => {
  // Single test case ID
  it(qase(1, 'User can login'), () => {
    expect(true).to.equal(true);
  });

  // Multiple test case IDs
  it(qase([1, 2], 'Multiple IDs'), () => {
    expect(true).to.equal(true);
  });
});
```

### Metadata Methods

```javascript
it('Test with metadata', () => {
  qase.title('Custom test title');
  qase.fields({ severity: 'critical', priority: 'high' });
  qase.suite('Authentication / Login');
  qase.comment('This test covers the main login flow');
  qase.parameters({ environment: 'staging', browser: 'Chrome' });

  expect(true).to.equal(true);
});
```

### Steps (Synchronous)

**Important:** Mocha uses synchronous callbacks for steps (no async/await):

```javascript
it('Test with steps', function () {
  qase.step('Initialize environment', () => {
    // Setup code
  });

  qase.step('Perform action', () => {
    // Test logic
  });

  qase.step('Verify result', () => {
    // Assertions
    expect(result).to.equal(expected);
  });
});
```

**Note:** Use `function()` syntax (not arrow functions) when you need access to Mocha's `this` context:

```javascript
it('Test with context', function () {
  this.timeout(5000); // Access Mocha's this context

  qase.step('Step 1', () => {
    // Step code
  });
});
```

### Attachments

```javascript
// Path-based attachment
qase.attach({ paths: '/path/to/log.txt' });

// Multiple files
qase.attach({ paths: ['/path/to/file1.txt', '/path/to/file2.log'] });

// Content-based attachment
qase.attach({
  name: 'test-log.txt',
  content: 'Test execution log content',
  contentType: 'text/plain',
});
```

---

## Extra Reporters

Mocha-qase-reporter supports combining with other Mocha reporters:

```javascript
// .mocharc.js
module.exports = {
  reporters: [
    'spec', // Default console output
    'json', // JSON output
    ['mocha-qase-reporter', { /* Qase options */ }],
  ],
};
```

This allows you to maintain local test reports while also sending results to Qase.

---

## Compatibility Notes

### Node.js Version Support

- **Current (1.2.0):** Node.js >= 14

### Mocha Version Support

- **Current (1.2.0):** Mocha >= 9.0.0
- Tested with Mocha 10.x and 11.x

### Framework Compatibility

- CommonJS and ES Modules supported
- TypeScript support with full type definitions
- Works with all Mocha interfaces (BDD, TDD, QUnit, Exports)
- Compatible with other Mocha reporters (extra reporters)

---

## Troubleshooting

### Common Issues

#### Issue: Module not found after installation

**Solution:** Ensure you're importing from the correct subpath:

```javascript
// Correct
const { qase } = require('mocha-qase-reporter/mocha');

// Incorrect - missing /mocha subpath
const { qase } = require('mocha-qase-reporter');
```

#### Issue: Reporter not running

**Solution:** Verify that `QASE_MODE=testops` is set when running tests:

```bash
QASE_MODE=testops npx mocha
```

Or configure `mode: 'testops'` in your `.mocharc.js` or `qase.config.json`.

#### Issue: Steps not working in async tests

**Solution:** Mocha steps use synchronous callbacks, not async/await:

```javascript
// Correct - synchronous callbacks
it('Test', () => {
  qase.step('Step 1', () => {
    // Code
  });
});

// Incorrect - async/await not supported for steps in Mocha
it('Test', async () => {
  await qase.step('Step 1', async () => {
    // This won't work correctly
  });
});
```

#### Issue: Cannot access Mocha's this context

**Solution:** Use `function()` syntax instead of arrow functions:

```javascript
// Correct - function syntax preserves this context
it('Test', function () {
  this.timeout(5000);
  qase.step('Step', () => { /* ... */ });
});

// Incorrect - arrow function loses this context
it('Test', () => {
  this.timeout(5000); // Error: cannot read property of undefined
});
```

---

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the CHANGELOG
3. Open a new issue with:
   - Current version (1.2.0)
   - Mocha version
   - Error messages
   - Configuration file (without sensitive data)
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
