/**
 * Inventory Page Object for saucedemo.com
 *
 * This page object encapsulates interactions with the product inventory page.
 * Cypress page objects are simple classes that wrap cy commands.
 * They do NOT use async/await and return cy chains for further chaining.
 */
class InventoryPage {
  /**
   * Get all inventory items
   * @returns {Cypress.Chainable} All inventory items
   */
  getItems() {
    return cy.get('.inventory_item');
  }

  /**
   * Get all product names
   * @returns {Cypress.Chainable} All product name elements
   */
  getItemNames() {
    return cy.get('[data-test="inventory-item-name"]');
  }

  /**
   * Get all product prices
   * @returns {Cypress.Chainable} All product price elements
   */
  getItemPrices() {
    return cy.get('[data-test="inventory-item-price"]');
  }

  /**
   * Add a product to cart by its slug
   * @param {string} productSlug - The product slug (e.g., 'sauce-labs-backpack')
   */
  addToCart(productSlug) {
    return cy.get(`[data-test="add-to-cart-${productSlug}"]`).click();
  }

  /**
   * Remove a product from cart by its slug
   * @param {string} productSlug - The product slug (e.g., 'sauce-labs-backpack')
   */
  removeFromCart(productSlug) {
    return cy.get(`[data-test="remove-${productSlug}"]`).click();
  }

  /**
   * Get the shopping cart badge (displays number of items)
   * @returns {Cypress.Chainable} The cart badge element
   */
  getCartBadge() {
    return cy.get('.shopping_cart_badge');
  }

  /**
   * Navigate to the shopping cart
   */
  goToCart() {
    return cy.get('#shopping_cart_container a').click();
  }

  /**
   * Sort products by the given option
   * @param {string} value - Sort option value (e.g., 'az', 'za', 'lohi', 'hilo')
   */
  sortBy(value) {
    return cy.get('.product_sort_container').select(value);
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
export default new InventoryPage();
