## Install

```
$ npm install --save qase-core-reporter
```

## Usage

> Create a new Qase JS reporter in minutes by leveraging this core reporter.
> Use Qase core reporter with test framework custom reporter hooks

```js
import {
  QaseCoreReporter,
  QaseOptions,
  QaseCoreReporterOptions,
  TestResult
} from "qase-core-reporter";

const reporterOptions: QaseOptions = {
  // expected options, provided by reporter user
  apiToken: 'lknkldnfknobek'
  projectCode: 'DH'
};

const qaseCoreReporterOptions: QaseCoreReporterOptions = {
  // expected core options, provider by reporter developer
  frameworkName: 'vitest',
  reporterName: 'vitest-qase-reporter'
};

// Initialize Core reporter with expected params
const reporter = new QaseCoreReporter(reporterOptions, qaseCoreReporterOptions);

// On start hook
reporter.start();

// On test results
reporter.addTestResult(test: TestResult, status, attachments);

// On end/complete hook
reporter.end({ spawn: false }); // spawn true will finish reporting in a child process
```

## Reporter Options

<a name="qase-core-reporter"></a>

## reporter(qaseOptions, qaseCoreReporterOptions) ⇒ <code>QaseCoreReporter</code>

| Param                                       | Type      | Required | Description                                                                       |
| ------------------------------------------- | --------- | -------- | --------------------------------------------------------------------------------- |
| qaseOptions                                 | `object`  | yes      |                                                                                   |
| qaseOptions.`report`                        | `boolean` | no       | Whether or not to enable reporter                                                 |
| qaseOptions.`apiToken`                      | `string`  | yes      | Qase api key                                                                      |
| qaseOptions.`projectCode`                   | `string`  | yes      | Qase project ID                                                                   |
| qaseOptions.`basePath`                      | `string`  | no       | Qase API base url                                                                 |
| qaseOptions.`rootSuiteTitle`                | `string`  | no       | The root suite that unknown test cases will be added to                           |
| qaseOptions.`runId`                         | `string`  | no       | Qase run ID, if you want results to be posted to a specific run                   |
| qaseOptions.`logging`                       | `boolean` | no       | Whether or not to output Qase logs while testing and reporting                    |
| qaseOptions.`runComplete`                   | `boolean` | no       | Whether or not to complete a test run when results are posted                     |
| qaseOptions.`environmentId`                 | `string`  | no       | Qase environment ID                                                               |
| qaseOptions.`runDescription`                | `string`  | no       | Qase run custom description                                                       |
| qaseOptions.`runName`                       | `string`  | no       | Qase run custom name                                                              |
| qaseCoreReporterOptions                     | `object`  | yes      |                                                                                   |
| qaseCoreReporterOptions.`frameworkName`     | `string`  | yes      | Test automation framework/package name                                            |
| qaseCoreReporterOptions.`reporterName`      | `string`  | yes      | Current qase reporter package name                                                |
| qaseCoreReporterOptions.`uploadAttachments` | `boolean` | no       | Wether or not to upload attachments                                               |
| qaseCoreReporterOptions.`screenshotFolder`  | `string`  | no       | Folder to find screenshots with Qase ID in file name                              |
| qaseCoreReporterOptions.`videoFolder`       | `string`  | no       | Folder to find videos with Qase ID in file name                                   |
| qaseCoreReporterOptions.`loadConfig`        | `boolean` | no       | Whether or not to also load reporter options from `qase.config.json` or `.qaserc` |

## API (public methods)

<a name="qase-core-reporter-public-methods"></a>

| Method                                   | Description                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| start()                                  | Check if reporting is enabled, check project and create run if needed                                           |
| addTestResult(test, status, attachments) | Parse and save test results for publishing                                                                      |
| end({spawn: true/false})                 | Upload attachments if needed and map to existing results, send results as BulkCreate, complete run if specified |
| uploadAttachments(attachments)           | Upload attachments based on file path and return attachment hashes for test results                             |

## Qase Reporter Environmental Variables

> Qase environmental variables are first class options, which means the user can change all default/static reporter options by using these variables.

<a name="qase-core-reporter-envs"></a>
| Variable | Type | Description |
| ------------------------- | --------- | -------------------------------------------------------------- |
| `QASE_REPORT` | boolean | Whether or not to enable reporter |
| `QASE_API_TOKEN` | string | Qase api key |
| `QASE_API_BASE_URL` | string | Qase API base url |
| `QASE_PROJECT_CODE` | string | Qase project ID |
| `QASE_RUN_ID` | string | Qase run ID, if you want results to be posted to a specific run |
| `QASE_RUN_NAME` | string | Qase run custom name |
| `QASE_RUN_DESCRIPTION` | string | Qase run custom description |
| `QASE_RUN_COMPLETE` | string | Whether or not to complete a test run when results are posted |
| `QASE_ENVIRONMENT_ID` | string | Qase environment ID |
| `QASE_ROOT_SUITE_TITLE` | string | The root suite that unknown test cases will be added to |
| `QASE_UPLOAD_ATTACHMENTS` | string | Whether or not to upload attachments
| `QASE_LOGGING` | boolean | Whether or not to output Qase logs while testing and reporting |
