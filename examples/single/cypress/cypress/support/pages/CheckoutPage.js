/**
 * Checkout Page Object for saucedemo.com
 *
 * This page object encapsulates interactions with the checkout flow pages.
 * Cypress page objects are simple classes that wrap cy commands.
 * They do NOT use async/await and return cy chains for further chaining.
 */
class CheckoutPage {
  /**
   * Fill in the first name field
   * @param {string} name - The first name to enter
   */
  fillFirstName(name) {
    return cy.get('[data-test="firstName"]').type(name);
  }

  /**
   * Fill in the last name field
   * @param {string} name - The last name to enter
   */
  fillLastName(name) {
    return cy.get('[data-test="lastName"]').type(name);
  }

  /**
   * Fill in the postal code field
   * @param {string} code - The postal code to enter
   */
  fillPostalCode(code) {
    return cy.get('[data-test="postalCode"]').type(code);
  }

  /**
   * Fill in all checkout information fields
   * @param {string} first - First name
   * @param {string} last - Last name
   * @param {string} zip - Postal code
   */
  fillInfo(first, last, zip) {
    this.fillFirstName(first);
    this.fillLastName(last);
    this.fillPostalCode(zip);
  }

  /**
   * Continue to the next step
   */
  continue() {
    return cy.get('[data-test="continue"]').click();
  }

  /**
   * Cancel checkout and return to cart
   */
  cancel() {
    return cy.get('[data-test="cancel"]').click();
  }

  /**
   * Complete the order
   */
  finish() {
    return cy.get('[data-test="finish"]').click();
  }

  /**
   * Get the checkout complete header message
   * @returns {Cypress.Chainable} The complete header element
   */
  getCompleteHeader() {
    return cy.get('.complete-header');
  }

  /**
   * Get the error message element
   * @returns {Cypress.Chainable} The error element
   */
  getError() {
    return cy.get('[data-test="error"]');
  }

  /**
   * Get the page title
   * @returns {Cypress.Chainable} The title element
   */
  getTitle() {
    return cy.get('.title');
  }
}

// Export singleton instance
export default new CheckoutPage();
