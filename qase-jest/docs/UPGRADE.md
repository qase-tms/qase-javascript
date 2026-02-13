# Upgrade Guide: Jest Reporter

This guide covers migration steps between major versions of the Qase Jest Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 2.2.0 | January 2026 | >= 14 | Current stable release with improved reporter functionality |
| 2.1.0 | December 2025 | >= 14 | Enhanced metadata handling and multi-project support |
| 2.0.0 | August 2025 | >= 14 | Complete rewrite with new architecture and API |

---

## Upgrading to 2.x

### Breaking Changes

The jest-qase-reporter started with the v2.x architecture, leveraging the unified qase-javascript-commons library for consistent reporting across all test frameworks. If you are using v2.x, you are already on the latest architecture.

**No migration from a previous major version is required for jest-qase-reporter.**

### Current Version Features

Version 2.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Test case linking via wrapper function pattern: `test(qase(id, 'name'), callback)`
- Rich metadata support: titles, fields, suites, parameters, comments
- Nested test steps with `qase.step()`
- File and content-based attachments with `qase.attach()`
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `qase.config.json` or reporter options

---

## Configuration

### Current Format (v2.x)

Configuration uses the modern qase-javascript-commons format:

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
            title: 'Jest Automated Run',
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

---

## Import Pattern

### Current Import (v2.x)

```javascript
const { qase } = require('jest-qase-reporter/jest');
```

**ES Modules:**

```javascript
import { qase } from 'jest-qase-reporter/jest';
```

**Note:** The `/jest` subpath is required to access the `Qase` helper function for test annotations.

---

## API Reference

### Test ID Linking

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('User Authentication', () => {
  // Single test case ID
  test(qase(1, 'User can login'), () => {
    expect(true).toBe(true);
  });

  // Multiple test case IDs
  test(qase([1, 2], 'Multiple IDs'), () => {
    expect(true).toBe(true);
  });
});
```

### Metadata Methods

```javascript
test('Test with metadata', () => {
  qase.title('Custom test title');
  qase.fields({ severity: 'critical', priority: 'high' });
  qase.suite('Authentication / Login');
  qase.comment('This test covers the main login flow');
  qase.parameters({ browser: 'Chrome', environment: 'staging' });

  expect(true).toBe(true);
});
```

### Steps

```javascript
test('Test with steps', async () => {
  await qase.step('Initialize environment', async () => {
    // Setup code
  });

  await qase.step('Perform action', async () => {
    // Test logic
  });

  await qase.step('Verify result', async () => {
    // Assertions
  });
});
```

### Attachments

```javascript
// Path-based attachment
qase.attach({ paths: '/path/to/log.txt' });

// Content-based attachment
qase.attach({
  name: 'test-log.txt',
  content: 'Test execution log content',
  contentType: 'text/plain',
});
```

---

## Compatibility Notes

### Node.js Version Support

- **Current (2.2.0):** Node.js >= 14

### Jest Version Support

- **Current (2.2.0):** Jest >= 28.0.0
- Tested with Jest 29.x

### Framework Compatibility

- CommonJS and ES Modules supported
- TypeScript support with full type definitions
- Works with ts-jest for TypeScript projects

---

## Troubleshooting

### Common Issues

#### Issue: Module not found after installation

**Solution:** Ensure you're importing from the correct subpath:

```javascript
// Correct
const { qase } = require('jest-qase-reporter/jest');

// Incorrect - missing /jest subpath
const { qase } = require('jest-qase-reporter');
```

#### Issue: Reporter not running

**Solution:** Verify that `QASE_MODE=testops` is set when running tests:

```bash
QASE_MODE=testops npx jest
```

Or configure `mode: 'TestOps'` in your reporter options.

#### Issue: Configuration not recognized

**Solution:** Check that your configuration follows the correct structure. The `testops` object should contain `api.token` and `project` fields:

```javascript
{
  mode: 'testops',
  testops: {
    api: { token: 'your_token' },
    project: 'YOUR_PROJECT_CODE',
  }
}
```

---

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the CHANGELOG
3. Open a new issue with:
   - Current version (2.2.0)
   - Error messages
   - Configuration file (without sensitive data)
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
