# Code Style Guide for Documentation Examples

## Overview

This guide defines consistent formatting standards for all code examples in Qase JavaScript reporter documentation. Apply these rules when creating or updating documentation across all 9 frameworks to ensure a unified, professional appearance.

**Purpose:** Ensure code examples are readable, consistent, and follow JavaScript/TypeScript best practices that users can confidently copy and use in their projects.

**Scope:** Documentation code examples only. This does not govern the internal reporter source code (see .prettierrc.json for package formatting rules).

---

## Language and Syntax

### When to Use TypeScript vs JavaScript

**Use TypeScript for:**
- Examples where types clarify usage (configuration objects, complex parameters)
- Framework examples that primarily use TypeScript (Playwright)
- API method signatures where return types matter
- Generic/reusable code snippets that benefit from type safety

**Use JavaScript for:**
- Simple examples that don't benefit from types
- Framework examples that primarily use JavaScript (Jest, Mocha with CommonJS)
- Quick start guides and minimal examples
- When showing both CommonJS and ES modules side by side

### Module Systems

**Show both CommonJS and ES modules when import method matters:**

```javascript
// CommonJS
const { qase } = require('jest-qase-reporter/jest');

// ES Modules
import { qase } from 'jest-qase-reporter/jest';
```

**Default to ES modules (import/export) unless:**
- Framework documentation traditionally uses CommonJS (Jest examples often use require)
- Showing configuration files that must be CommonJS (some config files)

### Modern JavaScript Features

**Always use:**
- `const` and `let` (never `var`)
- Arrow functions for callbacks: `() => {}`
- Async/await for asynchronous code (never callbacks or .then())
- Template literals for string interpolation: `` `Test run: ${runId}` ``
- Destructuring where it improves clarity: `const { qase } = require(...)`
- Spread operator for copying objects/arrays: `{ ...options }`

**Example of modern style:**
```javascript
const config = {
  mode: 'testops',
  testops: {
    api: { token: process.env.QASE_API_TOKEN },
    project: 'DEMO',
  },
};

const executeTests = async () => {
  await qase.step('Initialize', async () => {
    // Setup code
  });
};
```

---

## Indentation and Formatting

### Indentation Rules

- **2 spaces** for indentation (matches JavaScript ecosystem convention and .prettierrc.json)
- **No tabs** ever
- Consistent indentation for nested structures (objects, arrays, blocks)

### Brace Style

- **K&R style** - opening brace on same line:
  ```javascript
  function testSomething() {
    // code
  }

  if (condition) {
    // code
  }
  ```

### Quotes

- **Single quotes** for strings (matches .prettierrc.json)
  ```javascript
  const name = 'test';
  const path = '/path/to/file';
  ```

- **Template literals** for string interpolation or multiline strings:
  ```javascript
  const message = `Test ${name} completed`;
  ```

### Commas and Semicolons

- **Trailing commas** in multiline objects and arrays (matches .prettierrc.json):
  ```javascript
  const config = {
    mode: 'testops',
    project: 'DEMO',
    api: {
      token: 'token',
    },
  };
  ```

- **Semicolons** at end of statements:
  ```javascript
  const value = 42;
  console.log('Done');
  ```

### Line Length

- Keep lines under 100 characters where practical
- Break long method chains and parameter lists across multiple lines
- Indent continuation lines by 2 spaces

---

## Code Block Formatting

### Language Specifiers

**Always specify language** for syntax highlighting:

```javascript
// Correct
```javascript
const { qase } = require('jest-qase-reporter/jest');
\`\`\`

// Incorrect - no language specified
\`\`\`
const { qase } = require('jest-qase-reporter/jest');
\`\`\`
```

### Language Tag Reference

- `javascript` - JavaScript code
- `typescript` - TypeScript code
- `bash` - Shell commands
- `json` - JSON configuration files (not JavaScript config files)
- `gherkin` - Cucumber feature files
- `diff` - Showing code changes

**Use `bash` for shell commands, not `sh` or `shell`:**
```bash
npm install --save-dev jest-qase-reporter
npx jest
```

