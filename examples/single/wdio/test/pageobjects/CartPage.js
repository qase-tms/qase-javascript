class CartPage {
  get items() { return $$('.cart_item'); }
  get itemName() { return $('[data-test="inventory-item-name"]'); }
  get itemPrice() { return $('[data-test="inventory-item-price"]'); }
  get checkoutButton() { return $('[data-test="checkout"]'); }
  get continueShoppingButton() { return $('[data-test="continue-shopping"]'); }
  get pageTitle() { return $('.title'); }

  async removeItem(productSlug) {
    await $('[data-test="remove-' + productSlug + '"]').click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}

module.exports = new CartPage();
