import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('Example suite', () => {
    it('clicking "type" navigates to a new URL', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');
    });

    it('Gets, types and asserts 2', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();
        
        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');
        // Get an input, type into it and verify that the value has been updated
        cy.get('.action-email')
            .type('fake@email.com')
            .should('have.value', 'unexpected@email.com');
    });

    it.skip('Gets, types and asserts 3', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');

        // Get an input, type into it and verify that the value has been updated
        cy.get('.action-email')
            .type('fake@email.com')
            .should('have.value', 'unexpected@email.com');
    });

    it.skip('Gets, types and asserts 4', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');

        // Get an input, type into it and verify that the value has been updated
        cy.get('.action-email')
            .type('fake@email.com')
            .should('have.value', 'unexpected@email.com');
    });
});
