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
import { qase } from 'cypress-qase-reporter/dist/mocha';

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

To run tests and create a test run, execute the command:
```bash
QASE_REPORT=1 npx cypress run
```

![Reporter in console](docs/stdout.png)

A test run will be performed and available at:
```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

Reporter options (* - required):

- *`apiToken` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- *`projectCode` - Code of your project (can be extracted from main 
  page of your project: `https://app.qase.io/project/DEMOTR` - 
  `DEMOTR` is project code here)
- `runId` - Run ID from Qase TMS (also can be got from run URL)
- `logging` [true/false] - Enabled debug logging from reporter or not
- `delay` (seconds) - Delay to publish pending results
- `environmentId` - To execute with the sending of the envinroment information
- `basePath` - URL Qase.io

Example `cypress.json` config:

```json
{
    "reporter": "cypress-qase-reporter",
    "reporterOptions": {
        "apiToken": "api_key",
        "projectCode": "project_code",
        "runId": 45,
        "logging": true,
        "basePath": "https://api.qase.io/v1"
    }
}
```

You can check example configuration with multiple reporters in [demo project](./demo/cypress.json).

Supported ENV variables:

- `QASE_REPORT` - You **should** pass this ENV if you want to use 
  qase reporter
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created

<!-- references -->

[auth]: https://developers.qase.io/#authentication
