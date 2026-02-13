# Attachments in {{FRAMEWORK_NAME}}

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase {{FRAMEWORK_NAME}} Reporter supports attaching various types of content to test results:

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

{{ATTACH_FILE_PATH_EXAMPLE}}

### Multiple Files

{{ATTACH_MULTIPLE_FILES_EXAMPLE}}

---

## Attaching Content from Memory

### Text Content

{{ATTACH_TEXT_CONTENT_EXAMPLE}}

### Binary Content (Screenshots)

{{ATTACH_BINARY_CONTENT_EXAMPLE}}

### JSON Data

{{ATTACH_JSON_CONTENT_EXAMPLE}}

---

## Attaching to Steps

Attach content to a specific test step:

{{ATTACH_TO_STEP_EXAMPLE}}

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
const { qase } = require('{{PACKAGE_NAME}}/{{FRAMEWORK_INTEGRATION_PATH}}');

qase.attach({ paths: '/path/to/file.txt' });
```

**ES Modules:**
```javascript
import { qase } from '{{PACKAGE_NAME}}/{{FRAMEWORK_INTEGRATION_PATH}}';

await qase.attach({ paths: '/path/to/file.txt' });
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

### Selenium Screenshots

{{USE_CASE_SELENIUM_EXAMPLE}}

### Playwright Screenshots

{{USE_CASE_PLAYWRIGHT_EXAMPLE}}

### API Response Logs

{{USE_CASE_API_LOGS_EXAMPLE}}

### Browser Console Logs

{{USE_CASE_CONSOLE_LOGS_EXAMPLE}}

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
