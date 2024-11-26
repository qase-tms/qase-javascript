import { qase } from 'cypress-qase-reporter/mocha';

describe('Parametrized tests', () => {
  let ids = [1, 2, 3, 4, 5];

  for (let i = 0; i < ids.length; i++) {
    it(`Test with parameter success`, () => {
      qase.parameters({ 'some_parameter': ids[i].toString() });
      cy.visit('https://example.cypress.io');
      cy.contains('type').click();
      cy.url().should('include', '/commands/actions');
    });

    it(`Test with parameter failed`, () => {
      qase.parameters({ 'some_parameter': ids[i].toString() });
      cy.visit('https://example.cypress.io');
      cy.contains('type').click();
      cy.url().should('include', '/commands/actionsss');
    });
  }
});
