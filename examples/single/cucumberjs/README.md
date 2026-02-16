# CucumberJS BDD Example

This example demonstrates realistic BDD (Behavior-Driven Development) API testing using CucumberJS with Qase Test Management integration. Tests exercise the JSONPlaceholder REST API with Gherkin feature files expressing business behavior.

## Prerequisites

1. [Node.js](https://nodejs.org/) (version 18 or higher required for native fetch)
2. [npm](https://www.npmjs.com/)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/cucumberjs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Qase credentials in `qase.config.json`:
   - Set your API token in `testops.api.token`
   - Set your project code in `testops.project`

## Test Scenarios

### features/api-crud.feature (4 scenarios)
User CRUD operations against JSONPlaceholder:
- **Get all users** -- Verify 10 users returned with required fields
- **Get single user by ID** -- Verify specific user data (Leanne Graham)
- **Create new user** -- POST with JSON body, verify 201 response
- **Delete user** -- DELETE request, verify 200 response

### features/api-posts.feature (3 scenarios + Scenario Outline)
Post validation and filtering:
- **Get all posts** -- Verify 100 posts returned
- **Filter posts by user ID** -- Scenario Outline with 3 user IDs (parameterized)
- **Get post with comments** -- Verify nested resource returns 5 comments

### features/api-errors.feature (4 scenarios)
Error handling behavior:
- **Non-existent user** -- Verify 200 response with empty object (JSONPlaceholder behavior)
- **Non-existent post** -- Verify 200 response with empty object
- **Invalid endpoint** -- Verify 404 for unknown routes
- **POST with empty body** -- Verify graceful handling (201 with ID)

### features/api-advanced.feature (4 scenarios)
Advanced Qase integration patterns:
- **Fetch user and their posts** -- Multi-step relationship test with @QaseParameters
- **Suite hierarchy and group parameters** -- @QaseGroupParameters demonstration
- **Parameters tag with Scenario Outline** -- @QaseParameters overriding Examples params
- **Ignored test** -- @QaseIgnore excluding from Qase reporting

## Qase Features Demonstrated

| Feature | How It's Used | Example |
|---------|---------------|---------|
| Test Case ID | `@QaseID=N` tag on scenarios | `@QaseID=1` |
| Title Override | `@QaseTitle=Name` tag (underscores for spaces) | `@QaseTitle=Get_all_users_returns_10_users` |
| Custom Fields | `@QaseFields=JSON` tag (compact, no spaces) | `@QaseFields={"severity":"critical","layer":"api"}` |
| Suite Hierarchy | `@QaseSuite=Path` tag (tab-separated levels) | `@QaseSuite=API\tUsers\tRead` |
| Parameters | `@QaseParameters=JSON` tag | `@QaseParameters={"testScope":"user_posts_relationship"}` |
| Group Parameters | `@QaseGroupParameters=JSON` tag | `@QaseGroupParameters={"environment":"production"}` |
| Ignore | `@QaseIgnore` tag | Excludes scenario from Qase reporting |
| Steps | Native Gherkin Given/When/Then | Auto-mapped to Qase steps |
| Attachments | `this.attach(content, mimeType)` in steps | JSON response data attached to results |
| Parameterization | Scenario Outline with Examples table | Parameters auto-extracted from Examples |

## Running Tests

Run tests locally (no Qase reporting):
```bash
QASE_MODE=off npm test
```

Run tests with Qase reporting:
```bash
npm test
```

## CucumberJS-Specific Patterns

- **Tag-based metadata** -- All Qase configuration uses Gherkin tags, not programmatic imports
- **No `qase` import needed** -- Unlike other frameworks, there is no `qase` object to import
- **Native step mapping** -- Given/When/Then steps are automatically reported as Qase test steps
- **`this.attach()` for attachments** -- Use Cucumber's native attachment API, not `qase.attach()`
- **`function()` not `=>` in steps** -- Arrow functions break Cucumber's World context
- **No spaces in tags** -- Use underscores for titles, compact JSON without spaces for fields
- **Profile-based config** -- `cucumber.js` file configures formatter and step definition paths

## API Notes

Tests use [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as the test API:
- Free, public REST API -- no authentication required
- Returns realistic data (users, posts, comments, todos)
- Write operations (POST, PUT, DELETE) are faked -- they return success responses but don't persist data
- Non-existent resources (e.g., `/users/999`) return status 200 with an empty object `{}`
- Only truly invalid endpoints (e.g., `/invalid-endpoint`) return 404
- Stable and widely used for testing and prototyping

## Additional Resources

- [Qase CucumberJS Reporter](https://github.com/qase-tms/qase-javascript/tree/main/qase-cucumberjs)
- [CucumberJS Documentation](https://cucumber.io/docs/installation/javascript/)
- [JSONPlaceholder API Guide](https://jsonplaceholder.typicode.com/guide/)
