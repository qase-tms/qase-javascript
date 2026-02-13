# Playwright Example

This is a sample project demonstrating how to write and execute tests using the Playwright framework with integration to
Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/playwright
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

5. To run tests locally without Qase reporting:
   ```bash
   QASE_MODE=off npx playwright test
   ```

6. To run tests and upload the results to Qase Test Management:
   ```bash
   QASE_MODE=testops npx playwright test
   ```

## Example Files

This project contains several test files demonstrating different Qase features:

| File | Feature | Description |
|------|---------|-------------|
| `id.spec.js` | Test case linking | Links test to Qase test case by ID using `qase(id, name)` wrapper or `qase.id()` method |
| `title.spec.js` | Custom titles | Sets custom test result titles with `qase.title()` |
| `fields.spec.js` | Custom fields | Sets severity, priority, description, and other metadata with `qase.fields()` |
| `suite.spec.js` | Suite organization | Groups tests into suites and sub-suites with `qase.suite()` |
| `steps.spec.js` | Test steps | Defines execution steps with `await test.step()` (Playwright native) |
| `chain.spec.js` | Method chaining | Demonstrates chaining multiple Qase methods |
| `attach.spec.js` | Attachments | Attaches files and content to test results with `qase.attach()` |
| `comment.spec.js` | Comments | Adds comments to test results with `qase.comment()` |
| `ignore.spec.js` | Ignoring tests | Excludes tests from Qase reporting with `qase.ignore()` |
| `params.spec.js` | Parameters | Reports parameterized test data with `qase.parameters()` |

## Expected Behavior

### Running with QASE_MODE=off (Local Development)

When running tests with `QASE_MODE=off`, tests execute normally without Qase reporting:

- Tests run and pass/fail as usual
- No data is sent to Qase TestOps
- No Qase API token required
- Output shows standard Playwright test results
- Playwright trace viewer and reports work normally

This mode is useful for local development and debugging.

### Running with QASE_MODE=testops (CI/CD and Reporting)

When running tests with `QASE_MODE=testops`, test results are reported to Qase:

- Tests execute and results are sent to Qase TestOps
- A new test run is created in your Qase project
- Test results include all metadata (steps, attachments, fields, etc.)
- Console output includes Qase test run link
- Requires valid `QASE_TESTOPS_API_TOKEN` and `QASE_TESTOPS_PROJECT` configuration
- Playwright's native screenshots and traces can be attached automatically

**Steps Example (`steps.spec.js`):**
- Uses Playwright's native `test.step()` which is automatically reported to Qase
- Each step shows execution status, duration, and any errors
- Nested steps appear hierarchically in Qase
- Steps are also visible in Playwright's trace viewer

**Attachments Example (`attach.spec.js`):**
- Files attached via `paths` option appear in test results
- Screenshots captured with `page.screenshot()` can be attached
- Content attached via `content` option is uploaded to Qase
- Attachments are visible in the test run details
- Supports text, JSON, images, videos, and binary files

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
      "title": "Playwright Automated Test Run",
      "complete": true
    }
  }
}
```

Or configure via `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    [
      'playwright-qase-reporter',
      {
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
    ],
  ],
});
```

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Playwright documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-playwright).
