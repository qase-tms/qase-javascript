import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps';

Given('I am on the homepage', () => {
  cy.visit('https://example.cypress.io');
});

When('I click on the first link', () => {
  cy.visit('https://example.cypress.io');
});

Then('I should see the first link', () => {
  cy.get('a').first().click();
});


When('I should see the first link failed', () => {
  cy.get('a').first().click();
  throw new Error('This step failed');
});
