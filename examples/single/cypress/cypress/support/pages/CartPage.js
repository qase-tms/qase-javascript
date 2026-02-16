/**
 * Cart Page Object for saucedemo.com
 *
 * This page object encapsulates interactions with the shopping cart page.
 * Cypress page objects are simple classes that wrap cy commands.
 * They do NOT use async/await and return cy chains for further chaining.
 */
class CartPage {
  /**
   * Get all cart items
   * @returns {Cypress.Chainable} All cart items
   */
  getItems() {
    return cy.get('.cart_item');
  }

  /**
   * Get the product name in cart
   * @returns {Cypress.Chainable} The product name element
   */
  getItemName() {
    return cy.get('[data-test="inventory-item-name"]');
  }

  /**
   * Remove a product from cart by its slug
   * @param {string} productSlug - The product slug (e.g., 'sauce-labs-backpack')
   */
  removeItem(productSlug) {
    return cy.get(`[data-test="remove-${productSlug}"]`).click();
  }

  /**
   * Proceed to checkout
   */
  checkout() {
    return cy.get('[data-test="checkout"]').click();
  }

  /**
   * Continue shopping (return to inventory)
   */
  continueShopping() {
    return cy.get('[data-test="continue-shopping"]').click();
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
export default new CartPage();
