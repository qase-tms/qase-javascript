# Mocha Example - API Testing with Qase Integration

## Overview

This example demonstrates realistic API testing scenarios using Mocha with Qase TestOps integration. The tests validate a public REST API (JSONPlaceholder) while showcasing all Qase reporter features in practical contexts, including CRUD operations on users, post validation and filtering, error handling for 404 responses, and advanced features like nested steps, suite hierarchies, and parameterized tests.

## Prerequisites

- Node.js 18 or higher (for native `fetch` support)
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

The Qase reporter can be configured using environment variables or configuration files.

**Environment Variables:**
- `QASE_MODE` - Set to `testops` to enable reporting, `off` to disable (default: off)
- `QASE_TESTOPS_API_TOKEN` - Your Qase API token (required for testops mode)
- `QASE_TESTOPS_PROJECT` - Your Qase project code (required for testops mode)

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
# Run tests without Qase reporting (default)
npm test

# Run tests with Qase reporting
QASE_MODE=testops npm test
```

## Test Scenarios

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

## Qase Features Demonstrated

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

## Project Structure

```
mocha/
├── test/
│   ├── api-crud.spec.js     # User CRUD operations
│   ├── api-posts.spec.js    # Post validation and filtering
│   ├── api-errors.spec.js   # Error handling scenarios
│   └── api-advanced.spec.js # Advanced Qase features
├── .mocharc.js              # Mocha configuration
├── qase.config.json         # Qase reporter configuration
└── package.json
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

## Additional Resources

- [Qase Mocha Reporter Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-mocha)
- [Mocha Documentation](https://mochajs.org/)
- [JSONPlaceholder Guide](https://jsonplaceholder.typicode.com/guide/)
