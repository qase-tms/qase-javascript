const { qase } = require('wdio-qase-reporter');
const LoginPage = require('../pageobjects/LoginPage');
const InventoryPage = require('../pageobjects/InventoryPage');
const CartPage = require('../pageobjects/CartPage');

describe('Cart Management', () => {
  beforeEach(async () => {
    await LoginPage.open();
    await LoginPage.login('standard_user', 'secret_sauce');
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/inventory.html'),
      { timeout: 5000 }
    );
  });

  it(qase(8, 'User can add product to cart'), async () => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCart\tAdd Items');
    qase.parameters({ product: 'Sauce Labs Backpack' });

    await qase.step('Add product to cart', async () => {
      await InventoryPage.addToCart('sauce-labs-backpack');
    });

    await qase.step('Verify cart badge shows item count', async () => {
      await expect(InventoryPage.cartBadge).toHaveText('1');
    });

    await qase.step('Navigate to cart page', async () => {
      await InventoryPage.goToCart();
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/cart.html'),
        { timeout: 5000 }
      );
    });

    await qase.step('Verify product is in cart', async () => {
      await expect(CartPage.pageTitle).toHaveText('Your Cart');
      await expect(CartPage.itemName).toHaveTextContaining('Backpack');
    });

    const cartState = {
      itemCount: 1,
      productAdded: 'Sauce Labs Backpack'
    };

    qase.attach({
      name: 'cart-state.json',
      content: JSON.stringify(cartState, null, 2),
      type: 'application/json'
    });

    qase.comment('Product successfully added to cart and visible on cart page');
  });

  it(qase(9, 'User can remove product from cart'), async () => {
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCart\tRemove Items');

    await qase.step('Add product to cart', async () => {
      await InventoryPage.addToCart('sauce-labs-backpack');
      await expect(InventoryPage.cartBadge).toHaveText('1');
    });

    await qase.step('Navigate to cart', async () => {
      await InventoryPage.goToCart();
    });

    await qase.step('Remove product from cart', async () => {
      await CartPage.removeItem('sauce-labs-backpack');
    });

    await qase.step('Verify cart is empty', async () => {
      const items = await CartPage.items;
      expect(items).toHaveLength(0);
    });

    qase.comment('Product successfully removed from cart');
  });

  it(qase(10, 'User can add multiple products to cart'), async () => {
    qase.fields({ severity: 'medium', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tCart\tMultiple Items');

    await qase.step('Add first product', async () => {
      await InventoryPage.addToCart('sauce-labs-backpack');
    });

    await qase.step('Add second product', async () => {
      await InventoryPage.addToCart('sauce-labs-bike-light');
    });

    await qase.step('Add third product', async () => {
      await InventoryPage.addToCart('sauce-labs-bolt-t-shirt');
    });

    await qase.step('Verify cart badge shows correct count', async () => {
      await expect(InventoryPage.cartBadge).toHaveText('3');
    });

    await qase.step('Navigate to cart and verify all items', async () => {
      await InventoryPage.goToCart();
      const items = await CartPage.items;
      expect(items).toHaveLength(3);
    });

    qase.comment('Multiple products can be added and are tracked correctly');
  });
});
