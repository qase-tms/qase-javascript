# Attachments in WebdriverIO

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results.

---

## Overview

Qase WebdriverIO Reporter supports attaching various types of content to test results:

- **Files** — Attach files from the filesystem
- **Screenshots** — Attach images captured during test execution
- **Logs** — Attach text logs or console output
- **Binary data** — Attach any binary content from memory

Attachments can be added to:
- **Test cases** — Visible in the overall test result
- **Test steps** — Visible in specific step results

**Framework Support:**
- **Mocha/Jasmine:** Programmatic attachment API via `qase.attach()`
- **Cucumber:** Attachments added via Cucumber's native step attachment API are automatically captured

---

## Attaching Files (Mocha/Jasmine)

### From File Path

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with file attachment', () => {
    qase.attach({ paths: 'path/to/file.txt' });
    expect(true).to.equal(true);
  });
});
```

### Multiple Files

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with multiple file attachments', () => {
    qase.attach({ paths: ['path/to/file1.txt', 'path/to/file2.log'] });
    expect(true).to.equal(true);
  });
});
```

---

## Attaching Content from Memory (Mocha/Jasmine)

### Text Content

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with text content attachment', async () => {
    const logContent = 'Test execution log content';

    qase.attach({
      name: 'execution.log',
      content: logContent,
      type: 'text/plain',
    });

    expect(true).to.equal(true);
  });
});
```

### Binary Content (Screenshots)

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with screenshot attachment', async () => {
    await browser.url('https://example.com');

    const screenshot = await browser.takeScreenshot();

    qase.attach({
      name: 'page-screenshot.png',
      content: screenshot,
      type: 'image/png',
    });

    await expect($('#header')).toExist();
  });
});
```

### JSON Data

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with JSON data attachment', () => {
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

    expect(true).to.equal(true);
  });
});
```

---

## Attaching to Steps (Mocha/Jasmine)

Attach content to a specific test step:

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with step-level attachments', async () => {
    await qase.step('Navigate and capture screenshot', async (step) => {
      await browser.url('https://example.com/login');

      step.attach({
        name: 'login-page.png',
        content: await browser.takeScreenshot(),
        type: 'image/png',
      });
    });

    await qase.step('Perform action', async (step) => {
      await $('#username').setValue('testuser');

      step.attach({
        name: 'action-log.txt',
        content: 'Username entered successfully',
        type: 'text/plain',
      });
    });
  });
});
```

---

## Cucumber Attachments

Cucumber attachments are automatically captured when using step attachments:

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

When('I take a screenshot', async function() {
  const screenshot = await browser.takeScreenshot();
  // Cucumber's native attach method
  this.attach(screenshot, 'image/png');
});

When('I log test data', function() {
  const data = JSON.stringify({ testId: 123 }, null, 2);
  this.attach(data, 'application/json');
});
```

---

## Automatic Screenshot Reporting

WebdriverIO can be configured to automatically attach screenshots:

```javascript
// wdio.conf.js
const WDIOQaseReporter = require('wdio-qase-reporter').default;

exports.config = {
  reporters: [[WDIOQaseReporter, {
    disableWebdriverScreenshotsReporting: false, // Enable automatic screenshots
  }]],

  // ... other options
};
```

When `disableWebdriverScreenshotsReporting` is `false`, WebDriver screenshots are automatically attached to test results.

---

## Method Reference

### `qase.attach()` (Mocha/Jasmine)

Attach content to the test case.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string` or `string[]` | No* | Path(s) to file(s) to attach |
| `content` | `string` or `Buffer` | No* | Content to attach |
| `name` | `string` | No | Custom filename (auto-detected from path) |
| `type` | `string` | No | MIME type (auto-detected from extension) |

\* Either `paths` or `content` must be provided, but not both.

**Basic usage:**
```javascript
import { qase } from 'wdio-qase-reporter';

// Attach file by path
qase.attach({ paths: 'path/to/file.txt' });

// Attach content from memory
qase.attach({
  name: 'log.txt',
  content: 'Test log content',
  type: 'text/plain',
});
```

### Step-level Attachment (Mocha/Jasmine)

Within a step callback, use the step parameter:

```javascript
await qase.step('Step name', async (step) => {
  step.attach({
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

### WebDriver Screenshots

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with WebDriver screenshot', async () => {
    await browser.url('https://example.com');

    // Take screenshot using WebDriver
    const screenshot = await browser.takeScreenshot();

    qase.attach({
      name: 'page-state.png',
      content: screenshot,
      type: 'image/png',
    });

    await expect($('#main-content')).toExist();
  });
});
```

### Element Screenshots

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with element screenshot', async () => {
    await browser.url('https://example.com');

    // Screenshot specific element
    const element = await $('#header');
    const screenshot = await element.saveScreenshot();

    qase.attach({
      name: 'header-screenshot.png',
      content: screenshot,
      type: 'image/png',
    });

    await expect(element).toExist();
  });
});
```

### Browser Console Logs

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with browser console logs', async () => {
    await browser.url('https://example.com');

    // Get browser logs
    const logs = await browser.getLogs('browser');

    qase.attach({
      name: 'console-logs.json',
      content: JSON.stringify(logs, null, 2),
      type: 'application/json',
    });

    expect(true).to.equal(true);
  });
});
```

### WebDriver Command Logs

```javascript
import { qase } from 'wdio-qase-reporter';

describe('Test Suite', () => {
  it('Test with command logs', async () => {
    await browser.url('https://example.com');
    await $('#login-button').click();

    // Capture execution timeline
    const commandLog = browser.commandList.map(cmd => ({
      command: cmd.method,
      endpoint: cmd.endpoint,
      duration: cmd.duration,
    }));

    qase.attach({
      name: 'command-log.json',
      content: JSON.stringify(commandLog, null, 2),
      type: 'application/json',
    });

    expect(true).to.equal(true);
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
4. For Mocha/Jasmine, ensure `qase` is imported from `wdio-qase-reporter`
5. For Cucumber, verify you're using `this.attach()` within step definitions

### Large Files

Large attachments may slow down test execution. Consider:
- Compressing logs before attaching
- Using selective logging (e.g., only on failure)
- Setting reasonable size limits
- Using `disableWebdriverScreenshotsReporting: true` to disable automatic screenshots

### Binary Data Issues

When attaching binary data, always specify:
- `name` with appropriate extension
- `type` if extension doesn't match content type

### Cucumber Attachments Not Captured

Ensure:
- Reporter is properly configured in `wdio.conf.js`
- `useCucumber: true` is set in reporter options
- Using `this.attach()` method, not `qase.attach()`

---

## See Also

- [Usage Guide](usage.md)
- [Steps Guide](STEPS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
