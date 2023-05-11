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
import { qase } from "cypress-qase-reporter/dist/mocha";

describe("My First Test", () => {
  qase(
    [1, 2],
    it("Several ids", () => {
      expect(true).to.equal(true);
    })
  );
  qase(
    3,
    it("Correct test", () => {
      expect(true).to.equal(true);
    })
  );
  qase(
    4,
    it.skip("Skipped test", () => {
      expect(true).to.equal(true);
    })
  );
  qase(
    5,
    it("Failed test", () => {
      expect(true).to.equal(false);
    })
  );
});
```
If you are going to use several specifications for execution and you have in config

```bash
"runComplete": true
```

then it is necessary to additionally set in the project settings

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
  <img width="65%" src="screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

#### You can check example configuration with multiple reporters in [demo project (cypress v10)](examples/cypress-v10/cypress.config.js) and [demo project (cypress v6)](examples/cypress-v6/cypress.json).

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
| `uploadAttachments` | _boolean_ | no | Uploading attachment to results |

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
| `QASE_UPLOAD_ATTACHMENTS` | Same as `uploadAttachments` |
 
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
   cd examples
   ```
5. Install examples dependencies
   ```sh
   npm install
   ```
6. Update config file with API key and project code `./examples/[cypress-v6|cypress-v10]`
7. Run example test
   ```sh
   npm run test
   ```
