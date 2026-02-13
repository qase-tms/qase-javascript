# Placeholder Naming Convention Reference

This document provides a comprehensive reference for all placeholder patterns used in JavaScript reporter documentation templates.

---

## Overview

Placeholders use the `{{PLACEHOLDER_NAME}}` syntax and are replaced with framework-specific values when generating documentation for each JavaScript testing framework (Jest, Playwright, Cypress, Mocha, Vitest, CucumberJS, Newman, TestCafe, WDIO).

**Purpose:** Enable consistent, maintainable documentation across all JavaScript reporters without manual duplication.

**Syntax:** All placeholders use uppercase with underscores: `{{EXAMPLE_PLACEHOLDER}}`

---

## Common Placeholders

These placeholders apply to all JavaScript frameworks:

| Placeholder | Description | Example Values |
|-------------|-------------|----------------|
| `{{FRAMEWORK_NAME}}` | Framework display name | `Jest`, `Playwright`, `Cypress`, `Mocha`, `Vitest`, `Cucumber.js`, `Newman`, `TestCafe`, `WebdriverIO` |
| `{{PACKAGE_NAME}}` | npm package name | `jest-qase-reporter`, `playwright-qase-reporter`, `cypress-qase-reporter` |
| `{{FRAMEWORK_VERSION}}` | Minimum framework version | `28.0.0` (Jest), `1.16.3` (Playwright), `10.0.0` (Cypress) |
| `{{NODE_VERSION}}` | Node.js version requirement | Usually `14` (can be higher for specific frameworks) |
| `{{FRAMEWORK_SLUG}}` | URL-safe framework identifier | `jest`, `playwright`, `cypress`, `mocha`, `vitest`, `cucumberjs`, `newman`, `testcafe`, `wdio` |

---

## JavaScript-Specific Placeholders

These placeholders handle JavaScript/TypeScript syntax variations:

### Import and Integration

| Placeholder | Description | Example Values |
|-------------|-------------|----------------|
| `{{IMPORT_STATEMENT}}` | Import syntax (CommonJS or ES modules) | `const { qase } = require('jest-qase-reporter/jest')` or `import { qase } from 'playwright-qase-reporter/playwright'` |
| `{{FRAMEWORK_INTEGRATION_PATH}}` | Sub-path for qase object import | `jest-qase-reporter/jest`, `playwright-qase-reporter/playwright` |
| `{{RUN_COMMAND}}` | Basic command to run tests | `npx jest`, `npx playwright test`, `npx cypress run` |
| `{{CONFIG_LOCATION}}` | Where config goes | `jest.config.js`, `playwright.config.ts`, `cypress.config.js` |

### Code Example Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{QUICK_START_TEST_EXAMPLE}}` | Minimal test example with QaseID |
| `{{LINK_TESTS_EXAMPLE}}` | Example of linking tests with IDs |
| `{{METADATA_EXAMPLE}}` | Example of adding fields/title/suite |
| `{{IGNORE_EXAMPLE}}` | Example of ignoring a test |
| `{{STATUS_TABLE}}` | Framework-to-Qase status mapping table |
| `{{RUNNING_TESTS_EXAMPLES}}` | Framework-specific run commands with options |

### Usage Guide Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{QASEID_SINGLE_EXAMPLE}}` | Single QaseID example |
| `{{QASEID_MULTIPLE_EXAMPLE}}` | Multiple QaseID example |
| `{{TITLE_EXAMPLE}}` | Custom title example |
| `{{FIELDS_EXAMPLE}}` | Fields (severity, priority, layer) example |
| `{{SUITE_SIMPLE_EXAMPLE}}` | Simple suite example |
| `{{SUITE_NESTED_EXAMPLE}}` | Nested suite example |
| `{{MUTE_EXAMPLE}}` | Muted test example |

