import { qase } from 'cypress-qase-reporter/dist/mocha';

describe('Example suite', () => {
    it('Clicking "type" navigates to a new url', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();

        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');
    });

    it('Gets, types and asserts', () => {
        cy.visit('https://example.cypress.io');

        cy.contains('type').click();
        
        // Should be on a new URL which includes '/commands/actions'
        cy.url().should('include', '/commands/actions');
        // Get an input, type into it and verify that the value has been updated
        cy.get('.action-email')
            .type('fake@email.com')
            .should('have.value', 'unexpected@email.com');
    });

    it.skip('Gets, types and asserts 2', () => {
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
