# Framework Syntax Variations

## Overview

This document catalogs API syntax differences across all 9 JavaScript testing frameworks supported by Qase reporters. Use this as a reference when applying templates to specific frameworks or when writing framework-specific documentation.

**Purpose:** Provide quick lookup for framework-specific patterns to ensure accurate template application and documentation consistency.

**Scope:** API patterns and syntax differences, not comprehensive API documentation (see individual package README files for full API reference).

---

## Import Patterns

Each framework has a specific package name and import path:

| Framework | Package | Import Path | Example (CommonJS) | Example (ES Modules) |
|-----------|---------|-------------|-------------------|---------------------|
| Jest | jest-qase-reporter | jest-qase-reporter/jest | `const { qase } = require('jest-qase-reporter/jest')` | `import { qase } from 'jest-qase-reporter/jest'` |
| Playwright | playwright-qase-reporter | playwright-qase-reporter | `const { qase } = require('playwright-qase-reporter')` | `import { qase } from 'playwright-qase-reporter'` |
| Cypress | cypress-qase-reporter | cypress-qase-reporter/mocha | `const { qase } = require('cypress-qase-reporter/mocha')` | `import { qase } from 'cypress-qase-reporter/mocha'` |
| Mocha | mocha-qase-reporter | mocha-qase-reporter/mocha | `const { qase } = require('mocha-qase-reporter/mocha')` | `import { qase } from 'mocha-qase-reporter/mocha'` |
| Vitest | vitest-qase-reporter | vitest-qase-reporter | `const { qase } = require('vitest-qase-reporter')` | `import { qase } from 'vitest-qase-reporter'` |
| CucumberJS | cucumberjs-qase-reporter | N/A (uses tags) | N/A - uses Gherkin tags | N/A - uses Gherkin tags |
| Newman | newman-qase-reporter | N/A (plugin) | N/A - Postman collection | N/A - Postman collection |
| TestCafe | testcafe-qase-reporter | TBD | TBD - Phase 3 | TBD - Phase 3 |
| WDIO | wdio-qase-reporter | TBD | TBD - Phase 3 | TBD - Phase 3 |

**Pattern notes:**
- Jest requires `/jest` subpath to access qase helper
- Playwright uses root package export
- Cypress uses `/mocha` subpath (Mocha integration)
- Mocha uses `/mocha` subpath
- Vitest uses root package export (Jest-compatible API)
- CucumberJS uses Gherkin tags instead of programmatic API
- Newman integrates via plugin/reporter, not direct import in tests

**Source:** Verified from qase-jest/README.md, qase-playwright/README.md, qase-cypress/README.md, qase-mocha/README.md, qase-vitest/README.md, qase-cucumberjs/README.md

---

## Test ID Linking Patterns

Different frameworks use different syntaxes to link tests to Qase test case IDs:

### Jest

**Wrapper function pattern:**
```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('Test suite', () => {
  test(qase(1, 'Single test case ID'), () => {
    expect(true).toBe(true);
  });

  test(qase([1, 2], 'Multiple test case IDs'), () => {
    expect(true).toBe(true);
  });
});
```

**Pattern:** `test(qase(id, 'name'), callback)` or `test(qase([id1, id2], 'name'), callback)`

---

### Playwright

**Multiple options available:**

1. **Wrapper function (like Jest):**
```typescript
import { qase } from 'playwright-qase-reporter';

test(qase(2, 'Test with Qase ID'), () => {
  expect(true).toBe(true);
});
```

2. **Method call inside test:**
```typescript
test('Simple test', () => {
  qase.title('Example of simple test');
  expect(true).toBe(true);
});
```

3. **Annotation/metadata (no ID required):**
```typescript
test('Test with annotated fields', () => {
  qase.fields({ 'severity': 'high', 'priority': 'medium' });
  expect(true).toBe(true);
});
```

**Pattern:** Flexible - supports both wrapper and method-based annotation. Most versatile API.

---

### Cypress

**Mocha wrapper function:**
```javascript
import { qase } from 'cypress-qase-reporter/mocha';

describe('Test suite', () => {
  it(qase(1, 'Test case with ID'), () => {
    cy.visit('https://example.com');
    cy.contains('Example').should('be.visible');
  });

  it(qase([2, 3], 'Multiple IDs'), () => {
    cy.get('.button').click();
  });
});
```

