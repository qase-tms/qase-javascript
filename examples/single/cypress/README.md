# Cypress Example

This is a sample project demonstrating how to write and execute tests using the Cypress framework with integration to
Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/cypress
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

4. To run tests locally without Qase reporting (interactive mode):
   ```bash
   QASE_MODE=off npx cypress open
   ```

5. To run tests locally without Qase reporting (headless mode):
   ```bash
   QASE_MODE=off npx cypress run
   ```

6. To run tests and upload the results to Qase Test Management:
   ```bash
   QASE_MODE=testops npx cypress run
   ```

## Example Files

This project contains several test files demonstrating different Qase features:

| File | Feature | Description |
|------|---------|-------------|
| `simpleTests.cy.js` | Basic tests | Simple Cypress tests with and without Qase integration |
| `methodTests.cy.js` | Qase methods | Demonstrates `qase.comment()` and `qase.attach()` methods |
| `stepTests.cy.js` | Test steps | Defines execution steps with `qase.step()` (synchronous callbacks) |
| `parametrizedTests.cy.js` | Parameters | Reports parameterized test data with `qase.parameters()` |

## Expected Behavior

### Running with QASE_MODE=off (Local Development)

When running tests with `QASE_MODE=off`, tests execute normally without Qase reporting:

- Tests run and pass/fail as usual
- No data is sent to Qase TestOps
- No Qase API token required
- Output shows standard Cypress test results
- Cypress screenshots and videos work normally

This mode is useful for local development and debugging.

### Running with QASE_MODE=testops (CI/CD and Reporting)

When running tests with `QASE_MODE=testops`, test results are reported to Qase:

- Tests execute and results are sent to Qase TestOps
- A new test run is created in your Qase project
- Test results include all metadata (steps, attachments, comments, etc.)
- Console output includes Qase test run link
- Requires valid `QASE_TESTOPS_API_TOKEN` and `QASE_TESTOPS_PROJECT` configuration
- Cypress screenshots on failure can be attached automatically

**Steps Example (`stepTests.cy.js`):**
- Creates test result with multiple named steps using `qase.step()`
- Each step shows execution status, duration, and any errors
- **Important:** Cypress steps use synchronous callbacks (no async/await)
- Nested steps can be created by calling `qase.step()` within another step
- Steps are visible in Qase test run details

**Attachments Example (`methodTests.cy.js`):**
- Content attached via `qase.attach()` appears in test results
- Supports attaching text, JSON, and other content types
- Cypress screenshots and videos can be attached automatically on failure
- Attachments are visible in the test run details

**Parameters Example (`parametrizedTests.cy.js`):**
- Parameterized tests report their parameter values to Qase
- Parameters help identify which test variant produced which result
- Useful for data-driven testing scenarios

**Multi-Project Support:**
- When configured for multi-project reporting, same test results are sent to multiple Qase projects
- Each project can have different test case IDs for the same test

## Configuration

Example `qase.config.json`:

```json
{
  "mode": "testops",
  "debug": false,
  "testops": {
    "api": {
      "token": "your_api_token_here"
    },
    "project": "YOUR_PROJECT_CODE",
    "run": {
      "title": "Cypress Automated Test Run",
      "complete": true
    }
  }
}
```

Or configure via `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    testops: {
      api: {
        token: process.env.QASE_TESTOPS_API_TOKEN,
      },
      project: 'YOUR_PROJECT_CODE',
      run: {
        complete: true,
      },
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

## Important Notes

- **Synchronous Steps:** Unlike Jest or Playwright, Cypress steps use synchronous callbacks. Do NOT use `async/await` with `qase.step()` in Cypress tests.
- **Import Pattern:** Use `import { qase } from 'cypress-qase-reporter/mocha';` (note the `/mocha` suffix, as Cypress uses Mocha under the hood)

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Cypress documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress).
