# Qase Integration in WebdriverIO

This guide demonstrates how to integrate Qase with WebdriverIO, providing instructions on how to add Qase IDs, titles,
fields, suites, comments, and file attachments to your test cases.

---

## Adding QaseID to a Test

To associate a QaseID with a test in WebdriverIO, use the `qase` function. This function accepts a single integer
representing the test's ID in Qase.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it(qase(1, 'test'), () => {
  browser.url('https://example.com');
});

it(qase([1, 2, 3], 'test'), () => {
  browser.url('https://example.com');
});
```

---

## Adding a Title to a Test

You can provide a title for your test using the `qase.title` function. The function accepts a string, which will be
used as the test's title in Qase. If no title is provided, the test method name will be used by default.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.title('Title');
  browser.url('https://example.com');
});
```

---

## Adding Fields to a Test

The `qase.fields` function allows you to add additional metadata to a test case. You can specify multiple fields to
enhance test case information in Qase.

### System Fields

- `description` — Description of the test case.
- `preconditions` — Preconditions for the test case.
- `postconditions` — Postconditions for the test case.
- `severity` — Severity of the test case (e.g., `critical`, `major`).
- `priority` — Priority of the test case (e.g., `high`, `low`).
- `layer` — Test layer (e.g., `UI`, `API`).

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.fields({ description: "Description", preconditions: "Preconditions" });
  browser.url('https://example.com');
});
```

---

## Adding a Suite to a Test

To assign a suite or sub-suite to a test, use the `qase.suite` function. It can receive a suite name, and optionally a
sub-suite, both as strings.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.suite("Suite 01");
  browser.url('https://example.com');
});

it('test', () => {
  qase.suite("Suite 01\tSuite 02");
  browser.url('https://example.com');
});
```

---

## Ignoring a Test in Qase

To exclude a test from being reported to Qase (while still executing the test in WebdriverIO), use the `qase.ignore`
function. The test will run, but its result will not be sent to Qase.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.ignore();
  browser.url('https://example.com');
});
```

---

## Adding a Comment to a Test

You can attach comments to the test results in Qase using the `qase.comment` function. The comment will be displayed
alongside the test execution details in Qase.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.comment("Some comment");
  browser.url('https://example.com');
});
```

---

## Attaching Files to a Test

To attach files to a test result, use the `qase.attach` function. This method supports attaching one or multiple files,
along with optional file names, comments, and file types.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', type: 'text/plain' });
  qase.attach({ paths: '/path/to/file' });
  qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });
  browser.url('https://example.com');
});
```

## Adding Parameters to a Test

You can add parameters to a test case using the `qase.parameters` function. This function accepts an object with
parameter names and values.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.parameters({ param1: 'value1', param2: 'value2' });
  browser.url('https://example.com');
});
```

## Adding Group Parameters to a Test

To add group parameters to a test case, use the `qase.groupParameters` function. This function accepts an object with
group parameter names and values.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', () => {
  qase.parameters({ param1: 'value1', param2: 'value2' });
  qase.groupParameters({ param3: 'value3', param4: 'value4' });
  browser.url('https://example.com');
});
```

## Adding Steps to a Test

You can add steps to a test case using the `qase.step` function. This function accepts a string and a callback function,
which will be used as the step description and actions in Qase.

### Example

```javascript
import { qase } from 'wdio-qase-reporter';

it('test', async () => {
  await qase.step('Some step', async (step) => {
    // some actions
    step.attach({ name: 'screenshot.png', type: 'image/png', content: await browser.takeScreenshot() });
  });
  browser.url('https://example.com');
});
```

## Cucumber Integration

WebdriverIO Qase reporter supports Cucumber integration. When using Cucumber, you can annotate your scenarios with Qase IDs using tags.

### Feature file example

```gherkin
Feature: Test user role

  @QaseId=3
  Scenario: Login
    Given I test login
    When I enter credentials
    Then I should be logged in

  @QaseId=4,5
  @Title=Custom Test Title
  @Suite=Authentication
  Scenario: Logout
    Given I am logged in
    When I click logout
    Then I should be logged out
```

### Supported Cucumber tags

- `@QaseId=<id>` - Set Qase test case ID(s). Multiple IDs can be separated by commas
- `@Title=<title>` - Set custom test title
- `@Suite=<suite>` - Set test suite name

### Configuration for Cucumber

```javascript
// wdio.conf.js
const WDIOQaseReporter = require('wdio-qase-reporter').default;

exports.config = {
  reporters: [[WDIOQaseReporter, {
    useCucumber: true,  // Enable Cucumber support
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false,
  }]],
  // ... other options
};
```
