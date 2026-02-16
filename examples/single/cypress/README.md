# Cypress Example - E-commerce Test Suite

This is a realistic e-commerce test suite demonstrating how to write and execute end-to-end tests using Cypress with integration to Qase Test Management. The tests run against [saucedemo.com](https://www.saucedemo.com), a demo e-commerce site.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/cypress
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

## Running Tests

### Local Development (Without Qase Reporting)

Run tests locally without sending results to Qase:

```bash
# Interactive mode with Cypress UI
QASE_MODE=off npx cypress open

# Headless mode
QASE_MODE=off npx cypress run
```

In this mode:
- Tests execute normally
- No data is sent to Qase TestOps
- No Qase API token required
- Standard Cypress test output

### CI/CD Mode (With Qase Reporting)

Run tests and upload results to Qase TestOps:

```bash
QASE_MODE=testops npx cypress run
```

In this mode:
- Tests execute and results are sent to Qase TestOps
- A new test run is created in your Qase project
- Test results include all metadata (steps, attachments, comments, parameters, etc.)
- Console output includes Qase test run link
- Requires valid `QASE_TESTOPS_API_TOKEN` and `QASE_TESTOPS_PROJECT` configuration
- Cypress screenshots on failure can be attached automatically

## Test Scenarios

This example demonstrates realistic e-commerce test scenarios across four test files:

| File | Scenarios | Description |
|------|-----------|-------------|
| `login.cy.js` | Authentication | Login with valid/invalid credentials, locked user |
| `inventory.cy.js` | Product Browsing | Browse products, sort by price, view details |
| `cart.cy.js` | Shopping Cart | Add/remove products, multiple items |
| `checkout.cy.js` | Checkout Flow | Complete purchase, validation, cancel checkout |

**Total:** 13 test cases covering the complete e-commerce user journey.

## Page Objects

This example uses the Page Object Model pattern to organize test code:

| Page Object | Purpose |
|------------|---------|
| `LoginPage.js` | Authentication page interactions |
| `InventoryPage.js` | Product browsing and cart operations |
| `CartPage.js` | Shopping cart management |
| `CheckoutPage.js` | Checkout flow operations |

Page objects are located in `cypress/support/pages/` and follow Cypress patterns (synchronous operations, returning `cy` chains).

## Qase Features Demonstrated

This example demonstrates all Qase reporter features in realistic test scenarios:

| Feature | API Method | Example Location | Description |
|---------|-----------|------------------|-------------|
| **Test ID** | `qase(id, it(...))` | All tests | Link Cypress tests to Qase test cases |
| **Title** | `it('title', ...)` | All tests | Test case title (from Cypress test name) |
| **Fields** | `qase.fields({...})` | All tests | Severity, priority, layer metadata |
| **Suite** | `qase.suite('...')` | All tests | Hierarchical test organization using `\t` separator |
| **Steps** | `qase.step('name', () => {...})` | All tests | Named test execution steps |
| **Attachments** | `qase.attach({...})` | inventory, cart, checkout | Attach JSON, text, or other content |
| **Comments** | `qase.comment('...')` | All tests | Additional context for test results |
| **Parameters** | `qase.parameters({...})` | login, inventory, checkout | Report test parameters/inputs |
| **Ignore** | `qase.ignore()` | checkout test 13 | Exclude specific tests from reporting |

### Example: Complete Test with Multiple Features

```javascript
qase(10,
  it('User can complete checkout with valid information', () => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tComplete Flow');
    qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

    qase.step('Fill in checkout information', () => {
      CheckoutPage.fillInfo('John', 'Doe', '12345');
    });

    qase.step('Complete the order', () => {
      CheckoutPage.finish();
    });

    qase.step('Attach order details', () => {
      qase.attach({
        name: 'order-details.txt',
        content: 'Order Details: ...',
        contentType: 'text/plain'
      });
    });

    qase.comment('Checkout completed successfully');
  })
);
```

## Important Cypress-Specific Notes

### Synchronous Steps (CRITICAL)

Unlike Jest or Playwright, Cypress steps use **synchronous callbacks**. Do NOT use `async/await` with `qase.step()`:

```javascript
// ✅ CORRECT - Synchronous callback
qase.step('Add product to cart', () => {
  InventoryPage.addToCart('sauce-labs-backpack');
  InventoryPage.getCartBadge().should('have.text', '1');
});

// ❌ WRONG - Do not use async/await
qase.step('Add product to cart', async () => {  // ❌ NO async
  await InventoryPage.addToCart('...');          // ❌ NO await
});
```

Cypress commands are already queued and executed asynchronously by Cypress itself. Adding `async/await` will break the Cypress command chain.

### Import Pattern

Use the `/mocha` import path, as Cypress uses Mocha under the hood:

```javascript
import { qase } from 'cypress-qase-reporter/mocha';  // ✅ CORRECT
```

### Attachment Content Type

Use `contentType` parameter (not `type`) for attachments:

```javascript
qase.attach({
  name: 'data.json',
  content: JSON.stringify({ ... }),
  contentType: 'application/json'  // ✅ Use contentType
});
```

### Test ID Wrapper Pattern

Use the wrapper pattern to link test IDs:

```javascript
qase(1,                          // ✅ Wrap the entire it() call
  it('Test name', () => {
    // test implementation
  })
);
```

### Suite Hierarchy

Use `\t` (tab character) to define suite hierarchy:

```javascript
qase.suite('E-commerce\tCheckout\tValidation');
// Creates: E-commerce > Checkout > Validation
```

## Configuration

### Option 1: qase.config.json

```json
{
  "mode": "testops",
  "debug": false,
  "testops": {
    "api": {
      "token": "your_api_token_here"
    },
    "project": "YOUR_PROJECT_CODE",
    "run": {
      "title": "Cypress E-commerce Test Run",
      "complete": true
    }
  }
}
```

### Option 2: cypress.config.js

The configuration is already set up in `cypress.config.js` with the Qase reporter. You can customize it further:

```javascript
module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      debug: true,
      testops: {
        api: {
          token: process.env.QASE_TESTOPS_API_TOKEN,
        },
        project: process.env.QASE_TESTOPS_PROJECT,
        uploadAttachments: true,
        run: {
          complete: true,
        },
      },
    },
  },
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
      // ... other event handlers
    },
  },
});
```

### Environment Variables

You can also configure via environment variables:

- `QASE_MODE` - Set to `testops` to enable reporting, `off` to disable
- `QASE_TESTOPS_API_TOKEN` - Your Qase API token
- `QASE_TESTOPS_PROJECT` - Your Qase project code

## Custom Commands

This example includes a custom `login` command for convenience:

```javascript
// Usage in tests
cy.login();  // Logs in with default credentials (standard_user/secret_sauce)
cy.login('problem_user', 'secret_sauce');  // Logs in with custom credentials
```

## Additional Resources

- [Qase Cypress Reporter Documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-cypress)
- [Cypress Documentation](https://docs.cypress.io/)
- [Saucedemo Test Site](https://www.saucedemo.com)
- [Qase TestOps](https://qase.io/)
