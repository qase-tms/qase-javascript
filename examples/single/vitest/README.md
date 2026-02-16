# Vitest API Testing Example with Qase Reporter

## Overview

This example demonstrates realistic API testing scenarios using Vitest with full Qase TestOps integration. The tests make real HTTP requests to [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake REST API for testing and prototyping, demonstrating all Qase reporter features including user CRUD operations, post validation and filtering, error handling, and advanced features like nested steps, suite hierarchy, and parameterized tests.

## Prerequisites

- [Node.js](https://nodejs.org/) version 18 or higher (required for native `fetch` API)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/vitest
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your Qase project settings:
   - Update the API token in `vitest.config.ts` or create a `qase.config.json` file
   - Set the correct project code
   - Enable "Create test cases" option in your Qase project settings

## Configuration

The Qase reporter can be configured using environment variables or configuration files.

**Environment Variables:**
- `QASE_MODE` - Set to `testops` to enable reporting, `off` to disable (default: off)
- `QASE_TESTOPS_API_TOKEN` - Your Qase API token (required for testops mode)
- `QASE_TESTOPS_PROJECT` - Your Qase project code (required for testops mode)

Example `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    testTimeout: 10000, // API requests may take longer
    reporters: [
      'default',
      ['vitest-qase-reporter',
        {
          mode: 'testops',
          debug: true,
          testops: {
            api: {
              token: process.env.QASE_TESTOPS_API_TOKEN || "<token>",
            },
            run: {
              complete: true,
            },
            project: process.env.QASE_TESTOPS_PROJECT || "<project_code>",
            uploadAttachments: true,
            showPublicReportLink: true,
          },
          captureLogs: true,
        }
      ],
    ],
  },
});
```

## Running Tests

```bash
# Run tests without Qase reporting (default)
npm test

# Run tests with Qase reporting
QASE_MODE=testops npm test
```

### Run Specific Test File

```bash
npm test api-crud.test.ts
```

## Test Scenarios

This example includes realistic API testing scenarios demonstrating all Qase reporter features:

### Test Files

| File | Purpose | Qase Features |
|------|---------|---------------|
| **api-crud.test.ts** | User CRUD operations (GET all, GET by ID, POST create, DELETE) | `qase.title()`, `qase.fields()`, `qase.step()`, `qase.parameters()`, `qase.attach()`, `qase.comment()` |
| **api-posts.test.ts** | Post validation and filtering (GET all, GET by user, GET with comments) | `qase.title()`, `qase.fields()`, `qase.parameters()`, `qase.step()`, `qase.attach()` |
| **api-errors.test.ts** | Error handling (404 responses, invalid endpoints) | `qase.title()`, `qase.fields()`, `qase.parameters()`, `qase.comment()`, `qase.attach()`, `qase.step()` |
| **api-advanced.test.ts** | Advanced features (nested steps, suite hierarchy, parameterized tests, ignored tests) | `qase.suite()`, `qase.step()` (nested), `qase.parameters()`, `qase.comment()`, `qase.ignore()` |

### Qase Features Coverage

All 9 Qase reporter features are demonstrated in realistic API testing context:

| Feature | Methods/Patterns | Where Used | Notes |
|---------|-----------------|------------|-------|
| **Test linking** | Wrap with `withQase()` | All test files | Access to full Qase API |
| **Custom titles** | `await qase.title()` | All tests | Descriptive test result titles |
| **Custom fields** | `await qase.fields()` | All tests | Layer, severity, priority metadata |
| **Suite hierarchy** | `await qase.suite()` | api-advanced.test.ts | Use `\t` separator for nesting |
| **Test steps** | `await qase.step()` | All tests | Named execution steps, supports nesting |
| **Attachments** | `await qase.attach()` | api-crud.test.ts, api-posts.test.ts, api-errors.test.ts | **CRITICAL: use `type` parameter, NOT `contentType`** |
| **Comments** | `await qase.comment()` | api-crud.test.ts, api-errors.test.ts, api-advanced.test.ts | Additional context for test results |
| **Parameters** | `await qase.parameters()` | All test files | Test input data and iterations |
| **Ignore tests** | `qase.ignore()` | api-advanced.test.ts | Mark tests to be excluded (NOT async) |

## Vitest-Specific Patterns

**CRITICAL differences from other reporters:**

1. **Import path:** `import { withQase } from 'vitest-qase-reporter/vitest'`
   - NOT from base package like Jest/Mocha

2. **Wrapper pattern:** `withQase(async ({ qase }) => { ... })`
   - Wrap test callback to access Qase API
   - Must be async function
   - Example:
     ```typescript
     test("my test", withQase(async ({ qase }) => {
       await qase.step("step 1", async () => { ... });
     }));
     ```

3. **Attachment parameter:** Use `type:` NOT `contentType:`
   - **Vitest:** `await qase.attach({ name: 'file.json', content: '...', type: 'application/json' })`
   - **Jest/Mocha:** `await qase.attach({ name: 'file.json', content: '...', contentType: 'application/json' })`
   - This is a key difference that will cause errors if wrong parameter is used

4. **Async requirements:** MUST `await` ALL qase methods except `qase.ignore()`
   - `await qase.title()`, `await qase.fields()`, `await qase.step()`, etc.
   - `qase.ignore()` is the ONLY synchronous method

5. **Suite hierarchy:** Use `\t` (tab character) as separator
   - Example: `await qase.suite('API Tests\tAdvanced\tRelationships')`

## Project Structure

```
vitest/
├── tests/
│   ├── api-crud.test.ts     # User CRUD operations
│   ├── api-posts.test.ts    # Post validation and filtering
│   ├── api-errors.test.ts   # Error handling scenarios
│   └── api-advanced.test.ts # Advanced Qase features
├── vitest.config.ts         # Vitest configuration
├── qase.config.json         # Qase reporter configuration (optional)
└── package.json
```

## JSONPlaceholder API

This example uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as the test API:

- **Free fake REST API** for testing and prototyping
- **No authentication required** - publicly accessible
- **Realistic data structure** - users, posts, comments, albums, photos, todos
- **Fake operations** - POST/PUT/PATCH/DELETE requests are faked (not persisted)
- **Stable and reliable** - maintained for testing purposes

### Available Resources

- `/users` - 10 users with profile data
- `/posts` - 100 posts across all users
- `/comments` - 500 comments on posts
- `/albums` - 100 albums
- `/photos` - 5000 photos
- `/todos` - 200 todo items

## Expected Behavior

When running with `QASE_MODE=testops`:

- **12+ realistic API tests** execute against JSONPlaceholder
- **Real HTTP requests** are made (requires internet connection)
- **Test results** are reported to Qase TestOps with:
  - Named execution steps showing request/validation flow
  - Request/response data attached as JSON
  - Test parameters (user IDs, post IDs, etc.)
  - Custom fields (layer, severity, priority)
  - Comments explaining expected failures
  - Suite hierarchy for organized reporting
- **Test run link** is displayed in console output

## Important Notes

- **Node 18+ required** for native `fetch` API (no external HTTP library needed)
- **Attachment parameter:** Always use `type:` NOT `contentType:` - this is critical for Vitest
- **Async/await required:** All qase methods must be awaited except `qase.ignore()`
- **Internet required:** Tests make real API calls to jsonplaceholder.typicode.com
- **Faked writes:** POST/PUT/DELETE operations appear successful but don't persist data
- **TypeScript:** All test files use TypeScript (.test.ts) with full type safety

## Additional Resources

- [Qase Vitest Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-vitest)
- [JSONPlaceholder Guide](https://jsonplaceholder.typicode.com/guide/)
- [Vitest Documentation](https://vitest.dev/)
