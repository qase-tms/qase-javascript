# Qase TMS Cypress reporter

Publish results simple and easy.

## How to install

```
npm install -D cypress-qase-reporter@beta
```

## Example of usage

The Cypress reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests. For example:

```typescript
import { qase } from 'cypress-qase-reporter/mocha';

describe('My First Test', () => {
  qase([1, 2],
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
});

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

Qase Cypress reporter can be configured in multiple ways:
- using a config file `qase.config.json`
- using environment variables

For a full list of configuration options, see the [Configuration reference](../qase-javascript-commons/README.md#configuration).

Example `cypress.config.js` config:

```js
import cypress from 'cypress';

import plugins from './cypress/plugins/index.js';

module.exports = cypress.defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-mochawesome-reporter, cypress-qase-reporter',
    cypressMochawesomeReporterReporterOptions: {
      charts: true,
    },
    cypressQaseReporterReporterOptions: {
      debug: true,

      testops: {
        api: {
          token: 'api_key',
        },

        project: 'project_code',
        uploadAttachments: true,

        run: {
          complete: true,
        },
      },

      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
        }
      }
    },
  },
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      return plugins(on, config);
    },
  },
});
```

### You can check example configuration with multiple reporters in [demo project](../examples/cypress/cypress.config.js).

## Requirements

We maintain the reporter on [LTS versions of Node](https://nodejs.org/en/about/releases/).

`cypress >= 8.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
