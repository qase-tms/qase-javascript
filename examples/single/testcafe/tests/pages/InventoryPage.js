import { Selector } from 'testcafe';

class InventoryPage {
  constructor() {
    this.items = Selector('.inventory_item');
    this.itemNames = Selector('[data-test="inventory-item-name"]');
    this.itemPrices = Selector('[data-test="inventory-item-price"]');
    this.sortDropdown = Selector('.product_sort_container');
    this.cartBadge = Selector('.shopping_cart_badge');
    this.cartLink = Selector('#shopping_cart_container a');
    this.pageTitle = Selector('.title');
  }

  addToCartButton(productSlug) {
    return Selector('[data-test="add-to-cart-' + productSlug + '"]');
  }

  removeButton(productSlug) {
    return Selector('[data-test="remove-' + productSlug + '"]');
  }
}

export default new InventoryPage();
