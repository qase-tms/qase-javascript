# Multi-Project Support in Vitest

Qase Vitest Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your Vitest config (e.g. in `vitest.config.ts` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

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

## Using `addQaseProjects(name, mapping)`

Use the `addQaseProjects(name, mapping)` helper from `vitest-qase-reporter/vitest` to build a test name that includes multi-project markers. The reporter parses the title and sets `testops_project_mapping`:

```typescript
import { test } from 'vitest';
import { addQaseId, addQaseProjects } from 'vitest-qase-reporter/vitest';

// Single project (legacy)
test(addQaseId('login flow', [100]), async () => {
  expect(true).toBe(true);
});

// Multi-project
test(addQaseProjects('login flow', { PROJ1: [100], PROJ2: [200] }), async () => {
  expect(true).toBe(true);
});

// Multiple IDs per project
test(addQaseProjects('checkout', { PROJ1: [10, 11], PROJ2: [20] }), async () => {
  expect(true).toBe(true);
});
```

**Key points:**

- Single project with single ID: `test(addQaseId('test name', [100]), () => { ... })`
- Multi-project: `test(addQaseProjects('test name', { PROJ1: [100], PROJ2: [200] }), () => { ... })`
- Multiple IDs per project: `test(addQaseProjects('test name', { PROJ1: [10, 11], PROJ2: [20] }), () => { ... })`

Project codes must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

Tests whose name does not contain multi-project markers (and have no single-project `(Qase ID: …)`) are sent to the `default_project`. Results without any case ID are sent to the default project without linking to a test case.

---

## Important Notes

1. **Project codes must match**: Keys in `addQaseProjects('name', { PROJ1: [1], ... })` must match `testops_multi.projects[].code` in config.
2. **Mode**: Use `mode: 'testops_multi'` in Vitest reporter config.
3. **Title format**: The helper produces a title like `Name (Qase PROJ1: 1,2) (Qase PROJ2: 3)`.
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project Vitest example](../../examples/multiProject/vitest/) for a complete runnable setup.

### Complete Example

Here's a complete Vitest test file showing multi-project usage:

```typescript
import { test, expect, describe } from 'vitest';
import { addQaseId, addQaseProjects } from 'vitest-qase-reporter/vitest';

describe('Multi-project test suite', () => {
  // Test reported to two projects
  test(addQaseProjects('User can login successfully', { PROJ1: [1], PROJ2: [2] }), async () => {
    const username = 'testuser';
    const password = 'password123';

    expect(username).toBeDefined();
    expect(password).toBeDefined();
  });

  // Test with multiple case IDs per project
  test(addQaseProjects('Checkout process works', { PROJ1: [10, 11], PROJ2: [20] }), async () => {
    const cart = { items: 2, total: 99.99 };

    expect(cart.items).toBeGreaterThan(0);
    expect(cart.total).toBeGreaterThan(0);
  });

  // Single-project test (uses default_project)
  test(addQaseId('Test reported to default project', [50]), async () => {
    expect(1 + 1).toBe(2);
  });

  // Test without Qase metadata (goes to default_project without case ID)
  test('Regular test without Qase tracking', async () => {
    expect(true).toBe(true);
  });
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Ensure `mode` is `testops_multi` (not `TestOps`) and project codes match the config
* Check that project codes in `addQaseProjects()` match config codes exactly (case-sensitive)
* Ensure each project has a valid API token with write permissions
* Use `addQaseProjects(name, mapping)` (or an equivalent title format) so the reporter can parse the mapping from the test name

### Wrong Test Cases Linked

* Verify the mapping object has correct project codes as keys
* Check that test case IDs exist in the respective projects
* Enable debug logging to see how the reporter parses multi-project markers

### Default Project Not Working

* Ensure `default_project` is set in `testops_multi` config
* Verify the default project code matches one of the projects in the `projects` array
* Tests without multi-project markers will only report to the default project

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Examples](../../examples/multiProject/vitest/)
