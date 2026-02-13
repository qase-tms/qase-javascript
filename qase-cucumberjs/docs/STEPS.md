# Test Steps in CucumberJS

This guide covers how test steps are reported in Qase when using CucumberJS.

---

## Overview

In CucumberJS, test steps are defined using **Gherkin syntax** (Given/When/Then), not the `qase.step()` API. Each Gherkin step in your feature files is automatically reported as a Qase test step.

**Key difference from other frameworks:** CucumberJS does not use programmatic `qase.step()` calls. Test steps come directly from your Gherkin scenarios and are automatically captured by the Qase reporter.

Each reported step includes:
- Step name (from Gherkin step text)
- Step status (passed/failed/skipped)
- Step duration
- Attachments (if any added via `this.attach()`)
- Error details (on failure)

---

## Gherkin Steps

### Basic Step Structure

Gherkin steps use Given/When/Then/And/But keywords to define test behavior:

```gherkin
Feature: User Authentication

  Scenario: User can log in
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should see the dashboard
    And I should see my username
```

Each line (Given, When, And, Then) is automatically reported as a separate step in Qase.

### Step Definitions

Step definitions map Gherkin steps to executable code:

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

Given('I am on the login page', async function() {
  await this.driver.get('https://example.com/login');
});

When('I enter valid credentials', async function() {
  await this.driver.findElement({ id: 'email' }).sendKeys('user@example.com');
  await this.driver.findElement({ id: 'password' }).sendKeys('password123');
});

When('I click the login button', async function() {
  await this.driver.findElement({ id: 'login-button' }).click();
});

Then('I should see the dashboard', async function() {
  const url = await this.driver.getCurrentUrl();
  assert.strictEqual(url, 'https://example.com/dashboard');
});

Then('I should see my username', async function() {
  const username = await this.driver.findElement({ id: 'username' }).getText();
  assert.strictEqual(username, 'user@example.com');
});
```

---

## Step Parameters

Gherkin supports parameterized steps with data passed from the feature file:

```gherkin
Feature: User Login

  Scenario: Login with specific user
    Given I am on the login page
    When I login as "john@example.com" with password "secret123"
    Then I should see "Welcome, John"
```

```javascript
const { When, Then } = require('@cucumber/cucumber');

When('I login as {string} with password {string}', async function(email, password) {
  await this.driver.findElement({ id: 'email' }).sendKeys(email);
  await this.driver.findElement({ id: 'password' }).sendKeys(password);
  await this.driver.findElement({ id: 'login-button' }).click();
});

Then('I should see {string}', async function(expectedText) {
  const text = await this.driver.findElement({ id: 'message' }).getText();
  assert.strictEqual(text, expectedText);
});
```

In Qase, the step will show: `When I login as "john@example.com" with password "secret123"`

---

## Scenario Outline with Examples

Scenario Outlines allow running the same scenario multiple times with different data:

```gherkin
Feature: User Login

  Scenario Outline: Login with different users
    Given I am on the login page
    When I login as "<email>" with password "<password>"
    Then I should see "<message>"

  Examples:
    | email              | password  | message        |
    | john@example.com   | pass123   | Welcome, John  |
    | jane@example.com   | secret456 | Welcome, Jane  |
    | admin@example.com  | admin789  | Welcome, Admin |
```

Each row in the Examples table creates a separate test run in Qase, with steps showing the actual parameter values.

---

## Background Steps

Background steps run before each scenario in a feature:

```gherkin
Feature: Shopping Cart

  Background:
    Given I am logged in as "customer@example.com"
    And I have cleared my shopping cart

  Scenario: Add item to cart
    When I add "Laptop" to cart
    Then my cart should contain 1 item

  Scenario: Remove item from cart
    Given I have added "Laptop" to cart
    When I remove "Laptop" from cart
    Then my cart should be empty
```

Background steps are reported for each scenario automatically.

---

## Nested Steps

Gherkin does not support nested steps directly. Each Given/When/Then/And step is reported as a flat step in Qase results.

If you need hierarchical organization, use multiple scenarios or scenario outlines within a feature:

```gherkin
Feature: User Registration

  Scenario: Complete registration process
    Given I am on the registration page
    When I fill in personal details
    And I fill in address details
    And I accept terms and conditions
    And I submit the registration form
    Then I should see a success message
