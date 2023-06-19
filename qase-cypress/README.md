> # Qase TMS Cypress reporter
>
> Publish results simple and easy.

## How to integrate

```
npm install cypress-qase-reporter
```

## Example of usage

If you want to decorate come test with Qase Case ID you could use qase function:

```typescript
import { qase } from 'cypress-qase-reporter';

describe('My First Test', () => {
    qase([1,2],
        it('Several ids', () => {
            expect(true).to.equal(true);
        })
    );
    qase(3,
        it('Correct test', () => {
            expect(true).to.equal(true);
        })
    );
    qase(4,
        it.skip('Skipped test', () => {
            expect(true).to.equal(true);
        })
    );
    qase(5,
        it('Failed test', () => {
            expect(true).to.equal(false);
        })
    );
});

```
If you are going to use several specifications for execution and you have in config 
```json
"testops": {
  "run": {
    "complete": true
  }
}
```
then it is necessary to additionally set in the project settings
```
Allow to add results for cases in closed runs.
```

To run tests and create a test run, execute the command (for example from folder examples):
```bash
QASE_MODE=testops npx cypress run
```
or
```bash
npm test
```
<p align="center">
  <img width="65%" src="./screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

Reporter options (* - required):

- `mode` - `testops`/`off` Enables reporter, default - `off`
- `debug` - Enables debug logging, defaule - `false`
- *`testops.api.token` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`testops.projectCode` - Code of your project (can be extracted from main
  page of your project: `https://app.qase.io/project/DEMOTR` -
  `DEMOTR` is project code here)
- `testops.uploadAttachments` - Permission to send screenshots to Qase TMS
- `testops.run.id` - Pass Run ID
- `testops.run.title` - Set custom Run name, when new run is created
- `testops.run.description` - Set custom Run description, when new run is created
- `testops.run.complete` - Whether the run should be completed
- `testops.run.environment` - To execute with the sending of the envinroment information
- `screenshotFolder` - Folder for save screenshot cypress

#### You can check example configuration with multiple reporters in [demo project](../examples/cypress/cypress.config.js).

Supported ENV variables:

- `QASE_MODE` - Same as `mode`
- `QASE_DEBUG` - Same as `debug`
- `QASE_TESTOPS_API_TOKEN` - Same as `testops.api.token`
- `QASE_TESTOPS_PROJECT_CODE` - Same as `testops.projectCode`
- `QASE_TESTOPS_RUN_ID` - Pass Run ID from ENV and override reporter option `testops.run.id`
- `QASE_TESTOPS_RUN_TITLE` - Same as `testops.run.title`
- `QASE_TESTOPS_RUN_DESCRIPTION` - Same as `testops.run.description`
- `QASE_TESTOPS_RUN_ENVIRONMENT` - Same as `testops.run.environment`

## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)

`cypress >= 8.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
