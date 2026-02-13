# Vitest Example

This is a sample project demonstrating how to write and execute tests using the Vitest framework with integration to
Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:

   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/vitest
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Configure your Qase project settings:
   - Update the API token in `vitest.config.ts` or create a `qase.config.json` file
   - Set the correct project name
   - Enable "Create test cases" option in your Qase project settings

4. To run tests locally without Qase reporting:

   ```bash
   QASE_MODE=off npm test
   ```

5. To run tests and upload the results to Qase Test Management:

   ```bash
   QASE_MODE=testops npm test
   ```

## Example Files

This project contains several test files demonstrating different Qase features:

| File | Feature | Description |
|------|---------|-------------|
| `id.test.ts` | Test case linking | Links test to Qase test case by ID using `qase(id, name)` wrapper |
| `title.test.ts` | Custom titles | Sets custom test result titles with `qase.title()` |
| `fields.test.ts` | Custom fields | Sets severity, priority, description, and other metadata with `qase.fields()` |
| `suite.test.ts` | Suite organization | Groups tests into suites and sub-suites with `qase.suite()` |
| `steps.test.ts` | Test steps | Defines execution steps with `await qase.step()` using `withQase()` wrapper |
| `attach.test.ts` | Attachments | Attaches files and content to test results with `qase.attach()` |
| `comment.test.ts` | Comments | Adds comments to test results with `qase.comment()` |
| `params.test.ts` | Parameters | Reports parameterized test data with `qase.parameters()` |
| `api.test.ts` | API testing | Demonstrates API testing with Qase integration |
| `e2e.test.ts` | E2E testing | End-to-end testing example with Qase reporting |
| `for.test.ts` | Loop tests | Demonstrates using loops to generate multiple tests |

## Expected Behavior

### Running with QASE_MODE=off (Local Development)

When running tests with `QASE_MODE=off`, tests execute normally without Qase reporting:

- Tests run and pass/fail as usual
- No data is sent to Qase TestOps
- No Qase API token required
- Output shows standard Vitest test results
- Vitest UI and watch mode work normally

This mode is useful for local development and debugging.

### Running with QASE_MODE=testops (CI/CD and Reporting)

When running tests with `QASE_MODE=testops`, test results are reported to Qase:

- Tests execute and results are sent to Qase TestOps
- A new test run is created in your Qase project
- Test results include all metadata (steps, attachments, fields, etc.)
- Console output includes Qase test run link
- Requires valid `QASE_TESTOPS_API_TOKEN` and `QASE_TESTOPS_PROJECT` configuration

**Steps Example (`steps.test.ts`):**
- Uses `withQase(async ({ qase }) => { ... })` wrapper to access step functionality
- Creates test result with multiple named steps using `await qase.step()`
- Each step shows execution status, duration, and any errors
- Nested steps appear hierarchically in Qase
- Steps with expected results and data are captured

**Attachments Example (`attach.test.ts`):**
- Uses `withQase(async ({ qase }) => { ... })` wrapper to access attach functionality
- Files attached via `paths` option appear in test results
- Content attached via `content` option is uploaded to Qase
- **Note:** Vitest uses `type:` parameter instead of `contentType:` for in-memory attachments
- Attachments are visible in the test run details
- Supports text, JSON, images, and binary files

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
      "title": "Vitest Automated Test Run",
      "complete": true
    }
  }
}
```

Or configure via `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default',
      [
        'vitest-qase-reporter',
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
  },
});
```

## Important Notes

- **withQase Wrapper:** For tests using steps or attachments, wrap your test callback with `withQase(async ({ qase }) => { ... })` to access the `qase` object
- **Import Pattern:** Use `import { withQase } from 'vitest-qase-reporter/vitest';` for step/attach functionality
- **Attachment Parameter:** Use `type:` instead of `contentType:` when attaching content from memory
- **TypeScript Support:** Vitest examples use TypeScript (.ts files) with full type safety

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Vitest documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-vitest).
