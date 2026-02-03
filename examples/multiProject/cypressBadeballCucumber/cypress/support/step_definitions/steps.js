import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the homepage', () => {
  cy.visit('https://example.cypress.io');
});

When('I click on the first link', () => {
  cy.visit('https://example.cypress.io');
});

Then('I should see the first link', () => {
  cy.get('a').first().click();
});
