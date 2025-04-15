# qase-cucumberjs@2.1.0

## What's new

- Updated to the latest minor version of the common package for improved compatibility and features.
- Fixed all ESLint warnings across the project to ensure code quality and maintainability.

# qase-cucumberjs@2.0.7

## What's new

Enhanced handling of start and end times for tests and steps, ensuring greater accuracy in reporting.

# qase-cucumberjs@2.0.5

## What's new

Enabled support for multiple IDs in the `QaseID` tag, allowing tests to be linked to multiple cases.

```gherkin
@QaseID=1,2,3
Scenario: Scenario with new Qase ID tag
Given I have a step
```

# qase-cucumberjs@2.0.4

## What's new

Fixed the issue with the `QaseFields` tag.

# qase-cucumberjs@2.0.3

## What's new

Support attachments in the test results.

```js
const { Given, Then } = require('cucumber');

Given('I have a step with attachment', async function() {
  await this.attach('Hello, world!', 'text/plain');
});

Then('I have a step with attachment', async function() {
  await this.attach('Hello, world!', 'text/plain');
});
```

# qase-cucumberjs@2.0.2

## What's new

- Support `QaseIgnore` tag. If the test case has the `QaseIgnore` tag, the reporter will not send the result to the Qase
  TMS.

    ```cucumber
    @QaseIgnore
    Scenario: simple test
    ```

- Improved error handling.

# qase-cucumberjs@2.0.0

## What's new

This is the first release in the 2.x series of the Cucumber JS reporter.
It brings a new annotation syntax with field values,
new and more flexible configs, uploading results in parallel with running tests,
and other powerful features.

This changelog entry will be updated soon.
For more information about the new features and a guide for migration from v1, refer to the
[reporter documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cucumberjs#readme)

# qase-cucumberjs@2.0.0-beta.3

## What's new

Added support new Qase tags.

```diff
-  @Q-1
+  @QaseID=2
+  @QaseTitle=Scenario_with_Qase_title_tag
+  @QaseFields={"description":"Description","severity":"high"}
  Scenario: simple test
```

QaseID - is a unique identifier of the test case in the Qase TMS.
QaseTitle - is a title of the test case in the Qase TMS.
QaseFields - is a JSON object with additional fields for the test case in the Qase TMS.

# qase-cucumberjs@2.0.0-beta.2

## What's new

Added support gherkin steps.
Before this version, the reporter was not able to parse the steps from the feature files.
Now, the reporter can parse the steps and send them to the Qase TMS.

# qase-cucumberjs@2.0.0-beta.1

## What's new

First major beta release for the version 2 series of the Qase Cypress reporter.
