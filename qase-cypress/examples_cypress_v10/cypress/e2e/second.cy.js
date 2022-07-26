import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('My First Test', () => {
    qase(1, it('clicking "type" navigates to a new url', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');
    }));

    qase(2, it('Gets, types and asserts', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');
        // Get an input, type into it and verify that the value has been updated
        cy.get('.action-email')
            .type('fake@email.com')
            .should('have.value', 'unexpected@email.com');
    }));

    qase(3, it.skip('Gets, types and asserts', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');

        // Get an input, type into it and verify that the value has been updated
        cy.get('.action-email')
            .type('fake@email.com')
            .should('have.value', 'unexpected@email.com');
    }));

    it('Go to utilities', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('Utilities').click();

        // Should be on a new URL which includes 'utilities'
        cy.url().should('include', 'utilities');
    });

    describe('Test Suite - Level 2', () => {
        it('Go to Cypress API', () => {
            cy.visit('https://example.cypress.io');

            cy.contains('Cypress API').click();

            // Should be on a new URL which includes 'utilities'
            cy.url().should('include', 'cypress-api');
        });
    });
});
