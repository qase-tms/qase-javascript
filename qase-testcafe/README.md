# Qase TMS TestCafe reporter

Publish results simple and easy.

To install the latest version, run:

```sh
npm install -D testcafe-reporter-qase
```

## Updating from v1

To update a test project using testcafe-reporter-qaser@v1 to version 2:

1. Update reporter configuration in `qase.config.json` and/or environment variables —
   see the [configuration reference](#configuration) below.

## Example of usage

The TestCafe reporter has the ability to auto-generate test cases
and suites from your test data.

You can also annotate the tests with the IDs of existing test cases
from Qase.io before executing tests. It's a more reliable way to bind
autotests to test cases, that persists when you rename, move, or
parameterize your tests.

### Metadata

- `qase.title` - set the title of the test case
- `qase.fields` - set the fields of the test case
- `qase.suite` - set the suite of the test case
- `qase.comment` - set the comment of the test case
- `qase.parameters` - set the parameters of the test case
- `qase.groupParameters` - set the group parameters of the test case
- `qase.ignore` - ignore the test case in Qase. The test will be executed, but the results will not be sent to Qase.
- `qase.step` - create a step in the test case
- `qase.attach` - attach a file or content to the test case

For detailed instructions on using annotations and methods, refer to [Usage](docs/usage.md).

For example:

```js
const q = qase.id(1)
  .title('Text typing basics')
  .field({ 'severity': 'high' })
  .parameters({ 'browser': 'chrome' })
  .create();
test.meta({ ...q })(
  'Click check boxes and then verify their state',
  async (t) => {
    await t;
  },
);
```

---

To run tests and create a test run, execute the command (for example from folder examples):

```bash
QASE_MODE=testops npx testcafe chrome test.js -r spec,qase
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

<p align="center">
  <img src="./screenshots/demo.gif">
</p>

## Configuration

Qase Testcafe reporter can be configured in multiple ways:

- using a separate config file `qase.config.json`,
- using environment variables (they override the values from the configuration files).

For a full list of configuration options, see
the [Configuration reference](../qase-javascript-commons/README.md#configuration).

Example `qase.config.json` file:

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

Check out the example of configuration for multiple reporters in the
[demo project](../examples/testcafe/qase.config.json).

## Requirements

We maintain the reporter on [LTS versions of Node](https://nodejs.org/en/about/releases/).

`testcafe >= 2.0.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
