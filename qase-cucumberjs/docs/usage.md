# Qase Integration in CucumberJS

This guide provides comprehensive instructions for integrating Qase with CucumberJS using Gherkin tags and step definitions.

> **Configuration:** For complete configuration reference including all available options, environment variables, and examples, see the [qase-javascript-commons README](../../qase-javascript-commons/README.md).

---

## Table of Contents

- [Adding QaseID](#adding-qaseid)
- [Adding Title](#adding-title)
- [Adding Fields](#adding-fields)
- [Adding Suite](#adding-suite)
- [Tags](#tags)
- [Ignoring Tests](#ignoring-tests)
- [Muting Tests](#muting-tests)
- [Working with Attachments](#working-with-attachments)
- [Working with Steps](#working-with-steps)
- [Working with Parameters](#working-with-parameters)
- [Multi-Project Support](#multi-project-support)
- [Running Tests](#running-tests)
- [Integration Patterns](#integration-patterns)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)
- [Complete Examples](#complete-examples)

- [See Also](#see-also)
---

## Adding QaseID

Link your Gherkin scenarios to existing test cases in Qase using the `@QaseID` tag.

### Single ID

```gherkin
Feature: User Authentication

  @QaseID=1
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

### Multiple IDs

```gherkin
Feature: User Authentication

  @QaseID=1,2,3
  Scenario: Login covering multiple test cases
    Given I am on the login page
    When I enter valid credentials
    Then I should see the dashboard
```

### Multi-Project Support

To send test results to multiple Qase projects simultaneously, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Adding Title

Set a custom title for the test case using the `@QaseTitle` tag (overrides scenario name):

> **Note:** Gherkin tags cannot contain whitespace (cucumber-js fails with `A tag may not contain whitespace`), so tag values such as titles, suite names and field values must not contain spaces.

```gherkin
Feature: User Authentication

  @QaseID=1
  @QaseTitle=User_can_complete_login_flow
  Scenario: Login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding Fields

Add metadata to your test cases using the `@QaseFields` tag. Both system and custom fields are supported.

### System Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| `description` | Test case description | Any text |
| `preconditions` | Test preconditions | Any text (supports Markdown) |
| `postconditions` | Test postconditions | Any text |
| `severity` | Test severity | `blocker`, `critical`, `major`, `normal`, `minor`, `trivial` |
| `priority` | Test priority | `high`, `medium`, `low` |
| `layer` | Test layer | `e2e`, `api`, `unit` |

### Example

```gherkin
Feature: User Authentication

  @QaseID=1
  @QaseFields={"severity":"critical","priority":"high","layer":"e2e"}
  Scenario: Critical login test
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding Suite

Organize scenarios into suites using the `@QaseSuite` tag:

### Simple Suite

```gherkin
Feature: User Authentication

  @QaseID=1
  @QaseSuite=Authentication
  Scenario: Login test
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

### Nested Suites

Separate suite levels with `\t` (a backslash followed by `t`, as in the example below; a real tab character works too):

```gherkin
Feature: User Authentication

  @QaseID=1
  @QaseSuite=Application\tAuthentication\tLogin\tEdgeCases
  Scenario: Login with special characters
    Given I am on the login page
    When I enter credentials with special characters
    Then I should be logged in
```

> **Note:** Feature and Scenario Outline structure can also serve as natural suite hierarchy in Qase.

---

## Tags

Assign tags to scenarios. Tags help categorize and filter tests in Qase.

```gherkin
@QaseID=1
@QaseTags=smoke,regression
Scenario: Login test
  Given I am on the login page
  When I enter valid credentials
  Then I should be logged in
```

Multiple `@QaseTags` annotations accumulate:

```gherkin
@QaseTags=smoke
@QaseTags=regression
Scenario: Login test
  Given I am on the login page
  When I enter valid credentials
  Then I should be logged in
```

---

## Ignoring Tests

Exclude a scenario from Qase reporting using the `@QaseIgnore` tag. The scenario still executes, but results are not sent to Qase:

```gherkin
Feature: User Authentication

  @QaseIgnore
  Scenario: Test not reported to Qase
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Muting Tests

Mark a scenario as muted using the `@QaseMuted` tag. The scenario is still reported, and its result is sent to Qase as muted, the same as setting the `muted` field to `'true'`. The test case itself is not muted:

```gherkin
Feature: User Authentication

  @QaseMuted
  Scenario: Known failing test
    Given I am on the login page
    When I enter invalid credentials
    Then I should see an error
```

---

## Working with Attachments

Attach files, screenshots, logs, and other content to your test results using the `this.attach()` method in step definitions.

### Attach Screenshot in Step

```javascript
// step_definitions/login_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the login page', async function() {
  await this.page.goto('https://example.com/login');

  // Attach screenshot
  const screenshot = await this.page.screenshot();
  await this.attach(screenshot, 'image/png');
});
```

### Attach Text Content

```javascript
When('I enter valid credentials', async function() {
  await this.page.fill('#username', 'testuser');
  await this.page.fill('#password', 'password');

  // Attach text log
  await this.attach('Credentials entered successfully', 'text/plain');

  await this.page.click('#login-button');
});
```

### Attach JSON Data

```javascript
Then('I should be logged in', async function() {
  await this.page.waitForSelector('.dashboard');

  // Attach JSON data
  const userData = { username: 'testuser', status: 'logged_in' };
  await this.attach(JSON.stringify(userData, null, 2), 'application/json');
});
```

### Attach in Hooks

```javascript
// support/hooks.js
const { Before, After } = require('@cucumber/cucumber');

After(async function(scenario) {
  if (scenario.result.status === 'failed') {
    const screenshot = await this.page.screenshot();
    await this.attach(screenshot, 'image/png');
  }
});
```

### Supported MIME Types

Common MIME types are auto-detected. You can also specify explicitly:

| Extension | MIME Type |
|-----------|-----------|
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.txt` | `text/plain` |
| `.json` | `application/json` |
| `.xml` | `application/xml` |
| `.html` | `text/html` |
| `.pdf` | `application/pdf` |

> For more details, see [Attachments Guide](ATTACHMENTS.md).

---

## Working with Steps

CucumberJS automatically creates steps from your Gherkin scenarios. Each `Given`, `When`, `Then`, and `And` statement becomes a step in Qase.

### Native Gherkin Step Mapping

```gherkin
Feature: User Authentication

  @QaseID=1
  Scenario: Login with detailed steps
    Given I am on the login page
    When I enter username "testuser"
    And I enter password "password123"
    And I click the login button
    Then I should see the dashboard
    And I should see welcome message
```

Each line above becomes a separate step in Qase with its own result.

### Step Definitions

```javascript
// step_definitions/login_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the login page', async function() {
  await this.page.goto('https://example.com/login');
});

When('I enter username {string}', async function(username) {
  await this.page.fill('#username', username);
});

When('I enter password {string}', async function(password) {
  await this.page.fill('#password', password);
});

When('I click the login button', async function() {
  await this.page.click('#login-button');
});

Then('I should see the dashboard', async function() {
  await this.page.waitForSelector('.dashboard');
});

Then('I should see welcome message', async function() {
  const message = await this.page.locator('.welcome').textContent();
  expect(message).toContain('Welcome');
});
```

> For more details, see [Steps Guide](STEPS.md).

---

## Working with Parameters

Report parameterized test data to Qase using tags or Scenario Outline.

### Using @QaseParameters Tag

```gherkin
Feature: Browser Compatibility

  @QaseID=1
  @QaseParameters={"browser":"Chrome","version":"110"}
  Scenario: Test on Chrome
    Given I open the application in Chrome
    When I perform test actions
    Then I should see expected results
```

### Using Scenario Outline (Native Parameterization)

```gherkin
Feature: Login with Different Credentials

  @QaseID=1
  Scenario Outline: Login with <username>
    Given I am on the login page
    When I enter username "<username>"
    And I enter password "<password>"
    Then I should see <result>

    Examples:
      | username | password  | result           |
      | user1    | pass1     | dashboard        |
      | user2    | pass2     | dashboard        |
      | invalid  | invalid   | error message    |
```

### Group Parameters

```gherkin
Feature: Environment Testing

  @QaseID=1
  @QaseParameters={"browser":"Chrome","os":"Windows"}
  @QaseGroupParameters={"environment":"staging","region":"us-east"}
  Scenario: Test in specific environment
    Given I am testing in staging environment
    When I run the test
    Then results should be recorded
```

---

## Multi-Project Support

Send test results to multiple Qase projects simultaneously using special tag syntax.

For detailed configuration, examples, and troubleshooting, see the [Multi-Project Support Guide](MULTI_PROJECT.md).

---

## Running Tests

### Basic Execution

```sh
QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter
```

### With Specific Features

```sh
npx cucumber-js -f cucumberjs-qase-reporter features/login.feature
```

### With Tag Filtering

```sh
npx cucumber-js -f cucumberjs-qase-reporter --tags "@smoke"
```

### With Tag Expression

```sh
npx cucumber-js -f cucumberjs-qase-reporter --tags "@QaseID=1 and not @skip"
```

> **Note:** Cucumber tag expressions match whole tag names, so `--tags "@QaseID"` does not select scenarios tagged `@QaseID=1`. Use the full tag, e.g. `--tags "@QaseID=1 or @QaseID=2"`.

### Using Profile

```javascript
// cucumber.js
module.exports = {
  default: {
    format: ['progress', 'cucumberjs-qase-reporter'],
    require: ['step_definitions/**/*.js'],
    publishQuiet: true,
  },
};
```

```sh
npx cucumber-js --profile default
```

---

## Complete Examples

### Full Feature Example

```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So I can access my account

  Background:
    Given the application is running
    And the database is seeded

  @QaseID=1
  @QaseTitle=User_can_log_in_with_valid_credentials
  @QaseFields={"severity":"blocker","priority":"high","layer":"e2e"}
  @QaseSuite=Authentication\tLogin\tHappyPath
  Scenario: Successful login
    Given I am on the login page
    When I enter username "testuser@example.com"
    And I enter password "SecurePass123!"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see "Welcome back, Test User"
    And I should see the logout button

  @QaseID=2
  @QaseFields={"severity":"critical","priority":"high","layer":"e2e"}
  @QaseSuite=Authentication\tLogin\tEdgeCases
  Scenario: Login with invalid credentials
    Given I am on the login page
    When I enter username "invalid@example.com"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see an error message
    And I should remain on the login page
```

### Example Project Structure

```
my-project/
├── qase.config.json
├── cucumber.js
├── features/
│   ├── authentication.feature
│   ├── checkout.feature
│   └── ...
├── step_definitions/
│   ├── login_steps.js
│   ├── checkout_steps.js
│   └── ...
├── support/
│   ├── hooks.js
│   └── world.js
└── package.json
```

---

## Troubleshooting

### Tests Not Appearing in Qase

1. Verify `mode` is set to `testops` (not `off` or `report`)
2. Check API token has write permissions
3. Verify project code is correct
4. Check for errors in console output (enable `debug: true`)
5. Ensure formatter is specified: `-f cucumberjs-qase-reporter`

### Tag Parsing Errors

**Problem:** `@QaseID` or `@QaseFields` tags not recognized

**Solution:**
1. Verify tag syntax: `@QaseID=1` (no spaces around `=`)
2. For fields, use valid JSON: `@QaseFields={"severity":"critical"}`
3. Check for typos in tag names. Only the first letter of each word may vary in case (`@QaseID`, `@qaseid`, `@QaseId` all work); fully upper-case names such as `@QASEID` are not recognized
4. Make sure tag values contain no spaces — Gherkin cannot parse whitespace inside a tag
5. Ensure tags are at scenario level, not step level

### Step Definition Not Found

**Problem:** `Undefined. Implement with the following snippet:`

**Solution:**
1. Verify step definitions are in correct directory
2. Check `require` path in cucumber.js configuration
3. Ensure step patterns match exactly (including quotes and parameters)
4. For TypeScript, verify ts-node is configured

### World Object Issues

**Problem:** `this.page is undefined` or similar errors

**Solution:**
1. Ensure World object is properly configured in `support/world.js`
2. Use function expressions (not arrow functions) in step definitions
3. Verify browser/page initialization happens in Before hook

```javascript
// support/world.js
const { setWorldConstructor } = require('@cucumber/cucumber');

class CustomWorld {
  constructor() {
    this.page = null;
    this.browser = null;
  }
}

setWorldConstructor(CustomWorld);
```

### Parallel Feature Execution

**Problem:** Tests fail or report incorrectly when running in parallel

**Solution:**
1. CucumberJS parallel execution requires careful World isolation
2. Ensure each scenario has independent setup/teardown
3. Avoid shared state between scenarios
4. Consider using `--parallel` flag limitations

```sh
npx cucumber-js -f cucumberjs-qase-reporter --parallel 2
```

### Attachments Not Uploading

**Problem:** Screenshots or logs not appearing in Qase

**Solution:**
1. Verify `this.attach()` is called with correct MIME type
2. Check file/buffer content is valid
3. Enable debug logging to see attachment processing
4. Ensure attachments are called within step/hook context

---

## Integration Patterns

### Organizing Step Definitions

**By domain:**
```
step_definitions/
├── authentication_steps.js
├── user_management_steps.js
├── checkout_steps.js
└── common_steps.js
```

**Each file focuses on one domain:**
```javascript
// step_definitions/authentication_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the login page', async function() {
  await this.page.goto('/login');
});

When('I log in as {string}', async function(role) {
  const credentials = this.testData.users[role];
  await this.page.fill('#username', credentials.username);
  await this.page.fill('#password', credentials.password);
  await this.page.click('#login-button');
});
```

### Using World Objects for State

```javascript
// support/world.js
const { setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class CustomWorld {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testData = {};
  }

  async init() {
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);

Before(async function() {
  await this.init();
});

After(async function() {
  await this.cleanup();
});
```

### Before/After Hooks with Qase

```javascript
// support/hooks.js
const { Before, After, Status } = require('@cucumber/cucumber');

Before({ tags: '@require-auth' }, async function() {
  // Login before scenarios tagged with @require-auth
  await this.page.goto('/login');
  await this.page.fill('#username', 'testuser');
  await this.page.fill('#password', 'password');
  await this.page.click('#login-button');
});

After(async function(scenario) {
  // Attach screenshot on failure
  if (scenario.result.status === Status.FAILED) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');

    // Attach page HTML
    const html = await this.page.content();
    await this.attach(html, 'text/html');

    // Attach console logs
    const logs = this.consoleMessages || [];
    await this.attach(JSON.stringify(logs, null, 2), 'application/json');
  }
});
```

### Scenario Outline Patterns

```gherkin
Feature: Data-Driven Testing

  @QaseID=1
  Scenario Outline: Validate <item> in cart
    Given I have <quantity> "<item>" in my cart
    When I proceed to checkout
    Then the total should be <expected_total>

    @smoke
    Examples: Common items
      | item    | quantity | expected_total |
      | Apple   | 2        | $4.00          |
      | Banana  | 3        | $3.00          |

    @regression
    Examples: Edge cases
      | item           | quantity | expected_total |
      | Luxury Item    | 1        | $1000.00       |
      | Bulk Item      | 100      | $500.00        |
```

### Tag Expressions for Filtering

```sh
# Run only smoke tests
npx cucumber-js --tags "@smoke"

# Run smoke tests that are not skipped
npx cucumber-js --tags "@smoke and not @skip"

# Run the scenario linked to case 1 or marked as critical
npx cucumber-js --tags "@QaseID=1 or @critical"

# Complex expression
npx cucumber-js --tags "(@smoke or @regression) and not (@wip or @skip)"
```

---

## Common Use Cases

### Use Case 1: Tag Scenarios for Specific Qase Projects

```gherkin
Feature: Multi-Project Reporting

  @qaseid.PROJ1(1)
  @qaseid.PROJ2(5)
  Scenario: Test reported to multiple projects
    Given I am testing shared functionality
    When I execute the test
    Then results are sent to both projects
```

### Use Case 2: Attach Screenshots in After Hook

```javascript
// support/hooks.js
const { After, Status } = require('@cucumber/cucumber');

After(async function(scenario) {
  // Always attach screenshot at end
  const screenshot = await this.page.screenshot();
  await this.attach(screenshot, 'image/png');

  // Attach failure details if failed
  if (scenario.result.status === Status.FAILED) {
    const html = await this.page.content();
    await this.attach(html, 'text/html');

    const errorLog = `
Scenario: ${scenario.pickle.name}
Status: ${scenario.result.status}
Error: ${scenario.result.message}
    `.trim();

    await this.attach(errorLog, 'text/plain');
  }
});
```

### Use Case 3: Use Scenario Outline for Parameterized Testing

```gherkin
Feature: Login with Different Browsers

  @QaseID=1
  Scenario Outline: Login on <browser>
    Given I am using <browser> browser
    When I navigate to the login page
    And I enter valid credentials
    And I click login button
    Then I should be logged in successfully

    Examples:
      | browser |
      | Chrome  |
      | Firefox |
      | Safari  |
```

### Use Case 4: Filter by @QaseID Tags

```sh
# Run specific QaseIDs (tag expressions match the whole tag, so "@QaseID" alone matches nothing)
npx cucumber-js --tags "@QaseID=1 or @QaseID=2"

# Run a scenario by line number
npx cucumber-js features/login.feature:12

# Run all except ignored tests
npx cucumber-js --tags "not @QaseIgnore"
```

### Use Case 5: Background Steps for Common Setup

```gherkin
Feature: Shopping Cart

  Background:
    Given the application is running
    And I am logged in as "standard_user"
    And my cart is empty

  @QaseID=1
  Scenario: Add item to cart
    When I add "Laptop" to cart
    Then cart should contain 1 item

  @QaseID=2
  Scenario: Remove item from cart
    Given I have "Laptop" in my cart
    When I remove "Laptop" from cart
    Then cart should be empty
```

Background steps run before each scenario and are reported as part of the test flow.

### Use Case 6: Complex Test with Rich Metadata

```gherkin
Feature: E2E Checkout Flow

  @QaseID=1
  @QaseTitle=User_can_complete_checkout_from_cart_to_confirmation
  @QaseFields={"severity":"blocker","priority":"high","layer":"e2e"}
  @QaseSuite=E2E\tCheckout\tHappyPath
  @QaseParameters={"payment_method":"credit_card","shipping":"standard"}
  Scenario: Complete checkout with credit card
    Given I am logged in
    And I have items in my cart
    When I proceed to checkout
    And I enter shipping address
    And I select "standard" shipping
    And I enter credit card details
    And I review my order
    And I confirm the purchase
    Then I should see order confirmation
    And I should receive confirmation email
    And order should exist in database
```

### Use Case 7: API Testing with CucumberJS

```gherkin
Feature: API User Management

  @QaseID=10
  @QaseFields={"layer":"api","severity":"critical"}
  Scenario: Create user via API
    Given the API is available
    When I send POST request to "/users" with:
      | field    | value              |
      | name     | John Doe           |
      | email    | john@example.com   |
      | role     | admin              |
    Then the response status should be 201
    And the response should contain user ID
    And the user should exist in database
```

```javascript
// step_definitions/api_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const axios = require('axios');

When('I send POST request to {string} with:', async function(endpoint, dataTable) {
  const data = {};
  dataTable.hashes().forEach(row => {
    data[row.field] = row.value;
  });

  this.response = await axios.post(`https://api.example.com${endpoint}`, data);

  // Attach request/response
  await this.attach(JSON.stringify({
    request: { endpoint, data },
    response: this.response.data,
  }, null, 2), 'application/json');
});

Then('the response status should be {int}', function(expectedStatus) {
  expect(this.response.status).toBe(expectedStatus);
});
```

---

## See Also

- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Steps Guide](STEPS.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- [Upgrade Guide](UPGRADE.md)