**Pattern:** `it(qase(id, 'name'), callback)` - similar to Jest but uses `it` instead of `test`

---

### Mocha

**Wrapper function (same as Cypress):**
```typescript
import { qase } from 'mocha-qase-reporter/mocha';

describe('My First Test', () => {
  it(qase(1, 'Single ID'), () => {
    expect(true).to.equal(true);
  });

  it(qase([2, 3], 'Multiple IDs'), () => {
    expect(true).to.equal(true);
  });
});
```

**Pattern:** `it(qase(id, 'name'), callback)` - Mocha standard syntax

---

### Vitest

**Jest-compatible wrapper:**
```typescript
import { qase } from 'vitest-qase-reporter';

describe('Test suite', () => {
  test(qase(1, 'Test with ID'), () => {
    expect(true).toBe(true);
  });

  test(qase([1, 2], 'Multiple IDs'), () => {
    expect(true).toBe(true);
  });
});
```

**Pattern:** `test(qase(id, 'name'), callback)` - identical to Jest API

---

### CucumberJS

**Gherkin tag-based:**
```gherkin
Feature: Cucumber documentation
  As a user of cucumber.js
  I want to have documentation on cucumber
  So I can write better applications

  @QaseID=1
  Scenario: Usage documentation
    Given I am on the cucumber.js GitHub repository
    When I go to the README file
    Then I should see a "Cool" section

  @QaseID=2
  @QaseFields={'severity':'high'}
  Scenario: Status badges
    Given I am on the cucumber.js GitHub repository
    When I go to the README file
    Then I should see a "Build Status" badge
```

**Pattern:** Uses Gherkin tags `@QaseID=N` and `@QaseFields={...}` instead of programmatic API

---

### Newman

**Postman collection scripting:**
```javascript
pm.test(qase(1, "Test name"), function () {
  pm.response.to.have.status(200);
});
```

**Pattern:** TBD - Phase 3 (uses pm.test with Postman API)

---

### TestCafe

**Pattern:** TBD - Phase 3 documentation

---

### WDIO (WebdriverIO)

**Pattern:** TBD - Phase 3 documentation

---

## Metadata Methods Comparison

All frameworks support metadata methods, but with varying synchronous/asynchronous behavior:

| Method | Jest | Playwright | Cypress | Mocha | Vitest | CucumberJS | Newman | TestCafe | WDIO |
|--------|------|------------|---------|-------|--------|------------|--------|----------|------|
| `qase.title()` | Sync | Sync | Sync | Sync | Sync | Tag-based | TBD | TBD | TBD |
| `qase.fields()` | Sync | Sync | Sync | Sync | Sync | Tag-based | TBD | TBD | TBD |
| `qase.suite()` | Sync | Sync | Sync | Sync | Sync | Feature-based | TBD | TBD | TBD |
| `qase.ignore()` | Sync | Sync | Sync | Sync | Sync | N/A | TBD | TBD | TBD |
| `qase.comment()` | Sync | Sync | Sync | Sync | Sync | N/A | TBD | TBD | TBD |
| `qase.parameters()` | Sync | Sync | Sync | Sync | Sync | N/A | TBD | TBD | TBD |
| `qase.groupParameters()` | Sync | Sync | Sync | Sync | Sync | N/A | TBD | TBD | TBD |

**Parameter format examples:**

```javascript
// Set title
qase.title('User can log in successfully');

// Set fields with object
qase.fields({
  severity: 'critical',
  priority: 'high',
  layer: 'api'
});

// Set suite hierarchy
qase.suite('Authentication / Login');

// Ignore test (runs but doesn't report to Qase)
qase.ignore();

// Add comment
qase.comment('This test verifies edge case for user login');

// Set parameters
qase.parameters({
  browser: 'Chrome',
  environment: 'staging'
});

// Group parameters
qase.groupParameters({
  'Environment': 'production',
  'Region': 'us-east-1'
});
```

**Source:** Pattern verified from examples/single/jest/test/steps.test.js and qase-jest/README.md

---

## Steps API Variations

Steps allow organizing test execution into logical phases with nested structure:

### Jest / Playwright / Vitest

**Async/await required:**
```javascript
test('Test with steps', async () => {
  await qase.step('Initialize the environment', async () => {
    // Setup code
  });

  await qase.step('Test Core Functionality', async () => {
    // Test logic
  });

  await qase.step('Verify Expected Behavior', async () => {
    // Assertions
  });
});
```

