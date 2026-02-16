# Mocha Example - API Testing with Qase Integration

This example demonstrates realistic API testing scenarios using Mocha with Qase TestOps integration. The tests validate a public REST API (JSONPlaceholder) while showcasing all Qase reporter features in practical contexts.

## Overview

The example includes 4 test files demonstrating:
- **CRUD operations** on users (GET, POST, DELETE)
- **Post validation** and filtering
- **Error handling** for 404 responses
- **Advanced features** like nested steps, suite hierarchies, and parameterized tests

All tests run against [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake REST API for testing and prototyping.

## Prerequisites

- Node.js 18 or higher (for native `fetch` support)
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Create a `qase.config.json` file in the root directory:

```json
{
  "debug": true,
  "testops": {
    "api": {
      "token": "your_qase_api_token"
    },
    "project": "your_project_code",
    "uploadAttachments": true,
    "run": {
      "complete": true,
      "title": "Mocha API Test Run"
    }
  }
}
```

**Getting your credentials:**
- **API Token**: Qase profile settings → API Tokens section
- **Project Code**: Found in your Qase project URL or settings

## Running Tests

```bash
# Run all tests with Qase reporting
npm test

# Run without Qase reporting (local development)
QASE_MODE=off npm test
```

## Test Files

### 1. `api-crud.spec.js` - User CRUD Operations
Tests basic CRUD operations on the `/users` endpoint:
- **GET all users** - Verifies 10 users returned with proper structure
- **GET single user** - Validates specific user details (Leanne Graham)
- **POST create user** - Tests user creation with request/response attachments
- **DELETE user** - Verifies deletion (faked by JSONPlaceholder)

**Qase features:** `qase.id`, `qase.fields`, `qase.step`, `qase.attach`, `qase.comment`, `qase.parameters`

### 2. `api-posts.spec.js` - Post Validation
Tests post retrieval and filtering:
- **GET all posts** - Verifies 100 posts with correct structure
- **GET posts by user** - Tests filtering with query parameters
- **GET post with comments** - Validates relationships and nested data

**Qase features:** `qase.id`, `qase.fields`, `qase.parameters`, `qase.step`, `qase.attach`

### 3. `api-errors.spec.js` - Error Handling
Tests error scenarios and 404 responses:
- **Non-existent user** - Validates 404 handling for invalid user ID
- **Non-existent post** - Attaches error response for documentation
- **Invalid endpoint** - Verifies graceful handling of bad URLs

**Qase features:** `qase.id`, `qase.comment`, `qase.step`, `qase.attach`

### 4. `api-advanced.spec.js` - Advanced Features
Demonstrates complex Qase capabilities:
- **Complex nested steps** - Multi-level step hierarchy for related API calls
- **Suite hierarchy** - Nested suite structure with `\t` separator
- **Parameterized patterns** - Testing multiple resources with parameters
- **Ignored test** - Placeholder for future authentication features

**Qase features:** `qase.id`, `qase.fields`, `qase.suite`, `qase.step`, `qase.parameters`, `qase.attach`, `qase.comment`, `qase.ignore`

## Qase Features Reference

All 9 Qase reporter features demonstrated in these tests:

| Feature | Usage | Example File |
|---------|-------|--------------|
| **Test ID** | `qase(id, 'name')` wrapper | All files |
| **Title** | `qase.title('custom title')` | Not needed (using qase wrapper) |
| **Fields** | `qase.fields({ layer, severity, priority })` | api-crud, api-posts, api-advanced |
| **Suite** | `qase.suite('Parent\tChild\tGrandchild')` | api-advanced |
| **Steps** | `await qase.step('name', async () => {})` | All files |
| **Attachments** | `qase.attach({ name, content, contentType })` | api-crud, api-posts, api-errors, api-advanced |
| **Comments** | `qase.comment('additional info')` | api-crud, api-errors, api-advanced |
| **Parameters** | `qase.parameters({ key: 'value' })` | api-crud, api-posts, api-advanced |
| **Ignore** | `qase.ignore()` with `it.skip()` | api-advanced |

## Mocha-Specific Patterns

### Import from Correct Path
```javascript
const { qase } = require('mocha-qase-reporter/mocha');
```
**Important:** Must import from `mocha-qase-reporter/mocha` (not base package).

### Test ID Wrapper Pattern
```javascript
it(qase(1, 'Test description'), async function() {
  // Test code
});
```
The `qase(id, name)` wrapper assigns Qase test case IDs.

### Attachment contentType Parameter
```javascript
qase.attach({
  name: 'data.json',
  content: JSON.stringify(data),
  contentType: 'application/json'  // Note: contentType, not type
});
```
**Important:** Mocha uses `contentType` parameter (Vitest uses `type`).

### Steps Can Be Sync or Async
```javascript
// Async steps (recommended for API calls)
await qase.step('Fetch data', async () => {
  const response = await fetch(url);
});

// Sync steps (for simple operations)
qase.step('Validate data', () => {
  assert.strictEqual(value, expected);
});
```

### Suite Hierarchy with \t Separator
```javascript
qase.suite('API Tests\tAdvanced\tRelationships');
// Creates: API Tests > Advanced > Relationships in Qase UI
```

### Function Context for `this` Access
While modern API uses the `qase` object directly, traditional Mocha patterns use `function()` syntax (not arrow functions) to access `this` context:

```javascript
// Modern approach (used in these examples)
it('test', function() {
  qase.title('Custom title');
});

// Traditional approach (also valid)
it('test', function() {
  this.title('Custom title');
});
```

## JSONPlaceholder API

These tests use [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake REST API:

**Key endpoints:**
- `/users` - 10 users
- `/posts` - 100 posts
- `/comments` - 500 comments
- `/albums` - 100 albums
- `/photos` - 5000 photos

**Important notes:**
- **No authentication required** - Perfect for testing examples
- **Write operations are faked** - POST/PUT/PATCH/DELETE return success but don't persist data
- **Stable and reliable** - Hosted by Vercel, widely used for testing
- **CORS enabled** - Can be used from browser or Node.js

## Expected Output

When running with `QASE_MODE=testops`, you'll see:

```
JSONPlaceholder User CRUD Operations
  ✓ GET all users - verify 10 users returned (Qase ID: 1)
  ✓ GET single user by ID - verify user details (Qase ID: 2)
  ✓ POST create user - verify 201 response and returned ID (Qase ID: 3)
  ✓ DELETE user - verify 200 response (Qase ID: 4)

JSONPlaceholder Post Validation
  ✓ GET all posts - verify 100 posts returned (Qase ID: 5)
  ✓ GET posts by user ID - verify filtered results (Qase ID: 6)
  ✓ GET post with comments - verify comment structure (Qase ID: 7)

JSONPlaceholder Error Handling
  ✓ GET non-existent user - verify 404 response (Qase ID: 8)
  ✓ GET non-existent post - attach error response (Qase ID: 9)
  ✓ Invalid endpoint - verify graceful 404 handling (Qase ID: 10)

JSONPlaceholder Advanced Qase Features
  ✓ Complex nested steps - multi-resource retrieval (Qase ID: 11)
  ✓ Suite hierarchy demonstration (Qase ID: 12)
  ✓ Parameterized test pattern - multiple user IDs (Qase ID: 13)
  - Future feature - API authentication (Qase ID: 14)

13 passing
1 pending

[INFO] qase: Test run link: https://app.qase.io/run/YOUR_PROJECT/dashboard/RUN_ID
```

## What You'll See in Qase

After running tests with `QASE_MODE=testops`:

1. **Test Run** created with title "Mocha API Test Run"
2. **14 test results** (13 passed, 1 skipped)
3. **Detailed steps** for each test showing API calls and validations
4. **Attachments** including request bodies and response data (JSON files)
5. **Test metadata** like fields (layer, severity, priority), parameters, and comments
6. **Suite hierarchy** showing nested organization in the advanced tests

## Troubleshooting

### Tests fail with "fetch is not defined"
Ensure you're using Node.js 18 or higher, which includes native fetch support. For older versions:
```bash
npm install node-fetch@2
```
Then update imports to use `node-fetch`.

### Qase reporter not working
1. Verify `QASE_MODE=testops` is set
2. Check `qase.config.json` has valid token and project code
3. Ensure `mocha-qase-reporter` is listed in `.mocharc.js` reporter configuration

### Tests timeout
API calls may take longer than default Mocha timeout. The `.mocharc.js` is configured with 10000ms timeout. Adjust if needed:
```javascript
module.exports = {
  timeout: 15000  // 15 seconds
};
```

## Learn More

- [Qase Mocha Reporter Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-mocha)
- [Mocha Documentation](https://mochajs.org/)
- [JSONPlaceholder Guide](https://jsonplaceholder.typicode.com/guide/)

## Benefits

This example demonstrates:

✅ **Realistic API testing patterns** - Real HTTP requests, not mocks
✅ **All Qase features in context** - Not isolated demos, but practical usage
✅ **Mocha-specific patterns** - Correct import paths, contentType, step handling
✅ **Error handling** - How to test and document failure scenarios
✅ **Best practices** - Nested steps, parameterization, attachments
✅ **Zero infrastructure** - Uses free public API, no setup required
✅ **Ready for CI/CD** - Can run in any environment with internet access
