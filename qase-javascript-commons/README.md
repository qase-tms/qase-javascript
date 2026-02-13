# Qase JavaScript Commons

This module is an SDK for developing test reporters for Qase TMS.
It's using `qaseio` as an API client, and all Qase reporters are, in turn,
using this package.
You should use it if you're developing your own test reporter for a special-purpose framework.

To report results from tests using a popular framework or test runner,
don't install this module directly and
use the corresponding reporter module instead:

* [CucumberJS](https://github.com/qase-tms/qase-javascript/tree/main/qase-cucumberjs#readme)
* [Cypress](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress#readme)
* [Jest](https://github.com/qase-tms/qase-javascript/tree/main/qase-jest#readme)
* [Newman](https://github.com/qase-tms/qase-javascript/tree/main/qase-newman#readme)
* [Playwright](https://github.com/qase-tms/qase-javascript/tree/main/qase-playwright#readme)
* [TestCafe](https://github.com/qase-tms/qase-javascript/tree/main/qase-testcafe#readme)

## Installation

```bash
npm install qase-javascript-commons
```

## Configuration

Qase JS Reporters can be configured in multiple ways:

* using a config file `qase.config.json`
* using environment variables

All configuration options are listed in the table below:

| Description                                                                                                           | Config file                | Environment variable            | Default value                           | Required | Possible values            |
|-----------------------------------------------------------------------------------------------------------------------|----------------------------|---------------------------------|-----------------------------------------|----------|----------------------------|
| **Common**                                                                                                            |                            |                                 |                                         |          |                            |
| Mode of reporter                                                                                                      | `mode`                     | `QASE_MODE`                     | `off`                                  | No       | `testops`, `testops_multi`, `report`, `off` |
| Fallback mode of reporter                                                                                             | `fallback`                 | `QASE_FALLBACK`                 | `off`                                   | No       | `testops`, `testops_multi`, `report`, `off` |
| Environment                                                                                                           | `environment`              | `QASE_ENVIRONMENT`              | undefined                              | No       | Any string                 |
| Root suite                                                                                                            | `rootSuite`                | `QASE_ROOT_SUITE`               | undefined                               | No       | Any string                 |
| Enable debug logs                                                                                                     | `debug`                    | `QASE_DEBUG`                    | `False`                                 | No       | `True`, `False`            |
| Enable capture logs from `stdout` and `stderr`                                                                        | `testops.defect`           | `QASE_CAPTURE_LOGS`             | `False`                                 | No       | `True`, `False`            |
| Map test result statuses to different values (format: `fromStatus=toStatus`)                                          | `statusMapping`                     | `QASE_STATUS_MAPPING`                    | undefined                               | No       | Object mapping statuses (e.g., `{"invalid": "failed", "skipped": "passed"}`) |
| **Logging configuration**                                                                                             |                            |                                 |                                         |          |                            |
| Enable/disable console output for reporter logs                                                                       | `logging.console`          | `QASE_LOGGING_CONSOLE`          | `True`                                  | No       | `True`, `False`            |
| Enable/disable file output for reporter logs                                                                          | `logging.file`             | `QASE_LOGGING_FILE`             | Same as `debug` setting                 | No       | `True`, `False`            |
| **Qase Report configuration**                                                                                         |                            |                                 |                                         |          |                            |
| Driver used for report mode                                                                                           | `report.driver`            | `QASE_REPORT_DRIVER`            | `local`                                 | No       | `local`                    |
| Path to save the report                                                                                               | `report.connection.path`   | `QASE_REPORT_CONNECTION_PATH`   | `./build/qase-report`                   |          |                            |
| Local report format                                                                                                   | `report.connection.format` | `QASE_REPORT_CONNECTION_FORMAT` | `json`                                  |          | `json`, `jsonp`            |
| **Qase TestOps configuration**                                                                                        |                            |                                 |                                         |          |                            |
| Token for [API access](https://developers.qase.io/#authentication)                                                    | `testops.api.token`        | `QASE_TESTOPS_API_TOKEN`        |  undefined                              | Yes      | Any string                 |
| Qase API host. For enterprise users, specify address: `example.qase.io`                                           | `testops.api.host`         | `QASE_TESTOPS_API_HOST`         | `qase.io`                               | No       | Any string                 |
| Qase enterprise environment                                                                                           | `testops.api.enterprise`   | `QASE_TESTOPS_API_ENTERPRISE`   | `False`                                 | No       | `True`, `False`            |
| Code of your project, which you can take from the URL: `https://app.qase.io/project/DEMOTR` - `DEMOTR` is the project code | `testops.project`          | `QASE_TESTOPS_PROJECT`          |  undefined                              | Yes      | Any string                 |
| Qase test run ID                                                                                                      | `testops.run.id`           | `QASE_TESTOPS_RUN_ID`           |  undefined                              | No       | Any integer                |
| Qase test run title                                                                                                   | `testops.run.title`        | `QASE_TESTOPS_RUN_TITLE`        | `Automated run <Current date and time>` | No       | Any string                 |
| Qase test run description                                                                                             | `testops.run.description`  | `QASE_TESTOPS_RUN_DESCRIPTION`  | `<Framework name> automated run`        | No       | Any string                 |
| Qase test run complete                                                                                                | `testops.run.complete`     | `QASE_TESTOPS_RUN_COMPLETE`     | `True`                                  |          | `True`, `False`            |
| Array of tags to be added to the test run                                                                             | `testops.run.tags`         | `QASE_TESTOPS_RUN_TAGS`         | `[]`                                    | No       | Array of strings           |
| External link to associate with test run (e.g., Jira ticket)                                                          | `testops.run.externalLink` | `QASE_TESTOPS_RUN_EXTERNAL_LINK` | undefined                              | No       | JSON object with `type` (`jiraCloud` or `jiraServer`) and `link` (e.g., `PROJ-123`) |
| Qase test plan ID                                                                                                     | `testops.plan.id`          | `QASE_TESTOPS_PLAN_ID`          |  undefined                              | No       | Any integer                |
| Size of batch for sending test results                                                                                | `testops.batch.size`       | `QASE_TESTOPS_BATCH_SIZE`       | `200`                                   | No       | Any integer                |
| Enable defects for failed test cases                                                                                  | `testops.defect`           | `QASE_TESTOPS_DEFECT`           | `False`                                 | No       | `True`, `False`            |
| Enable/disable attachment uploads                                                                                     | `testops.uploadAttachments`        | `QASE_TESTOPS_UPLOAD_ATTACHMENTS`       | `true`                                  | No       | `True`, `False`            |
| Filter test results by status (comma-separated list of statuses to exclude from reporting)                           | `testops.statusFilter`              | `QASE_TESTOPS_STATUS_FILTER`             | undefined                               | No       | Array of strings (`passed`, `failed`, `skipped`, `invalid`) |
| Configuration values to create/find in groups (format: `group1=value1,group2=value2`)                                | `testops.configurations.values`     | `QASE_TESTOPS_CONFIGURATIONS_VALUES`     | undefined                               | No       | Comma-separated key=value pairs |
| Create configuration groups if they don't exist                                                                       | `testops.configurations.createIfNotExists` | `QASE_TESTOPS_CONFIGURATIONS_CREATE_IF_NOT_EXISTS` | `false`                          | No       | `True`, `False`            |
| Enable public report link generation and display after test run completion                                            | `testops.showPublicReportLink`      | `QASE_TESTOPS_SHOW_PUBLIC_REPORT_LINK`   | `False`                                 | No       | `True`, `False`            |
| **Qase TestOps Multi-Project configuration**                                                                          |                                     |                                            |                                         |          |                            |
| Default project code for tests without explicit project mapping                                                       | `testops_multi.default_project`     | N/A (use config file)                     | First project in `projects`             | No       | Any string (must match one of `projects[].code`) |
| Array of project configurations                                                                                      | `testops_multi.projects`             | N/A (use config file)                     | `[]`                                    | Yes\*\*  | Array of objects           |
| Project code                                                                                                         | `testops_multi.projects[].code`     | N/A                                       | undefined                               | Yes\*\*  | Any string                 |
| Project-specific test run title                                                                                      | `testops_multi.projects[].run.title` | N/A                                       | Same as single-project default          | No       | Any string                 |
| Project-specific test run description                                                                               | `testops_multi.projects[].run.description` | N/A                                | Same as single-project default          | No       | Any string                 |
| Project-specific test run complete                                                                                  | `testops_multi.projects[].run.complete`    | N/A                                | `true`                                  | No       | `true`, `false`            |
| Project-specific test run ID                                                                                        | `testops_multi.projects[].run.id`   | N/A                                       | undefined                               | No       | Any integer                |
| Project-specific test plan ID                                                                                       | `testops_multi.projects[].plan.id`  | N/A                                       | undefined                               | No       | Any integer                |
| Project-specific environment                                                                                        | `testops_multi.projects[].environment`     | N/A                                | Uses global `environment` if not set     | No       | Any string                 |

\*\* Required when using `testops_multi` mode

### Example `qase.config.json` config

```json
{
  "mode": "testops",
  "fallback": "report",
  "debug": false,
  "environment": "local",
  "captureLogs": false,
  "statusMapping": {
    "invalid": "failed",
    "skipped": "passed"
  },
  "logging": {
    "console": true,
    "file": true
  },
  "report": {
    "driver": "local",
    "connection": {
      "local": {
        "path": "./build/qase-report",
        "format": "json"
      }
    }
  },
  "testops": {
    "api": {
      "token": "<token>",
      "host": "qase.io"
    },
    "run": {
      "title": "Regress run",
      "description": "Regress run description",
      "complete": true,
      "tags": ["tag1", "tag2"],
      "externalLink": {
        "type": "jiraCloud",
        "link": "PROJ-123"
      }
    },
    "defect": false,
    "project": "<project_code>",
    "uploadAttachments": true,
    "showPublicReportLink": true,
    "statusFilter": ["passed", "skipped"],
    "batch": {
      "size": 100
    },
    "configurations": {
      "values": [
        {
          "name": "group1",
          "value": "value1"
        },
        {
          "name": "group2", 
          "value": "value2"
        }
      ],
      "createIfNotExists": true
    }
  }
}
```

### Multi-Project Configuration (`testops_multi` mode)

Example `qase.config.json` for multi-project reporting:

```json
{
  "mode": "testops_multi",
  "fallback": "report",
  "debug": false,
  "environment": "local",
  "logging": {
    "console": true,
    "file": false
  },
  "report": {
    "driver": "local",
    "connection": {
      "local": {
        "path": "./build/qase-report",
        "format": "json"
      }
    }
  },
  "testops": {
    "api": {
      "token": "<token>",
      "host": "qase.io"
    },
    "batch": { "size": 100 },
    "showPublicReportLink": true
  },
  "testops_multi": {
    "default_project": "PROJ1",
    "projects": [
      {
        "code": "PROJ1",
        "run": {
          "title": "PROJ1 Multi-Project Run",
          "description": "Test run for PROJ1 project",
          "complete": true
        },
        "plan": { "id": 1 },
        "environment": "staging"
      },
      {
        "code": "PROJ2",
        "run": {
          "title": "PROJ2 Multi-Project Run",
          "description": "Test run for PROJ2 project",
          "complete": true
        },
        "environment": "production"
      }
    ]
  }
}
```

### Environment Variables Example

```bash
# Set external link for Jira Cloud
export QASE_TESTOPS_RUN_EXTERNAL_LINK='{"type":"jiraCloud","link":"PROJ-123"}'

# Set external link for Jira Server
export QASE_TESTOPS_RUN_EXTERNAL_LINK='{"type":"jiraServer","link":"PROJ-456"}'

# Filter out test results with specific statuses
export QASE_TESTOPS_STATUS_FILTER="passed,failed"

# Map test result statuses
export QASE_STATUS_MAPPING="invalid=failed,skipped=passed"

# Logging configuration
export QASE_LOGGING_CONSOLE=false  # Disable console output
export QASE_LOGGING_FILE=true      # Enable file output

# Enable public report link generation
export QASE_TESTOPS_SHOW_PUBLIC_REPORT_LINK=true
```

## Multi-Project Support

The multi-project feature allows you to send test results to multiple Qase projects simultaneously, with different test case IDs for each project. This is useful when:

* You need to report the same test to different projects
* Different projects track the same functionality with different test case IDs
* You want to maintain separate test runs for different environments or teams

### How It Works

1. Configure multiple projects in the `testops_multi.projects` array
2. Each project can have its own run configuration (title, description, plan, environment)
3. Use framework-specific helpers or markers to map test cases to projects (see table below)
4. Tests without explicit project mapping are sent to `default_project` (or the first project). Results without any case ID are also sent to the default project without linking to a test case.

### Framework-Specific Documentation

For detailed framework-specific documentation on multi-project support, see:

* **[Cypress Multi-Project Guide](../qase-cypress/docs/MULTI_PROJECT.md)** — `qase.projects(mapping, it(...))`, title markers
* **[Playwright Multi-Project Guide](../qase-playwright/docs/MULTI_PROJECT.md)** — `qase.projects(mapping)`, `qase.projectsTitle()`, annotations
* **[Jest Multi-Project Guide](../qase-jest/docs/MULTI_PROJECT.md)** — `qase.projects(mapping, name)`
* **[Vitest Multi-Project Guide](../qase-vitest/docs/MULTI_PROJECT.md)** — `addQaseProjects(name, mapping)`
* **[Mocha Multi-Project Guide](../qase-mocha/docs/MULTI_PROJECT.md)** — `qase.projects(mapping, name)`
* **[WDIO Multi-Project Guide](../qase-wdio/docs/MULTI_PROJECT.md)** — `qase.projects(mapping, name)`
* **[CucumberJS Multi-Project Guide](../qase-cucumberjs/docs/MULTI_PROJECT.md)** — tags `@qaseid.PROJ(ids)` in feature files
* **[Newman](../examples/single/multiProject/newman/README.md)** — comments in test script
* **[TestCafe](../examples/single/multiProject/testcafe/README.md)** — `qase.projects(mapping).create()` in `test.meta()`

### Example Usage

For runnable examples, see the [multi-project examples directory](../examples/single/multiProject/).

### Configuration

Set `mode` to `testops_multi` and add a `testops_multi` section with `default_project` and `projects`:

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
        "run": { "title": "Project 1 Run", "complete": true },
        "plan": { "id": 1 },
        "environment": "staging"
      },
      {
        "code": "PROJ2",
        "run": { "title": "Project 2 Run", "id": 123, "complete": true },
        "environment": "production"
      }
    ]
  }
}
```

### Test case mapping

For each result you can set `testops_project_mapping` (or use the helpers on `TestResultType`):

- **`testops_project_mapping`**: `Record<string, number[]>` — project code → list of test case IDs.
- **Backward compatibility**: if `testops_project_mapping` is empty or missing, the result uses `testops_id` and is sent to `default_project` (or the first project).

### How to specify projects and IDs in tests

Use the syntax below **only when `mode` is `testops_multi`**. For single-project mode (`testops`), keep using the usual single-project syntax (e.g. `(Qase ID: 123)` or `qase(1, 'name')`).

Use the **helper methods** below so project codes and IDs are formatted correctly (same idea as `qase(id, name)` for single-project).

#### Vitest

- **Single project:** `addQaseId(name, caseIds)` → `"name (Qase ID: 1,2)"`.
- **Multi-project:** `addQaseProjects(name, mapping)` → `"name (Qase PROJ1: 1,2) (Qase PROJ2: 3)"`.

```js
import { addQaseId, addQaseProjects } from 'vitest-qase-reporter/vitest';

// Single project (legacy)
it(addQaseId('login flow', [100]), async () => { ... });

// Multi-project — use helper so title is formatted correctly
it(addQaseProjects('login flow', { PROJ1: [100], PROJ2: [200] }), async () => { ... });

// Multiple IDs per project
it(addQaseProjects('checkout', { PROJ1: [10, 11], PROJ2: [20] }), async () => { ... });
```

#### Jest

- **Single project:** `qase(caseId, name)`.
- **Multi-project:** `qase.projects(mapping, name)`.

```js
const { qase } = require('jest-qase-reporter');

// Single project
test(qase(100, 'login flow'), () => { ... });

// Multi-project
test(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'login flow'), () => { ... });
```

#### Cypress

- **Single project:** `qase(caseId, test)` (mutates test title) or title string `(Qase ID: 100)`.
- **Multi-project:** `qase.projects(mapping, name)` returns the title string; use it as the first argument to `it()`.

```js
const { qase } = require('cypress-qase-reporter');

// Single project
it(qase(100, 'login flow'), () => { ... });  // if qase receives test
it('login flow (Qase ID: 100)', () => { ... });

// Multi-project — use helper
it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'login flow'), () => { ... });
```

**Tags (Cucumber/BDD):** `@qaseid.PROJ1(100) @qaseid.PROJ2(200)`.

#### Playwright

- **Single project:** `qase(caseId, name)` or `qase.id([1, 2])` in test.
- **Multi-project:** `qase.projects(mapping)` inside the test (metadata, not title).

```js
const { test } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');

