# Multi-Project Support in Cypress

Qase Cypress Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

To enable multi-project support, set the mode to `testops_multi` in your Cypress reporter options (e.g. in `cypress.config.js` or `qase.config.json`):

```json
{
  "mode": "testops_multi",
  "testops": {
    "api": { "token": "<token>", "host": "qase.io" },
    "batch": { "size": 100 }
  },
  "testops_multi": {
    "default_project": "PROJ1",
    "projects": [
      {
        "code": "PROJ1",
        "run": { "title": "PROJ1 Cypress Run", "complete": true }
      },
      {
        "code": "PROJ2",
        "run": { "title": "PROJ2 Cypress Run", "complete": true }
      }
    ]
  }
}
```

## Using `qase.projects()`

The `qase.projects(mapping, nameOrTest)` helper lets you map a test to one or more projects and case IDs.

### Pass the test (recommended)

Pass the result of `it()` as the second argument so the test title is updated with markers; the reporter will parse them and set `testops_project_mapping`:

```javascript
const { qase } = require('cypress-qase-reporter');

describe('Suite', () => {
  qase.projects({ PROJ1: [1], PROJ2: [2] }, it('A test reported to two projects', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
  }));

  qase.projects(
    { PROJ1: [10, 11], PROJ2: [20] },
    it('Multiple cases per project', () => {
      cy.visit('https://example.cypress.io');
    }),
  );
});
```

### Pass the title string

You can also pass a title string; the helper returns the formatted title for use as the first argument to `it()`:

```javascript
it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), () => {
  cy.visit('/login');
});
```

### Combining with other Qase methods

Use `qase.projects()` together with other Qase methods (e.g. `qase.title()`, `qase.attach()`) inside the test.

## Tests Without Project Mapping

If a test does not use `qase.projects()` and has no `(Qase PROJ: ids)` markers in the title, it is sent to the `default_project` from your configuration. If the test also has no `(Qase ID: …)` legacy ID, the result is sent to the default project without linking to a test case.

## Important Notes

1. **Project codes must match**: The project codes in `qase.projects({ PROJ1: [1], ... })` must exactly match the codes in `testops_multi.projects[].code`.

2. **Mode requirement**: Set `mode` to `testops_multi` in your reporter config. Single-project mode (`testops`) does not use project mapping.

3. **Cucumber/BDD**: When using Cypress with Cucumber (e.g. `@badeball/cypress-cucumber-preprocessor`), use tags in feature files: `@qaseid.PROJ1(1) @qaseid.PROJ2(2)`. See [Cucumber documentation](cucumber.md).

## Examples

See the [multi-project Cypress example](../../examples/multiProject/cypress/) for a complete runnable setup.

## Troubleshooting

### Results not appearing in projects

* Ensure `mode` is `testops_multi` in reporter options.
* Verify project codes in `qase.projects()` match `testops_multi.projects[].code`.
* For Cypress, ensure you pass the test to `qase.projects(mapping, it(...))` so the title is updated with markers, or use a title that already contains `(Qase PROJ: ids)`.

### Results sent to wrong project

* Check the `default_project` setting for tests without explicit mapping.
* Project codes are case-sensitive and must match exactly.
