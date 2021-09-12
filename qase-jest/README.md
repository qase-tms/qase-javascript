# [Qase TMS](https://qase.io) Jest Reporter

[![License](https://lxgaming.github.io/badges/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

## Installation

```
npm install jest-qase-reporter
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
- `runComplete` [true/false] - Complete run after all tests are finished

Example jest.config.js config:

```js
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        apiToken: '578e3b73a34f06e84eafea103cd44dc24253b2c5',
        projectCode: 'PRJCODE',
        runId: 45,
        logging: true,
        runComplete: true,
      },
    ],
  ],
  ...
};
```

You can check example configuration with multiple reporters in [example project](./examples/jest.config.js)

Supported ENV variables:

- `QASE_REPORT` - You **should** pass this ENV if you want to use 
  qase reporter
- `QASE_API_TOKEN` - API token
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created
- `QASE_RUN_COMPLETE` - Complete run after all tests are finished

## Using Reporter

If you want to decorate come test with Qase Case ID you could use qase function:

```typescript
import { qase } from 'jest-qase-reporter/dist/jest';

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

## Running Jest Reporter

To start jest run with qase reporter run it like this:
```bash
QASE_REPORT=1 npx jest
```
