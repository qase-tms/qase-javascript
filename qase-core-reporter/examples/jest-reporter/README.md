> # Qase TMS Jest reporter
>
> Publish results simple and easy.

## How to integrate

```
npm install jest-qase-reporter
```

## Using Reporter

The Jest reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

```typescript
import { qase } from "jest-qase-reporter/dist/jest";

describe("My First Test", () => {
  test(qase([1, 2], "Several ids"), () => {
    expect(true).toBe(true);
  });

  test(qase(3, "Correct test"), () => {
    expect(true).toBe(true);
  });

  test.skip(qase("4", "Skipped test"), () => {
    expect(true).toBe(true);
  });

  test(qase(["5", "6"], "Failed test"), () => {
    expect(true).toBe(false);
  });
});
```
To run tests and create a test run, execute the command (for example from folder examples):

```bash
QASE_REPORT=1 npx jest
```

or

```bash
npm test
```

<p align="center">
  <img width="65%" src="screenshots/jest-reporter-output.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

| Param | Type  | Required | Description |
| --| --------- | -------- | ------------------ |
| `report`   | _boolean_  | no |   Enable reporter   |
| `apiToken`  | _string_ | __yes__ | Token for API access, you can find more information [here](https://developers.qase.io/#authentication) |
| `basePath` | _string_ | no | URL Qase.io |
| `projectCode` | _string_ | __yes__  | Code of your project (can be extracted from main page of your project: `https://app.qase.io/project/TP` - `TP` is project code here) |
| `rootSuiteTitle` | _string_ | no | A parent suite for your autocreated tests |
| `runId` | _string_ | no | Pass Run ID |
| `environmentId` | _string_ | no | To execute with the sending of the envinroment information |
| `runName` | _string_ | no | Set custom Run name, when new run is created. Supported parameter - `%DATE%` |
| `runDescription` | _string_ | no | Set custom Run description, when new run is created |
| `runComplete` | _boolean_ | no | Closure of the test run after passing |
| `logging` | _boolean_ | no | Enabled debug logging from reporter or not |


Example `jest.config.js` config:

```js
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        apiToken: 'api_key',
        projectCode: 'project_code',
        runId: 45,
        environmentId: 1,
        logging: true,
        runComplete: true,
      },
    ],
  ],
  ...
};
```

You can check example configuration with multiple reporters in [example project](./example/jest.config.js).

---

> Qase environmental variables are first class options, which means the user can change all default/static reporter options by using these variables.


```
Supported ENV variables:
```

| Variable | Description |
| -- | -- |
| `QASE_REPORT` | Same as `report` |
| `QASE_API_TOKEN` | Same as `apiToken` |
| `QASE_API_BASE_URL` | Same as `basePath` |
| `QASE_PROJECT_CODE` | Same as `projectCode` |
| `QASE_ROOT_SUITE_TITLE` | Same as `rootSuiteTitle` |
| `QASE_RUN_ID` | Same as `runId` |
| `QASE_ENVIRONMENT_ID` | Same as `environmentId` |
| `QASE_RUN_NAME` | Same as `runName` |
| `QASE_RUN_DESCRIPTION` | Same as `runDescription` |
| `QASE_RUN_COMPLETE` | Same as `runComplete` |
| `QASE_LOGGING` | Same as `logging` |
 
 ---

## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following the [link](https://nodejs.org/en/about/releases/)

<!-- references -->

[auth]: https://developers.qase.io/#authentication

---

## Development

To build this reporter locally, you need to build the `qase-core-reporter` module first, which is a directory up.

1. Install dependencies
   ```sh
   npm install
   ```
2. Run project in dev watch mode
   ```sh
   npm run dev:watch
   ```
3. Make any needed changes to `./src/index.ts`
4. There is also the option to test with the example project, go to examples
   ```sh
   cd example
   ```
5. Install examples dependencies
   ```sh
   npm install
   ```
6. Update config file with API key and project code `./example/jest.config.js`
7. Run example test
   ```sh
   npm run test
   ```
