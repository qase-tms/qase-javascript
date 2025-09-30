# Cypress with @badeball/cypress-cucumber-preprocessor and Qase Integration

This example demonstrates how to use Cypress with the new `@badeball/cypress-cucumber-preprocessor` and integrate it with Qase reporter.

## Features

- Uses `@badeball/cypress-cucumber-preprocessor` (new version)
- Compatible with both old and new cucumber preprocessors
- Supports Qase ID tags (`@QaseID(1)`, `@QaseID(1,2)`)
- Automatic step detection and reporting
- Screenshot and video attachment support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Qase credentials in `cypress.config.js`:
```javascript
cypressQaseReporterReporterOptions: {
    testops: {
        api: {
            token: '<your_token>',
        },
        project: '<your_project_code>',
    },
}
```

3. Run tests:
```bash
npm test
```

## Configuration

The example uses `@badeball/cypress-cucumber-preprocessor` with automatic step reporting via hooks.

## Files Structure

- `cypress/e2e/*.feature` - Cucumber feature files
- `cypress/support/step_definitions/*.js` - Step definitions and hooks
- `cypress/support/e2e.js` - Support file
- `cypress.config.js` - Cypress configuration with preprocessor setup

## Qase Integration

The integration automatically:
- Creates test runs before execution
- Reports test results with execution status
- Extracts Qase IDs from `@QaseID` tags in scenario titles
- Captures and reports individual Cucumber steps
- Attaches screenshots and videos
- Completes test runs after execution
- Supports all Qase metadata (titles, fields, suites, etc.)

### Cucumber Steps Reporting

Steps are automatically captured using the `BeforeStep` hook in `cypress/support/step_definitions/hooks.js`:

```javascript
import { BeforeStep } from '@badeball/cypress-cucumber-preprocessor';
import { addCucumberStep } from 'cypress-qase-reporter/cucumber';

BeforeStep(function({ pickleStep }) {
  const keyword = pickleStep.keyword || '';
  const stepText = `${keyword}${pickleStep.text}`;
  addCucumberStep(stepText);
});
```

This automatically reports each Gherkin step (Given/When/Then) to Qase with its execution status (passed/failed).
