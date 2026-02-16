# Newman Collection Example

This example demonstrates realistic API testing using a Postman collection with the Newman CLI runner and Qase Test Management integration. Tests exercise the JSONPlaceholder REST API with organized collection folders providing suite hierarchy.

## Prerequisites

1. [Node.js](https://nodejs.org/) (version 18 or higher recommended)
2. [npm](https://www.npmjs.com/)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/newman
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Qase credentials in `qase.config.json`:
   - Set your API token in `testops.api.token`
   - Set your project code in `testops.project`

## Collection Structure

### Users (4 requests)
CRUD operations on JSONPlaceholder users:
- **Get all users** -- Verify 10 users with required fields (id, name, email, address)
- **Get single user** -- Verify user 1 data and nested address structure
- **Create user** -- POST with JSON body, verify 201 response and returned user
- **Delete user** -- DELETE request, verify 200 and empty response body

### Posts (3 requests)
Post validation and filtering:
- **Get all posts** -- Verify 100 posts with required fields (userId, id, title, body)
- **Filter posts by user** -- Query string filtering with parameterized userId
- **Get post comments** -- Nested resource, verify 5 comments with valid email

### Error Handling (3 requests)
Error and edge case scenarios:
- **Non-existent user** -- Verify 200 with empty object for /users/999
- **Invalid endpoint** -- Verify 404 for unknown routes
- **POST with empty body** -- Verify graceful handling (201 with generated ID)

### Advanced (3 requests)
Advanced testing patterns:
- **Chained request** -- Pre-request script fetches user, stores in collection variable, test validates
- **Parameterized user lookup** -- Data-driven testing with `// qase.parameters:` annotation
- **Response time validation** -- Performance assertion (response under 2000ms)

## Qase Features Demonstrated

| Feature | How It's Used | Example |
|---------|---------------|---------|
| Test Case ID | `// qase: N` comment before pm.test() | `// qase: 1` |
| Parameters | `// qase.parameters: key1, key2` comment | `// qase.parameters: userId, expectedName` |
| Auto-collect Params | `autoCollectParams: true` in qase.config.json | Reports all data file fields automatically |
| Suite Hierarchy | Collection folder structure | `JSONPlaceholder API Tests > Users > Get all users` |
| Data-driven Testing | `-d data.json` flag with iteration data | 3 iterations with different userId/expectedName |

### Newman Limitations

Newman reporter has limited Qase feature support compared to other frameworks:

| Feature | Supported | Notes |
|---------|-----------|-------|
| Test Case ID | Yes | Via `// qase: N` comments |
| Parameters | Yes | Via `// qase.parameters:` + data file |
| Suite Hierarchy | Yes | Via collection folder structure |
| Title Override | No | Test name comes from request name |
| Custom Fields | No | No severity, priority, etc. |
| Steps | No | Each pm.test() is a separate result |
| Attachments | No | No file attachment support |
| Ignore | No | Cannot exclude specific tests |
| Comments | No | No comment annotation support |

## Running Tests

Run tests locally (no Qase reporting):
```bash
QASE_MODE=off npm test
```

Run tests with Qase reporting:
```bash
npm test
```

Run with parameterized data file:
```bash
npm run test:data
```

This runs the collection 3 times (one per data row), with each iteration using different `userId` and `expectedName` values.

## Newman-Specific Patterns

- **Comment-based annotations** -- Use `// qase: N` in exec array before pm.test() calls
- **Each pm.test() is a separate result** -- No nesting or step hierarchy
- **Folder = Suite** -- Collection folders automatically create suite hierarchy in Qase
- **Pre-request scripts** -- Run before the main request; useful for chaining and setup
- **Data-driven iterations** -- `-d data.json` runs collection once per data row
- **Collection variables** -- Share data between pre-request and test scripts

## API Notes

Tests use [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as the test API:
- Free, public REST API -- no authentication required
- Returns realistic data (users, posts, comments, todos)
- Write operations (POST, PUT, DELETE) are faked -- they return success responses but don't persist data
- Stable and widely used for testing and prototyping

## Additional Resources

- [Qase Newman Reporter](https://github.com/qase-tms/qase-javascript/tree/main/qase-newman)
- [Newman Documentation](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)
- [JSONPlaceholder API Guide](https://jsonplaceholder.typicode.com/guide/)
