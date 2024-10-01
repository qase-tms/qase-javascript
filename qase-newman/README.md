# Qase TMS Newman reporter

Publish results simple and easy.

To install the latest version, run:

```bash
npm install newman-reporter-qase
```

## Example of usage

### Define in tests

The Newman reporter has the ability to auto-generate test cases
and suites from your test data.

But if necessary, you can independently register the ID of already
existing test cases from TMS before the executing tests.
Example:

```js
//qase: 10
// Qase: 1, 2, 3
// qase: 4 5 6 14
pm.test('expect response be 200', function() {
  pm.response.to.be.info
})
```

### Execute rom CLI:

```
QASE_MODE=testops newman run ./sample-collection.json -r qase
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

You can find more information about using the reporter [here](./docs/usage.md).

## Configuration

Qase Newman reporter can be configured in multiple ways:

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

## Requirements

We maintain the reporter on LTS versions of Node. You can find the current versions by following
the [link](https://nodejs.org/en/about/releases/)

`newman >= 5.3.0`

<!-- references -->

[auth]: https://developers.qase.io/#authentication
