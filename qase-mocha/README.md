# Qase TMS Mocha reporter

Publish results simple and easy.

To install the latest beta version, run:

```sh
npm install -D mocha-qase-reporter@beta
```

## Getting started

The Mocha reporter can auto-generate test cases
and suites from your test data.
Test results of subsequent test runs will match the same test cases
as long as their names and file paths don't change.

You can also annotate the tests with the IDs of existing test cases
from Qase.io before executing tests. It's a more reliable way to bind
autotests to test cases, that persists when you rename, move, or
parameterize your tests.

For example:

```typescript
import { qase } from 'mocha-qase-reporter/mocha';

describe('My First Test', () => {
  it(qase(1,'Several ids'), () => {;
    expect(true).to.equal(true);
  });

  // a test can check multiple test cases
  it(qase([2,3],'Correct test'), () => {
    expect(true).to.equal(true);
  });

  it.skip('Skipped test', () => {
    expect(true).to.equal(true);
  });
});
```

To execute Mocha tests and report them to Qase.io, run the command:

```bash
QASE_MODE=testops mocha
```

or

```bash
npm test
```

You can try it with the example project at [`examples/mocha`](../examples/mocha/).

<p align="center">
  <img width="65%" src="./screenshots/screenshot.png">
</p>

A test run will be performed and available at:

```
https://app.qase.io/run/QASE_PROJECT_CODE
```

### Parallel execution

The reporter supports parallel execution of tests.

First, you need to create a new run in Qase.io. You can use
the [Qase CLI](https://github.com/qase-tms/qasectl):

```bash
# Create a new test run
qli testops run create --project DEMO --token token --title 'Mocha test run'

# Save the run ID to the environment variable
export QASE_TESTOPS_RUN_ID=$(< qase.env grep QASE_TESTOPS_RUN_ID | cut -d'=' -f2)
```

Then, you can run tests in parallel:

```bash
QASE_MODE=testops mocha --parallel
```

After the tests are finished, you can complete the run:

```bash
qli testops run complete --project DEMO --token token --id $(echo $QASE_TESTOPS_RUN_ID)
```

## Configuration

Qase Mocha reporter can be configured in multiple ways:

- using a separate config file `qase.config.json`,
- using environment variables (they override the values from the configuration files).

For a full list of configuration options, see
the [Configuration reference](../qase-javascript-commons/README.md#configuration).

Example `qase.config.json` config:

```json
{
  "mode": "testops",
  "debug": true,
  "testops": {
    "api": {
      "token": "api_key"
    },
    "project": "project_code",
    "run": {
      "complete": true
    }
  }
}
```

Also, you need to configure the reporter using the `.mocharc.js` file:

```js
// .mocharc.js

module.exports = {
  reporter: "mocha-qase-reporter",
  // ... other mocha options
}
```

## Requirements

We maintain the reporter on [LTS versions of Node](https://nodejs.org/en/about/releases/).

`mocha >= 10.2.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
