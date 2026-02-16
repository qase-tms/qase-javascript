# Playwright Example - E-commerce Test Suite

## Overview

This is a sample project demonstrating realistic e-commerce test scenarios using the Playwright framework with integration to Qase Test Management. The tests run against [saucedemo.com](https://www.saucedemo.com), a demo e-commerce application, showcasing how to structure a real-world test suite with page objects and scenario-based tests that cover authentication, product browsing, cart management, and checkout flows.

## Prerequisites

Ensure that the following tools are installed on your machine:

1. [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
2. [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Installation

1. Clone this repository by running the following commands:
   ```bash
   git clone https://github.com/qase-tms/qase-javascript.git
   cd qase-javascript/examples/single/playwright
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Create a `qase.config.json` file in the root of the project. Follow the instructions
   on [how to configure the file](https://github.com/qase-tms/qase-javascript/tree/main/qase-javascript-commons#configuration).

## Configuration

The Qase reporter can be configured using environment variables or configuration files.

**Environment Variables:**
- `QASE_MODE` - Set to `testops` to enable reporting, `off` to disable (default: off)
- `QASE_TESTOPS_API_TOKEN` - Your Qase API token (required for testops mode)
- `QASE_TESTOPS_PROJECT` - Your Qase project code (required for testops mode)

### Using qase.config.json

Create a `qase.config.json` file in the project root:

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
      "title": "Playwright E-commerce Test Run",
      "complete": true
    }
  }
}
```

### Using playwright.config.js

The project includes a `playwright.config.js` with the Qase reporter configured:

```javascript
const config = {
  timeout: 30000,
  testDir: './test',
  use: {
    baseURL: 'https://www.saucedemo.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['playwright-qase-reporter', { /* options */ }],
  ],
};
```

## Running Tests

```bash
# Run tests without Qase reporting (default)
npm test

# Run tests with Qase reporting
QASE_MODE=testops npm test
```

### Expected Behavior

**Running with QASE_MODE=off (Local Development)**

When running tests with `QASE_MODE=off`, tests execute normally without Qase reporting:

- Tests run against saucedemo.com and pass/fail as usual
- No data is sent to Qase TestOps
- No Qase API token required
- Output shows standard Playwright test results
- Playwright trace viewer and reports work normally

This mode is useful for local development and debugging.

**Running with QASE_MODE=testops (CI/CD and Reporting)**

When running tests with `QASE_MODE=testops`, test results are reported to Qase:

- Tests execute and results are sent to Qase TestOps
- A new test run is created in your Qase project
- Test results include all metadata (steps, attachments, fields, etc.)
- Console output includes Qase test run link
- Requires valid `QASE_TESTOPS_API_TOKEN` and `QASE_TESTOPS_PROJECT` configuration
- Screenshots and other attachments are uploaded to Qase

## Test Scenarios

This project contains four test files demonstrating different e-commerce user flows:

| File | Scenario | Description |
|------|----------|-------------|
| `login.spec.js` | User Authentication | Tests successful login, invalid password handling, and locked user scenarios |
| `inventory.spec.js` | Product Browsing | Tests product listing, sorting, and detail page navigation |
| `cart.spec.js` | Shopping Cart | Tests adding/removing items and managing multiple products in cart |
| `checkout.spec.js` | Checkout Process | Tests complete checkout flow, validation, and cancellation |

## Qase Features Demonstrated

This example demonstrates all key Qase reporter features in realistic test scenarios:

| Feature | Files | Description |
|---------|-------|-------------|
| **Test Case Linking** (`qase(id, name)`) | All test files | Links tests to Qase test cases using the wrapper pattern |
| **Test Fields** (`qase.fields()`) | All test files | Sets severity, priority, layer, and other metadata |
| **Test Suites** (`qase.suite()`) | All test files | Organizes tests into hierarchical suites using tab separator |
| **Test Steps** (`test.step()`) | All test files | Uses Playwright native steps for structured test execution |
| **Attachments** (`qase.attach()`) | login.spec.js, inventory.spec.js, cart.spec.js, checkout.spec.js | Attaches screenshots, JSON data, and text files to test results |
| **Comments** (`qase.comment()`) | login.spec.js, inventory.spec.js | Adds contextual comments to test results |
| **Parameters** (`qase.parameters()`) | login.spec.js, cart.spec.js, checkout.spec.js | Reports parameterized test data |
| **Ignore Tests** (`qase.ignore()`) | checkout.spec.js | Excludes specific tests from Qase reporting |

## Playwright-Specific Patterns

This example uses Playwright-specific patterns for the Qase reporter:

- **Native Steps**: Uses Playwright's native `test.step()` (not `qase.step()`)
- **Attachment Content Type**: Uses `contentType` parameter (not `type`)
- **Test ID Wrapper**: Uses `qase(id, 'name')` wrapper pattern (not mixing with `qase.id()`)
- **Suite Hierarchy**: Uses tab character `\t` as separator in `qase.suite()`

## Project Structure

```
test/
├── pages/
│   ├── LoginPage.js       # Login page interactions
│   ├── InventoryPage.js   # Product listing page interactions
│   ├── CartPage.js        # Shopping cart page interactions
│   └── CheckoutPage.js    # Checkout flow interactions
├── login.spec.js          # Authentication test scenarios
├── inventory.spec.js      # Product browsing test scenarios
├── cart.spec.js           # Shopping cart test scenarios
└── checkout.spec.js       # Checkout test scenarios
```

Each page object encapsulates the selectors and methods for interacting with a specific page, making tests more maintainable and readable.

## Additional Resources

For more details on how to use this integration with Qase Test Management, visit
the [Qase Playwright documentation](https://github.com/qase-tms/qase-javascript/tree/main/qase-playwright).
