import { qase } from 'cypress-qase-reporter/mocha';

describe('Step tests', () => {
  it('test with steps success', () => {
    qase.step('Step 1', () => {
      cy.visit('https://example.cypress.io');
    });
    qase.step('Step 2', () => {
      cy.contains('type').click();
    });
    qase.step('Step 3', () => {
      cy.url().should('include', '/commands/actions');
    });
  });

  it('test with steps failed', () => {
    qase.step('Step 1', () => {
      cy.visit('https://example.cypress.io');
    });
    qase.step('Step 2', () => {
      cy.contains('type').click();
    });
    qase.step('Step 3', () => {
      cy.url().should('include', '/commands/actionsss');
    });
  });
});
