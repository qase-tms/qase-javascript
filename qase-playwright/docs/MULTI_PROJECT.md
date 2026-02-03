# Multi-Project Support in Playwright

Qase Playwright Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your Playwright config (e.g. in `playwright.config.js` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

## Specifying Project Mapping

### Inside the test: `qase.projects(mapping)`

Call `qase.projects({ PROJECT_CODE: [id1, id2, ...], ... })` at the start of the test so the result is sent to the specified projects:

```javascript
const { test } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');

test('login and checkout', async ({ page }) => {
  qase.projects({ PROJ1: [1, 2], PROJ2: [3] });
  await page.goto('/login');
  // ...
});
```

### In the test title: `qase.projectsTitle(name, mapping)`

Use `qase.projectsTitle('Test name', { PROJ1: [1], PROJ2: [2] })` as the test name; the reporter parses the generated title and sets the mapping:

```javascript
test(qase.projectsTitle('Login flow', { PROJ1: [100], PROJ2: [200] }), async ({ page }) => {
  await page.goto('/login');
});
```

### Via annotation

You can attach a `QaseProjects` annotation with JSON mapping (e.g. in `test.info().annotations`). The reporter reads it and applies the project mapping.

## Tests Without Project Mapping

Tests that do not call `qase.projects()` or use `qase.projectsTitle()` and have no QaseProjects annotation are sent to the `default_project` from your configuration. If they have a single-project Qase ID, that ID is used for the default project.

## Important Notes

1. **Project codes must match**: Codes in `qase.projects({ PROJ1: [1], ... })` must match `testops_multi.projects[].code`.
2. **Mode**: Use `mode: 'testops_multi'` in reporter config.
3. **Each project gets its own run**: Each project in `testops_multi.projects` will have a separate test run created.

## Examples

See the [multi-project Playwright example](../../examples/multiProject/playwright/) for a complete runnable setup.

## Troubleshooting

* Ensure `mode` is `testops_multi` and project codes in your code match the config.
* If results do not appear, check that `qase.projects()` is called (or the title/annotation is set) before the test body runs.
