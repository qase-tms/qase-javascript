import { Selector } from 'testcafe';

class CartPage {
  constructor() {
    this.items = Selector('.cart_item');
    this.itemName = Selector('[data-test="inventory-item-name"]');
    this.itemPrice = Selector('[data-test="inventory-item-price"]');
    this.checkoutButton = Selector('[data-test="checkout"]');
    this.continueShoppingButton = Selector('[data-test="continue-shopping"]');
    this.pageTitle = Selector('.title');
  }

  removeButton(productSlug) {
    return Selector('[data-test="remove-' + productSlug + '"]');
  }
}

export default new CartPage();
