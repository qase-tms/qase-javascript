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

You can add steps to a test case using the `qase.step` function. This function accepts a string for the action, and optionally an expected result and input data, which will be used as the step description in Qase.

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

### Example with Expected Result and Data

```javascript
import { qase } from 'playwright-qase-reporter';

test('test', async ({ page }) => {
  await test.step(qase.step('Click button', 'Button should be clicked', 'Button data'), async () => {
    await page.click('button');
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

---

## Selective execution tests

You can use the `grep` property to select tests to run. You can specify a regular expression to match the Qase IDs in `playwright.config.js` or in command line arguments.

### Configuration-based filtering

```javascript
const config = {
  grep: /(Qase ID: 1|2|3)/,
  reporter: [
    [
      'playwright-qase-reporter',
      {
        debug: true,

        testops: {
          api: {
            token: 'api_key',
          },

          project: 'project_code',
          uploadAttachments: true,

          run: {
            complete: true,
          },
        },
      },
    ],
  ],
};

module.exports = config;
```

### Command line filtering

```bash
# Run tests with specific Qase IDs
npx playwright test --grep "(Qase ID: 1|2|3)"
```

### Using qasectl for test plan filtering

If you use `qase([Id], 'Test name')` syntax for test case IDs, you can use `qasectl` for getting prepared regex with all Qase IDs from your test plan. See [qasectl](https://github.com/qase-tms/qasectl/blob/main/docs/command.md#get-filtered-results) for more information.

For example, if you have a test plan with ID 123, you can get the regular expression with all Qase IDs from it with the following command:

```bash
qasectl testops filter --project PROJ --token <token> --planID 123 --framework playwright --output qase.env --verbose
```

Specify result to run command:

```bash
npx playwright test --grep "$(cat qase.env | grep QASE_FILTERED_RESULTS | cut -d'=' -f2)"
```

Only tests with Qase IDs from the file will be run and reported to Qase.
