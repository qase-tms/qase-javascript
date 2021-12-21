> # Qase TMS TestCafe reporter
>
> Publish results simple and easy.

## How to integrate

```
npm install testcafe testcafe-reporter-qase
```

## Example of usage

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

You can run your tests by providing custom reporter:
```bash
npx testcafe chrome test.js -r spec,qase
```
or
```
npm test
```
![Output of run](examples/screenshots/screenshot.png)​
A test run will be performed and available at:
```
https://app.qase.io/run/QASE_PROJECT_CODE
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
    "apiToken": "api_key",
    "projectCode": "project_code",
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

<!-- references -->

[auth]: https://developers.qase.io/#authentication
