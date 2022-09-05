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

You should also have an active item in the project settings at

```
https://app.qase.io/project/QASE_PROJECT_CODE/settings/options
```

option in the `Test Runs` block:

```
Allow submitting results in bulk
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
  <img width="65%" src="examples_cypress_v10/screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

## Configuration

Reporter options (\* - required):

- \*`apiToken` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- \*`projectCode` - Code of your project (can be extracted from main
  page of your project: `https://app.qase.io/project/TP` -
  `TP` is project code here)
- `runId` - Run ID from Qase TMS (also can be got from run URL)
- `logging` [true/false] - Enabled debug logging from reporter or not
- `environmentId` - To execute with the sending of the environment information
- `basePath` - URL Qase.io
- `screenshotFolder` - Folder for save screenshot cypress,
- `videoFolder` - Folder for save videos cypress,
- `uploadAttachments` [true/false] - Permission to send screenshots/video to Qase TMS
- `runComplete` [true/false] - Permission for automatic completion of the test run

#### You can check example configuration with multiple reporters in [demo project (cypress v10)](examples/cypress-v10/cypress.config.js) and [demo project (cypress v6)](examples/cypress-c6/cypress.json).

Supported ENV variables:

- `QASE_REPORT` - You **should** pass this ENV if you want to use
  qase reporter
- `QASE_RUN_ID` - Pass Run ID from ENV and override reporter options
- `QASE_RUN_NAME` - Set custom Run name, when new run is created
- `QASE_RUN_DESCRIPTION` - Set custom Run description, when new run is created
- `QASE_API_TOKEN` - Token for API access, you can find more information
  [here](https://developers.qase.io/#authentication)
- `QASE_API_BASE_URL` - URL Qase.io, default value `https://api.qase.io/v1`
- `QASE_ENVIRONMENT_ID` - To execute with the sending of the environment information
- `QASE_SCREENSHOT_FOLDER` - Folder for save screenshot cypress
- `QASE_VIDEO_FOLDER` - Folder for save video cypress
- `QASE_UPLOAD_ATTACHMENTS` - Permission to send screenshots/videos to Qase TMS
- `QASE_RUN_COMPLETE` - Permission for automatic completion of the test run

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
