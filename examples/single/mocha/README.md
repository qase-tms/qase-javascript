# Mocha Example

This is a sample project demonstrating how to write and execute tests using the Mocha framework with integration to
Qase Test Management.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository by running the following commands:

   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/mocha
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

4. To run tests and upload the results to Qase Test Management, use the following command:

   ```bash
   npm run test
   ```

## Features Demonstrated

- **Qase Integration**: Shows various Qase features like test IDs, titles, suites, comments, fields, attachments, and steps
- **Test Methods**: Demonstrates different ways to use Qase methods in tests
- **Async Tests**: Shows how to handle asynchronous test execution
- **Parametrized Tests**: Demonstrates parameterized test execution
- **Attachment Handling**: Shows how to attach files and data to tests

## Usage

### Basic Test Execution

```bash
npm run test
```

This runs all tests with the Qase reporter, sending results to Qase TestOps.

### Alternative: Direct Mocha Command

```bash
QASE_MODE=testops mocha
```

This runs Mocha directly with Qase integration.

## Configuration Files

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
    "showPublicReportLink": true,
    "run": {
      "complete": true,
      "title": "Mocha test run"
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

## Expected Behavior

### Running with QASE_MODE=off (Local Development)

When running tests with `QASE_MODE=off`, tests execute normally without Qase reporting:

- Tests run and pass/fail as usual
- No data is sent to Qase TestOps
- No Qase API token required
- Output shows standard Mocha test results

This mode is useful for local development and debugging.

### Running with QASE_MODE=testops (CI/CD and Reporting)

When running tests with `QASE_MODE=testops`, test results are reported to Qase:

- Tests execute and results are sent to Qase TestOps
- A new test run is created in your Qase project
- Test results include all metadata (steps, attachments, fields, etc.)
- Console output includes Qase test run link
- Requires valid Qase API token and project code in `qase.config.json`

**Steps Example:**
- Creates test result with multiple named steps using `this.step()`
- Each step shows execution status, duration, and any errors
- Nested steps appear hierarchically in Qase
- Steps with callbacks can contain assertions and actions

**Attachments Example:**
- Files attached via `this.attach()` appear in test results
- Content can be strings, buffers, or file paths
- Attachments are visible in the test run details
- Supports text, JSON, images, and binary files

**Context Methods:**
- Mocha provides Qase methods via test context (`this` keyword)
- Must use `function()` syntax (not arrow functions) to access `this`
- Available methods: `this.title()`, `this.suite()`, `this.fields()`, `this.comment()`, `this.parameters()`, `this.attach()`, `this.step()`

## What You'll See

### Test Execution Output

When running tests with Qase integration, you'll see:

1. **Qase Integration**: DEBUG logs showing data being sent to Qase TestOps
2. **Test Run Creation**: Results are sent to Qase TestOps
3. **Test Run Link**: URL to view results in Qase dashboard
4. **Test Results**: Individual test results with Qase IDs

Example output:

```
[DEBUG] qase: Starting test run
[DEBUG] qase: Creating test run: {"title":"Mocha test run","description":"","is_autotest":true,"cases":[],"start_time":"2025-10-07 19:30:00","tags":[]}
[DEBUG] qase: Test run created: {"status":true,"result":{"id":3743}}

  Simple tests async
    ✔ test without qase metadata success
    1) test without qase metadata failed
    - test with qase id success (Qase ID: 10)
    2) test with qase id failed (Qase ID: 20)
    ✔ test with title success
    3) test with title failed
    ✔ test with suite success
    4) test with suite failed
    ✔ test with comment success
    5) test with comment failed
    ✔ test with fields success
    6) test with fields failed
    ✔ ignored test success
    7) ignored test failed

  Attachment tests
    ✔ successful test with string attachment
    8) failing test with string attachment

  Parametrized test
    ✔ test with parameters success 1
    9) test with parameters failed 1
    ✔ test with parameters success 2
    10) test with parameters failed 2
    ✔ test with parameters success 3
    11) test with parameters failed 3
    ✔ test with parameters success 4
    12) test with parameters failed 4
    ✔ test with parameters success 5
    13) test with parameters failed 5

  Simple tests
    ✔ test without qase metadata success
    14) test without qase metadata failed
    - test with qase id success (Qase ID: 1)
    15) test with qase id failed (Qase ID: 2)
    ✔ test with title success
    16) test with title failed
    ✔ test with suite success
    17) test with suite failed
    ✔ test with comment success
    18) test with comment failed
    ✔ test with fields success
    19) test with fields failed
    ✔ ignored test success
    20) ignored test failed

  Step tests
    ✔ successful test with steps
    21) failing test with steps

  2 passing (11ms)
  2 pending
  38 failing

[DEBUG] qase: Publishing test run results
[DEBUG] qase: Results sent to Qase: 40
[INFO] qase: Test run link: https://app.qase.io/run/DEVX/dashboard/3743
[INFO] qase: Run 3743 completed
```

## Benefits

This example demonstrates comprehensive Qase integration with Mocha:

- **Full Qase Functionality**: All Qase methods (`this.title()`, `this.suite()`, etc.) are available
- **TestOps Integration**: Results are sent to Qase TestOps for analysis
- **Rich Test Metadata**: Support for titles, suites, comments, fields, attachments, and steps
- **Async Support**: Proper handling of asynchronous test execution
- **Parametrized Tests**: Support for parameterized test execution
- **Attachment Support**: Ability to attach files and data to tests
- **CI/CD Ready**: Perfect for automated testing pipelines

## Test Examples

### Basic Test with Qase ID

```javascript
const { qase } = require('mocha-qase-reporter/mocha');

it(qase(1, 'test with qase id'), function() {
  assert.strictEqual(1, 1);
});
```

### Test with Custom Title

```javascript
it('test with title', function() {
  this.title('Custom Test Title');
  assert.strictEqual(1, 1);
});
```

### Test with Suite

```javascript
it('test with suite', function() {
  this.suite('Custom Suite');
  assert.strictEqual(1, 1);
});
```

### Test with Comment

```javascript
it('test with comment', function() {
  this.comment('This is a test comment');
  assert.strictEqual(1, 1);
});
```

### Test with Fields

```javascript
it('test with fields', function() {
  this.fields({ environment: 'test', priority: 'high' });
  assert.strictEqual(1, 1);
});
```

### Test with Attachment

```javascript
it('test with attachment', function() {
  this.attach({ 
    name: 'test-data.txt', 
    content: 'Sample test data', 
    contentType: 'text/plain' 
  });
  assert.strictEqual(1, 1);
});
```

### Test with Steps

```javascript
it('test with steps', function() {
  this.step('Step 1: Initialize', () => {
    assert.strictEqual(1, 1);
  });
  
  this.step('Step 2: Execute', () => {
    assert.strictEqual(2, 2);
  });
  
  this.step('Step 3: Verify', () => {
    assert.strictEqual(3, 3);
  });
});
```

### Parametrized Test

```javascript
const parameters = [1, 2, 3, 4, 5];

parameters.forEach((param, index) => {
  it(`test with parameters success ${param}`, function() {
    this.parameters({ value: param });
    assert.strictEqual(param, param);
  });
});
```

## Troubleshooting

### TestOps Mode Failing

If TestOps mode fails with "Uncaught error outside test suite", make sure you have:

1. **Valid Qase Token**: Replace `your_qase_token_here` in `qase.config.json` with your actual Qase API token
2. **Valid Project Code**: Replace `your_project_code_here` in `qase.config.json` with your actual project code
3. **Network Access**: Ensure you can reach Qase API from your environment

### Qase Methods Not Working

If Qase methods (`this.title()`, `this.suite()`, etc.) are not working:

1. **Check Reporter**: Make sure you're using `mocha-qase-reporter`
2. **Check Mode**: Ensure `QASE_MODE=testops` is set
3. **Check Configuration**: Verify `qase.config.json` is properly configured

### Async Tests Not Working

If async tests are not working properly:

1. **Use Proper Async Syntax**: Use `async/await` or return promises
2. **Check Timeouts**: Ensure timeout is sufficient for async operations
3. **Handle Errors**: Properly handle and assert async errors

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Mocha documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-mocha).
