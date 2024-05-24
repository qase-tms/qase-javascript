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