```

Each step is reported as a top-level step (not nested).

---

## Steps with Data Tables

Gherkin supports data tables for passing structured data to steps:

```gherkin
Feature: User Management

  Scenario: Create user with details
    Given I am on the user creation page
    When I create a user with the following details:
      | Field      | Value              |
      | First Name | John               |
      | Last Name  | Doe                |
      | Email      | john@example.com   |
      | Role       | Administrator      |
    Then the user should be created successfully
```

```javascript
const { When } = require('@cucumber/cucumber');

When('I create a user with the following details:', async function(dataTable) {
  const userData = dataTable.rowsHash();

  await this.driver.findElement({ id: 'firstName' }).sendKeys(userData['First Name']);
  await this.driver.findElement({ id: 'lastName' }).sendKeys(userData['Last Name']);
  await this.driver.findElement({ id: 'email' }).sendKeys(userData['Email']);
  await this.driver.findElement({ id: 'role' }).sendKeys(userData['Role']);
  await this.driver.findElement({ id: 'submit' }).click();
});
```

The data table is included in the step report.

---

## Steps with Doc Strings

Doc strings allow passing multi-line text to steps:

```gherkin
Feature: API Testing

  Scenario: Post JSON data
    Given I have API credentials
    When I send a POST request with body:
      """
      {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin"
      }
      """
    Then the response should be successful
```

```javascript
const { When } = require('@cucumber/cucumber');

When('I send a POST request with body:', async function(docString) {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: docString,
  });

  this.response = response;
});
```

---

## Step Status

Steps automatically inherit status from execution:

| Execution | Step Status |
|-----------|-------------|
| Step definition completes successfully | Passed |
| Assertion fails or error thrown | Failed |
| Step definition not found | Undefined (reported as Blocked) |
| Step skipped due to previous failure | Skipped |
| Ambiguous step definition match | Ambiguous (reported as Failed) |

---

## Common Patterns

### Page Navigation Steps

```gherkin
Feature: Website Navigation

  Scenario: Navigate through pages
    Given I am on the home page
    When I click on "Products" in the menu
    And I click on "Laptops" category
    Then I should be on the laptops page
    And I should see at least 5 products
```

### Form Interaction Steps

```gherkin
Feature: Contact Form

  Scenario: Submit contact form
    Given I am on the contact page
    When I fill in the following:
      | Name    | John Doe           |
      | Email   | john@example.com   |
      | Subject | Product Inquiry    |
      | Message | I need information |
    And I submit the form
    Then I should see "Thank you for contacting us"
```

### API Testing Steps

```gherkin
Feature: REST API

  Scenario: Get user details
    Given I have a valid API token
    When I send a GET request to "/api/users/123"
    Then the response status should be 200
    And the response should contain:
      | Field    | Value             |
      | id       | 123               |
      | email    | user@example.com  |
```

---

## Troubleshooting

### Steps Not Appearing

1. Verify reporter is configured as Cucumber formatter:
   ```bash
   npx cucumber-js -f cucumberjs-qase-reporter
   ```
2. Check that feature files are properly formatted with valid Gherkin syntax
3. Ensure step definitions are loaded:
   ```bash
   npx cucumber-js -r step_definitions features/
   ```
4. Enable debug logging to trace step capture:
   ```json
   {
     "debug": true
   }
   ```

### Undefined Steps

If steps show as "Undefined" in Qase:
1. Verify step definitions exist for all Gherkin steps
2. Check step definition patterns match exactly (including quotes and data types)
3. Run with `--dry-run` to see missing step definitions:
   ```bash
   npx cucumber-js --dry-run
   ```

### Ambiguous Steps

If multiple step definitions match the same Gherkin step:
1. Review step definition patterns to ensure uniqueness
2. Run with `--dry-run` to identify ambiguous matches
3. Refactor step definitions to be more specific

### Steps Show Wrong Duration

- Very fast steps may show 0ms duration
- Async steps without proper `await` may report incorrect duration
- Ensure all async operations use `async/await` correctly

---

## See Also

- [Usage Guide](usage.md)
- [Attachments Guide](ATTACHMENTS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
