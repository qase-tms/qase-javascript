# Upgrade Guide: Playwright Reporter

This guide covers migration steps between major versions of the Qase Playwright Reporter.

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

The playwright-qase-reporter started with the v2.x architecture, leveraging the unified qase-javascript-commons library for consistent reporting across all test frameworks. If you are using v2.x, you are already on the latest architecture.

**No migration from a previous major version is required for playwright-qase-reporter.**

### Current Version Features

Version 2.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Dual test case linking patterns: wrapper function and method-based annotation
- Rich metadata support: titles, fields, suites, parameters, comments
- Native Playwright test steps and qase.step() for custom steps
- Screenshot and file attachments with `qase.attach()`
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `qase.config.json` or playwright.config.ts

---

## Configuration

### Current Format (v2.x)

Configuration uses the modern qase-javascript-commons format:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'DEMO',
          run: {
            title: 'Playwright Automated Run',
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

---

## Import Pattern

### Current Import (v2.x)

```typescript
import { qase } from 'playwright-qase-reporter';
```

**Note:** Playwright uses the root package export (no subpath required).

---

## API Reference

### Test ID Linking

**Wrapper Function Pattern:**

```typescript
import { qase } from 'playwright-qase-reporter';
import { test, expect } from '@playwright/test';

test(qase(1, 'User can login'), async ({ page }) => {
  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example');
});

test(qase([1, 2], 'Multiple IDs'), async ({ page }) => {
  // Test code
});
```

**Method-Based Pattern:**

```typescript
test('Simple test', async ({ page }) => {
  qase.title('Custom test title');
  qase.fields({ severity: 'high', priority: 'medium' });

  await page.goto('https://example.com');
  expect(await page.title()).toBe('Example');
});
```

### Metadata Methods

```typescript
test('Test with metadata', async ({ page }) => {
  qase.title('Custom test title');
  qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
  qase.suite('Authentication / Login');
  qase.comment('This test covers the main login flow');
  qase.parameters({ browser: 'chromium', viewport: '1920x1080' });

  // Test code
});
```

### Steps

**Custom Steps with qase.step():**

```typescript
test('Test with custom steps', async ({ page }) => {
  await qase.step('Navigate to login page', async () => {
    await page.goto('https://example.com/login');
  });

  await qase.step('Enter credentials', async () => {
    await page.fill('#username', 'user@example.com');
    await page.fill('#password', 'password123');
  });

  await qase.step('Verify login success', async () => {
    await expect(page.locator('.dashboard')).toBeVisible();
  });
});
```

**Native Playwright Steps:**

```typescript
test('Test with native steps', async ({ page }) => {
  await test.step('Navigate to page', async () => {
    await page.goto('https://example.com');
  });

  await test.step('Verify page loaded', async () => {
    await expect(page).toHaveTitle('Example');
  });
});
```

Both patterns are reported to Qase. You can mix them in the same test if needed.

### Attachments

**Screenshot Attachment:**

```typescript
const screenshot = await page.screenshot();
qase.attach({
  name: 'screenshot.png',
  content: screenshot,
  contentType: 'image/png',
});
```

**File Attachment:**

```typescript
qase.attach({ paths: '/path/to/log.txt' });
```

**Content Attachment:**

```typescript
qase.attach({
  name: 'test-data.json',
  content: JSON.stringify({ key: 'value' }),
  contentType: 'application/json',
});
```

---

## Compatibility Notes

### Node.js Version Support

- **Current (2.2.0):** Node.js >= 14

### Playwright Version Support

- **Current (2.2.0):** Playwright >= 1.16.3
- Tested with Playwright 1.40+

### Framework Compatibility

- TypeScript recommended (full type definitions included)
- ES Modules required for Playwright projects
- Works with all Playwright test runner features (fixtures, annotations, etc.)

---

## Troubleshooting

### Common Issues

#### Issue: Module not found after installation

**Solution:** Ensure you're importing from the correct package:

```typescript
// Correct
import { qase } from 'playwright-qase-reporter';

// Incorrect - no subpath needed
import { qase } from 'playwright-qase-reporter/playwright';
```

#### Issue: Reporter not configured

**Solution:** Verify the reporter is added to your playwright.config.ts:

```typescript
reporter: [
  ['playwright-qase-reporter', { /* options */ }],
],
```

#### Issue: Tests not reported to Qase

**Solution:** Check that:
1. API token is set: `process.env.QASE_API_TOKEN`
2. Project code is correct: `project: 'YOUR_PROJECT_CODE'`
3. Mode is set to TestOps: `mode: 'TestOps'`

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
   - Current version (2.2.0)
   - Playwright version
   - Error messages
   - Configuration file (without sensitive data)
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
