# WDIO Example - E-commerce Test Suite

This example demonstrates realistic e-commerce test scenarios on [saucedemo.com](https://www.saucedemo.com) using WebdriverIO with Qase TestOps integration.

**Note:** This is a **single project** example. For multi-project usage patterns, see `examples/multiProject/wdio/`.

## Overview

The test suite covers core e-commerce user flows:
- User authentication (login scenarios)
- Product catalog browsing and sorting
- Shopping cart management
- Complete checkout process

All tests demonstrate comprehensive Qase reporter features in realistic test contexts using the Page Object Model pattern.

## Prerequisites

- Node.js 18 or higher
- npm
- Chrome browser (tests run in headless mode)

## Setup

```bash
# Install dependencies
npm install
```

## Running Tests

### Local execution (no reporting)
```bash
QASE_MODE=off npm test
```

### With Qase TestOps reporting
```bash
# Configure your credentials in qase.config.json first
QASE_MODE=testops npm test
```

## Test Files

| File | Scenarios | Features Demonstrated |
|------|-----------|----------------------|
| `login.spec.js` | Valid login, invalid credentials, locked user | qase.id, fields, suite, steps, comment, attach, parameters |
| `inventory.spec.js` | Browse products, sort by price, view details | Multiple IDs `qase([6, 7], 'name')`, JSON attachments |
| `cart.spec.js` | Add to cart, remove from cart, multiple items | qase.step, parameters, JSON attachments |
| `checkout.spec.js` | Complete checkout, validation errors, cancel | Nested steps `step.step()`, qase.ignore() |

## Qase Features Demonstrated

| Feature | Usage Pattern | Example Location |
|---------|--------------|------------------|
| Test ID | `it(qase(1, 'name'), async () => {})` | All test files |
| Multiple IDs | `it(qase([6, 7], 'name'), async () => {})` | `inventory.spec.js` |
| Title | Provided as second argument in wrapper | All tests |
| Fields | `qase.fields({severity, priority, layer})` | All tests |
| Suite | `qase.suite('Parent\tChild\tGrandchild')` | All tests |
| Steps | `await qase.step('name', async () => {})` | All tests |
| Nested Steps | `await qase.step('parent', async (step) => { await step.step('child', async () => {}) })` | `checkout.spec.js` |
| Parameters | `qase.parameters({key: 'value'})` | Various tests |
| Attachments | `qase.attach({name, content, type})` | `login.spec.js`, `inventory.spec.js`, `cart.spec.js`, `checkout.spec.js` |
| Comment | `qase.comment('text')` | All tests |
| Ignore | `it(qase.ignore(), 'name', async () => {})` | `checkout.spec.js` |

## Page Objects

This example uses the **WDIO Page Object Pattern** with getter methods:

```javascript
class LoginPage {
  get usernameInput() { return $('[data-test="username"]'); }
  get passwordInput() { return $('[data-test="password"]'); }

  async login(username, password) {
    await this.usernameInput.setValue(username);
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
  }
}

module.exports = new LoginPage();
```

Page objects are located in `test/pageobjects/`:
- `LoginPage.js` - Login page interactions
- `InventoryPage.js` - Product catalog and sorting
- `CartPage.js` - Shopping cart management
- `CheckoutPage.js` - Checkout process

## Important WDIO Patterns

### CommonJS (not ES modules)
```javascript
const { qase } = require('wdio-qase-reporter');
const LoginPage = require('../pageobjects/LoginPage');
```

### Wrapper Pattern for Test IDs
```javascript
// Correct: wrap test name with qase()
it(qase(1, 'Test name'), async () => {
  // test code
});

// Multiple IDs
it(qase([1, 2], 'Test name'), async () => {
  // test code
});
```

### Async Steps
```javascript
await qase.step('Step name', async () => {
  // step code
});
```

### Attachment Type Parameter
```javascript
// Use 'type' parameter (NOT 'contentType')
qase.attach({
  name: 'file.json',
  content: JSON.stringify(data),
  type: 'application/json'
});
```

### Critical Hooks in wdio.conf.js
```javascript
const { beforeRunHook, afterRunHook } = require('wdio-qase-reporter');

exports.config = {
  // ... other config
  onPrepare: async function () {
    await beforeRunHook();  // Required for Qase integration
  },
  onComplete: async function () {
    await afterRunHook();   // Required for Qase integration
  },
};
```

## Configuration

### qase.config.json
Single project configuration:

```json
{
  "debug": true,
  "testops": {
    "api": {
      "token": "your_api_token"
    },
    "project": "your_project_code",
    "uploadAttachments": true,
    "run": {
      "complete": true
    }
  }
}
```

### wdio.conf.js
WebdriverIO configuration with Qase reporter:

```javascript
const WDIOQaseReporter = require('wdio-qase-reporter').default;
const { afterRunHook, beforeRunHook } = require('wdio-qase-reporter');

exports.config = {
  reporters: [
    [WDIOQaseReporter, {
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: true,
      useCucumber: false,
    }]
  ],
  // ... critical hooks
  onPrepare: async function () {
    await beforeRunHook();
  },
  onComplete: async function () {
    await afterRunHook();
  },
};
```

## Learn More

- [Qase WDIO Reporter Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-wdio)
- [WebdriverIO Documentation](https://webdriver.io/)
- [Saucedemo Test Site](https://www.saucedemo.com)

## Credentials

For testing on saucedemo.com, use these credentials:
- **Standard User:** `standard_user` / `secret_sauce`
- **Locked User:** `locked_out_user` / `secret_sauce` (for negative testing)
