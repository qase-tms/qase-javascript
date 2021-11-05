# [Qase TMS](https://qase.io) Playwright Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

## Installation

```
npm install playwright-qase-reporter
```

## Configuration

Reporter options (* - required):

- *`apiToken` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`projectCode` - Code of your project (can be extracted from main 
  page of your project: `https://app.qase.io/project/DEMOTR` - 
  `DEMOTR` is project code here)
- `runId` - Run ID from Qase TMS (also can be got from run URL)
- `environmentId` - Environment ID from Qase TMS
- `logging` [true/false] - Enabled debug logging from reporter or not
- `runComplete` [true/false] - Complete run after all tests are finished
- `uploadAttachments` [true/false] - Uploading attachments (screenshot/video) after test ended

Example playwright.config.js config:

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
                apiToken: '',
                projectCode: 'DEMO',
                runComplete: true,
                logging: true,
                uploadAttachments: true,
            }],
    ],
};
module.exports = config;
```

You can check example configuration with multiple reporters in [example project](./examples/playwright.config.js)

Supported ENV variables:

- `QASE_REPORT` - You **should** pass this ENV if you want to use qase reporter
- `QASE_API_TOKEN` - API token
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_ENVIRONMENT_ID` - Pass Environment ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created
- `QASE_RUN_COMPLETE` - Complete run after all tests are finished
- `QASE_UPLOAD_ATTACHMENTS` - Uploading attachments (screenshot/video) after test ended

## Using Reporter

If you want to decorate come test with Qase Case ID you could use qase function:

```typescript
import { qase } from 'playwright-qase-reporter/dist/playwright';

describe('My First Test', () => {
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

## Running Playwright Reporter

To start playwright run with qase reporter run it like this:
```bash
QASE_REPORT=1 npx playwright test
```
