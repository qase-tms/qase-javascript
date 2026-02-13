# Multi-Project Support in TestCafe

Qase TestCafe Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your `qase.config.json` and add the `testops_multi` section with `default_project` and `projects`.

**Example configuration:**

```json
{
  "mode": "testops_multi",
  "testops_multi": {
    "default_project": "PROJ1",
    "projects": [
      {
        "code": "PROJ1",
        "api": {
          "token": "your_api_token_for_proj1"
        }
      },
      {
        "code": "PROJ2",
        "api": {
          "token": "your_api_token_for_proj2"
        }
      }
    ]
  }
}
```

---

## Using `qase.projects(mapping).create()`

TestCafe uses a builder pattern for setting test metadata. Use `qase.projects(mapping)` to link a test to multiple projects, then call `.create()` to build the metadata object. Pass the result to `test.meta()`:

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Multi-project example`.page`https://example.com`;

// Multi-project test - map to PROJ1 case 100 and PROJ2 case 200
const q1 = qase.projects({ PROJ1: [100], PROJ2: [200] }).create();
test.meta(q1)('Login flow reported to two projects', async (t) => {
  await t.expect(true).ok();
});

// Multiple IDs per project
const q2 = qase.projects({ PROJ1: [10, 11], PROJ2: [20] }).create();
test.meta(q2)('Checkout reported to multiple cases', async (t) => {
  await t.expect(1 + 1).eql(2);
});
```

### Combining with Other Metadata

You can chain `qase.projects()` with other builder methods:

```javascript
// Combine multi-project with test ID and fields
const q = qase.id(1).projects({ PROJ1: [100], PROJ2: [200] }).fields({ severity: 'high' }).create();
test.meta(q)('Test with ID, multi-project, and fields', async (t) => {
  await t.expect(true).ok();
});
```

**Key points:**

- Single project with single ID: `qase.id(100).create()` (reports to default_project)
- Multi-project: `qase.projects({ PROJ1: [100], PROJ2: [200] }).create()`
- Multiple IDs per project: `qase.projects({ PROJ1: [10, 11], PROJ2: [20] }).create()`
- **Always call `.create()` at the end** to build the metadata object

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

Tests that do not use `qase.projects()` are sent to the `default_project`. If they use `qase.id(id).create()` (single-project syntax), that ID is used for the default project.

```javascript
// This test goes to default_project with case ID 50
const q = qase.id(50).create();
test.meta(q)('Single project test', async (t) => {
  await t.expect(true).ok();
});

// This test goes to default_project without a case ID
test('Test without Qase metadata', async (t) => {
  await t.expect(true).ok();
});
```

---

## Important Notes

1. **Project codes must match**: Codes in `qase.projects({ PROJ1: [1], ... })` must match `testops_multi.projects[].code` in config.
2. **Mode**: Set `mode` to `testops_multi` in qase.config.json.
3. **Builder pattern**: Always call `.create()` after setting metadata (e.g., `qase.projects({...}).create()`).
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project TestCafe example](../../examples/multiProject/testcafe/) for a complete runnable setup.

### Complete Example

Here's a complete TestCafe test file showing multi-project usage:

```javascript
import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Multi-project test suite`.page`https://devexpress.github.io/testcafe/example/`;

// Test reported to two projects
const q1 = qase.projects({ PROJ1: [1], PROJ2: [2] }).create();
test.meta(q1)('User can submit form', async (t) => {
  await t
    .typeText('#developer-name', 'John Doe')
    .click('#tried-test-cafe')
    .click('#submit-button');

  await t.expect(true).ok();
});

// Test with multiple case IDs per project
const q2 = qase.projects({ PROJ1: [10, 11], PROJ2: [20] }).create();
test.meta(q2)('Form validation works correctly', async (t) => {
  await t.click('#submit-button');
  // Validation error should appear
  await t.expect(true).ok();
});

// Test combining multi-project with other metadata
const q3 = qase
  .projects({ PROJ1: [100], PROJ2: [200] })
  .title('Enhanced form test')
  .fields({ severity: 'critical', priority: 'high' })
  .create();
test.meta(q3)('Complete user flow', async (t) => {
  await t
    .typeText('#developer-name', 'Jane Smith')
    .click('#tried-test-cafe')
    .click('#submit-button');
});

// Single-project test (uses default_project)
const q4 = qase.id(50).create();
test.meta(q4)('Test reported to default project', async (t) => {
  await t.expect(1 + 1).eql(2);
});

// Test without Qase metadata (goes to default_project without case ID)
test('Regular test without Qase tracking', async (t) => {
  await t.expect(true).ok();
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Verify `mode` is `testops_multi` (not `testops`) in qase.config.json
* Check that project codes in `qase.projects()` match config codes exactly (case-sensitive)
* Ensure each project has a valid API token with write permissions
* Confirm you called `.create()` at the end of the builder chain

### Wrong Test Cases Linked

* Verify the mapping object has correct project codes as keys
* Check that test case IDs exist in the respective projects
* Enable debug logging to see how the reporter parses multi-project markers
* Ensure the metadata is passed to `test.meta()` correctly

### Default Project Not Working

* Ensure `default_project` is set in `testops_multi` config
* Verify the default project code matches one of the projects in the `projects` array
* Tests without `qase.projects()` will only report to the default project

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Examples](../../examples/multiProject/testcafe/)
