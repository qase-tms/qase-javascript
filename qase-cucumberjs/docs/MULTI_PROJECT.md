# Multi-Project Support in CucumberJS

Qase CucumberJS Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same scenario execution to different projects with different test case IDs, which is useful when:

* You need to report the same scenario to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your `qase.config.json` and add the `testops_multi` section with `default_project` and `projects`.

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

## Tag Format

* **Multi-project**: `@qaseid.PROJECT_CODE(id1,id2,...)` — project code must match `testops_multi.projects[].code`.
* **Legacy single-project**: `@QaseID=123` or `@qaseid(123)` — sent to `default_project` with that ID.

## Important Notes

1. **Project codes must match**: The project code in `@qaseid.PROJ1(1)` must match a `code` in `testops_multi.projects`.
2. **Mode**: Set `mode` to `testops_multi` in `qase.config.json`.
3. **Default project**: Scenarios without any Qase tags are sent to `default_project` without a case ID.
4. **Multiple tags**: You can combine multiple `@qaseid.PROJ(ids)` tags to report one scenario to multiple projects.

## Examples

See the [multi-project CucumberJS example](../../examples/multiProject/cucumberjs/) for a complete runnable setup.

## Troubleshooting

### Results not appearing in projects

* Verify `mode` is `testops_multi` in `qase.config.json`.
* Check that project codes in tags (e.g. `@qaseid.DEVX(1)`) match `testops_multi.projects[].code` exactly (case-sensitive).
* Ensure all projects are listed in `testops_multi.projects`.

### Scenarios sent to wrong project

* For scenarios without tags, check the `default_project` setting.
* Ensure tag spelling and project codes match the configuration exactly.
