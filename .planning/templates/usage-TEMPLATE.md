# Qase Integration in {{FRAMEWORK_NAME}}

This guide provides comprehensive instructions for integrating Qase with {{FRAMEWORK_NAME}}.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

---

## Table of Contents

- [Adding QaseID](#adding-qaseid)
- [Adding Title](#adding-title)
- [Adding Fields](#adding-fields)
- [Adding Suite](#adding-suite)
- [Ignoring Tests](#ignoring-tests)
- [Muting Tests](#muting-tests)
- [Working with Attachments](#working-with-attachments)
- [Working with Steps](#working-with-steps)
- [Working with Parameters](#working-with-parameters)
- [Multi-Project Support](#multi-project-support)
- [Running Tests](#running-tests)
- [Complete Examples](#complete-examples)

---

## Adding QaseID

Link your automated tests to existing test cases in Qase by specifying the test case ID.

### Single ID

{{QASEID_SINGLE_EXAMPLE}}

### Multiple IDs

{{QASEID_MULTIPLE_EXAMPLE}}

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case (overrides auto-generated title):

{{TITLE_EXAMPLE}}

---

## Adding Fields

Add metadata to your test cases using fields. Both system and custom fields are supported.

### System Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| `description` | Test case description | Any text |
| `preconditions` | Test preconditions | Any text (supports Markdown) |
| `postconditions` | Test postconditions | Any text |
| `severity` | Test severity | `blocker`, `critical`, `major`, `normal`, `minor`, `trivial` |
| `priority` | Test priority | `high`, `medium`, `low` |
| `layer` | Test layer | `e2e`, `api`, `unit` |

### Example

{{FIELDS_EXAMPLE}}

---

## Adding Suite

Organize tests into suites and sub-suites:

### Simple Suite

{{SUITE_SIMPLE_EXAMPLE}}

### Nested Suites

{{SUITE_NESTED_EXAMPLE}}

---

## Ignoring Tests

Exclude a test from Qase reporting. The test still executes, but results are not sent to Qase:

{{IGNORE_EXAMPLE}}

---

## Muting Tests

Mark a test as muted. Muted tests are reported but do not affect the test run status:

{{MUTE_EXAMPLE}}

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results.

### Attach File from Path

{{ATTACH_FILE_EXAMPLE}}

### Attach Content from Code

{{ATTACH_CONTENT_EXAMPLE}}

### Attach to Specific Step

{{ATTACH_STEP_EXAMPLE}}

### Supported MIME Types

Common MIME types are auto-detected. You can also specify explicitly:

| Extension | MIME Type |
|-----------|-----------|
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.txt` | `text/plain` |
| `.json` | `application/json` |
| `.xml` | `application/xml` |
| `.html` | `text/html` |
| `.pdf` | `application/pdf` |

> For more details, see [Attachments Guide](ATTACHMENTS.md).

---

## Working with Steps

Define test steps for detailed reporting in Qase.

### Using Async Function

{{STEP_ASYNC_EXAMPLE}}

### Nested Steps

{{STEP_NESTED_EXAMPLE}}

### Steps with Expected Result

{{STEP_EXPECTED_EXAMPLE}}

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase.

### Basic Parameterized Test

{{PARAMS_BASIC_EXAMPLE}}

### Group Parameters

{{PARAMS_GROUP_EXAMPLE}}

---

## Multi-Project Support

Send test results to multiple Qase projects simultaneously with different test case IDs for each project.

For detailed configuration, examples, and troubleshooting, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Running Tests

### Basic Execution

{{RUN_BASIC_EXAMPLE}}

### With Environment

{{RUN_ENV_EXAMPLE}}

### With Test Plan

{{RUN_PLAN_EXAMPLE}}

### With Existing Test Run

{{RUN_EXISTING_EXAMPLE}}

---

## Complete Examples

### Full Test Example

{{COMPLETE_EXAMPLE}}

### Example Project Structure

```
my-project/
├── qase.config.json
├── {{CONFIG_LOCATION}}
├── tests/
│   ├── {{TEST_FILE_EXAMPLE}}
│   └── ...
└── package.json
```

---

## Troubleshooting

### Tests Not Appearing in Qase

1. Verify `mode` is set to `testops` (not `off` or `report`)
2. Check API token has write permissions
3. Verify project code is correct
4. Check for errors in console output (enable `debug: true`)

### Attachments Not Uploading

1. Verify file path exists and is readable
2. Check file size (large files may take time)
3. Enable debug logging to see upload status

### Results Going to Wrong Test Cases

1. Verify QaseID matches the test case ID in Qase
2. Check for duplicate IDs in your test suite
3. Verify you're using the correct project code

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
