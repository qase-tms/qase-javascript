const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');
const LoginPage = require('./pages/LoginPage');
const InventoryPage = require('./pages/InventoryPage');
const CartPage = require('./pages/CartPage');

test.describe('Shopping Cart', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test(qase(7, 'User can add product to cart'), async ({ page }) => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tShopping Cart\tAdd Items');
    qase.parameters({ product: 'Sauce Labs Backpack' });

    await test.step('Add product to cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Verify cart badge shows 1 item', async () => {
      const cartBadge = await page.locator(inventoryPage.cartBadge).textContent();
      expect(cartBadge).toBe('1');
    });

    await test.step('Navigate to cart and verify product', async () => {
      await inventoryPage.goToCart();
      await expect(page).toHaveURL(/.*cart.html/);

      const itemCount = await cartPage.getItemCount();
      expect(itemCount).toBe(1);

      const cartState = { itemsInCart: 1, product: 'Sauce Labs Backpack' };
      qase.attach({
        name: 'cart-state.json',
        content: JSON.stringify(cartState, null, 2),
        contentType: 'application/json'
      });
    });
  });

  test(qase(8, 'User can remove product from cart'), async ({ page }) => {
    qase.fields({ severity: 'medium', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tShopping Cart\tRemove Items');

    await test.step('Add product to cart', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Navigate to cart', async () => {
      await inventoryPage.goToCart();
      await expect(page).toHaveURL(/.*cart.html/);
    });

    await test.step('Remove product from cart', async () => {
      await cartPage.removeItem('sauce-labs-backpack');
    });

    await test.step('Verify cart is empty', async () => {
      const itemCount = await cartPage.getItemCount();
      expect(itemCount).toBe(0);

      const cartBadge = page.locator(inventoryPage.cartBadge);
      await expect(cartBadge).not.toBeVisible();
    });
  });

  test(qase(9, 'User can add multiple products to cart'), async ({ page }) => {
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tShopping Cart\tMultiple Items');

    await test.step('Add first product', async () => {
      await inventoryPage.addToCart('sauce-labs-backpack');
    });

    await test.step('Add second product', async () => {
      await inventoryPage.addToCart('sauce-labs-bike-light');
    });

    await test.step('Verify cart badge shows 2 items', async () => {
      const cartBadge = await page.locator(inventoryPage.cartBadge).textContent();
      expect(cartBadge).toBe('2');
    });
  });
});
