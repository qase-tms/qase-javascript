# qase-cucumberjs@2.0.1

## What's new

Improve the collecting information about failed tests.
Now, the reporter will collect the stack trace and the error message from all errors for failed tests.

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
