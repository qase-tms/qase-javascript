# Upgrade Guide: Vitest Reporter

This guide covers migration steps between major versions of the Qase Vitest Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 1.1.0 | January 2026 | >= 14 | Current stable release with enhanced metadata support |
| 1.0.0 | August 2025 | >= 14 | Initial release with unified qase-javascript-commons |

---

## Upgrading to 1.x

### Breaking Changes

The vitest-qase-reporter is currently in its first major version series (1.x). No migration from a previous major version is required.

### Current Version Features

Version 1.1.0 includes:

- Full support for Qase TestOps API with batch result upload
- Test case linking via the test name: `test(addQaseId('name', [id]), callback)`
- Rich metadata support via `withQase(async ({ qase }) => { ... })`: titles, fields, suites, parameters, comments
- Async test steps with `await qase.step()`
- File and content-based attachments with `await qase.attach()`
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `qase.config.json` or `vitest.config.ts`

---

## Configuration

### Current Format (v1.x)

Configuration uses the modern qase-javascript-commons format:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default', // Keep default Vitest reporter
      [
        'vitest-qase-reporter',
        {
          mode: 'testops',
          debug: false,
          testops: {
            api: {
              token: process.env.QASE_API_TOKEN,
            },
            project: 'DEMO',
            run: {
              title: 'Vitest Automated Run',
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
  },
});
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
QASE_MODE=testops npx vitest run
```

---

## Import Pattern

### Current Import (v1.x)

```typescript
import { addQaseId, addQaseProjects, withQase } from 'vitest-qase-reporter/vitest';
```

**CommonJS:**

```javascript
const { addQaseId, addQaseProjects, withQase } = require('vitest-qase-reporter/vitest');
```

**Note:** Test helpers come from the `vitest-qase-reporter/vitest` subpath. The root package export (`vitest-qase-reporter`) is the reporter itself and is referenced in the `reporters` array of `vitest.config.ts`.

---

## API Reference

### Test Case ID Linking

Test case IDs are added to the test name with `addQaseId(name, ids)`:

```typescript
import { addQaseId } from 'vitest-qase-reporter/vitest';
import { describe, test, expect } from 'vitest';

describe('User Authentication', () => {
  // Single test case ID
  test(addQaseId('User can login', [1]), () => {
    expect(true).toBe(true);
  });

  // Multiple test case IDs
  test(addQaseId('Multiple IDs', [1, 2]), () => {
    expect(true).toBe(true);
  });
});
```

### Metadata Methods

Metadata methods are called on the `qase` object passed to the `withQase()` callback. All of them are async:

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';

test('Test with metadata', withQase(async ({ qase }) => {
  await qase.title('Custom test title');
  await qase.fields({ severity: 'critical', priority: 'high', layer: 'unit' });
  await qase.suite('Authentication\tLogin');
  await qase.comment('This test covers the main login flow');
  await qase.parameters({ environment: 'staging', mode: 'development' });

  expect(true).toBe(true);
}));
```

### Steps (Async)

```typescript
test('Test with steps', withQase(async ({ qase }) => {
  await qase.step('Initialize environment', async () => {
    // Setup code
  });

  await qase.step('Perform action', async () => {
    // Test logic
  });

  await qase.step('Verify result', async () => {
    // Assertions
    expect(result).toBe(expected);
  });
}));
```

**With expected results and data:**

```typescript
// Inside a withQase(async ({ qase }) => { ... }) callback
await qase.step(
  'Verify login success',
  async () => {
    expect(user.authenticated).toBe(true);
  },
  'User should be authenticated', // Expected result (optional)
  'User data' // Data (optional)
);
```

### Nested Steps

```typescript
test('Test with nested steps', withQase(async ({ qase }) => {
  await qase.step('Parent step', async () => {
    await qase.step('Child step 1', async () => {
      // Nested logic
    });

    await qase.step('Child step 2', async () => {
      // More nested logic
    });
  });
}));
```

### Attachments

```typescript
test('Test with attachments', withQase(async ({ qase }) => {
  // Path-based attachment
  await qase.attach({ paths: ['/path/to/log.txt'] });

  // Multiple files
  await qase.attach({ paths: ['/path/to/file1.txt', '/path/to/file2.log'] });

  // Content-based attachment (content must be a string)
  await qase.attach({
    name: 'test-data.json',
    content: JSON.stringify({ key: 'value' }),
    type: 'application/json',
  });
}));
```

---

## Migrating from Jest

If you're migrating from Jest to Vitest, the Qase helpers differ: IDs are set with `addQaseId()` and metadata methods are called on the `qase` object passed by `withQase()`:

**Jest code:**

```javascript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'Test'), async () => {
  await qase.step('Step 1', async () => { /* ... */ });
  qase.attach({ paths: 'file.txt' });
});
```

**Vitest code:**

```typescript
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';

test(addQaseId('Test', [1]), withQase(async ({ qase }) => {
  await qase.step('Step 1', async () => { /* ... */ });
  await qase.attach({ paths: ['file.txt'] });
}));
```

---

## Compatibility Notes

### Node.js Version Support

- **Current (1.1.0):** Node.js >= 14

### Vitest Version Support

- **Current (1.1.0):** Vitest >= 3.0.0
- Tested with Vitest 3.x

### Framework Compatibility

- ES Modules recommended (Vitest default)
- CommonJS supported
- TypeScript support with full type definitions
- Works with Vitest workspace feature for monorepos
- Compatible with Vitest UI and browser mode

---

## Troubleshooting

### Common Issues

#### Issue: Module not found after installation

**Solution:** Ensure you're importing the test helpers from the `/vitest` subpath:

```typescript
// Correct
import { addQaseId, withQase } from 'vitest-qase-reporter/vitest';

// Incorrect - the package has no `qase` export
import { qase } from 'vitest-qase-reporter';
```

#### Issue: Reporter not running

**Solution:** Verify that `QASE_MODE=testops` is set when running tests:

```bash
QASE_MODE=testops npx vitest run
```

Or configure `mode: 'testops'` in your `vitest.config.ts` or `qase.config.json`.

#### Issue: Tests not reported to Qase

**Solution:** Check that:
1. API token is set: `process.env.QASE_API_TOKEN`
2. Project code is correct: `project: 'YOUR_PROJECT_CODE'`
3. Mode is set to TestOps: `mode: 'TestOps'`
4. Reporter is in the `reporters` array in vitest.config.ts

#### Issue: Configuration format errors

**Solution:** Ensure the configuration follows the correct structure:

```typescript
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
   - Current version (1.1.0)
   - Vitest version
   - Error messages
   - Configuration file (without sensitive data)
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
- [Vitest Documentation](https://vitest.dev/)
