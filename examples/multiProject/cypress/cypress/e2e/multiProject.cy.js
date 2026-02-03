const { qase } = require('cypress-qase-reporter/mocha');

describe('Multi-project example', () => {
  // Map this test to case 1 in PROJ1 and case 2 in PROJ2. Replace IDs with real case IDs in your projects.
  qase.projects({ PROJ1: [1], PROJ2: [2] }, it('A test reported to two projects', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  }));

  qase.projects(
    { PROJ1: [10, 11], PROJ2: [20] },
    it('Another test with multiple cases per project', () => {
      cy.visit('https://example.cypress.io');
      cy.contains('type').click();
      cy.url().should('include', '/commands/actions');
    }),
  );
});
