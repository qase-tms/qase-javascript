# CucumberJS Example

This is a sample project demonstrating how to write and execute tests using the CucumberJS framework with integration to Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/cucumberjs
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

## Example Files

This example includes:

* **features/** — Gherkin feature files with test scenarios
  * `simple.feature` — Basic scenarios with Qase tags (@QaseID, @QaseTitle, @QaseFields)
  * `table.feature` — Examples using data tables
* **step_definitions/** — Step implementation files
  * `simple_steps.js` — Step definitions using native Cucumber Given/When/Then
  * `table_steps.js` — Step definitions for table-based scenarios
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
QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter
```

## Expected Behavior

When tests execute with Qase reporting enabled:

* **Gherkin scenarios** are reported as individual test cases in Qase
* **Given/When/Then/And steps** from feature files are automatically reported as Qase test steps
* **@QaseID tags** link scenarios to existing test cases in your Qase project
* **@QaseTitle tags** override the default scenario name in Qase
* **@QaseFields tags** add metadata (severity, priority, etc.) to test results
* **Attachments** added via `this.attach()` in step definitions are included in Qase results

## Framework-Specific Features

CucumberJS with Qase has unique patterns:

* **No programmatic qase.step() API** — Steps come from Gherkin syntax (Given/When/Then)
* **Native Cucumber attachments** — Use `this.attach(content, mimeType)` in step definitions (not `qase.attach()`)
* **Tag-based metadata** — Test configuration uses Gherkin tags instead of programmatic calls
* **Feature-based organization** — Test suite hierarchy comes from Feature/Scenario structure

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit the [Qase CucumberJS documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cucumberjs).
