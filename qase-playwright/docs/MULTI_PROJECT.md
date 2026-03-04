# Multi-Project Support in Playwright

Qase Playwright Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your Playwright config (e.g. in `playwright.config.ts` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

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

## Specifying Project Mapping

Playwright offers multiple approaches to map tests to multiple projects:

### Inside the test: `qase.projects(mapping)`

Call `qase.projects({ PROJECT_CODE: [id1, id2, ...], ... })` at the start of the test so the result is sent to the specified projects:

```typescript
import { test } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test('login and checkout', async ({ page }) => {
  qase.projects({ PROJ1: [1, 2], PROJ2: [3] });
  await page.goto('/login');
  // ...
});
```

### In the test title: `qase.projectsTitle(name, mapping)`

Use `qase.projectsTitle('Test name', { PROJ1: [1], PROJ2: [2] })` as the test name; the reporter parses the generated title and sets the mapping:

```typescript
test(qase.projectsTitle('Login flow', { PROJ1: [100], PROJ2: [200] }), async ({ page }) => {
  await page.goto('/login');
});
```

### Via annotation

You can attach a `QaseProjects` annotation with JSON mapping (e.g. in `test.info().annotations`). The reporter reads it and applies the project mapping.

**Key points:**

- Single project: `qase.id(100)` (reports to default_project)
- Multi-project (in test): `qase.projects({ PROJ1: [100], PROJ2: [200] })`
- Multi-project (in title): `qase.projectsTitle('Test name', { PROJ1: [100], PROJ2: [200] })`
- Multiple IDs per project: `qase.projects({ PROJ1: [10, 11], PROJ2: [20] })`

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

Tests that do not call `qase.projects()` or use `qase.projectsTitle()` and have no QaseProjects annotation are sent to the `default_project` from your configuration. If they have a single-project Qase ID, that ID is used for the default project.

---

## Important Notes

1. **Project codes must match**: Codes in `qase.projects({ PROJ1: [1], ... })` must match `testops_multi.projects[].code` in config.
2. **Mode**: Use `mode: 'testops_multi'` in reporter config.
3. **Each project gets its own run**: Each project in `testops_multi.projects` will have a separate test run created.
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project Playwright example](../../examples/multiProject/playwright/) for a complete runnable setup.

### Complete Example

Here's a complete Playwright test file showing multi-project usage:

```typescript
import { test, expect } from '@playwright/test';
import { qase } from 'playwright-qase-reporter';

test.describe('Multi-project test suite', () => {
  // Test reported to two projects using qase.projects() in test
  test('User can login successfully', async ({ page }) => {
    qase.projects({ PROJ1: [1], PROJ2: [2] });

    await page.goto('https://example.com/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('#login-button');

    await expect(page).toHaveURL(/dashboard/);
  });

  // Test reported to two projects using projectsTitle
  test(qase.projectsTitle('Checkout process works', { PROJ1: [10, 11], PROJ2: [20] }), async ({ page }) => {
    await page.goto('https://example.com/cart');
    await page.click('#checkout-button');

    await expect(page.locator('.success-message')).toBeVisible();
  });

  // Combining multi-project with other Qase methods
  test('User registration flow', async ({ page }) => {
    qase.projects({ PROJ1: [100], PROJ2: [200] });
    qase.title('Complete user registration with verification');
    qase.fields({ severity: 'critical', priority: 'high' });

    await page.goto('https://example.com/register');
    await page.fill('#email', 'newuser@example.com');
    await page.click('#register-button');

    await expect(page.locator('.confirmation')).toBeVisible();
  });

  // Single-project test (uses default_project)
  test('Test reported to default project', async ({ page }) => {
    qase.id(50);

    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
  });

  // Test without Qase metadata (goes to default_project without case ID)
  test('Regular test without Qase tracking', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
  });
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Ensure `mode` is `testops_multi` (not `TestOps`) and project codes in your code match the config
* Check that project codes match config codes exactly (case-sensitive)
* Ensure each project has a valid API token with write permissions
* If results do not appear, check that `qase.projects()` is called (or the title/annotation is set) before the test body runs

### Wrong Test Cases Linked

* Verify the mapping object has correct project codes as keys
* Check that test case IDs exist in the respective projects
* Enable debug logging to see how the reporter parses multi-project markers

### Default Project Not Working

* Ensure `default_project` is set in `testops_multi` config
* Verify the default project code matches one of the projects in the `projects` array
* Tests without `qase.projects()` or `qase.projectsTitle()` will only report to the default project

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Examples](../../examples/multiProject/playwright/)
