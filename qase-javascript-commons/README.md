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
| Mode of reporter                                                                                                      | `mode`                     | `QASE_MODE`                     | `off`                                  | No       | `testops`, `report`, `off` |
| Fallback mode of reporter                                                                                             | `fallback`                 | `QASE_FALLBACK`                 | `off`                                   | No       | `testops`, `report`, `off` |
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
