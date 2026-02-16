/**
 * Login Page Object for saucedemo.com
 *
 * This page object encapsulates the login page interactions.
 * Cypress page objects are simple classes that wrap cy commands.
 * They do NOT use async/await and return cy chains for further chaining.
 */
class LoginPage {
  /**
   * Navigate to the login page
   */
  visit() {
    return cy.visit('https://www.saucedemo.com');
  }

  /**
   * Fill in the username field
   * @param {string} username - The username to enter
   */
  fillUsername(username) {
    return cy.get('[data-test="username"]').type(username);
  }

  /**
   * Fill in the password field
   * @param {string} password - The password to enter
   */
  fillPassword(password) {
    return cy.get('[data-test="password"]').type(password);
  }

  /**
   * Click the login button
   */
  submit() {
    return cy.get('[data-test="login-button"]').click();
  }

  /**
   * Complete login flow
   * @param {string} username - The username to use
   * @param {string} password - The password to use
   */
  login(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.submit();
  }

  /**
   * Get the error message element
   * @returns {Cypress.Chainable} The error element
   */
  getError() {
    return cy.get('[data-test="error"]');
  }
}

// Export singleton instance
export default new LoginPage();
