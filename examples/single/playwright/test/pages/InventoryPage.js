class InventoryPage {
  constructor(page) {
    this.page = page;
    this.inventoryItems = '.inventory_item';
    this.itemName = '[data-test="inventory-item-name"]';
    this.itemPrice = '[data-test="inventory-item-price"]';
    this.sortDropdown = '.product_sort_container';
    this.cartBadge = '.shopping_cart_badge';
    this.cartLink = '#shopping_cart_container a';
    this.pageTitle = '.title';
  }

  async addToCart(productSlug) {
    await this.page.click(`[data-test="add-to-cart-${productSlug}"]`);
  }

  async removeFromCart(productSlug) {
    await this.page.click(`[data-test="remove-${productSlug}"]`);
  }

  async getItemCount() {
    return await this.page.locator(this.inventoryItems).count();
  }

  async sortBy(optionValue) {
    await this.page.selectOption(this.sortDropdown, optionValue);
  }

  async goToCart() {
    await this.page.click(this.cartLink);
  }
}

module.exports = InventoryPage;
