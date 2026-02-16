class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems = '.cart_item';
    this.itemName = '[data-test="inventory-item-name"]';
    this.itemPrice = '[data-test="inventory-item-price"]';
    this.checkoutButton = '[data-test="checkout"]';
    this.continueShoppingButton = '[data-test="continue-shopping"]';
    this.pageTitle = '.title';
  }

  async removeItem(productSlug) {
    await this.page.click(`[data-test="remove-${productSlug}"]`);
  }

  async getItemCount() {
    return await this.page.locator(this.cartItems).count();
  }

  async checkout() {
    await this.page.click(this.checkoutButton);
  }

  async continueShopping() {
    await this.page.click(this.continueShoppingButton);
  }
}

module.exports = CartPage;
