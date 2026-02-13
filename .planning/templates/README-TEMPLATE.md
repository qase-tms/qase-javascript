# [Qase TestOps](https://qase.io) {{FRAMEWORK_NAME}} Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

Qase {{FRAMEWORK_NAME}} Reporter enables seamless integration between your {{FRAMEWORK_NAME}} tests and [Qase TestOps](https://qase.io), providing automatic test result reporting, test case management, and comprehensive test analytics.

## Features

- Link automated tests to Qase test cases by ID
- Auto-create test cases from your test code
- Report test results with rich metadata (fields, attachments, steps)
- Support for parameterized tests
- Multi-project reporting support
- Flexible configuration (file, environment variables, {{FRAMEWORK_NAME}} config)

## Installation

```sh
npm install --save-dev {{PACKAGE_NAME}}
```

## Quick Start

**1. Create `qase.config.json` in your project root:**

```json
{
  "mode": "testops",
  "testops": {
    "project": "YOUR_PROJECT_CODE",
    "api": {
      "token": "YOUR_API_TOKEN"
    }
  }
}
```

**2. Add Qase ID to your test:**

{{QUICK_START_TEST_EXAMPLE}}

**3. Run your tests:**

```sh
{{RUN_COMMAND}}
```

## Configuration

The reporter is configured via (in order of priority):

1. **{{CONFIG_LOCATION}}** ({{FRAMEWORK_NAME}}-specific, highest priority)
2. **Environment variables** (`QASE_*`)
3. **Config file** (`qase.config.json`)

### Minimal Configuration

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| `mode` | `QASE_MODE` | Set to `testops` to enable reporting |
| `testops.project` | `QASE_TESTOPS_PROJECT` | Your Qase project code |
| `testops.api.token` | `QASE_TESTOPS_API_TOKEN` | Your Qase API token |

### Example `qase.config.json`

```json
{
  "mode": "testops",
  "fallback": "report",
  "testops": {
    "project": "YOUR_PROJECT_CODE",
    "api": {
      "token": "YOUR_API_TOKEN"
    },
    "run": {
      "title": "{{FRAMEWORK_NAME}} Automated Run"
    },
    "batch": {
      "size": 100
    }
  },
  "report": {
    "driver": "local",
    "connection": {
      "local": {
        "path": "./build/qase-report",
        "format": "json"
      }
    }
  }
}
```

> **Full configuration reference:** See [qase-javascript-commons](../qase-javascript-commons/README.md) for all available options including logging, status mapping, execution plans, and more.

## Usage

### Link Tests with Test Cases

Associate your tests with Qase test cases using test case IDs:

{{LINK_TESTS_EXAMPLE}}

### Add Metadata

Enhance your tests with additional information:

{{METADATA_EXAMPLE}}

### Ignore Tests

Exclude specific tests from Qase reporting (test still runs, but results are not sent):

{{IGNORE_EXAMPLE}}

### Test Result Statuses

| {{FRAMEWORK_NAME}} Result | Qase Status |
|---------------------------|-------------|
{{STATUS_TABLE}}

> For more usage examples, see the [Usage Guide](docs/usage.md).

## Running Tests

{{RUNNING_TESTS_EXAMPLES}}

## Requirements

- Node.js >= 14
- {{FRAMEWORK_NAME}} >= {{FRAMEWORK_VERSION}}

## Documentation

| Guide | Description |
|-------|-------------|
| [Usage Guide](docs/usage.md) | Complete usage reference with all methods and options |
| [Attachments](docs/ATTACHMENTS.md) | Adding screenshots, logs, and files to test results |
| [Steps](docs/STEPS.md) | Defining test steps for detailed reporting |
| [Multi-Project Support](docs/MULTI_PROJECT.md) | Reporting to multiple Qase projects |
| [Upgrade Guide](docs/UPGRADE.md) | Migration guide for breaking changes |

## Examples

See the [examples directory](../examples/) for complete working examples.

## License

Apache License 2.0. See [LICENSE](../LICENSE) for details.
