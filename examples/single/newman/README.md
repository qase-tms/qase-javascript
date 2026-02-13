# Newman Example

This is a sample project demonstrating how to run Postman collections using the Newman CLI runner with integration to Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/newman
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

## Example Files

This example includes:

* **sample-collection.json** — Postman collection with test assertions
  * Contains examples with and without Qase ID comments
  * Demonstrates comment-based test case linking
* **qase.config.json** — Qase reporter configuration

## Running Tests

To run tests locally without reporting to Qase:

```bash
QASE_MODE=off npm test
```

To run tests and upload the results to Qase Test Management:

```bash
npm test
```

Or with explicit mode:

```bash
QASE_MODE=testops npx newman run sample-collection.json -r qase
```

## Expected Behavior

When tests execute with Qase reporting enabled:

* **Each pm.test()** in the collection is reported as a separate test result
* **Comment-based IDs** (`// qase: 123`) link tests to existing Qase test cases
* **Postman assertions** determine pass/fail status
* **Collection structure** (folders) organizes tests in Qase
* **Request/response data** is captured in test result details

## Limitations

Newman reporter has the following limitations compared to other frameworks:

* **No programmatic steps API** — All assertions are reported at the test level (no qase.step())
* **No programmatic attachments API** — No qase.attach() support (Postman security/portability constraint)
* **No custom fields support** — Severity, priority, and other fields cannot be set via comments
* **Comment-based only** — Test configuration uses special comments, not programmatic imports

### Workarounds

* **For step-like organization:** Use multiple `pm.test()` calls with descriptive names
* **For attachments:** Use Postman console logging or store data in collection variables
* **For test organization:** Use Postman collection folders to group related tests

## Framework-Specific Features

Newman with Qase has unique patterns:

* **Comment-based annotations** — Use `// qase: 123` comments before `pm.test()` calls
* **Data-driven testing** — Run with `-d data.json` for parameterized tests
* **Multiple reporters** — Combine with other Newman reporters (`-r cli,qase`)
* **Collection-level config** — Parameters can be specified at folder/collection level

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit the [Qase Newman documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-newman).
