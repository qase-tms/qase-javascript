const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');
const LoginPage = require('./pages/LoginPage');
const InventoryPage = require('./pages/InventoryPage');

test.describe('Product Inventory', () => {
  let loginPage;
  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test(qase(4, 'User can browse all products'), async ({ page }) => {
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tInventory\tBrowsing');

    await test.step('Verify inventory page title', async () => {
      const title = await page.locator(inventoryPage.pageTitle).textContent();
      expect(title).toBe('Products');
    });

    await test.step('Count available products', async () => {
      const itemCount = await inventoryPage.getItemCount();
      expect(itemCount).toBe(6);
      qase.comment(`Found ${itemCount} products available in the inventory`);
    });

    await test.step('Verify product details are visible', async () => {
      const productCount = { total: 6, withPrices: 6, withNames: 6 };
      qase.attach({
        name: 'product-count.json',
        content: JSON.stringify(productCount, null, 2),
        contentType: 'application/json'
      });
    });
  });

  test(qase(5, 'User can sort products by price'), async ({ page }) => {
    qase.fields({ severity: 'medium', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tInventory\tSorting');
    qase.parameters({ sortOption: 'lohi' });

    await test.step('Select sort by price (low to high)', async () => {
      await inventoryPage.sortBy('lohi');
    });

    await test.step('Verify products are sorted correctly', async () => {
      const prices = await page.locator(inventoryPage.itemPrice).allTextContents();
      const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));

      const isSorted = numericPrices.every((price, i) => {
        return i === 0 || numericPrices[i - 1] <= price;
      });

      expect(isSorted).toBe(true);
    });
  });

  test(qase(6, 'User can view product details'), async ({ page }) => {
    qase.fields({ severity: 'medium', priority: 'low', layer: 'e2e' });
    qase.suite('E-commerce\tInventory\tProduct Details');

    await test.step('Click on first product', async () => {
      await page.locator(inventoryPage.itemName).first().click();
    });

    await test.step('Verify product detail page is displayed', async () => {
      await expect(page).toHaveURL(/.*inventory-item.html/);
      const backButton = page.locator('[data-test="back-to-products"]');
      await expect(backButton).toBeVisible();
    });
  });
});
