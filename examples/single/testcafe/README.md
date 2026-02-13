# TestCafe Example

This is a sample project demonstrating how to write and execute tests using the TestCafe framework with integration to Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/testcafe
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

## Example Files

This example includes:

* **simpleTests.js** — Basic test examples demonstrating:
  * Tests with and without Qase metadata
  * Builder pattern usage: `test.meta(qase.id(1).create())`
  * Setting title, fields, and ignore flags
* **attachmentTests.js** — Attachment examples showing:
  * File attachments from paths
  * Content attachments from memory using `type` parameter
  * Step-level attachments
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

Or with explicit mode and browser:

```bash
QASE_MODE=testops npx testcafe chrome simpleTests.js
```

## Expected Behavior

When tests execute with Qase reporting enabled:

* **Tests with .meta(qase.id().create())** are linked to existing Qase test cases
* **Builder pattern chaining** allows combining metadata: `qase.id(1).title('...').fields({...}).create()`
* **Attachments use 'type' parameter** for MIME type specification (not 'contentType')
* **Steps with nested callbacks** provide hierarchical test organization
* **TestCafe's async/await** syntax works seamlessly with Qase reporter

## Framework-Specific Features

TestCafe with Qase has unique patterns:

* **Builder pattern** — Use `.meta(qase.id().create())` to attach metadata to tests
* **Type parameter for attachments** — `qase.attach({ name: 'file.txt', content: '...', type: 'text/plain' })`
* **Nested steps via callbacks** — Use step parameter (s, s1, s2) for nesting: `await qase.step('Parent', async (s1) => { await s1.step('Child', ...) })`
* **No wrapper function** — TestCafe uses `.meta()` API instead of wrapping test declarations

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit the [Qase TestCafe documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-testcafe).
