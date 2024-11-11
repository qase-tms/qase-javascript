# Qase Integration in TestCafe

This guide demonstrates how to integrate Qase with TestCafe, providing instructions on how to add Qase IDs, titles,
fields, suites, comments, and file attachments to your test cases.

---

## Adding QaseID to a Test

To associate a QaseID with a test in TestCafe, use the `qase` function. This function accepts a single integer
representing the test's ID in Qase.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

const q = qase.id(1).create();
test.meta(q)('simple test', async (t) => {
  await t.expect(true).ok();
});
```

---

## Adding a Title to a Test

You can provide a title for your test using the `qase.title` function. The function accepts a string, which will be
used as the test's title in Qase. If no title is provided, the test method name will be used by default.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

const q = qase.title('Some title').create();
test.meta(q)('simple test', async (t) => {
  await t.expect(true).ok();
});
```

---

## Adding Fields to a Test

The `qase.fields` function allows you to add additional metadata to a test case. You can specify multiple fields to
enhance test case information in Qase.

### System Fields:

- `description` — Description of the test case.
- `preconditions` — Preconditions for the test case.
- `postconditions` — Postconditions for the test case.
- `severity` — Severity of the test case (e.g., `critical`, `major`).
- `priority` — Priority of the test case (e.g., `high`, `low`).
- `layer` — Test layer (e.g., `UI`, `API`).

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

const q = qase.fields({ 'severity': 'high', 'priority': 'medium' }).create();
test.meta(q)('simple test', async (t) => {
  await t.expect(true).ok();
});
```

---

## Ignoring a Test in Qase

To exclude a test from being reported to Qase (while still executing the test in TestCafe), use the `qase.ignore`
function. The test will run, but its result will not be sent to Qase.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

const q = qase.ignore().create();
test.meta(q)('simple test', async (t) => {
  await t.expect(true).ok();
});
```

---

## Attaching Files to a Test

To attach files to a test result, use the `qase.attach` function. This method supports attaching one or multiple files,
along with optional file names, comments, and file types.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

test('test', async (t) => {
  qase.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
  qase.attach({ paths: '/path/to/file' });
  qase.attach({ paths: ['/path/to/file', '/path/to/another/file'] });
  await t.expect(true).ok();
});
```

---

## Adding Parameters to a Test

You can add parameters to a test case using the `qase.parameters` function. This function accepts an object with
parameter names and values.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

const q = qase.parameters({ param1: 'value1', param2: 'value2' }).create();
test.meta(q)('simple test', async (t) => {
  await t.expect(true).ok();
});
```

## Adding Group Parameters to a Test

To add group parameters to a test case, use the `qase.groupParameters` function. This function accepts an list with
group parameter names.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

const q = qase.parameters({ param1: 'value1', param2: 'value2' }).groupParameters(['param1']).create();
test.meta(q)('simple test', async (t) => {
  await t.expect(true).ok();
});
```

## Adding Steps to a Test

You can add steps to a test case using the `qase.step` function. This function accepts a string, which will be used as
the step description in Qase.

### Example:

```javascript
import { qase } from 'testcafe-qase-reporter/qase';

test('test', async (t) => {
  await qase.step('Step 1', async (s1) => {
    await s1.step('Step 1.1', async (s11) => {
      await s11.step('Step 1.1.1', async (s111) => {
        s11.attach({ name: 'attachment.txt', content: 'Hello, world!', contentType: 'text/plain' });
        await s111.expect(true).ok();
      });
    });
    await t.expect(true).ok();
  });
  await t.expect(true).ok();
});
```
