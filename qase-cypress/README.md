# Qase TMS Cypress reporter

Publish results simple and easy.

> 🗿This readme is for the Cypress reporter v1, which is no longer supported.
> [Check out the newer version 2](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress#readme).

To install the Cypress reporter v1, run:

```sh
npm install -D cypress-qase-reporter@1.4.3
```

## Example of usage

In order to connect Qase tests with your automated JavaScript tests you need to pass your `testId` and the test itself to the `qase` function.
You can see example usage with [CypressJS](https://docs.qase.io/documentation/general/get-started-with-the-qase-platform/create-a-test-run#quick-test-case) tests:

```typescript
import { qase } from 'cypress-qase-reporter/dist/mocha';
const testId = 1

describe('My First Test', () => {
    qase(testId,
        it('Correct test', () => {
            expect(true).to.equal(true);
        })
    );
});

```
You can also pass testId to a list if the automated test corresponds to multiple of you test cases in Qase:
```typescript
import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('My First Test', () => {
    qase([1,4,9],
        it('Correct test', () => {
            expect(true).to.equal(true);
        })
    );
});
```

If you are going to use several specifications for execution and you have in config

```bash
"runComplete": true
```
then it is necessary to additionally set in the [project settings](https://docs.qase.io/documentation/general/get-started-with-the-qase-platform/create-a-project/project-settings) the following option:

```
Allow to add results for cases in closed runs.
```

To run tests and create a test run, execute the command (for example from folder examples):
```bash
QASE_REPORT=1 npx cypress run
```
or
```bash
npm test
```
<p align="center">
  <img width="65%" src="examples_cypress_v10/screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

Reporter options (__*__ - required):

- `apiToken` __*__ - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- `projectCode` __*__ - Code of your project (can be extracted from main 
  page of your project: `https://app.qase.io/project/DEMOTR` - 
  `DEMOTR` is project code here)
- `runId` - Run ID from Qase TMS (also can be got from run URL)
- `logging` [true/false] - Enabled debug logging from reporter or not
- `environmentId` - To execute with the sending of the envinroment information
- `basePath` - URL Qase.io
- `screenshotFolder` - Folder for save screenshot cypress,
- `sendScreenshot` [true/false] - Permission to send screenshots to Qase TMS
- `runComplete` [true/false] - Permission for automatic completion of the test run

#### Example

Configuration with multiple reporters:
[demo project (cypress v10)](examples_cypress_v10/cypress.config.js) 
and
[demo project (cypress v6)](examples_cypress_v6/cypress.json).

## Environment

Supported ENV variables:

- `QASE_REPORT` __*__ - You **should** pass 1 to this ENV if you want to use 
  qase reporter.
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created
- `QASE_API_TOKEN` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- `QASE_API_BASE_URL` - URL Qase.io, default value `https://api.qase.io/v1`
- `QASE_ENVIRONMENT_ID` - To execute with the sending of the envinroment information
- `QASE_SCREENSHOT_FOLDER` - Folder for save screenshot cypress
 - `QASE_SCREENSHOT_SENDING` - Permission to send screenshots to Qase TMS
 - `QASE_RUN_COMPLETE` - Permission for automatic completion of the test run

## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)

<!-- references -->

[auth]: https://developers.qase.io/#authentication
