# Attachments in TestCafe

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase TestCafe Reporter supports attaching various types of content to test results:

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

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with file attachment', async (t) => {
  qase.attach({ paths: ['path/to/file.txt'] });
  await t.expect(true).ok();
});
```

### Multiple Files

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with multiple file attachments', async (t) => {
  qase.attach({ paths: ['path/to/file1.txt', 'path/to/file2.log'] });
  await t.expect(true).ok();
});
```

---

## Attaching Content from Memory

### Text Content

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with text content attachment', async (t) => {
  const logContent = 'Test execution log content';

  qase.attach({
    name: 'execution.log',
    content: logContent,
    type: 'text/plain',
  });

  await t.expect(true).ok();
});
```

### Binary Content (Screenshots)

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with screenshot attachment', async (t) => {
  await t.navigateTo('https://example.com');

  const screenshot = await t.takeScreenshot();

  qase.attach({
    name: 'page-screenshot.png',
    content: screenshot,
    type: 'image/png',
  });

  await t.expect('#header').exists;
});
```

### JSON Data

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with JSON data attachment', async (t) => {
  const testData = {
    userId: 123,
    username: 'testuser',
    timestamp: new Date().toISOString(),
  };

  qase.attach({
    name: 'test-data.json',
    content: JSON.stringify(testData, null, 2),
    type: 'application/json',
  });

  await t.expect(true).ok();
});
```

---

## Attaching to Steps

Attach content to a specific test step:

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with step-level attachments', async (t) => {
  await qase.step('Navigate and capture screenshot', async (s) => {
    await t.navigateTo('https://example.com/login');

    s.attach({
      name: 'login-page.png',
      content: await t.takeScreenshot(),
      type: 'image/png',
    });
  });

  await qase.step('Perform action', async (s) => {
    await t.typeText('#username', 'testuser');

    s.attach({
      name: 'action-log.txt',
      content: 'Username entered successfully',
      type: 'text/plain',
    });
  });
});
```

---

## Method Reference

### `qase.attach()`

Attach content to the test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string[]` | No* | Array of path(s) to file(s) to attach |
| `content` | `string` or `Buffer` | No* | Content to attach |
| `name` | `string` | No | Custom filename (auto-detected from path) |
| `type` | `string` | No | MIME type (auto-detected from extension) |

\* Either `paths` or `content` must be provided, but not both.

**Basic usage:**
```javascript
import { qase } from 'testcafe-reporter-qase/qase';

// Attach file by path
qase.attach({ paths: ['path/to/file.txt'] });

// Attach content from memory
qase.attach({
  name: 'log.txt',
  content: 'Test log content',
  type: 'text/plain',
});
```

### Step-level Attachment

Within a step callback, use the step parameter:

```javascript
await qase.step('Step name', async (s) => {
  s.attach({
    name: 'step-attachment.txt',
    content: 'Content for this step',
    type: 'text/plain',
  });
});
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

For other file types, specify `type` explicitly.

---

## Common Use Cases

### TestCafe Screenshots

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with TestCafe screenshot', async (t) => {
  await t.navigateTo('https://example.com');

  // Take screenshot using TestCafe
  const screenshot = await t.takeScreenshot();

  qase.attach({
    name: 'page-state.png',
    content: screenshot,
    type: 'image/png',
  });

  await t.expect('#main-content').exists;
});
```

### Capturing Page Source

```javascript
import { qase } from 'testcafe-reporter-qase/qase';
import { ClientFunction } from 'testcafe';

test('Test with page source attachment', async (t) => {
  await t.navigateTo('https://example.com');

  // Get page HTML
  const getPageHTML = ClientFunction(() => document.documentElement.outerHTML);
  const pageSource = await getPageHTML();

  qase.attach({
    name: 'page-source.html',
    content: pageSource,
    type: 'text/html',
  });

  await t.expect('#header').exists;
});
```

### Attaching on Test Failure

```javascript
import { qase } from 'testcafe-reporter-qase/qase';

test('Test with failure screenshot', async (t) => {
  try {
    await t.navigateTo('https://example.com');
    await t.expect('#nonexistent-element').exists;
  } catch (error) {
    // Capture screenshot on failure
    qase.attach({
      name: 'failure-screenshot.png',
      content: await t.takeScreenshot(),
      type: 'image/png',
    });

    throw error;
  }
});
```

### Browser Console Logs

```javascript
import { qase } from 'testcafe-reporter-qase/qase';
import { RequestLogger } from 'testcafe';

const logger = RequestLogger(/.*/, {
  logRequestHeaders: true,
  logResponseHeaders: true,
});

fixture`API Tests`
  .page`https://example.com`
  .requestHooks(logger);

test('Test with request logs', async (t) => {
  await t.navigateTo('https://example.com');

  // Attach logged requests
  qase.attach({
    name: 'request-log.json',
    content: JSON.stringify(logger.requests, null, 2),
    type: 'application/json',
  });

  await t.expect(logger.requests.length).gt(0);
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
- `type` if extension doesn't match content type

---

## See Also

- [Usage Guide](usage.md)
- [Steps Guide](STEPS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
