> # Qase TMS Playwright reporter
>
> Publish results simple and easy.

## How to integrate

```
npm install playwright-qase-reporter
```


## Example of usage

If you want to decorate cake test with Qase case Id you could use case function. The Id in your test must be entered in accordance with the hierarchy of test case Ids in your TMS Qase. For example:

```typescript
import { qase } from 'playwright-qase-reporter/dist/playwright';

describe('Test suite', () => {
    test(qase([1,2], 'Several ids'), () => {
        expect(true).toBe(true);
    })

    test(qase(3, 'Correct test'), () => {
        expect(true).toBe(true);
    })

    test.skip(qase("4", 'Skipped test'), () => {
        expect(true).toBe(true);
    })

    test(qase(["5", "6"], 'Failed test'), () => {
        expect(true).toBe(false);
    })
});

```
You should also have an active item in the project settings at
```
https://app.qase.io/project/QASE_PROJECT_CODE/settings/options
```
option in the `Test Runs` block:
```
Allow submitting results in bulk
```
To run tests and create a test run, execute the command (for example from folder examples):
```bash
QASE_REPORT=1 npx playwright test
```
or
```bash
npm test
```

<p align="center">
  <img width="65%" src="./examples/screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```
To execute the tests locally, without sending the results, you can use the command:
```bash
npm run test:local
```
## Configuration

Reporter options (* - required):

- *`apiToken` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`projectCode` - Code of your project (can be extracted from main 
  page of your project: `https://app.qase.io/project/DEMOTR` - 
  `DEMOTR` is project code here)
  `basePath` - Qase.io url
- `runId` - Run ID from Qase TMS (also can be got from run URL)
- `environmentId` - Environment ID from Qase TMS
- `logging` [true/false] - Enabled debug logging from reporter or not
- `runComplete` [true/false] - Complete run after all tests are finished
- `uploadAttachments` [true/false] - Uploading attachments (screenshot/video) after test ended

Example `playwright.config.js` config:

```js
const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['playwright-qase-reporter',
            {
                apiToken: 'api_key',
                projectCode: 'project_code',
                runComplete: true,
                basePath: 'https://api.qase.io/v1',
                logging: true,
                uploadAttachments: true,
            }],
    ],
};
module.exports = config;
```

You can check example configuration with multiple reporters in [example project](./examples/playwright.config.js).

Supported ENV variables:

- `QASE_REPORT` - You **should** pass this ENV if you want to use qase reporter
- `QASE_API_TOKEN` - API token
- `QASE_PROJECT_CODE` - Code of your project (can be extracted from main page of your project: https://app.qase.io/project/DEMOTR - DEMOTR is project code here)
- `QASE_API_BASE_URL` - Qase.io url
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_ENVIRONMENT_ID` - Pass Environment ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created
- `QASE_RUN_COMPLETE` - Complete run after all tests are finished
- `QASE_UPLOAD_ATTACHMENTS` - Uploading attachments (screenshot/video) after test ended

<!-- references -->

[auth]: https://developers.qase.io/#authentication
