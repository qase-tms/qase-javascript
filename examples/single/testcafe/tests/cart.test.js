import { qase } from 'testcafe-reporter-qase/qase';
import loginPage from './pages/LoginPage.js';
import inventoryPage from './pages/InventoryPage.js';
import cartPage from './pages/CartPage.js';

fixture`Cart Management`
  .page`https://www.saucedemo.com`
  .beforeEach(async t => {
    // Login before each cart test
    await t
      .typeText(loginPage.usernameInput, 'standard_user')
      .typeText(loginPage.passwordInput, 'secret_sauce')
      .click(loginPage.loginButton);
    await t.expect(inventoryPage.pageTitle.innerText).eql('Products');
  });

test.meta(qase.id(7).title('Add product to cart').fields({
  severity: 'critical',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tCart\tAdd Items').parameters({
  product: 'Sauce Labs Backpack'
}).create())('Add to cart', async t => {
  await qase.step('Add Sauce Labs Backpack to cart', async () => {
    await t.click(inventoryPage.addToCartButton('sauce-labs-backpack'));
  });

  await qase.step('Verify cart badge shows 1', async () => {
    await t.expect(inventoryPage.cartBadge.innerText).eql('1', 'Cart badge should show 1 item');
  });

  await qase.step('Navigate to cart', async () => {
    await t.click(inventoryPage.cartLink);
  });

  await qase.step('Verify product in cart', async () => {
    await t.expect(cartPage.pageTitle.innerText).eql('Your Cart');
    const itemCount = await cartPage.items.count;
    await t.expect(itemCount).eql(1, 'Cart should contain 1 item');

    const itemName = await cartPage.itemName.innerText;
    await t.expect(itemName).eql('Sauce Labs Backpack', 'Correct product in cart');
  });

  await qase.comment('Product successfully added to cart and visible in cart page');

  await qase.attach({
    name: 'cart-state.txt',
    content: 'Product: Sauce Labs Backpack\nQuantity: 1\nStatus: Added',
    type: 'text/plain'
  });
});

test.meta(qase.id(8).title('Remove product from cart').fields({
  severity: 'high',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tCart\tRemove Items').create())('Remove from cart', async t => {
  await qase.step('Add product to cart', async () => {
    await t.click(inventoryPage.addToCartButton('sauce-labs-backpack'));
    await t.expect(inventoryPage.cartBadge.innerText).eql('1');
  });

  await qase.step('Navigate to cart', async () => {
    await t.click(inventoryPage.cartLink);
  });

  await qase.step('Remove product from cart', async () => {
    await t.click(cartPage.removeButton('sauce-labs-backpack'));
  });

  await qase.step('Verify cart is empty', async () => {
    const itemCount = await cartPage.items.count;
    await t.expect(itemCount).eql(0, 'Cart should be empty');
    await t.expect(inventoryPage.cartBadge.exists).notOk('Cart badge should not be visible');
  });

  await qase.comment('Product successfully removed from cart');
});

test.meta(qase.id(9).title('Add multiple products to cart').fields({
  severity: 'critical',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tCart\tAdd Items').create())('Add multiple products', async t => {
  await qase.step('Add first product', async () => {
    await t.click(inventoryPage.addToCartButton('sauce-labs-backpack'));
    await t.expect(inventoryPage.cartBadge.innerText).eql('1', 'Cart badge should show 1');
  });

  await qase.step('Add second product', async () => {
    await t.click(inventoryPage.addToCartButton('sauce-labs-bike-light'));
    await t.expect(inventoryPage.cartBadge.innerText).eql('2', 'Cart badge should show 2');
  });

  await qase.step('Navigate to cart and verify', async () => {
    await t.click(inventoryPage.cartLink);
    const itemCount = await cartPage.items.count;
    await t.expect(itemCount).eql(2, 'Cart should contain 2 items');
  });

  await qase.comment('Multiple products successfully added to cart');

  await qase.attach({
    name: 'multi-cart.json',
    content: JSON.stringify({
      products: ['Sauce Labs Backpack', 'Sauce Labs Bike Light'],
      totalItems: 2
    }, null, 2),
    type: 'application/json'
  });
});