### Attachments Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{ATTACH_FILE_PATH_EXAMPLE}}` | Attach file from filesystem |
| `{{ATTACH_MULTIPLE_FILES_EXAMPLE}}` | Attach multiple files |
| `{{ATTACH_TEXT_CONTENT_EXAMPLE}}` | Attach text content from code |
| `{{ATTACH_BINARY_CONTENT_EXAMPLE}}` | Attach binary content (screenshot) |
| `{{ATTACH_JSON_CONTENT_EXAMPLE}}` | Attach JSON data |
| `{{ATTACH_TO_STEP_EXAMPLE}}` | Attach to specific step |
| `{{USE_CASE_SELENIUM_EXAMPLE}}` | Selenium screenshot example |
| `{{USE_CASE_PLAYWRIGHT_EXAMPLE}}` | Playwright screenshot example |
| `{{USE_CASE_API_LOGS_EXAMPLE}}` | API response logging example |
| `{{USE_CASE_CONSOLE_LOGS_EXAMPLE}}` | Browser console logs example |

### Steps Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{STEP_ASYNC_EXAMPLE}}` | Basic async step example |
| `{{STEP_PARAMS_EXAMPLE}}` | Step with dynamic parameters |
| `{{NESTED_STEPS_EXAMPLE}}` | Nested steps example |
| `{{STEP_EXPECTED_EXAMPLE}}` | Step with expected result |
| `{{STEP_EXPECTED_DATA_EXAMPLE}}` | Step with expected result and data |
| `{{STEP_ATTACHMENTS_EXAMPLE}}` | Step with attachments |
| `{{PATTERN_PAGE_OBJECT_EXAMPLE}}` | Page Object pattern with steps |
| `{{PATTERN_API_EXAMPLE}}` | API testing with steps |
| `{{PATTERN_SETUP_TEARDOWN_EXAMPLE}}` | Setup/teardown with steps |

### Parameters Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{PARAMS_BASIC_EXAMPLE}}` | Basic parameterized test |
| `{{PARAMS_GROUP_EXAMPLE}}` | Group parameters example |

### Multi-Project Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{MULTI_PROJECT_USAGE_EXAMPLE}}` | Basic qase.projects() usage |
| `{{COMPLETE_MULTI_PROJECT_EXAMPLE}}` | Complete multi-project test example |

### Running Tests Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{RUN_BASIC_EXAMPLE}}` | Basic test execution command |
| `{{RUN_ENV_EXAMPLE}}` | Run with environment variables |
| `{{RUN_PLAN_EXAMPLE}}` | Run with test plan |
| `{{RUN_EXISTING_EXAMPLE}}` | Run with existing test run ID |

### Complete Examples Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{COMPLETE_EXAMPLE}}` | Full test example with all features |
| `{{TEST_FILE_EXAMPLE}}` | Test file name example |

