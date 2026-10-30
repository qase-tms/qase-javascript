# Attachments in Mocha

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase Mocha Reporter supports attaching various types of content to test results:

- **Files** — Attach files from the filesystem
- **Screenshots** — Attach images captured during test execution
- **Logs** — Attach text logs or console output
- **Binary data** — Attach any binary content from memory

Attachments are added to the test result. Call `this.attach()` inside a test declared with `function () {}`: the method lives on the Mocha test context and is not available in arrow functions.

---

## Attaching Files

### From File Path

```javascript
const assert = require('assert');

describe('Attachment tests', function() {
  it('Test with file attachment', function() {
    this.attach({ paths: './test/fixtures/test-file.txt' });

    assert.strictEqual(1, 1);
  });
});
```

### Multiple Files

```javascript
const assert = require('assert');

describe('Attachment tests', function() {
  it('Test with multiple attachments', function() {
    this.attach({
      paths: [
        './test/fixtures/file1.txt',
        './test/fixtures/file2.log',
        './test/fixtures/screenshot.png'
      ]
    });

    assert.strictEqual(1, 1);
  });
});
```

---

## Attaching Content from Memory

### Text Content

```javascript
const assert = require('assert');

describe('Attachment tests', function() {
  it('Test with text attachment', function() {
    this.attach({
      name: 'log.txt',
      content: 'Test execution log content',
      contentType: 'text/plain',
    });

    assert.strictEqual(1, 1);
  });
});
```

### Binary Content (Screenshots)

```javascript
const fs = require('fs');
const assert = require('assert');

describe('Attachment tests', function() {
  it('Test with binary attachment', function() {
    const screenshot = fs.readFileSync('./test/fixtures/screenshot.png');

    this.attach({
      name: 'screenshot.png',
      content: screenshot,
      contentType: 'image/png',
    });

    assert.strictEqual(1, 1);
  });
});
```

### JSON Data

```javascript
const assert = require('assert');

describe('Attachment tests', function() {
  it('Test with JSON attachment', function() {
    const data = {
      userId: 123,
      status: 'active',
      timestamp: new Date().toISOString(),
    };

    this.attach({
      name: 'test-data.json',
      content: JSON.stringify(data, null, 2),
      contentType: 'application/json',
    });

    assert.strictEqual(1, 1);
  });
});
```

---

## Attaching to Steps

Step-level attachments are not supported. `this.attach()` called inside a step body attaches the content to the test result.

---

## Method Reference

### `this.attach()`

Attach content to the test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string` or `string[]` | No* | Path(s) to file(s) to attach |
| `content` | `string` or `Buffer` | No* | Content to attach |
| `name` | `string` | No | Filename for `content` attachments (`paths` attachments use the file's basename) |
| `contentType` | `string` | No | MIME type for `content` attachments, defaults to `text/plain` (`paths` attachments detect it from the extension) |

\* Either `paths` or `content` must be provided, but not both.

```javascript
it('Test with attachment', function() {
  this.attach({ paths: './path/to/file.txt' });
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

For other file types, specify `contentType` explicitly.

---

## Common Use Cases

### Debug Logs

```javascript
const assert = require('assert');

describe('Debug logging', function() {
  it('Test with debug logs', function() {
    const debugLogs = [
      'Test started at ' + new Date().toISOString(),
      'Initializing test environment',
      'Running test logic',
      'Test completed successfully'
    ];

    this.attach({
      name: 'debug.log',
      content: debugLogs.join('\n'),
      contentType: 'text/plain',
    });

    assert.strictEqual(1, 1);
  });
});
```

### File Attachments

```javascript
const fs = require('fs');
const assert = require('assert');

describe('File attachment tests', function() {
  it('Test with generated file attachment', function() {
    const reportData = 'Test Report\n============\nStatus: Passed\n';
    const filePath = './test/output/report.txt';

    fs.writeFileSync(filePath, reportData);

    this.attach({ paths: filePath });

    assert.strictEqual(1, 1);

    // Cleanup
    fs.unlinkSync(filePath);
  });
});
```

### API Testing Logs

```javascript
const assert = require('assert');

describe('API tests', function() {
  it('API request with response logging', async function() {
    const response = await fetch('https://api.example.com/users');
    const data = await response.json();

    this.attach({
      name: 'api-response.json',
      content: JSON.stringify(data, null, 2),
      contentType: 'application/json',
    });

    assert.strictEqual(response.status, 200);
  });
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
