# Jest Example - API Testing with JSONPlaceholder

## Overview

This example project demonstrates how to write realistic API tests using the Jest framework with integration to Qase Test Management. The tests use [JSONPlaceholder](https://jsonplaceholder.typicode.com), a free fake REST API for testing and prototyping, covering CRUD operations, post validation, error handling, and advanced features like nested steps and suite hierarchies.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is required for native fetch support)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/jest
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

## Configuration

The Qase reporter can be configured using environment variables or configuration files.

**Environment Variables:**
- `QASE_MODE` - Set to `testops` to enable reporting, `off` to disable (default: off)
- `QASE_TESTOPS_API_TOKEN` - Your Qase API token (required for testops mode)
- `QASE_TESTOPS_PROJECT` - Your Qase project code (required for testops mode)

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
      "title": "Jest API Test Run",
      "complete": true
    }
  }
}
```

Or configure via `jest.config.js`:

```javascript
module.exports = {
  testTimeout: 10000, // API requests may take longer
  reporters: [
    'default',
    [
      'jest-qase-reporter',
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
};
```

## Running Tests

```bash
# Run tests without Qase reporting (default)
npm test

# Run tests with Qase reporting
QASE_MODE=testops npm test
```

### Run specific test file

```bash
npm test -- api-crud.test.js
```

### Run tests with verbose output

```bash
npm test -- --verbose
```

### Expected Behavior

**Running with QASE_MODE=off (Local Development)**

When running tests with `QASE_MODE=off`, tests execute normally without Qase reporting:

- Tests run and pass/fail as usual
- Real HTTP requests are made to JSONPlaceholder API
- No data is sent to Qase TestOps
- No Qase API token required
- Output shows standard Jest test results

**Running with QASE_MODE=testops (CI/CD and Reporting)**

When running tests with `QASE_MODE=testops`, test results are reported to Qase:

- Tests execute with real API calls to JSONPlaceholder
- Results are sent to Qase TestOps with all metadata
- A new test run is created in your Qase project
- Console output includes Qase test run link
- All steps, attachments, fields, and comments are captured
- Requires valid `QASE_TESTOPS_API_TOKEN` and `QASE_TESTOPS_PROJECT` configuration

## Test Scenarios

This project contains 4 test files with realistic API testing scenarios:

### api-crud.test.js - User CRUD Operations

Tests CRUD (Create, Read, Update, Delete) operations on the users endpoint:
- GET all users (verify 10 users returned)
- GET single user by ID (verify user details)
- POST create new user (verify 201 response and ID assignment)
- DELETE user (verify 200 response)

**Qase features demonstrated:** `qase.id`, `qase.fields`, `qase.step`, `qase.parameters`, `qase.attach`, `qase.comment`

### api-posts.test.js - Post Validation

Tests post retrieval and validation with filtering:
- GET all posts (verify 100 posts returned)
- GET posts filtered by user ID (verify query parameters)
- GET post with comments (verify nested data structure)

**Qase features demonstrated:** `qase.id`, `qase.fields`, `qase.parameters`, `qase.step`, `qase.attach`

### api-errors.test.js - Error Handling

Tests error handling and edge cases:
- GET non-existent user (verify empty object response)
- GET non-existent post (verify graceful handling)
- Invalid endpoint (verify 404 with HTML)
- POST with minimal data (verify API resilience)

**Qase features demonstrated:** `qase.id`, `qase.fields`, `qase.comment`, `qase.attach`, `qase.step`

### api-advanced.test.js - Advanced Features

Tests demonstrating advanced Qase features:
- Complex nested steps (user and posts retrieval)
- Suite hierarchy with tab separator
- Parameterized test pattern (multiple user IDs)
- Albums with nested photos
- Ignored test placeholder (future authentication feature)

**Qase features demonstrated:** `qase.suite`, nested `qase.step`, `qase.parameters`, `qase.ignore`, `qase.comment`

## Qase Features Demonstrated

All 9 Qase reporter features are demonstrated across the test files:

| Feature | API Method | Used In | Description |
|---------|-----------|---------|-------------|
| Test ID | `qase(id, name)` | All files | Links test to Qase test case using wrapper pattern |
| Title | `qase.title()` | (implicit via wrapper) | Test name is set via qase() wrapper |
| Fields | `qase.fields()` | All files | Sets severity, priority, layer metadata |
| Suite | `qase.suite()` | api-advanced.test.js | Organizes tests into hierarchical suites with `\t` separator |
| Steps | `await qase.step()` | All files | Defines execution steps with async/await support |
| Attachments | `qase.attach()` | api-crud, api-posts, api-errors | Attaches JSON content with `contentType` parameter |
| Comments | `qase.comment()` | api-crud, api-errors, api-advanced | Adds contextual notes to test results |
| Parameters | `qase.parameters()` | api-crud, api-posts, api-advanced | Reports parameterized test data |
| Ignore | `qase.ignore()` | api-advanced.test.js | Excludes specific test from Qase reporting |

## Jest-Specific Patterns

This example demonstrates Jest-specific Qase integration patterns:

1. **Import Path:** Use `jest-qase-reporter/jest` (not the base package)
   ```javascript
   const { qase } = require('jest-qase-reporter/jest');
   ```

2. **Test ID Wrapper:** Use `qase(id, name)` wrapper pattern
   ```javascript
   test(qase(1, 'Test name'), async () => {
     // test code
   });
   ```

3. **Attachments:** Use `contentType` parameter (NOT `type`)
   ```javascript
   qase.attach({
     name: 'data.json',
     content: JSON.stringify(data, null, 2),
     contentType: 'application/json',
   });
   ```

4. **Async Steps:** Use `await qase.step()` for async operations
   ```javascript
   await qase.step('Step name', async () => {
     // async operations
   });
   ```

5. **Suite Hierarchy:** Use `\t` (tab character) as separator
   ```javascript
   qase.suite('API Tests\tAdvanced\tRelationships');
   ```

## Project Structure

```
jest/
├── tests/
│   ├── api-crud.test.js     # User CRUD operations
│   ├── api-posts.test.js    # Post validation and filtering
│   ├── api-errors.test.js   # Error handling scenarios
│   └── api-advanced.test.js # Advanced Qase features
├── jest.config.js           # Jest configuration
├── qase.config.json         # Qase reporter configuration
└── package.json
```

## About JSONPlaceholder

[JSONPlaceholder](https://jsonplaceholder.typicode.com) is a free fake REST API for testing and prototyping. It provides:

- **Free and stable:** No authentication required, always available
- **Realistic data:** 10 users, 100 posts, 500 comments, and more
- **Faked writes:** POST/PUT/DELETE operations are faked (return success but don't persist)
- **No rate limits:** Perfect for CI/CD pipelines

### Available Endpoints

- `/users` - 10 users with full profile information
- `/posts` - 100 posts associated with users
- `/comments` - 500 comments on posts
- `/albums` - 100 photo albums
- `/photos` - 5000 photos in albums
- `/todos` - 200 todo items

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Jest documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-jest).
