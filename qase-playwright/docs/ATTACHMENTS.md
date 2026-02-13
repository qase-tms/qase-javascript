# Attachments in Playwright

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase Playwright Reporter supports attaching various types of content to test results:

- **Files** — Attach files from the filesystem
- **Screenshots** — Attach images captured during test execution
- **Logs** — Attach text logs or console output
- **Binary data** — Attach any binary content from memory

Attachments can be added to:
- **Test cases** — Visible in the overall test result
- **Test steps** — Visible in specific step results

---

## Attaching Files

### From File Path

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with file attachment', async () => {
  qase.attach({ paths: './test/attachments/test-file.txt' });

  expect(true).toBe(true);
});
```

### Multiple Files

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with multiple attachments', async () => {
  qase.attach({
    paths: [
      './test/attachments/file1.txt',
      './test/attachments/file2.log',
      './test/attachments/screenshot.png'
    ]
  });

  expect(true).toBe(true);
});
```

---

## Attaching Content from Memory

### Text Content

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with text attachment', async () => {
  qase.attach({
    name: 'log.txt',
    content: 'Test execution log content',
    contentType: 'text/plain',
  });

  expect(true).toBe(true);
});
```

### Binary Content (Screenshots)

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with screenshot attachment', async ({ page }) => {
  await page.goto('https://example.com');

  const screenshot = await page.screenshot();

  qase.attach({
    name: 'screenshot.png',
    content: screenshot,
    contentType: 'image/png',
  });

  expect(true).toBe(true);
});
```

### JSON Data

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with JSON attachment', async () => {
  const data = {
    userId: 123,
    status: 'active',
    timestamp: new Date().toISOString(),
  };

  qase.attach({
    name: 'test-data.json',
    content: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });

  expect(true).toBe(true);
});
```

---

## Attaching to Steps

Attach content to a specific test step:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with step attachments', async ({ page }) => {
  await qase.step('Navigate to page', async () => {
    await page.goto('https://example.com');

    qase.attach({
      name: 'navigation-log.txt',
      content: `Navigated to: ${page.url()}`,
      contentType: 'text/plain',
    });
  });

  await qase.step('Capture screenshot', async () => {
    const screenshot = await page.screenshot();

    qase.attach({
      name: 'page-screenshot.png',
      content: screenshot,
      contentType: 'image/png',
    });

    expect(screenshot).toBeDefined();
  });
});
```

---

## Method Reference

### `qase.attach()`

Attach content to the test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string` or `string[]` | No* | Path(s) to file(s) to attach |
| `content` | `string` or `Buffer` | No* | Content to attach |
| `name` | `string` | No | Custom filename (auto-detected from path) |
| `contentType` | `string` | No | MIME type (auto-detected from extension) |

\* Either `paths` or `content` must be provided, but not both.

**CommonJS:**
```javascript
const { qase } = require('playwright-qase-reporter');

qase.attach({ paths: './path/to/file.txt' });
```

**ES Modules:**
```javascript
import { qase } from 'playwright-qase-reporter';

qase.attach({ paths: './path/to/file.txt' });
```

---

## MIME Types

Common MIME types are auto-detected based on file extension:

| Extension | MIME Type |
|-----------|-----------|
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.svg` | `image/svg+xml` |
| `.txt` | `text/plain` |
| `.log` | `text/plain` |
| `.json` | `application/json` |
| `.xml` | `application/xml` |
| `.html` | `text/html` |
| `.csv` | `text/csv` |
| `.pdf` | `application/pdf` |
| `.zip` | `application/zip` |

For other file types, specify `contentType` explicitly.

---

## Common Use Cases

### Playwright Screenshots

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with automatic screenshot', async ({ page }) => {
  await page.goto('https://example.com');
  await page.click('button#submit');

  // Capture and attach screenshot
  const screenshot = await page.screenshot({ fullPage: true });

  qase.attach({
    name: 'full-page-screenshot.png',
    content: screenshot,
    contentType: 'image/png',
  });

  await expect(page.locator('.success')).toBeVisible();
});
```

### API Response Logs

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('API request with response logging', async ({ request }) => {
  const response = await request.get('https://api.example.com/users');
  const data = await response.json();

  qase.attach({
    name: 'api-response.json',
    content: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });

  expect(response.status()).toBe(200);
});
```

### Browser Console Logs

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('Test with browser console logs', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', (msg) => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto('https://example.com');
  await page.evaluate(() => {
    console.log('Page loaded');
    console.warn('Test warning');
    console.error('Test error');
  });

  qase.attach({
    name: 'console-logs.txt',
    content: logs.join('\n'),
    contentType: 'text/plain',
  });

  expect(logs.length).toBeGreaterThan(0);
});
```

---

## Troubleshooting

### Attachments Not Appearing

1. Verify the file path exists and is readable
2. Check file permissions
3. Enable debug logging to see upload status:
   ```json
   {
     "debug": true
   }
   ```

### Large Files

Large attachments may slow down test execution. Consider:
- Compressing logs before attaching
- Using selective logging (e.g., only on failure)
- Setting reasonable size limits

### Binary Data Issues

When attaching binary data, always specify:
- `name` with appropriate extension
- `contentType` if extension doesn't match content type

---

## See Also

- [Usage Guide](usage.md)
- [Steps Guide](STEPS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
