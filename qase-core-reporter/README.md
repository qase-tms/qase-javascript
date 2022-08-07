## Install

```
$ npm install --save qase-core-reporter
```

## Usage

```js
import {
  QaseCoreReporter,
  QaseOptions,
  QaseCoreReporterOptions,
} from "qase-core-reporter";

const reporterOptions: QaseOptions = {};
const qaseCoreReporterOptions: QaseCoreReporterOptions = {};

// Initialize Core reporter with expected params
const reporter = new QaseCoreReporter(reporterOptions, qaseCoreReporterOptions);

// Use reporter with test framework custom reporter hooks

// On start hook
reporter.start();

// On test results
reporter.addTestResult(test, status, attachments);

// On end/complete hook
reporter.end({ spawn: false }); // spawn true will finish reporting in a child process
```

## Reporter Options

<a name="qase-core-reporter"></a>

## reporter(qaseOptions, qaseCoreReporterOptions) ⇒ <code>QaseCoreReporter</code>

| Param                                    | Type      | Required | Description                                          |
| ---------------------------------------- | --------- | -------- | ---------------------------------------------------- |
| qaseOptions                              | `object`  | yes      |                                                      |
| qaseCoreReporterOptions                  | `object`  | yes      |                                                      |
| qaseCoreReporterOptions.frameworkName    | `string`  | yes      | Test automation framework/package name               |
| qaseCoreReporterOptions.reporterName     | `string`  | yes      | Current qase reporter package name                   |
| qaseCoreReporterOptions.sendScreenshot   | `boolean` | no       | Wether or not to upload attachments                  |
| qaseCoreReporterOptions.screenshotFolder | `string`  | no       | Folder to find screenshots with Qase ID in file name |

## API (public methods)

| Method                                   | Description                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| start()                                  | Check if reporting is enabled, check project and create run if needed                                           |
| addTestResult(test, status, attachments) | save test results for publishing                                                                                |
| end({spawn: true/false})                 | Upload attachments if needed and map to existing results, send results as BulkCreate, complete run if specified |
| uploadAttachments(attachments)           | Upload attachments based on file path and return attachment hashes for test results                             |