### Upgrade Guide Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{CURRENT_VERSION}}` | Current version number |
| `{{CURRENT_DATE}}` | Current version release date |
| `{{CURRENT_CHANGES}}` | Summary of current version changes |
| `{{PREVIOUS_VERSION}}` | Previous version number |
| `{{PREVIOUS_DATE}}` | Previous version release date |
| `{{PREVIOUS_CHANGES}}` | Summary of previous version changes |
| `{{BREAKING_CHANGES_LIST}}` | List of breaking changes |
| `{{CONFIG_MIGRATION_STEPS}}` | Configuration migration instructions |
| `{{ANNOTATION_MIGRATION_STEPS}}` | Test annotation migration instructions |
| `{{IMPORT_MIGRATION_STEPS}}` | Import statement migration instructions |
| `{{RENAMED_OPTIONS_TABLE}}` | Table of renamed configuration options |
| `{{REMOVED_OPTIONS_TABLE}}` | Table of removed configuration options |
| `{{NEW_OPTIONS_TABLE}}` | Table of new configuration options |
| `{{RENAMED_METHODS_TABLE}}` | Table of renamed API methods |
| `{{REMOVED_METHODS_TABLE}}` | Table of removed API methods |
| `{{NEW_METHODS_TABLE}}` | Table of new API methods |
| `{{IMPORT_CHANGES}}` | Description of import changes |
| `{{IMPORT_BEFORE_EXAMPLE}}` | Import statement before upgrade |
| `{{IMPORT_AFTER_EXAMPLE}}` | Import statement after upgrade |
| `{{EXAMPLE_1_TITLE}}` | Title for first migration example |
| `{{EXAMPLE_1_BEFORE}}` | Code before upgrade (example 1) |
| `{{EXAMPLE_1_AFTER}}` | Code after upgrade (example 1) |
| `{{EXAMPLE_2_TITLE}}` | Title for second migration example |
| `{{EXAMPLE_2_BEFORE}}` | Code before upgrade (example 2) |
| `{{EXAMPLE_2_AFTER}}` | Code after upgrade (example 2) |
| `{{FRAMEWORK_MIN_VERSION}}` | Minimum framework version for current release |
| `{{FRAMEWORK_PREV_MIN_VERSION}}` | Minimum framework version for previous release |
| `{{COMMON_ISSUE_1}}` | First common migration issue |
| `{{SOLUTION_1}}` | Solution for first issue |
| `{{COMMON_ISSUE_2}}` | Second common migration issue |
| `{{SOLUTION_2}}` | Solution for second issue |

---

## Framework Pattern Variations

Different JavaScript testing frameworks have different integration patterns. Document these variations when replacing placeholders:

### Jest

**Pattern:** Wrapper function
```javascript
const { qase } = require('jest-qase-reporter/jest');

test(qase([1, 2], 'Test name'), () => {
  qase.title('Custom title');
  qase.fields({ severity: 'high' });
  expect(true).toBe(true);
});
```

**Key characteristics:**
- Import from `jest-qase-reporter/jest`
- Use `qase([ids], 'name')` wrapper for test names
- Methods called inside test body: `qase.title()`, `qase.fields()`, `qase.step()`
- Steps are async: `await qase.step('name', async () => {})`

### Playwright

**Pattern:** Multiple patterns (wrapper, method, annotation)
```javascript
import { qase } from 'playwright-qase-reporter/playwright';

// Wrapper pattern
test(qase([1, 2], 'Test name'), async ({ page }) => {
  await qase.step('Step name', async () => {});
});

// Method pattern
test('Test name', async ({ page }) => {
  qase.id(1);
  qase.title('Custom title');
});
```

**Key characteristics:**
- Import from `playwright-qase-reporter/playwright` (ES modules)
- Multiple API patterns supported
- Native Playwright test.step() can be used alongside qase.step()

### Cypress

**Pattern:** Mocha-based with Cypress commands
```javascript
const { qase } = require('cypress-qase-reporter/cypress');

describe('Suite', () => {
  it(qase(1, 'Test name'), () => {
    qase.step('Step name', () => {
      cy.visit('/');
    });
  });
});
```

**Key characteristics:**
- Import from `cypress-qase-reporter/cypress`
- Mocha-style `describe`/`it` structure
- Steps work with Cypress commands
- Can integrate with Cypress custom commands

### Mocha

**Pattern:** Similar to Jest but Mocha syntax
```javascript
const { qase } = require('mocha-qase-reporter/mocha');

describe('Suite', () => {
  it(qase(1, 'Test name'), async () => {
    await qase.step('Step name', async () => {});
  });
});
```

### Vitest

**Pattern:** Similar to Jest (Vitest API compatible)
```javascript
import { qase } from 'vitest-qase-reporter/vitest';

describe('Suite', () => {
  test(qase([1], 'Test name'), async () => {
    await qase.step('Step name', async () => {});
  });
});
```

### Cucumber.js

