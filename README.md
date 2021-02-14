# [Qase TMS](https://qase.io) TestCafe Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

## Installation

```
npm install testcafe-reporter-qase
```

## Usage
In order to use reporter, you should add meta information to your tests. Meta key should be `CID`.
You should assign list of case IDs to it, e.g.:
```js
test
    .meta('CID', [1])
    ('Text typing basics', async (t) => {
        await t
    });

test
    .meta({ CID: [2, 3] })
    ('Click check boxes and then verify their state', async (t) => {
        await t
    });
```

After that you can run your tests by providing custom reporter:
```bash
npx testcafe chrome examples/use-page-model -r spec,qase
```

## Configuration

Qase reporter supports passing parameters using two ways: 
using `.qaserc` file and using ENV variables.

`.qaserc` parameters:
- `enabled` - Enable reporter
- `apiToken` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- `projectCode` - Code of your project (can be extracted from main
  page of your project: `https://app.qase.io/project/DEMOTR` -
  `DEMOTR` is project code here)
- `runId` - Pass Run ID
- `runName` - Set custom Run name, when new run is created.
  Supports two parameters:
    - `%DATE%`
    - `%AGENTS%`
- `runDescription` - Set custom Run description, when new run is created
- `logging` - Enabled debug logging from reporter or not

Example configuration file:
```json
{
    "enabled": true,
    "logging": true,
    "apiToken": "a786b45e371e1097c4c78a3211e3a1d23018ceb9",
    "projectCode": "PROJECTCODE",
    "runName": "TestCafe run %DATE% %AGENTS%"
}
```

Supported ENV variables:

- `QASE_ENABLED` - Same as `enabled`
- `QASE_API_TOKEN` - Same as `apiToken`
- `QASE_PROJECT` - Same as `projectCode`
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_RUN_NAME` - Same as `runName`
- `QASE_RUN_DESCRIPTION` - Same as `runDescription`
- `QASE_LOGGING` - Same as `logging`
