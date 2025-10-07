# Mocha Multi-Reporters Example

This is a sample project demonstrating how to write and execute tests using the Mocha framework with `mocha-multi-reporters` integration to Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:

   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/mocha-multi-reporters
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

4. To run tests with multi-reporters and upload the results to Qase Test Management:

   ```bash
   npm run test
   ```

## Features Demonstrated

- **Multiple Reporters**: Uses both `spec` reporter (console output) and `mocha-qase-reporter` (Qase integration)
- **Qase Integration**: Shows various Qase features like test IDs, titles, suites, comments, fields, attachments, and steps
- **Different Configuration Methods**: Demonstrates various ways to configure multi-reporters

## Usage

### Multi-Reporter Mode with TestOps

```bash
npm run test
```

This runs with multi-reporters, using the `mocha-multi-reporters.json` configuration file. You'll see both console output and Qase TestOps integration.

**Note**: This mode combines the benefits of multi-reporters (console output) with TestOps integration (sending results to Qase).

### Alternative: Using .mocharc.js

If you want to use the `.mocharc.js` configuration file:

```bash
mocha
```

## Configuration Files

### mocha-multi-reporters.json

```json
{
  "reporterEnabled": "spec,mocha-qase-reporter"
}
```

### .mocharc.js

```javascript
module.exports = {
  reporter: 'mocha-multi-reporters',
  reporterOptions: {
    configFile: 'mocha-multi-reporters.json'
  },
  timeout: 5000
};
```

### qase.config.json

```json
{
  "debug": true,
  "testops": {
    "api": {
      "token": "your_qase_token_here"
    },
    "project": "your_project_code_here",
    "uploadAttachments": true,
    "run": {
      "complete": true,
      "title": "Mocha Multi-Reporter Test Run"
    }
  }
}
```

**Important**: Replace `your_qase_token_here` and `your_project_code_here` with your actual Qase token and project code for TestOps mode to work.

### Getting Your Qase Credentials

1. **API Token**:
   - Go to your Qase profile settings
   - Navigate to "API Tokens" section
   - Create a new token or copy an existing one

2. **Project Code**:
   - Go to your Qase project
   - The project code is shown in the URL: `https://app.qase.io/project/YOUR_PROJECT_CODE`
   - Or find it in project settings

## What You'll See

### Multi-Reporter Mode with TestOps (`npm run test`)

When running in multi-reporter mode with TestOps, you'll see:

1. **Console Output**: Structured test results from the `spec` reporter
2. **Qase Integration**: DEBUG logs showing data being sent to Qase TestOps
3. **Test Run Creation**: Results are sent to Qase TestOps
4. **Test Run Link**: URL to view results in Qase dashboard

Example output:

```
  Multi-Reporter Demo Tests
    ✔ simple test without qase metadata
    ✔ test with qase id (Qase ID: 1)
    ✔ test with custom title (Qase ID: 2)
    ✔ test with custom suite (Qase ID: 3)
    ✔ test with comment (Qase ID: 4)
    ✔ test with fields (Qase ID: 5)
    ✔ test with attachment (Qase ID: 6)
    ✔ test with steps (Qase ID: 7)
    1) failing test for demonstration (Qase ID: 8)
    - skipped test (Qase ID: 9)

  8 passing (5ms)
  1 pending
  1 failing
```

## Benefits

This example demonstrates multi-reporter integration with TestOps:

- **Multi-Reporter Mode**: Perfect for development with console feedback
- **TestOps Integration**: Ideal for CI/CD pipelines and production testing
- **Console Feedback**: See test results immediately in your terminal
- **Qase Integration**: Get detailed reports and analytics in Qase
- **Flexible Configuration**: Multiple ways to configure based on your needs
- **Best of Both Worlds**: Combine the readability of spec reporter with the power of Qase integration

## Troubleshooting

### Reporter Not Found

Make sure you have the `mocha-multi-reporters.js` file in your project root.

### Configuration Issues

If the configuration file causes problems, try running with only the Qase reporter:

```bash
QASE_MODE=testops mocha --reporter mocha-qase-reporter
```

### TestOps Mode Failing

If TestOps mode fails with "Uncaught error outside test suite", make sure you have:

1. **Valid Qase Token**: Replace `your_qase_token_here` in `qase.config.json` with your actual Qase API token
2. **Valid Project Code**: Replace `your_project_code_here` in `qase.config.json` with your actual project code
3. **Network Access**: Ensure you can reach Qase API from your environment

### Qase Methods Not Available in Multi-Reporter Mode

In multi-reporter mode, the Qase methods (`this.title()`, `this.suite()`, etc.) are not available in the test context. Instead, use the `qase()` function to set test IDs and titles:

```javascript
// ✅ Works with multi-reporters
it(qase(1, 'test with qase id'), function() {
  assert.strictEqual(1, 1);
});

// ❌ Doesn't work with multi-reporters
it('test with title', function() {
  this.title('Custom Title'); // TypeError: this.title is not a function
  assert.strictEqual(1, 1);
});
```

For full Qase functionality (including `this.title()`, `this.suite()`, etc.), use single reporter mode:

```bash
QASE_MODE=testops mocha --reporter mocha-qase-reporter
```

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Mocha documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-mocha).