**With expected results and data:**
```javascript
await qase.step(
  'Click login button',
  async () => {
    // Click action
  },
  'Button should be clicked',  // Expected result (optional)
  'Button data'                 // Data (optional)
);
```

**Nested steps:**
```javascript
await qase.step('Parent step', async () => {
  await qase.step('Child step 1', async () => {
    // Nested step
  });

  await qase.step('Child step 2', async () => {
    // Another nested step
  });
});
```

**Pattern:** `await qase.step(name, async callback, expectedResult?, data?)` - async required

**Source:** Verified from examples/single/jest/test/steps.test.js

---

### Cypress

**Sync with done callback (Mocha-based):**
```javascript
it('Test with steps', () => {
  qase.step('Initialize environment', () => {
    cy.visit('https://example.com');
  });

  qase.step('Perform action', () => {
    cy.get('.button').click();
  });

  qase.step('Verify result', () => {
    cy.contains('Success').should('be.visible');
  });
});
```

**Pattern:** Synchronous callbacks (no async/await) - Mocha style

---

### Mocha

**Similar to Cypress:**
```javascript
it('Test with steps', () => {
  qase.step('Step 1', () => {
    // Test logic
  });

  qase.step('Step 2', () => {
    // More logic
  });
});
```

**Pattern:** Synchronous callbacks (Mocha standard)

---

### CucumberJS

**Gherkin steps (native):**
```gherkin
Scenario: User login
  Given I am on the login page
  When I enter valid credentials
  And I click the login button
  Then I should see the dashboard
```

**Pattern:** Uses native Gherkin Given/When/Then/And steps - no qase.step() API

---

### Newman / TestCafe / WDIO

**Pattern:** TBD - Phase 3 documentation

---

## Attachments API Variations

All frameworks support attachments with similar API but different async handling:

### Path-based Attachments

**All frameworks (Jest, Playwright, Cypress, Mocha, Vitest):**
```javascript
// Single file
qase.attach({ paths: '/path/to/file.txt' });

// Multiple files
qase.attach({ paths: ['/path/to/file1.txt', '/path/to/file2.log'] });
```

**Pattern:** Synchronous - `qase.attach({ paths: string | string[] })`

---

### Content-based Attachments

**Sync (most frameworks):**
```javascript
qase.attach({
  name: 'log.txt',
  content: 'Test execution log content',
  contentType: 'text/plain'
});
```

**Async (when needed):**
```javascript
await qase.attach({
  name: 'screenshot.png',
  content: Buffer.from(imageData, 'base64'),
  contentType: 'image/png'
});
```

**Pattern:** `qase.attach({ name: string, content: string | Buffer, contentType: string })`

---

### Framework-specific Screenshots

**Playwright:**
```javascript
const screenshot = await page.screenshot();
qase.attach({
  name: 'screenshot.png',
  content: screenshot,
  contentType: 'image/png'
});
```

**Cypress:**
```javascript
cy.screenshot('test-screenshot');
// Automatically attached if screenshots configured
```

**Pattern:** Playwright requires manual screenshot capture, Cypress auto-attaches configured screenshots

---

### CucumberJS / Newman / TestCafe / WDIO

**Pattern:** TBD - Phase 3 documentation

---

## Configuration Location

Each framework has specific configuration file and location:

| Framework | Primary Config File | Config Section | Alternative |
|-----------|---------------------|----------------|-------------|
| Jest | jest.config.js / jest.config.ts | `reporters` array | qase.config.json |
| Playwright | playwright.config.ts | `reporter` array | qase.config.json |
| Cypress | cypress.config.js | `setupNodeEvents` in `e2e` | qase.config.json |
| Mocha | .mocharc.js / .mocharc.json | `reporters` array | qase.config.json |
| Vitest | vitest.config.ts | `test.reporters` array | qase.config.json |
| CucumberJS | qase.config.json | Root config | Environment variables |
| Newman | CLI flags / script | Command-line options | qase.config.json |
| TestCafe | TBD | TBD | qase.config.json |
| WDIO | TBD | TBD | qase.config.json |

### Jest Configuration Example

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        mode: 'testops',
        testops: {
          api: {
            token: 'api_token'
          },
          project: 'project_code',
        },
      },
    ],
  ],
};
```

**Source:** qase-jest/README.md

---

### Playwright Configuration Example

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [
    [
      'playwright-qase-reporter',
      {
        testops: {
          api: {
            token: 'api_token',
          },
          project: 'project_code',
        },
      },
    ],
  ],
};

export default config;
```

