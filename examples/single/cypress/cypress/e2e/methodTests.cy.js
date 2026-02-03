import { qase } from 'cypress-qase-reporter/mocha';

describe('Method tests', () => {
  it('test with comment success', () => {
    qase.comment('My comment');
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test with comment failed', () => {
    qase.comment('My comment');
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });

  it('test with attach success', () => {
    qase.attach({ name: 'log.txt', content: 'My content', contentType: 'text/plain' });
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test with attach failed', () => {
    qase.attach({ name: 'log.txt', content: 'My content', contentType: 'text/plain' });
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });
});
