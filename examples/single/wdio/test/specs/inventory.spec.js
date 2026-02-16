const { qase } = require('wdio-qase-reporter');
const LoginPage = require('../pageobjects/LoginPage');
const InventoryPage = require('../pageobjects/InventoryPage');

describe('Product Inventory', () => {
  beforeEach(async () => {
    await LoginPage.open();
    await LoginPage.login('standard_user', 'secret_sauce');
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/inventory.html'),
      { timeout: 5000 }
    );
  });

  it(qase(4, 'User can browse all products'), async () => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tProduct Catalog\tBrowsing');

    await qase.step('Verify page title', async () => {
      await expect(InventoryPage.pageTitle).toHaveText('Products');
    });

    await qase.step('Count products displayed', async () => {
      const items = await InventoryPage.items;
      expect(items).toHaveLength(6);
    });

    await qase.step('Verify product details are visible', async () => {
      const names = await InventoryPage.itemNames;
      const prices = await InventoryPage.itemPrices;

      expect(await names[0].isDisplayed()).toBe(true);
      expect(await prices[0].isDisplayed()).toBe(true);
      expect(await prices[0].getText()).toMatch(/\$\d+\.\d{2}/);
    });

    qase.comment('All products are correctly displayed with prices and details');

    const productData = {
      totalProducts: 6,
      firstProduct: await (await InventoryPage.itemNames)[0].getText(),
      firstPrice: await (await InventoryPage.itemPrices)[0].getText()
    };

    qase.attach({
      name: 'product-list.json',
      content: JSON.stringify(productData, null, 2),
      type: 'application/json'
    });
  });

  it(qase(5, 'User can sort products by price'), async () => {
    qase.fields({ severity: 'medium', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tProduct Catalog\tSorting');
    qase.parameters({ sortOption: 'lohi' });

    await qase.step('Select sort by price low to high', async () => {
      await InventoryPage.sortBy('lohi');
    });

    await qase.step('Verify products are sorted by ascending price', async () => {
      const prices = await InventoryPage.itemPrices;
      const priceTexts = await Promise.all(prices.map(async p => await p.getText()));
      const priceValues = priceTexts.map(p => parseFloat(p.replace('$', '')));

      for (let i = 0; i < priceValues.length - 1; i++) {
        expect(priceValues[i]).toBeLessThanOrEqual(priceValues[i + 1]);
      }
    });

    qase.comment('Products correctly sorted by price in ascending order');
  });

  it(qase([6, 7], 'User can view product details'), async () => {
    qase.fields({ severity: 'medium', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tProduct Catalog\tDetails');

    let productName;

    await qase.step('Click on product name', async () => {
      const names = await InventoryPage.itemNames;
      productName = await names[0].getText();
      await names[0].click();
    });

    await qase.step('Verify navigation to product detail page', async () => {
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('inventory-item.html'),
        { timeout: 5000 }
      );
      expect(await browser.getUrl()).toContain('inventory-item.html');
    });

    qase.comment('Demonstrates multiple test IDs linked to same test case');
    qase.parameters({ productClicked: productName });
  });
});
