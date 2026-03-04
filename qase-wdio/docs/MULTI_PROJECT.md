# Multi-Project Support in WebdriverIO (WDIO)

Qase WDIO Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your WDIO config (e.g. in `wdio.conf.js` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

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

Use `qase.projects(mapping, name)` to set the test title with multi-project markers. Use the returned string as the test name:

```javascript
const { qase } = require('wdio-qase-reporter');

// Single project
it(qase(1, 'should work'), async () => {
  await browser.url('https://example.com');
  expect(await browser.getTitle()).toBe('Example Domain');
});

// Multi-project
it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), async () => {
  await browser.url('https://example.com/login');
  await $('#username').setValue('testuser');
  await $('#login-button').click();
});

// Multiple IDs per project
it(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'Checkout'), async () => {
  await browser.url('https://example.com/cart');
  await $('#checkout-button').click();
});
```

**Key points:**

- Single project with single ID: `it(qase(100, 'test name'), async () => { ... })`
- Multi-project: `it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'test name'), async () => { ... })`
- Multiple IDs per project: `it(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'test name'), async () => { ... })`

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

Tests that do not use `qase.projects()` and have no `(Qase PROJ: ids)` in the title are sent to the `default_project`. If they use `qase(id, name)` (single-project), that ID is used for the default project.

---

## Important Notes

1. **Project codes must match**: Codes in `qase.projects({ PROJ1: [1], ... })` must match `testops_multi.projects[].code` in config.
2. **Mode**: Set `mode` to `testops_multi` in WDIO reporter config.
3. **Title format**: The helper produces a title like `Name (Qase PROJ1: 1,2) (Qase PROJ2: 3)` so the reporter can parse the mapping.
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project WDIO example](../../examples/multiProject/wdio/) for a complete runnable setup.

### Complete Example

Here's a complete WDIO test file showing multi-project usage:

```javascript
const { qase } = require('wdio-qase-reporter');

describe('Multi-project test suite', () => {
  // Test reported to two projects
  it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'User can login successfully'), async () => {
    await browser.url('https://example.com/login');
    await $('#username').setValue('testuser');
    await $('#password').setValue('password123');
    await $('#login-button').click();

    expect(await browser.getUrl()).toContain('dashboard');
  });

  // Test with multiple case IDs per project
  it(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'Checkout process works'), async () => {
    await browser.url('https://example.com/cart');
    await $('#checkout-button').click();

    const successMessage = await $('.success-message');
    expect(await successMessage.isDisplayed()).toBe(true);
  });

  // Single-project test (uses default_project)
  it(qase(50, 'Test reported to default project'), async () => {
    await browser.url('https://example.com');
    expect(await browser.getTitle()).toBe('Example Domain');
  });

  // Test without Qase metadata (goes to default_project without case ID)
  it('Regular test without Qase tracking', async () => {
    await browser.url('https://example.com');
    expect(await browser.getTitle()).toBeTruthy();
  });
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Verify `mode` is `testops_multi` (not `testops`) and project codes in `qase.projects()` match the config
* Check that project codes match config codes exactly (case-sensitive)
* Ensure each project has a valid API token with write permissions
* Ensure the test name is the string returned by `qase.projects(mapping, name)`

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
- [Examples](../../examples/multiProject/wdio/)
