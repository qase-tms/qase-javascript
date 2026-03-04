# Attachments in Vitest

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase Vitest Reporter supports attaching various types of content to test results:

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
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with file attachment', async () => {
  await qase.attach({ paths: './test/fixtures/test-file.txt' });

  expect(true).toBe(true);
});
```

### Multiple Files

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with multiple attachments', async () => {
  await qase.attach({
    paths: [
      './test/fixtures/file1.txt',
      './test/fixtures/file2.log',
      './test/fixtures/screenshot.png'
    ]
  });

  expect(true).toBe(true);
});
```

---

## Attaching Content from Memory

### Text Content

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with text attachment', async () => {
  await qase.attach({
    name: 'log.txt',
    content: 'Test execution log content',
    type: 'text/plain',
  });

  expect(true).toBe(true);
});
```

### Binary Content (Screenshots)

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';
import fs from 'fs';

test('Test with binary attachment', async () => {
  const screenshot = fs.readFileSync('./test/fixtures/screenshot.png');

  await qase.attach({
    name: 'screenshot.png',
    content: screenshot,
    type: 'image/png',
  });

  expect(true).toBe(true);
});
```

### JSON Data

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with JSON attachment', async () => {
  const data = {
    userId: 123,
    status: 'active',
    timestamp: new Date().toISOString(),
  };

  await qase.attach({
    name: 'test-data.json',
    content: JSON.stringify(data, null, 2),
    type: 'application/json',
  });

  expect(true).toBe(true);
});
```

---

## Attaching to Steps

Attach content to a specific test step:

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with step attachments', async () => {
  await qase.step('Initialize test data', async () => {
    const testData = { user: 'testuser', role: 'admin' };

    await qase.attach({
      name: 'init-data.json',
      content: JSON.stringify(testData, null, 2),
      type: 'application/json',
    });
  });

  await qase.step('Execute test', async () => {
    await qase.attach({
      name: 'execution-log.txt',
      content: 'Test execution completed successfully',
      type: 'text/plain',
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
| `type` | `string` | No | MIME type (auto-detected from extension) |

\* Either `paths` or `content` must be provided, but not both.

**CommonJS:**
```javascript
const { qase } = require('vitest-qase-reporter/vitest');

await qase.attach({ paths: './path/to/file.txt' });
```

**ES Modules:**
```javascript
import { qase } from 'vitest-qase-reporter/vitest';

await qase.attach({ paths: './path/to/file.txt' });
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

### File Attachments

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';
import fs from 'fs';

test('Test with generated file attachment', async () => {
  const reportData = 'Test Report\n============\nStatus: Passed\n';
  const filePath = './test/output/report.txt';

  fs.writeFileSync(filePath, reportData);

  await qase.attach({ paths: filePath });

  expect(fs.existsSync(filePath)).toBe(true);

  // Cleanup
  fs.unlinkSync(filePath);
});
```

### JSON Data Logging

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with structured data logging', async () => {
  const testResults = {
    passed: 10,
    failed: 2,
    skipped: 1,
    duration: '5.2s',
  };

  await qase.attach({
    name: 'test-results.json',
    content: JSON.stringify(testResults, null, 2),
    type: 'application/json',
  });

  expect(testResults.passed).toBeGreaterThan(0);
});
```

### Binary Content

```typescript
import { qase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with binary data attachment', async () => {
  const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

  await qase.attach({
    name: 'test-image.png',
    content: imageData,
    type: 'image/png',
  });

  expect(imageData).toBeDefined();
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
