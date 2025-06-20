# Qase Integration in Playwright

This guide demonstrates how to integrate Qase with Playwright, providing instructions on how to add Qase IDs, titles,
fields, suites, comments, and file attachments to your test cases.

---

## Adding QaseID to a Test

To associate a QaseID with a test in Playwright, use the `qase` function. This function accepts a single integer
representing the test's ID in Qase.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test(qase(1, 'test'), async ({ page }) => {
  await page.goto('https://example.com');
});

test(qase([1, 2, 3], 'test'), async ({ page }) => {
  await page.goto('https://example.com');
});
```

---

## Adding a Title to a Test

You can provide a title for your test using the `qase.title` function. The function accepts a string, which will be
used as the test's title in Qase. If no title is provided, the test method name will be used by default.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.title('Title');
  await page.goto('https://example.com');
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
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.fields({ description: "Description", preconditions: "Preconditions" });
  await page.goto('https://example.com');
});
```

---

## Adding a Suite to a Test

To assign a suite or sub-suite to a test, use the `qase.suite` function. It can receive a suite name, and optionally a
sub-suite, both as strings.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.suite("Suite 01");
  await page.goto('https://example.com');
});

test('test', async ({ page }) => {
  qase.suite("Suite 01\tSuite 02");
  await page.goto('https://example.com');
});
```

---

## Ignoring a Test in Qase

To exclude a test from being reported to Qase (while still executing the test in Playwright), use the `qase.ignore`
function. The test will run, but its result will not be sent to Qase.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.ignore();
  await page.goto('https://example.com');
});
```

---

## Adding a Comment to a Test

You can attach comments to the test results in Qase using the `qase.comment` function. The comment will be displayed
alongside the test execution details in Qase.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.comment("Some comment");
  await page.goto('https://example.com');
});
```

---

## Attaching Files to a Test

To attach files to a test result, use the `qase.attach` function. This method supports attaching one or multiple files,
along with optional file names, comments, and file types.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
  qase.attach({ paths: '/path/to/file' });
  qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });
  await page.goto('https://example.com');
});
```

## Adding Parameters to a Test

You can add parameters to a test case using the `qase.parameters` function. This function accepts an object with
parameter names and values.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.parameters({ param1: 'value1', param2: 'value2' });
  await page.goto('https://example.com');
});
```

## Adding Group Parameters to a Test

To add group parameters to a test case, use the `qase.groupParameters` function. This function accepts an object with
group parameter names and values.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  qase.parameters({ param1: 'value1', param2: 'value2' });
  qase.groupParameters({ param3: 'value3', param4: 'value4' });
  await page.goto('https://example.com');
});
```

## Adding Steps to a Test

You can add steps to a test case using the `qase.step` function. This function accepts a string, which will be used as
the step description in Qase.

### Example

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  await test.step(qase.step('Some step'), async () => {
    // some actions
  });
  await page.goto('https://example.com');
});
```

## Annotations

Playwright Qase reporter supports test annotations for setting Qase IDs, titles, and suites.

### Example

```javascript
test('test',
  {
    annotation: { type: 'QaseID', description: '1' },
  },
  async ({ page }) => {
    await page.goto('https://example.com');
  });

test('test',
  {
    annotation: { type: 'QaseSuite', description: 'Suite defined in annotation' },
  },
  async ({ page }) => {
    await page.goto('https://example.com');
  });
```