**Use `json` for JSON config, `javascript` or `typescript` for .js/.ts config:**
```json
{
  "mode": "testops",
  "project": "DEMO"
}
```

```javascript
// jest.config.js
module.exports = {
  reporters: ['jest-qase-reporter'],
};
```

### Complete Examples

**Examples should be:**
- **Minimal but complete** - include necessary imports and setup
- **Runnable if possible** - user can copy and use with minimal modification
- **Focused** - show one concept at a time

**Good example - complete and focused:**
```javascript
const { qase } = require('jest-qase-reporter/jest');

test(qase(1, 'User can login'), async () => {
  const user = await login('user@example.com', 'password');
  expect(user).toBeDefined();
  expect(user.email).toBe('user@example.com');
});
```

**Bad example - incomplete snippet:**
```javascript
// Missing import, unclear context
expect(user).toBeDefined();
```

---

## Test Example Patterns

### Test Structure

**Use describe/it or describe/test for test structure:**
```javascript
describe('Authentication', () => {
  test('User can log in successfully', () => {
    // Test implementation
  });

  test('User cannot log in with invalid credentials', () => {
    // Test implementation
  });
});
```

### Meaningful Test Names

**Good test names:**
- "User can log in successfully"
- "API returns 404 for missing resource"
- "Form validation displays error message"

**Bad test names:**
- "test1"
- "it works"
- "should be true"

### Complete Test Functions

**Show full test structure, not fragments:**

**Good - complete test:**
```javascript
test(qase(1, 'User profile loads correctly'), async () => {
  const profile = await fetchUserProfile('user123');

  expect(profile.name).toBe('John Doe');
  expect(profile.email).toBe('john@example.com');
  expect(profile.verified).toBe(true);
});
```

**Bad - incomplete fragment:**
```javascript
// Unclear what this tests
expect(profile.name).toBe('John Doe');
```

### Async Tests

**Always use async/await, never callbacks or .then():**

**Good - async/await:**
```javascript
test('Fetch user data', async () => {
  const user = await fetchUser(123);
  expect(user.id).toBe(123);
});
```

**Bad - .then() chains:**
```javascript
test('Fetch user data', () => {
  return fetchUser(123).then(user => {
    expect(user.id).toBe(123);
  });
});
```

---

## API Call Examples

### Realistic Parameters

**Use realistic field names and values from Qase API:**

```javascript
qase.fields({
  severity: 'critical',
  priority: 'high',
  layer: 'api',
  description: 'Tests core authentication flow',
});
```

**Not:**
```javascript
qase.fields({
  field1: 'value1',
  field2: 'value2',
});
```

### Content Types for Attachments

**Always specify content type for attachments:**

```javascript
qase.attach({
  name: 'log.txt',
  content: 'Test execution log',
  contentType: 'text/plain',
});

qase.attach({
  name: 'screenshot.png',
  content: imageBuffer,
  contentType: 'image/png',
});
```

### Template Literals for Dynamic Values

**Use template literals for dynamic content:**

```javascript
await qase.step(`Verify user ${username} can login`, async () => {
  // Test logic
});

qase.comment(`Test executed on ${new Date().toISOString()}`);
```

---

## Configuration Examples

### JSON Formatting

**Format JSON with 2-space indent, trailing commas (if valid JSON5):**

```json
{
  "mode": "testops",
  "testops": {
    "api": {
      "token": "api_token_here"
    },
    "project": "DEMO"
  }
}
```

### JavaScript Configuration Files

