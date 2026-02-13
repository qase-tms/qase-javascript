# Multi-Project Support in Jest

Qase Jest Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your Jest reporter options (e.g. in `jest.config.js` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

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

## Using `qase.projects(mapping, name)`

Use `qase.projects(mapping, name)` to set the test title with multi-project markers. The first argument is the mapping (project code → array of case IDs); the second is the test name. Use the returned string as the test name:

```javascript
const { qase } = require('jest-qase-reporter/jest');

// Single project with single ID
test(qase(100, 'login flow'), () => {
  expect(true).toBe(true);
});

// Multi-project: one test, multiple projects
test(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'login flow'), () => {
  expect(true).toBe(true);
});

// Multiple IDs per project
test(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'checkout'), () => {
  expect(true).toBe(true);
});
```

**Key points:**

- Single project with single ID: `test(qase(100, 'test name'), () => { ... })`
- Multi-project: `test(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'test name'), () => { ... })`
- Multiple IDs per project: `test(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'test name'), () => { ... })`

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

Tests that do not use `qase.projects()` and have no `(Qase PROJ: ids)` in the title are sent to the `default_project`. If they use `qase(id, name)` (single-project syntax), that ID is used for the default project.

---

## Important Notes

1. **Project codes must match**: Codes in `qase.projects({ PROJ1: [1], ... })` must match `testops_multi.projects[].code` in config.
2. **Mode**: Set `mode` to `testops_multi` in reporter config.
3. **Title format**: The helper produces a title like `Name (Qase PROJ1: 1,2) (Qase PROJ2: 3)` so the reporter can parse the mapping.
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project Jest example](../../examples/multiProject/jest/) for a complete runnable setup.

### Complete Example

Here's a complete Jest test file showing multi-project usage:

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Multi-project test suite', () => {
  // Test reported to two projects
  test(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'User can login successfully'), () => {
    const username = 'testuser';
    const password = 'password123';

    expect(username).toBeDefined();
    expect(password).toBeDefined();
  });

  // Test with multiple case IDs per project
  test(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'Checkout process works'), () => {
    const cart = { items: 2, total: 99.99 };

    expect(cart.items).toBeGreaterThan(0);
    expect(cart.total).toBeGreaterThan(0);
  });

  // Combining multi-project with other Qase methods
  test(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'User registration'), () => {
    qase.title('Complete user registration flow');
    qase.fields({ severity: 'critical', priority: 'high' });

    expect(true).toBe(true);
  });

  // Single-project test (uses default_project)
  test(qase(50, 'Test reported to default project'), () => {
    expect(1 + 1).toBe(2);
  });

  // Test without Qase metadata (goes to default_project without case ID)
  test('Regular test without Qase tracking', () => {
    expect(true).toBe(true);
  });
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Verify `mode` is `testops_multi` (not `testops`) in reporter config
* Check that project codes in `qase.projects()` match config codes exactly (case-sensitive)
* Ensure each project has a valid API token with write permissions

### Wrong Test Cases Linked

* Verify the mapping object has correct project codes as keys
* Check that test case IDs exist in the respective projects
* Enable debug logging to see how the reporter parses multi-project markers

### Default Project Not Working

* Ensure `default_project` is set in `testops_multi` config
* Verify the default project code matches one of the projects in the `projects` array
* Tests without `qase.projects()` will only report to the default project

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Examples](../../examples/multiProject/jest/)
