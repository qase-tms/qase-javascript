# Attachments in Vitest

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase Vitest Reporter supports attaching various types of content to test results:

- **Files** — Attach files from the filesystem
- **Screenshots** — Attach images captured during test execution
- **Logs** — Attach text logs or console output
- **Text data** — Attach string content from memory

All `qase` methods are available on the object passed to the `withQase()` callback and are async. Attachments are added to the test result; the Vitest reporter does not link attachments to individual steps.

---

## Attaching Files

### From File Path

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with file attachment', withQase(async ({ qase }) => {
  await qase.attach({ paths: ['./test/fixtures/test-file.txt'] });

  expect(true).toBe(true);
}));
```

### Multiple Files

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with multiple attachments', withQase(async ({ qase }) => {
  await qase.attach({
    paths: [
      './test/fixtures/file1.txt',
      './test/fixtures/file2.log',
      './test/fixtures/screenshot.png'
    ]
  });

  expect(true).toBe(true);
}));
```

---

## Attaching Content from Memory

### Text Content

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with text attachment', withQase(async ({ qase }) => {
  await qase.attach({
    name: 'log.txt',
    content: 'Test execution log content',
    type: 'text/plain',
  });

  expect(true).toBe(true);
}));
```

### Binary Content (Screenshots)

`content` accepts only a string. Attach binary files such as screenshots by path:

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with screenshot attachment', withQase(async ({ qase }) => {
  await qase.attach({ paths: ['./test/fixtures/screenshot.png'] });

  expect(true).toBe(true);
}));
```

### JSON Data

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with JSON attachment', withQase(async ({ qase }) => {
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
}));
```

---

## Attaching Inside Steps

You can call `qase.attach()` inside a step. The attachment is added to the test result, not to the step:

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with step attachments', withQase(async ({ qase }) => {
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
}));
```

---

## Method Reference

### `qase.attach()`

Attach content to the test case. Available on the `qase` object passed to the `withQase()` callback.

```typescript
attach(attach: {
  name?: string;
  type?: string;
  content?: string;
  paths?: string[];
}): Promise<void>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string[]` | No* | Paths to files to attach (file name and MIME type are taken from each path) |
| `content` | `string` | No* | Content to attach |
| `name` | `string` | No | File name for `content` (default: `attachment`) |
| `type` | `string` | No | MIME type for `content` (default: `application/octet-stream`) |

\* Either `paths` or `content` must be provided. If both are given, only `paths` is used.

**CommonJS:**
```javascript
const { withQase } = require('vitest-qase-reporter/vitest');

test('test', withQase(async ({ qase }) => {
  await qase.attach({ paths: ['./path/to/file.txt'] });
}));
```

**ES Modules:**
```javascript
import { withQase } from 'vitest-qase-reporter/vitest';

test('test', withQase(async ({ qase }) => {
  await qase.attach({ paths: ['./path/to/file.txt'] });
}));
```

---

## MIME Types

For files attached with `paths`, common MIME types are auto-detected based on file extension:

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

For `content` attachments, specify `type` explicitly.

---

## Common Use Cases

### File Attachments

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';
import fs from 'fs';

test('Test with generated file attachment', withQase(async ({ qase }) => {
  const reportData = 'Test Report\n============\nStatus: Passed\n';
  const filePath = './test/output/report.txt';

  fs.writeFileSync(filePath, reportData);

  await qase.attach({ paths: [filePath] });

  expect(fs.existsSync(filePath)).toBe(true);

  // Cleanup
  fs.unlinkSync(filePath);
}));
```

### JSON Data Logging

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';

test('Test with structured data logging', withQase(async ({ qase }) => {
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
}));
```

### Binary Content

Write binary data to a file and attach it by path:

```typescript
import { withQase } from 'vitest-qase-reporter/vitest';
import { test, expect } from 'vitest';
import fs from 'fs';

test('Test with binary data attachment', withQase(async ({ qase }) => {
  const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const filePath = './test/output/test-image.png';

  fs.writeFileSync(filePath, imageData);
  await qase.attach({ paths: [filePath] });

  expect(imageData).toBeDefined();
}));
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

`content` is sent as a string, so binary data (images, archives) passed as `content` is not preserved. Write it to a file and attach it with `paths` instead.

---

## See Also

- [Usage Guide](usage.md)
- [Steps Guide](STEPS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
