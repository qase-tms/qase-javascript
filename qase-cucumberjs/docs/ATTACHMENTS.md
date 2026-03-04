# Attachments in CucumberJS

This guide covers how to attach files, screenshots, logs, and other content to your Qase test results when using CucumberJS.

---

## Overview

CucumberJS reporter captures attachments using **Cucumber's native attachment API** (`this.attach()`) within step definitions. The Qase reporter automatically captures these attachments and includes them in your test results.

**Key difference from other frameworks:** CucumberJS does not use `qase.attach()` programmatically. Instead, use Cucumber's built-in `this.attach()` method in your step definitions.

Attachments are automatically associated with:
- **Test results** — When added in step definitions
- **Specific steps** — Attachments are linked to the Gherkin step they're added in

---

## Limitations

CucumberJS uses Cucumber's native attachment API (`this.attach()`) within step definitions. The Qase reporter automatically captures these attachments. There is no programmatic `qase.attach()` import from the reporter package.

---

## Attaching Files

### From File Path

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');

When('I attach a log file', async function() {
  const fileContent = fs.readFileSync('path/to/file.txt');
  this.attach(fileContent, 'text/plain');
});
```

### Multiple Files

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');
const fs = require('fs');

When('I attach multiple files', async function() {
  const file1 = fs.readFileSync('path/to/file1.txt');
  const file2 = fs.readFileSync('path/to/file2.log');

  this.attach(file1, 'text/plain');
  this.attach(file2, 'text/plain');
});
```

---

## Attaching Content from Memory

### Text Content

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

When('I log test execution details', function() {
  const logContent = 'Test execution log content';
  this.attach(logContent, 'text/plain');
});
```

### Binary Content (Screenshots)

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

When('I take a screenshot', async function() {
  // Example using WebDriver or similar
  const screenshot = await this.driver.takeScreenshot();
  this.attach(Buffer.from(screenshot, 'base64'), 'image/png');
});
```

### JSON Data

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

When('I attach test data', function() {
  const testData = {
    userId: 123,
    username: 'testuser',
    timestamp: new Date().toISOString(),
  };

  this.attach(JSON.stringify(testData, null, 2), 'application/json');
});
```

---

## Attaching in Step Definitions

Attachments are added within step definitions and automatically linked to the Gherkin step:

```gherkin
Feature: User Login

  Scenario: Successful login with screenshot
    Given I am on the login page
    When I enter valid credentials
    And I take a screenshot
    Then I should see the dashboard
```

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the login page', async function() {
  await this.driver.get('https://example.com/login');
});

When('I enter valid credentials', async function() {
  await this.driver.findElement({ id: 'email' }).sendKeys('user@example.com');
  await this.driver.findElement({ id: 'password' }).sendKeys('password123');
});

When('I take a screenshot', async function() {
  const screenshot = await this.driver.takeScreenshot();
  this.attach(Buffer.from(screenshot, 'base64'), 'image/png');
});

Then('I should see the dashboard', async function() {
  const url = await this.driver.getCurrentUrl();
  assert.strictEqual(url, 'https://example.com/dashboard');
});
```

---

## Method Reference

### `this.attach()`

Cucumber's native method to attach content to test results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | `string` or `Buffer` | Yes | Content to attach |
| `mediaType` | `string` | Yes | MIME type of the content |

**Usage:**
```javascript
const { When } = require('@cucumber/cucumber');

When('I attach a file', function() {
  this.attach('File content here', 'text/plain');
});
```

**With Buffer:**
```javascript
When('I attach binary data', function() {
  const buffer = Buffer.from('binary data');
  this.attach(buffer, 'application/octet-stream');
});
```

---

## MIME Types

Common MIME types for attachments:

| Content Type | MIME Type |
|-------------|-----------|
| PNG image | `image/png` |
| JPEG image | `image/jpeg` |
| GIF image | `image/gif` |
| Plain text | `text/plain` |
| JSON data | `application/json` |
| XML data | `application/xml` |
| HTML | `text/html` |
| CSV | `text/csv` |
| PDF | `application/pdf` |
| ZIP | `application/zip` |

---

## Common Use Cases

### Selenium/WebDriver Screenshots

```javascript
const { When } = require('@cucumber/cucumber');

When('I capture a screenshot', async function() {
  const screenshot = await this.driver.takeScreenshot();
  this.attach(Buffer.from(screenshot, 'base64'), 'image/png');
});
```

### Playwright Screenshots

```javascript
const { When } = require('@cucumber/cucumber');

When('I take a page screenshot', async function() {
  const screenshot = await this.page.screenshot();
  this.attach(screenshot, 'image/png');
});
```

### API Response Logs

```javascript
const { When } = require('@cucumber/cucumber');

When('I make an API request', async function() {
  const response = await fetch('https://api.example.com/users');
  const data = await response.json();

  this.attach(JSON.stringify(data, null, 2), 'application/json');
});
```

### Console Output Logs

```javascript
const { When } = require('@cucumber/cucumber');

When('I capture console output', function() {
  const consoleOutput = this.capturedLogs.join('\n');
  this.attach(consoleOutput, 'text/plain');
});
```

### Page Source HTML

```javascript
const { When } = require('@cucumber/cucumber');

When('I capture page source', async function() {
  const pageSource = await this.driver.getPageSource();
  this.attach(pageSource, 'text/html');
});
```

---

## Attaching on Failure

Use Cucumber hooks to automatically attach screenshots or logs on test failure:

```javascript
const { After } = require('@cucumber/cucumber');

After(async function(scenario) {
  if (scenario.result.status === 'failed') {
    // Attach screenshot on failure
    const screenshot = await this.driver.takeScreenshot();
    this.attach(Buffer.from(screenshot, 'base64'), 'image/png');

    // Attach page source
    const pageSource = await this.driver.getPageSource();
    this.attach(pageSource, 'text/html');

    // Attach console logs
    const logs = await this.driver.manage().logs().get('browser');
    this.attach(JSON.stringify(logs, null, 2), 'application/json');
  }
});
```

---

## Troubleshooting

### Attachments Not Appearing

1. Verify you're using Cucumber's native `this.attach()` method
2. Ensure step definitions use regular functions (not arrow functions) to preserve `this` context:
   ```javascript
   // Correct
   When('I attach a file', function() {
     this.attach('content', 'text/plain');
   });

   // Incorrect - arrow function loses 'this' context
   When('I attach a file', () => {
     this.attach('content', 'text/plain'); // Error!
   });
   ```
3. Check that the CucumberJS formatter is properly configured:
   ```bash
   npx cucumber-js -f cucumberjs-qase-reporter
   ```
4. Enable debug logging to see attachment capture:
   ```json
   {
     "debug": true
   }
   ```

### Large Files

Large attachments may slow down test execution. Consider:
- Compressing logs before attaching
- Using selective attachment (e.g., only on failure)
- Setting reasonable size limits

### Binary Data Issues

When attaching binary data:
- Use `Buffer.from()` for base64 strings
- Specify correct MIME type for the content type

### Arrow Functions Break Attachments

Cucumber's `this.attach()` requires access to the World context. Always use regular functions in step definitions:

```javascript
// Correct - regular function preserves 'this'
When('I attach data', function() {
  this.attach('data', 'text/plain');
});

// Incorrect - arrow function loses 'this'
When('I attach data', () => {
  this.attach('data', 'text/plain'); // TypeError: Cannot read property 'attach' of undefined
});
```

---

## See Also

- [Usage Guide](usage.md)
- [Steps Guide](STEPS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
