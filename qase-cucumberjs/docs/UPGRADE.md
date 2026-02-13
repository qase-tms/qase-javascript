# Upgrade Guide: CucumberJS Reporter

This guide covers migration steps between major versions of the Qase CucumberJS Reporter.

---

## Version History

| Version | Release Date | Node.js Support | Key Changes |
|---------|--------------|-----------------|-------------|
| 2.2.0 | January 2026 | >= 14 | Current stable release with improved Gherkin tag parsing |
| 2.1.0 | December 2025 | >= 14 | Enhanced scenario support and metadata handling |
| 2.0.0 | August 2025 | >= 14 | Complete rewrite with new architecture |

---

## Upgrading to 2.x

### Breaking Changes

The cucumberjs-qase-reporter started with the v2.x architecture, leveraging the unified qase-javascript-commons library for consistent reporting across all test frameworks. If you are using v2.x, you are already on the latest architecture.

**No migration from a previous major version is required for cucumberjs-qase-reporter.**

### Current Version Features

Version 2.2.0 includes:

- Full support for Qase TestOps API with batch result upload
- Gherkin tag-based test case linking: `@QaseID=1`
- Field annotations via tags: `@QaseFields={'severity':'high'}`
- Native Gherkin step reporting (Given/When/Then/And)
- Native attachment support via `this.attach()` in step definitions
- Multi-project support for reporting to multiple Qase projects
- Flexible configuration via `qase.config.json` or environment variables

---

## Configuration

### Current Format (v2.x)

Configuration uses the modern qase-javascript-commons format:

**qase.config.json:**

```json
{
  "mode": "testops",
  "debug": false,
  "testops": {
    "api": {
      "token": "api_token_here"
    },
    "project": "DEMO",
    "run": {
      "title": "CucumberJS Automated Run",
      "description": "Test run from CI/CD pipeline",
      "complete": true
    },
    "batch": {
      "size": 100
    }
  }
}
```

**Environment Variables:**

```bash
export QASE_MODE=testops
export QASE_TESTOPS_API_TOKEN=your_api_token
export QASE_TESTOPS_PROJECT=DEMO
```

**Command Line:**

```bash
QASE_MODE=testops npx cucumber-js --format cucumberjs-qase-reporter
```

---

## Usage Pattern

### Test Case Linking via Tags

CucumberJS uses Gherkin tags instead of programmatic API for test annotations:

```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So I can access my account

  @QaseID=1
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should see the dashboard

  @QaseID=2
  @QaseFields={'severity':'high','priority':'critical'}
  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter invalid credentials
    And I click the login button
    Then I should see an error message
```

### Field Annotations

```gherkin
@QaseFields={'severity':'high','priority':'medium','layer':'e2e'}
Scenario: User can update profile
  Given I am logged in
  When I update my profile information
  Then I should see the updated information
```

**Supported field formats:**

- Single quotes: `@QaseFields={'severity':'high'}`
- Double quotes: `@QaseFields={"severity":"high"}`
- Mixed: `@QaseFields={'severity':"high","priority":'medium'}`

---

## Steps Reporting

### Native Gherkin Steps

CucumberJS automatically reports Gherkin steps (Given/When/Then/And) to Qase:

```gherkin
Scenario: User login flow
  Given I am on the login page           # Step 1 in Qase
  When I enter username "user@test.com"  # Step 2 in Qase
  And I enter password "password123"     # Step 3 in Qase
  And I click the login button           # Step 4 in Qase
  Then I should see the dashboard        # Step 5 in Qase
```

**No qase.step() API** - Use native Gherkin steps instead.

---

## Attachments

### Using Native CucumberJS Attachments

CucumberJS uses the native `this.attach()` method in step definitions:

**Step definition:**

```javascript
const { Given, When, Then } = require('@cucumber/cucumber');

When('I capture a screenshot', async function () {
  const screenshot = await browser.takeScreenshot();

  // Attach to Cucumber (and reported to Qase)
  await this.attach(screenshot, 'image/png');
});

Then('I attach test logs', async function () {
  const logContent = getTestLogs();

  await this.attach(logContent, 'text/plain');
});
```

