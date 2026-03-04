# Attachments in Cypress

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase Cypress Reporter supports attaching various types of content to test results:

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
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with file attachment', () => {
  qase.attach({ paths: './cypress/fixtures/test-file.txt' });

  cy.visit('https://example.com');
  cy.contains('Example').should('be.visible');
});
```

### Multiple Files

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with multiple attachments', () => {
  qase.attach({
    paths: [
      './cypress/fixtures/file1.txt',
      './cypress/fixtures/file2.log',
      './cypress/screenshots/test.png'
    ]
  });

  cy.visit('https://example.com');
});
```

---

## Attaching Content from Memory

### Text Content

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with text attachment', () => {
  qase.attach({
    name: 'log.txt',
    content: 'Test execution log content',
    contentType: 'text/plain',
  });

  cy.visit('https://example.com');
});
```

### Binary Content (Screenshots)

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with screenshot attachment', () => {
  cy.visit('https://example.com');

  cy.screenshot('test-screenshot', { capture: 'viewport' });

  // Manually attach screenshot
  cy.readFile('cypress/screenshots/test-screenshot.png', 'base64').then((content) => {
    qase.attach({
      name: 'screenshot.png',
      content: Buffer.from(content, 'base64'),
      contentType: 'image/png',
    });
  });
});
```

### JSON Data

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with JSON attachment', () => {
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

  cy.visit('https://example.com');
});
```

---

## Attaching to Steps

Attach content to a specific test step:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with step attachments', () => {
  qase.step('Navigate to page', () => {
    cy.visit('https://example.com');

    qase.attach({
      name: 'navigation-log.txt',
      content: 'Navigated to example.com',
      contentType: 'text/plain',
    });
  });

  qase.step('Interact with page', () => {
    cy.get('button#submit').click();

    qase.attach({
      name: 'interaction-log.txt',
      content: 'Clicked submit button',
      contentType: 'text/plain',
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
| `paths` | `string` or `string[]` | No* | Path(s) to file(s) to attach |
| `content` | `string` or `Buffer` | No* | Content to attach |
| `name` | `string` | No | Custom filename (auto-detected from path) |
| `contentType` | `string` | No | MIME type (auto-detected from extension) |

\* Either `paths` or `content` must be provided, but not both.

**CommonJS:**
```javascript
const { qase } = require('cypress-qase-reporter/mocha');

qase.attach({ paths: './path/to/file.txt' });
```

**ES Modules:**
```javascript
import { qase } from 'cypress-qase-reporter/mocha';

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

### Cypress Screenshots

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with automatic screenshot capture', () => {
  cy.visit('https://example.com');
  cy.get('button#submit').click();

  // Cypress captures screenshots automatically on failure
  // For manual screenshots:
  cy.screenshot('manual-screenshot');

  cy.contains('Success').should('be.visible');
});
```

**Note:** Cypress automatically captures screenshots on test failure. Use `cy.screenshot()` for manual screenshots during test execution.

### API Response Logs

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('API request with response logging', () => {
  cy.request('GET', 'https://api.example.com/users').then((response) => {
    qase.attach({
      name: 'api-response.json',
      content: JSON.stringify(response.body, null, 2),
      contentType: 'application/json',
    });

    expect(response.status).to.eq(200);
  });
});
```

### Browser Console Logs

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

it('Test with captured console logs', () => {
  const logs = [];

  cy.visit('https://example.com', {
    onBeforeLoad(win) {
      cy.stub(win.console, 'log').callsFake((message) => {
        logs.push(message);
      });
    },
  });

  cy.window().then((win) => {
    win.console.log('Test log 1');
    win.console.log('Test log 2');

    qase.attach({
      name: 'console-logs.txt',
      content: logs.join('\n'),
      contentType: 'text/plain',
    });
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
