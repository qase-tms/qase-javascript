# Cucumber/Gherkin Integration with Qase Reporter

This guide explains how to integrate Qase reporter with Cucumber/Gherkin tests in Cypress using either the legacy `cypress-cucumber-preprocessor` or the newer `@badeball/cypress-cucumber-preprocessor`.

---

## Table of Contents

- [Choosing a Preprocessor](#choosing-a-preprocessor)
- [Configuration for @badeball/cypress-cucumber-preprocessor (Recommended)](#configuration-for-badeballcypress-cucumber-preprocessor-recommended)
- [Configuration for cypress-cucumber-preprocessor (Legacy)](#configuration-for-cypress-cucumber-preprocessor-legacy)
- [Cucumber Steps Reporting](#cucumber-steps-reporting)
- [Examples](#examples)

---

## Choosing a Preprocessor

There are two Cucumber preprocessors available for Cypress:

- **`@badeball/cypress-cucumber-preprocessor`** (Recommended) - Actively maintained, modern implementation
- **`cypress-cucumber-preprocessor`** (Legacy) - Original implementation, now deprecated

This guide covers both, but we recommend using `@badeball/cypress-cucumber-preprocessor` for new projects.

---

## Configuration for @badeball/cypress-cucumber-preprocessor (Recommended)

### Installation

```bash
npm install -D @badeball/cypress-cucumber-preprocessor
npm install -D @bahmutov/cypress-esbuild-preprocessor
npm install -D cypress-qase-reporter
```

### Cypress Configuration

Update your `cypress.config.js`:

```javascript
import cypress from 'cypress';
import { afterSpecHook } from 'cypress-qase-reporter/hooks';
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const addCucumberPreprocessorPlugin = require('@badeball/cypress-cucumber-preprocessor').addCucumberPreprocessorPlugin;
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;

module.exports = cypress.defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      debug: true,
      testops: {
        api: {
          token: 'api_token',
        },
        project: 'project_code',
        uploadAttachments: true,
        run: {
          complete: true,
        },
      },
      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
        },
      },
    },
  },
  video: false,
  e2e: {
    specPattern: 'cypress/e2e/**/*.feature',
    async setupNodeEvents(on, config) {
      // 1. Set up the Cucumber preprocessor FIRST
      await addCucumberPreprocessorPlugin(on, config);
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      // 2. Set up the Qase reporter plugin
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);

      // 3. Register the after:spec hook
      on('after:spec', async (spec, results) => {
        await afterSpecHook(spec, config);
      });

      return config;
    },
  },
});
```

### Cucumber Steps Reporting

To automatically capture and report Gherkin steps to Qase, create a hooks file.

Create `cypress/support/step_definitions/hooks.js`:

```javascript
import { BeforeStep } from '@badeball/cypress-cucumber-preprocessor';
import { addCucumberStep } from 'cypress-qase-reporter/cucumber';

// Automatically report each Gherkin step to Qase
BeforeStep(function({ pickleStep }) {
  const keyword = pickleStep.keyword || '';
  const stepText = `${keyword}${pickleStep.text}`;
  addCucumberStep(stepText);
});
```

This hook will automatically:
- Capture each Gherkin step (Given/When/Then/And/But)
- Report it to Qase with the correct execution status (passed/failed)
- Include step details in your test results

**Note:** Step reporting is optional. If you only need test-level results without individual step details, you can skip this configuration.

### Manual Step Reporting (Alternative)

If you prefer more control, you can manually add steps in your step definitions:

```javascript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { addCucumberStep } from 'cypress-qase-reporter/cucumber';

Given('I am on the homepage', () => {
  addCucumberStep('Given I am on the homepage');
  cy.visit('https://example.com');
});

When('I click the button', () => {
  addCucumberStep('When I click the button');
  cy.get('button').click();
});

Then('I should see the result', () => {
  addCucumberStep('Then I should see the result');
  cy.get('.result').should('be.visible');
});
```

---

## Configuration for cypress-cucumber-preprocessor (Legacy)

### Installation

```bash
npm install -D cypress-cucumber-preprocessor
npm install -D cypress-qase-reporter
```

### Cypress Configuration

Update your `cypress.config.js`:

```javascript
import cypress from 'cypress';
import { afterSpecHook } from 'cypress-qase-reporter/hooks';

module.exports = cypress.defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      debug: true,
      testops: {
        api: {
          token: 'api_token',
        },
        project: 'project_code',
        uploadAttachments: true,
        run: {
          complete: true,
        },
      },
      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
        },
      },
    },
  },
  video: false,
  e2e: {
    specPattern: '**/*.feature',
    async setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);

      on('after:spec', async (spec, results) => {
        await afterSpecHook(spec, config);
      });

      return config;
    },
  },
});
```

### Cucumber Steps Reporting

For the legacy preprocessor, add the following to your `cypress/support/e2e.js` file:

```javascript
import { enableCucumberSupport } from 'cypress-qase-reporter/cucumber';

enableCucumberSupport();
```

This will automatically capture all Gherkin steps and report them to Qase. No additional configuration is needed.

---

## Cucumber Steps Reporting

### What Gets Reported

When you enable Cucumber steps reporting, the following information is sent to Qase for each step:

- **Step text** - The full Gherkin step (e.g., "Given I am on the homepage")
- **Step status** - Whether the step passed or failed
- **Step timing** - When the step started execution
- **Step attachments** - Any screenshots or files attached during the step

### Example Feature File

```gherkin
Feature: User Login

  @QaseID(1)
  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should see the dashboard
    And I should see my username

  @QaseID(2)
  Scenario: Failed login
    Given I am on the login page
    When I enter invalid credentials
    And I click the login button
    Then I should see an error message
```

### Adding Qase IDs

You can associate Qase test case IDs with your scenarios using tags:

- Single ID: `@QaseID(123)`
- Multiple IDs: `@QaseID(123,456)`

The Qase reporter will automatically extract these IDs and link the test results to the corresponding test cases in Qase.

---

## Examples

### Complete Working Examples

Check out our example projects:

- **[@badeball/cypress-cucumber-preprocessor Example](../../examples/single/cypressBadeballCucumber/)** - Modern implementation with automatic step reporting
- **[cypress-cucumber-preprocessor Example](../../examples/single/cypressCucumber/)** - Legacy implementation

Each example includes:
- Complete Cypress configuration
- Feature files with Gherkin scenarios
- Step definitions
- Qase reporter integration
- Automatic step reporting setup

### Running the Examples

```bash
# Navigate to the example directory
cd examples/cypressBadeballCucumber

# Install dependencies
npm install

# Set your Qase credentials in cypress.config.js

# Run tests
npm test
```

---

## Troubleshooting

### Steps are not being reported

**For @badeball/cypress-cucumber-preprocessor:**
- Ensure you've created the `hooks.js` file with the `BeforeStep` hook
- Verify the file is in `cypress/support/step_definitions/` directory
- Check that you're importing `addCucumberStep` from `'cypress-qase-reporter/cucumber'`

**For cypress-cucumber-preprocessor (legacy):**
- Verify you've called `enableCucumberSupport()` in `cypress/support/e2e.js`
- Ensure you're importing from `'cypress-qase-reporter/cucumber'`

### Cypress command queue errors

If you see errors like "Cypress detected that you returned a promise from a command", make sure you're using the provided `addCucumberStep` function, which properly handles the Cypress command queue.

### Test results not appearing in Qase

- Verify your API token is correct in `cypress.config.js`
- Check that your project code matches your Qase project
- Enable `debug: true` in reporter options to see detailed logs
- Ensure `mode: 'TestOps'` is set in your configuration

---

## Additional Resources

- [Qase Reporter Configuration](../README.md#configuration)
- [Qase Reporter Usage Guide](./usage.md)
- [@badeball/cypress-cucumber-preprocessor Documentation](https://github.com/badeball/cypress-cucumber-preprocessor)
- [Cypress Documentation](https://docs.cypress.io/)