**Include comments to explain options:**

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default', // Keep default Jest reporter
    [
      'jest-qase-reporter',
      {
        mode: 'testops',
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN, // Use environment variable for security
          },
          project: 'DEMO',
        },
      },
    ],
  ],
};
```

### Minimal Config First

**Show minimal working config first, then comprehensive:**

**Minimal:**
```javascript
module.exports = {
  reporters: [
    ['jest-qase-reporter', {
      testops: {
        api: { token: 'api_token' },
        project: 'DEMO',
      },
    }],
  ],
};
```

**Comprehensive (later in docs):**
```javascript
module.exports = {
  reporters: [
    ['jest-qase-reporter', {
      mode: 'testops',
      testops: {
        api: {
          token: process.env.QASE_API_TOKEN,
        },
        project: 'DEMO',
        run: {
          title: 'Automated Test Run',
          description: 'CI/CD pipeline execution',
        },
        batch: {
          size: 100,
        },
      },
    }],
  ],
};
```

### Realistic Placeholder Values

**Use realistic placeholders:**
- Project codes: `'DEMO'` or `'YOUR_PROJECT_CODE'`
- API tokens: `'api_token_here'` or `'YOUR_API_TOKEN'`
- Environment variables: `process.env.QASE_API_TOKEN`

**Not generic:**
- `'xxx'`, `'placeholder'`, `'value'`

---

## Comments and Documentation

### Comment Style

- **Sentence case** for comments
- **End with period** for complete sentences
- **No period** for short labels or inline clarifications

```javascript
// Initialize the test environment.
const env = setupEnvironment();

const token = process.env.QASE_API_TOKEN; // From environment
```

### Inline Comments

**Place inline comments above the line they describe:**

**Good:**
```javascript
// Set up test data
const user = createTestUser();

// Execute login flow
await login(user.email, user.password);
```

**Bad:**
```javascript
const user = createTestUser(); // Set up test data
await login(user.email, user.password); // Execute login flow
```

### Complex Examples

**For complex examples, add "Usage:" comment at top:**

```javascript
// Usage: Configure Jest reporter with custom run title and batch upload
//
// This example shows how to:
// - Set custom test run title
// - Enable batch upload for performance
// - Use environment variables for security

module.exports = {
  reporters: [
    ['jest-qase-reporter', {
      testops: {
        api: { token: process.env.QASE_API_TOKEN },
        project: 'DEMO',
        run: { title: 'Nightly Regression Tests' },
        batch: { size: 100 },
      },
    }],
  ],
};
```

### Avoid Redundant Comments

**Don't restate what code clearly shows:**

**Bad - redundant:**
```javascript
// Call qase.attach
qase.attach({ paths: 'file.txt' });

// Set the title
qase.title('Test title');
```

**Good - adds value:**
```javascript
// Attach test execution log for debugging
qase.attach({ paths: 'execution.log' });

// Override auto-generated title with user-friendly name
qase.title('User can successfully complete checkout');
```

---

## What to Avoid

### Deprecated Features

- Don't use `var` (always `const` or `let`)
- Don't mix tabs and spaces
- Don't use double quotes for strings (use single quotes)
- Don't use callbacks (use async/await)
- Don't use `.then()` chains (use async/await)

### Incomplete Code

- Don't show code without necessary context:
  ```javascript
  // Bad - where does qase come from?
  qase.title('Test');
  ```

- Don't use ellipsis (...) without clear indication:
  ```javascript
  // Bad - unclear what's omitted
  describe('Tests', () => {
    ...
  });

  // Good - clear structure
  describe('Tests', () => {
    test('test 1', () => { /* ... */ });
    test('test 2', () => { /* ... */ });
  });
  ```

### Console.log in Examples

**Don't use console.log in examples unless demonstrating logging:**

**Bad:**
```javascript
test('Example', () => {
  console.log('Running test');
  expect(true).toBe(true);
  console.log('Test done');
});
```

**Good (when showing debug output):**
```javascript
// Debug example: log test execution details
test('Example with logging', () => {
  console.log(`Test started at ${new Date()}`);
  expect(true).toBe(true);
});
```

### TypeScript `any` Type

**Don't use `any` type in TypeScript examples (defeats purpose):**

**Bad:**
```typescript
const config: any = { mode: 'testops' };
```

**Good:**
```typescript
const config: QaseConfig = { mode: 'testops' };
```

### Framework-Specific Syntax in Shared Examples

**Don't mix framework syntax in shared/common examples:**

**Bad (in general docs):**
```javascript
// Mixing Playwright (test) and Mocha (it)
test('Example', () => {
  it('should work', () => {
    // ...
  });
});
```

**Good:**
Keep framework-specific examples in framework-specific documentation.

---

## Example Templates

### Well-Formatted Test with Qase Integration

```javascript
const { qase } = require('jest-qase-reporter/jest');

