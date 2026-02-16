# TestCafe Example - E-commerce Test Suite

This is a comprehensive example demonstrating realistic e-commerce testing scenarios using TestCafe with Qase Test Management integration. Tests are executed against [saucedemo.com](https://www.saucedemo.com), a demo e-commerce application.

## Overview

This example showcases how to write end-to-end tests for a real-world e-commerce application, covering:

- **Authentication** - Login scenarios with valid/invalid credentials
- **Product Inventory** - Browsing, filtering, and viewing product details
- **Shopping Cart** - Adding, removing, and managing cart items
- **Checkout Flow** - Complete purchase process with form validation

All tests demonstrate Qase reporter integration using TestCafe's unique builder pattern and API.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
3. Chrome browser (or modify package.json to use a different browser)

## Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/testcafe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Qase integration by editing `qase.config.json`:
   ```json
   {
     "testops": {
       "api": {
         "token": "your-api-token-here"
       },
       "project": "your-project-code-here",
       "uploadAttachments": true,
       "run": {
         "complete": true
       }
     }
   }
   ```

   See [configuration guide](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration) for all options.

## Project Structure

```
testcafe/
├── tests/
│   ├── pages/              # Page Object Model
│   │   ├── LoginPage.js    # Login page selectors
│   │   ├── InventoryPage.js # Product listing selectors
│   │   ├── CartPage.js     # Shopping cart selectors
│   │   └── CheckoutPage.js # Checkout form selectors
│   ├── login.test.js       # Authentication scenarios
│   ├── inventory.test.js   # Product browsing scenarios
│   ├── cart.test.js        # Cart management scenarios
│   └── checkout.test.js    # Checkout flow scenarios
├── qase.config.json        # Qase reporter configuration
├── package.json
└── README.md
```

## Example Files

| File | Description | Test Count | Scenarios |
|------|-------------|------------|-----------|
| **login.test.js** | Authentication testing | 3 | Valid login, invalid password, locked user |
| **inventory.test.js** | Product browsing and filtering | 3 | Browse products, sort by price, view details |
| **cart.test.js** | Shopping cart operations | 3 | Add item, remove item, multiple items |
| **checkout.test.js** | Purchase completion flow | 4 | Complete checkout, validation errors, cancel, ignored test |

**Total:** 13 tests covering complete e-commerce user journey

## Running Tests

### Local execution (no reporting)

```bash
QASE_MODE=off npm test
```

### With Qase reporting

```bash
npm test
```

This runs all tests in Chrome with Qase reporter enabled.

### Run specific test file

```bash
QASE_MODE=testops npx testcafe chrome tests/login.test.js -r spec,qase
```

### Run with different browser

```bash
QASE_MODE=testops npx testcafe firefox tests/*.test.js -r spec,qase
```

## Page Object Pattern

This example uses TestCafe's Selector-based page objects. All page objects:

- Import `Selector` from TestCafe
- Define selectors as class properties in constructor
- Export as singleton instances
- Use data-test attributes for reliable element location

**Example:**

```javascript
import { Selector } from 'testcafe';

class LoginPage {
  constructor() {
    this.usernameInput = Selector('[data-test="username"]');
    this.passwordInput = Selector('[data-test="password"]');
    this.loginButton = Selector('[data-test="login-button"]');
  }
}

export default new LoginPage();
```

## Qase Features Demonstrated

| Feature | Usage Example | Description |
|---------|---------------|-------------|
| **Test ID** | `qase.id(1)` | Link test to existing Qase test case |
| **Title** | `qase.title('Custom title')` | Set custom test title |
| **Fields** | `qase.fields({severity:'critical', priority:'high'})` | Add metadata fields |
| **Suite** | `qase.suite('E-commerce\tCart\tAdd')` | Organize with suite hierarchy (tab-separated) |
| **Parameters** | `qase.parameters({username:'user1'})` | Document test parameters |
| **Steps** | `await qase.step('name', async () => {})` | Create hierarchical test steps |
| **Nested Steps** | `await qase.step('parent', async (s1) => { await s1.step('child', ...) })` | Multi-level step nesting |
| **Attachments** | `qase.attach({name:'file.txt', content:'...', type:'text/plain'})` | Attach files or content |
| **Comments** | `qase.comment('Additional info')` | Add runtime comments |
| **Ignore** | `qase.ignore()` | Skip reporting to Qase |

## TestCafe-Specific Patterns

### 1. Builder Pattern with `.create()`

**CRITICAL:** Every `test.meta()` call **MUST** end with `.create()`. This is the most common mistake.

```javascript
// ✅ CORRECT
test.meta(qase.id(1).title('Test').create())('Test name', async t => {
  // test code
});

// ❌ WRONG - Missing .create()
test.meta(qase.id(1).title('Test'))('Test name', async t => {
  // test code
});
```

### 2. Chaining Metadata

Chain multiple metadata methods before calling `.create()`:

```javascript
test.meta(
  qase.id(1)
    .title('Complex test')
    .fields({severity: 'high'})
    .suite('Module\tFeature')
    .parameters({user: 'admin'})
    .create()
)('Test name', async t => {
  // test code
});
```

### 3. Attachment Type Parameter

Use `type` (not `contentType`) for MIME type:

```javascript
// ✅ CORRECT
await qase.attach({
  name: 'data.json',
  content: JSON.stringify({key: 'value'}),
  type: 'application/json'  // Use 'type'
});

// ❌ WRONG
await qase.attach({
  name: 'data.json',
  content: JSON.stringify({key: 'value'}),
  contentType: 'application/json'  // Don't use 'contentType'
});
```

### 4. Async Steps

TestCafe steps are asynchronous and must use `async/await`:

```javascript
// ✅ CORRECT
await qase.step('Step name', async () => {
  await t.click(someButton);
});

// ✅ CORRECT - Nested steps
await qase.step('Parent step', async (s1) => {
  await s1.step('Child step', async () => {
    await t.typeText(input, 'text');
  });
});
```

### 5. Fixture Setup

Use TestCafe's fixture API for test organization:

```javascript
fixture`Suite Name`
  .page`https://example.com`
  .beforeEach(async t => {
    // Setup code
  });
```

## Expected Behavior

When tests run with Qase reporting enabled:

1. **Test results** are uploaded to your Qase project in real-time
2. **Attachments** (JSON, text files) are uploaded to Qase
3. **Steps** appear hierarchically in test case results
4. **Metadata** (fields, suites, parameters) is applied to test cases
5. **Ignored tests** are executed locally but not reported to Qase
6. **Screenshots** of failures are automatically captured and attached

## Credentials

The example uses demo credentials from saucedemo.com:

- **Standard user:** username: `standard_user`, password: `secret_sauce`
- **Locked user:** username: `locked_out_user`, password: `secret_sauce`

These are publicly available demo credentials for testing purposes only.

## Additional Resources

- [Qase TestCafe Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-testcafe)
- [TestCafe Documentation](https://testcafe.io/documentation)
- [Qase Test Management](https://qase.io)
- [SauceDemo Test Site](https://www.saucedemo.com)

## Troubleshooting

### Common Issues

1. **Missing `.create()`**: If tests don't report to Qase, ensure all `.meta()` calls end with `.create()`
2. **Wrong attachment parameter**: Use `type` not `contentType` for attachments
3. **Step not awaited**: All `qase.step()` calls must be awaited in TestCafe
4. **Browser not found**: Install Chrome or modify package.json to use a different browser

### Debug Mode

Enable debug mode in `qase.config.json` to see detailed logging:

```json
{
  "debug": true,
  "testops": {
    // ... rest of config
  }
}
```

## License

This example is part of the [qase-javascript](https://github.com/qase-tms/qase-javascript) repository and follows the same license.