// Multi-project: set mapping inside the test
test('login and checkout', async ({ page }) => {
  qase.projects({ PROJ1: [1, 2], PROJ2: [3] });
  await page.goto('/login');
  // ...
});

// Single project
test(qase(1, 'single project test'), async ({ page }) => { ... });
```

#### Mocha

- **Single project:** `qase(caseId, name)`.
- **Multi-project:** `qase.projects(mapping, name)`.

```js
const { qase } = require('mocha-qase-reporter');

it(qase(100, 'login flow'), function () { ... });
it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'login flow'), function () { ... });
```

#### WDIO (WebdriverIO)

- **Single project:** `qase(qaseId, name)`.
- **Multi-project:** `qase.projects(mapping, name)`.

```js
const { qase } = require('wdio-qase-reporter');

it(qase(1, 'should work'), async () => { ... });
it(qase.projects({ PROJ1: [100], PROJ2: [200] }, 'Login flow'), async () => { ... });
```

You can still type markers manually in the title (e.g. `(Qase PROJ1: 100) (Qase PROJ2: 200)`); the helpers avoid typos and keep the format consistent.

#### Summary

| Framework   | Single project (legacy)     | Multi-project (project: IDs in title or API)     |
|------------|-----------------------------|--------------------------------------------------|
| **Vitest** | `(Qase ID: 123)` in title   | `(Qase PROJ1: 123) (Qase PROJ2: 456)` in title   |
| **Jest**   | `(Qase ID: 123)` in title   | `(Qase PROJ1: 123) (Qase PROJ2: 456)` in title   |
| **Cypress**| `(Qase ID: 123)` or `@qaseid(123)` | `(Qase PROJ1: 123) (Qase PROJ2: 456)` or `@qaseid.PROJ1(123) @qaseid.PROJ2(456)` |
| **Playwright** | `qase(1, 'name')` or metadata | `qase.projects({ PROJ1: [1, 2], PROJ2: [3] })` in test |
| **Mocha**  | `(Qase ID: 123)` in title   | `(Qase PROJ1: 123) (Qase PROJ2: 456)` in title   |
| **WDIO**   | `(Qase ID: 123)` in title   | `(Qase PROJ1: 123) (Qase PROJ2: 456)` in title   |

- **Title format:** `(Qase PROJECT_CODE: id1,id2,...)` — space after `Qase`, project code (letters, numbers, underscores), colon, then one or more IDs separated by commas. Several projects = several such blocks in one title.
- **Cypress tags:** `@qaseid.PROJECT_CODE(id1,id2,...)`.
- **Playwright:** `qase.projects({ PROJECT_CODE: [id1, id2, ...], ... })`; project codes must match `testops_multi.projects[].code`.

Tests that do not specify any multi-project mapping are sent to `default_project` (or the first project) using their usual single-project ID, if any.