**No qase.attach() API** - Use native `this.attach()` in step definitions instead.

---

## API Differences from Other Reporters

CucumberJS reporter has a unique pattern compared to other Qase reporters:

| Feature | Other Reporters | CucumberJS |
|---------|----------------|------------|
| Test case ID linking | `qase(id, 'name')` wrapper | `@QaseID=1` tag |
| Fields | `qase.fields({...})` | `@QaseFields={...}` tag |
| Steps | `qase.step()` or native framework steps | Native Gherkin steps only |
| Attachments | `qase.attach()` | `this.attach()` in step definitions |
| Titles | `qase.title()` | Scenario name (auto) |
| Suites | `qase.suite()` | Feature name (auto) |

**No programmatic Qase API** - Everything is tag-based or native CucumberJS.

---

## Compatibility Notes

### Node.js Version Support

- **Current (2.2.0):** Node.js >= 14

### CucumberJS Version Support

- **Current (2.2.0):** CucumberJS >= 7.0.0
- Tested with CucumberJS 10.x

### Framework Compatibility

- ES Modules recommended
- CommonJS supported
- TypeScript support with full type definitions
- Works with all CucumberJS formatters
- Compatible with parallel execution

---

## Troubleshooting

### Common Issues

#### Issue: Reporter not running

**Solution:** Ensure you're using the correct formatter flag:

```bash
# Correct
QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter

# Also correct (combined with other formatters)
QASE_MODE=testops npx cucumber-js -f progress -f cucumberjs-qase-reporter
```

#### Issue: Test case IDs not recognized

**Solution:** Check your Gherkin tag syntax:

```gherkin
# Correct
@QaseID=1
Scenario: Test scenario

# Incorrect - missing equals sign
@QaseID 1
Scenario: Test scenario

# Incorrect - spaces around equals
@QaseID = 1
Scenario: Test scenario
```

#### Issue: Fields not parsing correctly

**Solution:** Ensure proper JSON syntax in the tag:

```gherkin
# Correct - single quotes for object
@QaseFields={'severity':'high','priority':'medium'}

# Also correct - double quotes
@QaseFields={"severity":"high","priority":"medium"}

# Incorrect - missing quotes
@QaseFields={severity:high,priority:medium}
```

#### Issue: Attachments not appearing in Qase

**Solution:** Use native CucumberJS `this.attach()` in step definitions:

```javascript
// Correct - in step definition
When('I take a screenshot', async function () {
  const screenshot = await takeScreenshot();
  await this.attach(screenshot, 'image/png');
});

// Incorrect - qase.attach() doesn't exist in CucumberJS
When('I take a screenshot', async function () {
  const screenshot = await takeScreenshot();
  qase.attach({ content: screenshot }); // Error: qase is not defined
});
```

#### Issue: Configuration not recognized

**Solution:** Verify your `qase.config.json` exists and has correct structure:

```json
{
  "mode": "testops",
  "testops": {
    "api": { "token": "your_token" },
    "project": "YOUR_PROJECT_CODE"
  }
}
```

Or use environment variables:

```bash
export QASE_MODE=testops
export QASE_TESTOPS_API_TOKEN=your_token
export QASE_TESTOPS_PROJECT=YOUR_PROJECT_CODE
```

---

## Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/qase-tms/qase-javascript/issues)
2. Review the CHANGELOG
3. Open a new issue with:
   - Current version (2.2.0)
   - CucumberJS version
   - Error messages
   - Configuration file (without sensitive data)
   - Example feature file
   - Steps to reproduce

---

## See Also

- [Usage Guide](usage.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
- [Multi-Project Support](MULTI_PROJECT.md)
- CHANGELOG
- [CucumberJS Documentation](https://cucumber.io/docs/cucumber/)
