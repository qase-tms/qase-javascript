# Multi-Project Support in Cypress

Qase Cypress Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

To enable multi-project support, set the mode to `testops_multi` in your Cypress reporter options (e.g. in `cypress.config.js` or `qase.config.json`):

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

## Using `qase.projects()`

The `qase.projects(mapping, nameOrTest)` helper lets you map a test to one or more projects and case IDs.

### Pass the test (recommended)

Pass the result of `it()` as the second argument so the test title is updated with markers; the reporter will parse them and set `testops_project_mapping`:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

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
  cy.get('#username').type('testuser');
  cy.get('#login-button').click();
});
```

**Key points:**

- Single project: `it(qase(100, 'test name'), () => { ... })`
- Multi-project: `it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'test name'), () => { ... })`
- Multiple IDs per project: `it(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'test name'), () => { ... })`

### Combining with other Qase methods

Use `qase.projects()` together with other Qase methods (e.g. `qase.title()`, `qase.attach()`) inside the test.

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

If a test does not use `qase.projects()` and has no `(Qase PROJ: ids)` markers in the title, it is sent to the `default_project` from your configuration. If the test also has no `(Qase ID: …)` legacy ID, the result is sent to the default project without linking to a test case.

---

## Important Notes

1. **Project codes must match**: The project codes in `qase.projects({ PROJ1: [1], ... })` must exactly match the codes in `testops_multi.projects[].code`.
2. **Mode requirement**: Set `mode` to `testops_multi` in your reporter config. Single-project mode (`testops`) does not use project mapping.
3. **Cucumber/BDD**: When using Cypress with Cucumber (e.g. `@badeball/cypress-cucumber-preprocessor`), use tags in feature files: `@qaseid.PROJ1(1) @qaseid.PROJ2(2)`. See [Cucumber documentation](cucumber.md).
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project Cypress example](../../examples/multiProject/cypress/) for a complete runnable setup.

### Complete Example

Here's a complete Cypress test file showing multi-project usage:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Multi-project test suite', () => {
  // Test reported to two projects
  it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'User can login successfully'), () => {
    cy.visit('https://example.cypress.io');
    cy.get('#username').type('testuser');
    cy.get('#password').type('password123');
    cy.get('#login-button').click();
    cy.url().should('include', '/dashboard');
  });

  // Test with multiple case IDs per project
  it(qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'Checkout process works'), () => {
    cy.visit('https://example.cypress.io/cart');
    cy.get('#checkout-button').click();
    cy.contains('Order successful').should('be.visible');
  });

  // Combining multi-project with other Qase methods
  it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'User registration flow'), () => {
    qase.title('Complete user registration with verification');
    qase.fields({ severity: 'critical', priority: 'high' });

    cy.visit('https://example.cypress.io/register');
    cy.get('#email').type('newuser@example.com');
    cy.get('#register-button').click();
    cy.contains('Registration successful').should('be.visible');
  });

  // Single-project test (uses default_project)
  it(qase(50, 'Test reported to default project'), () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').should('be.visible');
  });

  // Test without Qase metadata (goes to default_project without case ID)
  it('Regular test without Qase tracking', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').should('be.visible');
  });
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Ensure `mode` is `testops_multi` in reporter options
* Verify project codes in `qase.projects()` match `testops_multi.projects[].code` exactly (case-sensitive)
* For Cypress, ensure you pass the test to `qase.projects(mapping, it(...))` so the title is updated with markers, or use a title that already contains `(Qase PROJ: ids)`
* Ensure each project has a valid API token with write permissions

### Wrong Test Cases Linked

* Check the `default_project` setting for tests without explicit mapping
* Project codes are case-sensitive and must match exactly
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
- [Examples](../../examples/multiProject/cypress/)
