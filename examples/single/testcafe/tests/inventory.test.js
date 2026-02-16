import { qase } from 'testcafe-reporter-qase/qase';
import loginPage from './pages/LoginPage.js';
import inventoryPage from './pages/InventoryPage.js';

fixture`Product Inventory`
  .page`https://www.saucedemo.com`
  .beforeEach(async t => {
    // Login before each inventory test
    await t
      .typeText(loginPage.usernameInput, 'standard_user')
      .typeText(loginPage.passwordInput, 'secret_sauce')
      .click(loginPage.loginButton);
    await t.expect(inventoryPage.pageTitle.innerText).eql('Products');
  });

test.meta(qase.id(4).title('Browse all products').fields({
  severity: 'critical',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tInventory\tBrowse').create())('Browse products', async t => {
  await qase.step('Verify inventory page title', async () => {
    await t.expect(inventoryPage.pageTitle.innerText).eql('Products', 'Page title should be Products');
  });

  await qase.step('Verify product count', async () => {
    const itemCount = await inventoryPage.items.count;
    await t.expect(itemCount).eql(6, 'Should display 6 products');
  });

  await qase.step('Verify product details visible', async (s1) => {
    await s1.step('Check product names', async () => {
      const nameCount = await inventoryPage.itemNames.count;
      await t.expect(nameCount).gte(1, 'Product names should be visible');
    });

    await s1.step('Check product prices', async () => {
      const priceCount = await inventoryPage.itemPrices.count;
      await t.expect(priceCount).gte(1, 'Product prices should be visible');
    });
  });

  await qase.comment('All products successfully displayed with correct details');

  // Gather product data for attachment
  const productData = {
    totalProducts: await inventoryPage.items.count,
    timestamp: new Date().toISOString()
  };

  await qase.attach({
    name: 'product-inventory.json',
    content: JSON.stringify(productData, null, 2),
    type: 'application/json'
  });
});

test.meta(qase.id(5).title('Sort products by price').fields({
  severity: 'medium',
  priority: 'medium',
  layer: 'e2e'
}).suite('E-commerce\tInventory\tSort').parameters({
  sortOption: 'lohi'
}).create())('Sort products', async t => {
  await qase.step('Select price low to high sort', async () => {
    await t
      .click(inventoryPage.sortDropdown)
      .click(inventoryPage.sortDropdown.find('option').withText('Price (low to high)'));
  });

  await qase.step('Verify products sorted', async () => {
    const firstPrice = await inventoryPage.itemPrices.nth(0).innerText;
    const lastPrice = await inventoryPage.itemPrices.nth(5).innerText;

    // Extract numeric values (remove $ and convert to number)
    const firstValue = parseFloat(firstPrice.replace('$', ''));
    const lastValue = parseFloat(lastPrice.replace('$', ''));

    await t.expect(firstValue).lte(lastValue, 'First product should be cheaper than or equal to last');
  });

  await qase.comment('Products correctly sorted by price ascending');
});

test.meta(qase.id(6).title('View product details').fields({
  severity: 'medium',
  priority: 'medium',
  layer: 'e2e'
}).suite('E-commerce\tInventory\tDetails').create())('Product details', async t => {
  await qase.step('Click on first product', async () => {
    await t.click(inventoryPage.itemNames.nth(0));
  });

  await qase.step('Verify product detail page loaded', async () => {
    const url = await t.eval(() => window.location.href);
    await t.expect(url).contains('inventory-item.html', 'Should navigate to product detail page');
  });

  await qase.step('Verify back button exists', async () => {
    const backButton = await t.eval(() => !!document.querySelector('[data-test="back-to-products"]'));
    await t.expect(backButton).ok('Back button should be visible on detail page');
  });

  await qase.comment('Product detail page successfully loaded with navigation');
});
