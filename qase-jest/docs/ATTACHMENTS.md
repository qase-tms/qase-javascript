# Attachments in Jest

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase Jest Reporter supports attaching various types of content to test results:

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
const { qase } = require('jest-qase-reporter/jest');

test('Test with file attachment', () => {
  qase.attach({ paths: '/path/to/file.txt' });

  expect(true).toBe(true);
});
```

### Multiple Files

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with multiple attachments', () => {
  qase.attach({
    paths: [
      '/path/to/file1.txt',
      '/path/to/file2.log',
      '/path/to/screenshot.png'
    ]
  });

  expect(true).toBe(true);
});
```

---

## Attaching Content from Memory

### Text Content

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with text attachment', () => {
  qase.attach({
    name: 'log.txt',
    content: 'Test execution log content',
    contentType: 'text/plain',
  });

  expect(true).toBe(true);
});
```

### Binary Content (Screenshots)

```javascript
const { qase } = require('jest-qase-reporter/jest');
const fs = require('fs');

test('Test with binary attachment', () => {
  const screenshot = fs.readFileSync('/path/to/screenshot.png');

  qase.attach({
    name: 'screenshot.png',
    content: screenshot,
    contentType: 'image/png',
  });

  expect(true).toBe(true);
});
```

### JSON Data

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with JSON attachment', () => {
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

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with step attachments', async () => {
  await qase.step('Initialize test data', async () => {
    const testData = { user: 'testuser', role: 'admin' };

    qase.attach({
      name: 'init-data.json',
      content: JSON.stringify(testData, null, 2),
      contentType: 'application/json',
    });
  });

  await qase.step('Execute test', async () => {
    qase.attach({
      name: 'execution-log.txt',
      content: 'Test execution completed successfully',
      contentType: 'text/plain',
    });

    expect(true).toBe(true);
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
const { qase } = require('jest-qase-reporter/jest');

qase.attach({ paths: '/path/to/file.txt' });
```

**ES Modules:**
```javascript
import { qase } from 'jest-qase-reporter/jest';

qase.attach({ paths: '/path/to/file.txt' });
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

### Saving Test Artifacts

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test that generates artifacts', async () => {
  // Generate test data
  const testResults = {
    passed: 10,
    failed: 2,
    skipped: 1,
  };

  qase.attach({
    name: 'test-results.json',
    content: JSON.stringify(testResults, null, 2),
    contentType: 'application/json',
  });

  expect(testResults.passed).toBeGreaterThan(0);
});
```

### API Response Logs

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('API request with response logging', async () => {
  const response = await fetch('https://api.example.com/users');
  const data = await response.json();

  qase.attach({
    name: 'api-response.json',
    content: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });

  expect(response.status).toBe(200);
});
```

### Console Logs

```javascript
const { qase } = require('jest-qase-reporter/jest');

test('Test with captured console output', () => {
  const logs = [];
  const originalLog = console.log;

  console.log = (...args) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  console.log('Test started');
  console.log('Processing data...');
  console.log('Test completed');

  qase.attach({
    name: 'console-log.txt',
    content: logs.join('\n'),
    contentType: 'text/plain',
  });

  console.log = originalLog;

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