describe('User Authentication', () => {
  test(qase(1, 'User can login with valid credentials'), async () => {
    await qase.step('Navigate to login page', async () => {
      await page.goto('https://example.com/login');
    });

    await qase.step('Enter credentials', async () => {
      await page.fill('#email', 'user@example.com');
      await page.fill('#password', 'securePassword123');
    });

    await qase.step('Submit login form', async () => {
      await page.click('button[type="submit"]');
    });

    await qase.step('Verify successful login', async () => {
      await expect(page.locator('.dashboard')).toBeVisible();
      qase.attach({
        name: 'dashboard-screenshot.png',
        content: await page.screenshot(),
        contentType: 'image/png',
      });
    });
  });
});
```

### Well-Formatted Configuration Object

```javascript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'], // Console output
    [
      'playwright-qase-reporter',
      {
        mode: 'testops',
        debug: false,
        testops: {
          api: {
            token: process.env.QASE_API_TOKEN,
          },
          project: 'DEMO',
          run: {
            title: 'Automated Test Run',
            description: 'Nightly regression tests',
            complete: true,
          },
          batch: {
            size: 100,
          },
        },
      },
    ],
  ],
});
```

### Well-Formatted Import Statements (Both Styles)

**CommonJS:**
```javascript
const { qase } = require('jest-qase-reporter/jest');
const { describe, test, expect } = require('@jest/globals');
```

**ES Modules:**
```typescript
import { qase } from 'playwright-qase-reporter';
import { test, expect } from '@playwright/test';
```

### Well-Formatted Async Step Usage

```javascript
test('Complex workflow with steps', async () => {
  await qase.step('Initialize test environment', async () => {
    await setupDatabase();
    await seedTestData();
  });

  await qase.step('Execute main test flow', async () => {
    const result = await performComplexOperation();
    expect(result.success).toBe(true);
  });

  await qase.step('Verify side effects', async () => {
    const dbState = await checkDatabaseState();
    expect(dbState.recordCount).toBe(10);
  });

  await qase.step('Cleanup', async () => {
    await clearTestData();
  });
});
```

---

## Alignment with Codebase Standards

This style guide aligns with `.prettierrc.json` formatting rules:

- **Single quotes:** `"singleQuote": true`
- **Trailing commas:** `"trailingComma": "all"`
- **2-space indentation:** Default Prettier setting

When in doubt, run Prettier on code examples:
```bash
npx prettier --write example.js
```

---

## Quick Checklist

Before publishing documentation code examples, verify:

- [ ] Language specified for all code blocks (```javascript, ```typescript, ```bash)
- [ ] 2-space indentation throughout
- [ ] Single quotes for strings, template literals for interpolation
- [ ] Trailing commas in multiline objects/arrays
- [ ] Semicolons at statement end
- [ ] `const`/`let` only (no `var`)
- [ ] `async`/`await` for asynchronous code (no callbacks or `.then()`)
- [ ] Necessary imports included at top of examples
- [ ] Complete, runnable examples (not fragments without context)
- [ ] Meaningful test names and realistic parameter values
- [ ] Comments add value (not redundant restatements)
- [ ] No `console.log` unless demonstrating logging
- [ ] No TypeScript `any` type
- [ ] Framework-specific syntax only in framework-specific docs

---

## Summary

Following this style guide ensures:
- **Consistency** across all 9 framework documentation sets
- **Readability** for developers of all skill levels
- **Copy-paste friendliness** - users can use examples directly
- **Professionalism** that reflects well on the Qase reporter ecosystem

When applying templates in subsequent phases, reference this guide to maintain uniformity.