**Source:** qase-playwright/README.md

---

### Cypress Configuration Example

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
    },
  },
  reporter: 'cypress-qase-reporter',
  reporterOptions: {
    mode: 'testops',
    testops: {
      api: {
        token: 'api_token',
      },
      project: 'project_code',
    },
  },
});
```

**Source:** qase-cypress/README.md

---

### Mocha Configuration Example

```javascript
// .mocharc.js
module.exports = {
  reporters: [
    'spec',
    ['mocha-qase-reporter', {
      mode: 'testops',
      testops: {
        api: {
          token: 'api_token',
        },
        project: 'project_code',
      },
    }],
  ],
};
```

**Source:** qase-mocha/README.md

---

### Vitest Configuration Example

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      'default',
      [
        'vitest-qase-reporter',
        {
          mode: 'testops',
          testops: {
            api: {
              token: 'api_token'
            },
            project: 'project_code',
          },
        },
      ],
    ],
  },
});
```

**Source:** qase-vitest/README.md

---

## Run Commands

Standard test execution commands for each framework:

| Framework | Run Command | With Reporter Enabled |
|-----------|-------------|----------------------|
| Jest | `npx jest` | `QASE_MODE=testops npx jest` |
| Playwright | `npx playwright test` | `npx playwright test` (config-based) |
| Cypress | `npx cypress run` | `npx cypress run` (config-based) |
| Mocha | `npx mocha` | `QASE_MODE=testops npx mocha` |
| Vitest | `npx vitest run` | `QASE_MODE=testops npx vitest run` |
| CucumberJS | `npx cucumber-js` | `QASE_MODE=testops npx cucumber-js -f cucumberjs-qase-reporter` |
| Newman | `npx newman run` | `npx newman run collection.json -r qase` |
| TestCafe | TBD | TBD |
| WDIO | TBD | TBD |

**Notes:**
- Jest, Mocha, Vitest typically use `QASE_MODE=testops` environment variable
- Playwright, Cypress configure reporter in config file (no env var needed)
- CucumberJS requires formatter flag `-f cucumberjs-qase-reporter`
- Newman uses reporter flag `-r qase`

---

## Multi-Project Support

All frameworks support `qase.projects()` for sending test results to multiple Qase projects:

```javascript
// Jest / Playwright / Cypress / Mocha / Vitest
qase.projects({
  'PROJ1': [1, 2, 3],  // Test cases 1,2,3 go to PROJ1
  'PROJ2': [4, 5]      // Test cases 4,5 go to PROJ2
}, 'Test name');
```

**Configuration requires:**
```json
{
  "mode": "testops",
  "testops": {
    "multiproject": {
      "enabled": true
    }
  }
}
```

**Source:** qase-jest/docs/MULTI_PROJECT.md, qase-mocha/docs/MULTI_PROJECT.md

---

## Summary Table

Quick reference for choosing patterns:

| Feature | Jest | Playwright | Cypress | Mocha | Vitest | CucumberJS | Newman | TestCafe | WDIO |
|---------|------|------------|---------|-------|--------|------------|--------|----------|------|
| **Test syntax** | `test()` | `test()` | `it()` | `it()` | `test()` | Gherkin | `pm.test()` | TBD | TBD |
| **ID linking** | Wrapper | Wrapper/Method | Wrapper | Wrapper | Wrapper | Tags | TBD | TBD | TBD |
| **Steps async** | Yes | Yes | No | No | Yes | N/A | TBD | TBD | TBD |
| **Import path** | /jest | root | /mocha | /mocha | root | N/A | N/A | TBD | TBD |
| **Config file** | jest.config | playwright.config | cypress.config | .mocharc | vitest.config | qase.config | CLI | TBD | TBD |
| **Module system** | CommonJS/ESM | ESM | CommonJS/ESM | CommonJS/ESM | ESM | ESM | N/A | TBD | TBD |

---

## Next Steps

This variations matrix will be used in:
- **Phase 2:** Applying templates to Mocha, Vitest, CucumberJS documentation
- **Phase 3:** Completing Newman, TestCafe, WDIO documentation
- **Phase 4:** Validating all framework-specific implementations

For frameworks marked TBD, documentation will be completed in Phase 3 based on actual API investigation and examples.
