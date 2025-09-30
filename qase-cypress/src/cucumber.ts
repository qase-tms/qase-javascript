/// <reference types="cypress" />

declare const window: any;

interface CypressLogEntry {
  attributes: {
    name: string;
    message: string;
    displayName?: string;
    event: boolean;
    instrument: string;
  };
}

const CUCUMBER_TASK_NAME = 'qaseCucumberStepStart';

/**
 * Enable automatic Cucumber step reporting for cypress-cucumber-preprocessor (legacy).
 * This function automatically captures Gherkin steps and reports them to Qase.
 * 
 * @example
 * ```javascript
 * // In cypress/support/e2e.js
 * import { enableCucumberSupport } from 'cypress-qase-reporter/cucumber';
 * 
 * enableCucumberSupport();
 * ```
 */
export const enableCucumberSupport = () => {
  Cypress.on('log:added', handleLogAdded);
};

const handleLogAdded = (_: Cypress.ObjectLike, entry: CypressLogEntry) => {
  if (isCucumberStep(entry)) {
    processCucumberStep(entry);
  }
};

const isCucumberStep = (entry: CypressLogEntry): boolean => {
  const { attributes: { name, event, instrument } } = entry;
  return instrument === 'command' && !event && name === 'step';
};

const processCucumberStep = (entry: CypressLogEntry) => {
  const { attributes: { displayName, message } } = entry;
  sendTaskMessage(`${displayName ?? ''} ${message}`);
};

const sendTaskMessage = (message: string) => {
  cy.task(CUCUMBER_TASK_NAME, message, { log: false });
};

/**
 * Manually add a cucumber step to Qase report.
 * Use this function in Before/After hooks or directly in step definitions
 * when using @badeball/cypress-cucumber-preprocessor.
 * 
 * @param stepName - The name of the step (e.g., "Given I am on the homepage")
 * 
 * @example
 * ```typescript
 * import { Before } from '@badeball/cypress-cucumber-preprocessor';
 * import { addCucumberStep } from 'cypress-qase-reporter/cucumber';
 * 
 * Before(function() {
 *   addCucumberStep(this.pickle.name);
 * });
 * ```
 */
export const addCucumberStep = (stepName: string): void => {
  // Use Cypress.log to avoid command queue issues
  // The step will be collected by MetadataManager
  try {
    if (stepName && stepName.trim()) {
      Cypress.log({
        name: 'qase:step',
        message: stepName,
        consoleProps: () => ({
          Step: stepName,
        }),
      });
      
      // Also send to task for backend collection
      // We need to wrap this in a way that doesn't interfere with command queue
      cy.then(() => {
        cy.task(CUCUMBER_TASK_NAME, stepName, { log: false });
      });
    }
  } catch (e) {
    // Silently fail if Cypress is not available
    console.debug('Failed to add cucumber step:', e);
  }
};
