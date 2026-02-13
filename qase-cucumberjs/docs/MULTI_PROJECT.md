# Multi-Project Support in CucumberJS

Qase CucumberJS Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same scenario execution to different projects with different test case IDs, which is useful when:

* You need to report the same scenario to different projects
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

## Using Tags in Feature Files

Map scenarios to projects and case IDs using tags in your `.feature` files.

### Multi-project tags: `@qaseid.PROJECT_CODE(ids)`

Use one or more tags per scenario. Each tag specifies a project code and one or more test case IDs:

```gherkin
Feature: Multi-project example

  @qaseid.DEVX(1)
  @qaseid.DEMO(2)
  Scenario: Scenario reported to two projects
    Given I have a step
    When I perform an action
    Then I should see a result
```

### Multiple IDs per project

You can specify multiple test case IDs for a single project using comma-separated values:

```gherkin
  @qaseid.PROJ1(10,11)
  @qaseid.PROJ2(20)
  Scenario: Scenario with multiple cases per project
    Given I have multiple test cases
```

### Single project (legacy)

For a single project you can still use the legacy tag format:

```gherkin
  @QaseID=3
  Scenario: Scenario with legacy single-project tag
    Given I have a step
```

### Scenarios without Qase ID

Scenarios with no `@qaseid` or `@QaseID` tags are sent to the `default_project` from your configuration. The result is sent without linking to a test case (no case ID).

**Key points:**

- Single project (legacy): `@QaseID=100`
- Multi-project: `@qaseid.PROJ1(100)` and `@qaseid.PROJ2(200)` (multiple tags)
- Multiple IDs per project: `@qaseid.PROJ1(10,11)` (comma-separated, no spaces)

---

## Tag Format

* **Multi-project**: `@qaseid.PROJECT_CODE(id1,id2,...)` — project code must match `testops_multi.projects[].code`.
* **Legacy single-project**: `@QaseID=123` or `@qaseid(123)` — sent to `default_project` with that ID.

---

## Important Notes

1. **Project codes must match**: The project code in `@qaseid.PROJ1(1)` must match a `code` in `testops_multi.projects`.
2. **Mode**: Set `mode` to `testops_multi` in `qase.config.json`.
3. **Default project**: Scenarios without any Qase tags are sent to `default_project` without a case ID.
4. **Multiple tags**: You can combine multiple `@qaseid.PROJ(ids)` tags to report one scenario to multiple projects.
5. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project CucumberJS example](../../examples/multiProject/cucumberjs/) for a complete runnable setup.

### Complete Example

Here's a complete Gherkin feature file showing multi-project usage:

```gherkin
Feature: User Authentication
  As a user
  I want to authenticate
  So I can access the application

  @qaseid.PROJ1(1)
  @qaseid.PROJ2(2)
  Scenario: User can login successfully
    Given I am on the login page
    When I enter username "testuser"
    And I enter password "password123"
    And I click the login button
    Then I should see the dashboard

  @qaseid.PROJ1(10,11)
  @qaseid.PROJ2(20)
  Scenario: User registration works
    Given I am on the registration page
    When I enter email "newuser@example.com"
    And I enter password "securepass456"
    And I click the register button
    Then I should see a confirmation message

  @QaseID=50
  Scenario: Password reset (single project - legacy)
    Given I am on the login page
    When I click "Forgot password"
    And I enter email "user@example.com"
    Then I should receive a reset email

  Scenario: Public page loads (no Qase tracking)
    Given I am on the homepage
    Then I should see the welcome message
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Verify `mode` is `testops_multi` in `qase.config.json`
* Check that project codes in tags (e.g. `@qaseid.DEVX(1)`) match `testops_multi.projects[].code` exactly (case-sensitive)
* Ensure all projects are listed in `testops_multi.projects`
* Ensure each project has a valid API token with write permissions

### Wrong Test Cases Linked

* Verify tag spelling and format: `@qaseid.PROJECT_CODE(id1,id2)` (no spaces after commas)
* Check that test case IDs exist in the respective projects
* Enable debug logging to see how the reporter parses tags

### Default Project Not Working

* For scenarios without tags, check the `default_project` setting
* Ensure tag spelling and project codes match the configuration exactly
* Verify the default project code matches one of the projects in the `projects` array

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Examples](../../examples/multiProject/cucumberjs/)
