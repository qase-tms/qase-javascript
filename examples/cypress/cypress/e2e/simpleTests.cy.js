import { qase } from 'cypress-qase-reporter/mocha';

describe('Simple tests', () => {

  it('test without metadata success', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test without metadata failed', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });

  qase(1, it('test with Qase ID success', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  }));

  qase(2, it('test with Qase ID failed', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  }));

  it('test with title success', () => {
    qase.title('Test with title success');
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test with title failed', () => {
    qase.title('Test with title failed');
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });

  it('test with fields success', () => {
    qase.fields({ 'description': 'My description' });
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test with fields failed', () => {
    qase.fields({ 'description': 'My description' });
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });

  it('test with ignore success', () => {
    qase.ignore();
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test with ignore failed', () => {
    qase.ignore();
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });

  it('test with suite success', () => {
    qase.suite('My suite');
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actions');
  });

  it('test with suite failed', () => {
    qase.suite('My suite');
    cy.visit('https://example.cypress.io');
    cy.contains('type').click();
    cy.url().should('include', '/commands/actionsss');
  });
});
