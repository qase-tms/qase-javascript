# Multi-Project Support in {{FRAMEWORK_NAME}}

Qase {{FRAMEWORK_NAME}} Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

---

## Configuration

For detailed configuration options, refer to the [qase-javascript-commons README](../../qase-javascript-commons/README.md#multi-project-support).

### Basic Multi-Project Configuration

Set `mode` to `testops_multi` in your {{FRAMEWORK_NAME}} reporter options (e.g. in `{{CONFIG_LOCATION}}` or `qase.config.json`) and add the `testops_multi` section with `default_project` and `projects`.

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

Use `qase.projects(mapping, name)` to link a test to multiple projects. The first argument is the mapping (project code → array of case IDs); the second is the test name. Use the returned value as your test identifier:

{{MULTI_PROJECT_USAGE_EXAMPLE}}

**Key points:**

- Single project with single ID: `qase(100, 'test name')`
- Multi-project: `qase.projects({ PROJ1: [100], PROJ2: [200] }, 'test name')`
- Multiple IDs per project: `qase.projects({ PROJ1: [10, 11], PROJ2: [20] }, 'test name')`

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

See the [multi-project {{FRAMEWORK_NAME}} example](../../examples/multiProject/{{FRAMEWORK_SLUG}}/) for a complete runnable setup.

### Complete Example

{{COMPLETE_MULTI_PROJECT_EXAMPLE}}

---

## Troubleshooting

### Results Not Appearing in All Projects

* Verify `mode` is `testops_multi` (not `testops`)
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
- [Examples](../../examples/multiProject/{{FRAMEWORK_SLUG}}/)
