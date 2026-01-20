# Qase Integration in Cucumber.js

This guide demonstrates how to integrate Qase with Cucumber.js, providing instructions on how to add Qase IDs, titles,
fields, suites, comments, and file attachments to your test cases.

---

## Adding QaseID to a Test

To associate a QaseID with a test in Cucumber.js, use the `@QaseId` tag in your Gherkin feature files. This tag accepts
a single integer or multiple integers separated by commas representing the test"s ID(s) in Qase.

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in

  @QaseId=2,3,4
  Scenario: Multiple test cases
    Given I am on the login page
    When I enter invalid credentials
    Then I should see an error message
```

---

## Adding a Title to a Test

You can provide a custom title for your test using the `@Title` tag. The tag accepts a string, which will be used as
the test"s title in Qase. If no title is provided, the scenario name will be used by default.

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  @Title=Custom Test Title
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding Fields to a Test

The `@QaseFields` tag allows you to add additional metadata to a test case. You can specify multiple fields to
enhance test case information in Qase.

### System Fields

- `description` — Description of the test case.
- `preconditions` — Preconditions for the test case.
- `postconditions` — Postconditions for the test case.
- `severity` — Severity of the test case (e.g., `critical`, `major`).
- `priority` — Priority of the test case (e.g., `high`, `low`).
- `layer` — Test layer (e.g., `UI`, `API`).

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  @QaseFields={"severity":"high","priority":"medium","description":"Login functionality test"}
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding a Suite to a Test

To assign a suite or sub-suite to a test, use the `@QaseSuite` tag. It can receive a suite name, and optionally a
sub-suite, both as strings.

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  @QaseSuite=Authentication
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in

  @QaseId=2
  @QaseSuite=Authentication\tLogin\tEdge Cases
  Scenario: Login with special characters
    Given I am on the login page
    When I enter credentials with special characters
    Then I should be logged in
```

---

## Ignoring a Test in Qase

To exclude a test from being reported to Qase (while still executing the test in Cucumber.js), use the `@QaseIgnore`
tag. The test will run, but its result will not be sent to Qase.

### Example

```gherkin
Feature: User Authentication

  @QaseIgnore
  Scenario: This test will not be reported to Qase
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding Parameters to a Test

You can add parameters to a test case using the `@QaseParameters` tag. This tag accepts a JSON object with
parameter names and values.

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  @QaseParameters={"browser":"chrome","environment":"staging"}
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding Group Parameters to a Test

To add group parameters to a test case, use the `@QaseGroupParameters` tag. This tag accepts a JSON object with
group parameter names and values.

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  @QaseParameters={"browser":"chrome","environment":"staging"}
  @QaseGroupParameters={"test_group":"authentication","test_type":"smoke"}
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

---

## Adding Steps to a Test

Cucumber.js automatically creates steps from your Gherkin scenarios. Each `Given`, `When`, and `Then` statement
becomes a step in Qase. You can also add custom step information in your step definitions.

### Example

```gherkin
Feature: User Authentication

  @QaseId=1
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in
```

```javascript
// step_definitions/login_steps.js
const { Given, When, Then } = require("@cucumber/cucumber");

Given("I am on the login page", async function() {
  // Step implementation
  await this.page.goto("https://example.com/login");
});

When("I enter valid credentials", async function() {
  // Step implementation
  await this.page.fill("#username", "testuser");
  await this.page.fill("#password", "password");
  await this.page.click("#login-button");
});

Then("I should be logged in", async function() {
  // Step implementation
  await this.page.waitForSelector(".dashboard");
});
```

---

## Attaching Files to a Test

You can attach files to test results using the `this.attach()` method in your step definitions. This method supports
attaching files with content, paths, or media types.

### Example

```javascript
// step_definitions/login_steps.js
const { Given, When, Then } = require("@cucumber/cucumber");

Given("I am on the login page", async function() {
  await this.page.goto("https://example.com/login");
  
  // Attach screenshot
  const screenshot = await this.page.screenshot();
  await this.attach(screenshot, "image/png");
});

When("I enter valid credentials", async function() {
  await this.page.fill("#username", "testuser");
  await this.page.fill("#password", "password");
  
  // Attach text content
  await this.attach("Credentials entered successfully", "text/plain");
  
  await this.page.click("#login-button");
});

Then("I should be logged in", async function() {
  await this.page.waitForSelector(".dashboard");
  
  // Attach JSON data
  const userData = { username: "testuser", status: "logged_in" };
  await this.attach(JSON.stringify(userData, null, 2), "application/json");
});
```

---