**Pattern:** Gherkin-based with hooks
```javascript
// In step definitions or hooks
const { qase } = require('cucumberjs-qase-reporter/cucumber');

Before(function() {
  qase.id(1);
  qase.title('Custom title');
});

Given('step definition', async function() {
  await qase.step('Substep', async () => {});
});
```

### Newman (Postman CLI)

**Pattern:** Postman collection with custom scripting
```javascript
// In test scripts within Postman/Newman
// Uses pm.test() with custom markers
pm.test(qase(1, 'API test name'), function() {
  pm.response.to.have.status(200);
});
```

### TestCafe

**Pattern:** TestCafe fixture/test with metadata
```javascript
import { qase } from 'testcafe-qase-reporter/testcafe';

fixture('Fixture name');

test(qase(1, 'Test name'), async t => {
  await qase.step('Step name', async () => {
    await t.click('#button');
  });
});
```

### WebdriverIO (WDIO)

**Pattern:** Mocha/Jasmine style with WDIO commands
```javascript
const { qase } = require('wdio-qase-reporter/wdio');

describe('Suite', () => {
  it(qase(1, 'Test name'), async () => {
    await qase.step('Step name', async () => {
      await browser.url('/');
    });
  });
});
```

---

## Replacement Guidelines

### When to Use Each Placeholder

1. **Framework identifiers** (`{{FRAMEWORK_NAME}}`, `{{PACKAGE_NAME}}`, `{{FRAMEWORK_SLUG}}`):
   - Use consistently throughout all documentation
   - Never hardcode framework names except in framework-specific examples

2. **Import statements** (`{{IMPORT_STATEMENT}}`, `{{FRAMEWORK_INTEGRATION_PATH}}`):
   - Place at the beginning of all code examples
   - Show both CommonJS and ES modules where applicable

3. **Code examples** (`{{*_EXAMPLE}}` placeholders):
   - Replace with actual, tested code from examples directory
   - Ensure examples are minimal but complete (can copy-paste and run)
   - Match the framework's idiomatic patterns

4. **Configuration** (`{{CONFIG_LOCATION}}`):
   - Reference framework-specific config files
   - Show both inline config and external config file options

### How to Handle Optional Sections

Some frameworks may not support certain features:

- **If feature not supported:** Remove the entire section from the generated documentation
- **If feature partially supported:** Adapt the section with framework-specific notes
- **If feature has alternative:** Replace with framework's equivalent approach

### Framework-Specific Conditional Content

Use comments in templates to mark framework-specific variations:

```markdown
<!-- JEST_ONLY: This section only applies to Jest -->
Jest uses wrapper functions for test names.
<!-- END_JEST_ONLY -->

<!-- PLAYWRIGHT_CYPRESS: This applies to Playwright and Cypress -->
Async test functions are required.
<!-- END_PLAYWRIGHT_CYPRESS -->
```

---

## Validation Checklist

When generating documentation for a framework, verify:

- [ ] All `{{PLACEHOLDER}}` syntax has been replaced (no remaining `{{` or `}}`)
- [ ] Code examples use correct import paths for the framework
- [ ] Run commands use correct CLI tool (`npx jest`, `npx playwright test`, etc.)
- [ ] Configuration examples reference correct config files
- [ ] API patterns match framework's actual implementation
- [ ] Links to other documentation files are valid
- [ ] Examples are tested and working
- [ ] No Python-specific syntax remains (decorators, pip, Python versions)
- [ ] Framework version requirements are accurate
- [ ] Node.js version requirements are accurate

---

## Maintenance Notes

When updating templates:

1. Update this reference document if adding new placeholders
2. Document the expected output format for new placeholders
3. Add framework-specific variations if a new pattern emerges
4. Keep example placeholders in sync with actual examples directory
5. Validate all changes against at least one framework implementation

---

## See Also

- [Template Files](.) — All template files using these placeholders
- [Jest Documentation](../../qase-jest/README.md) — Reference implementation
- [Examples Directory](../../examples/) — Source for code examples
