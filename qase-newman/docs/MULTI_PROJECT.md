# Multi-Project Support in Newman

Qase Newman Reporter supports sending test results to multiple Qase projects simultaneously. This feature allows you to report the same test execution to different projects with different test case IDs, which is useful when:

* You need to report the same test to different projects
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

## Using Comment-Based Markers in Postman Collections

Newman uses comment-based markers in your Postman collection test scripts to map tests to multiple projects. Unlike other frameworks, Newman does not have a programmatic `qase.projects()` API because Newman executes Postman collection JSON files.

### Multi-Project Markers

Add special comments before your `pm.test()` calls to specify which projects and test case IDs to use:

```javascript
// qase PROJ1: 1
// qase PROJ2: 2
pm.test('Login flow', function () {
  pm.response.to.have.status(200);
});
```

### Multiple Test Case IDs per Project

You can link a test to multiple case IDs within the same project by using comma-separated IDs:

```javascript
// qase PROJ1: 10,11
// qase PROJ2: 20
pm.test('Checkout process', function () {
  pm.expect(pm.response.json()).to.have.property('orderId');
});
```

### Single-Project Format (Legacy)

You can still use the single-project format which reports to the `default_project`:

```javascript
// qase: 100
pm.test('User registration', function () {
  pm.response.to.have.status(201);
});
```

**Key points:**

- Single project with single ID: `// qase: 100`
- Multi-project: `// Qase PROJ1: 1` and `// Qase PROJ2: 2` (separate comments)
- Multiple IDs per project: `// Qase PROJ1: 10,11` (comma-separated, no spaces)

Project codes (e.g. `PROJ1`, `PROJ2`) must match `testops_multi.projects[].code` in your config.

---

## Tests Without Project Mapping

Tests that do not have `// Qase PROJECT: ids` comments are sent to the `default_project`. If they use the single-project format `// qase: id`, that ID is used for the default project.

---

## Important Notes

1. **Project codes must match**: Codes in `// Qase PROJ1: 1` comments must match `testops_multi.projects[].code` in config.
2. **Mode**: Set `mode` to `testops_multi` in qase.config.json.
3. **Comment format**: Use exact format `// Qase PROJECT_CODE: id1,id2` before `pm.test()` calls.
4. **API tokens**: Each project in `testops_multi.projects[]` can have its own API token for separate authentication.

---

## Examples

See the [multi-project Newman example](../../examples/multiProject/newman/) for a complete runnable setup.

### Complete Example

Here's a complete Postman collection test script showing multi-project usage:

```javascript
// Test reported to two projects
// qase PROJ1: 1
// qase PROJ2: 2
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Response has expected structure', function () {
  pm.expect(pm.response.json()).to.have.property('args');
});

// Test reported to multiple cases in different projects
// qase PROJ1: 10,11
// qase PROJ2: 20
pm.test('Response contains source parameter', function () {
  pm.expect(pm.response.json().args).to.have.property('source');
});

// Test with single-project format (goes to default_project)
// qase: 100
pm.test('Headers are present', function () {
  pm.response.to.have.header('Content-Type');
});

// Test without any markers (goes to default_project without case ID)
pm.test('Response time is acceptable', function () {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

---

## Troubleshooting

### Results Not Appearing in All Projects

* Verify `mode` is `testops_multi` (not `testops`) in qase.config.json
* Check that project codes in comments match config codes exactly (case-sensitive)
* Ensure each project has a valid API token with write permissions
* Verify comments are placed immediately before `pm.test()` calls

### Wrong Test Cases Linked

* Verify the comment format: `// Qase PROJECT_CODE: id1,id2` (no spaces after commas)
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
- [Examples](../../examples/multiProject/newman/)
