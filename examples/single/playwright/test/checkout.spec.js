const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');
const LoginPage = require('./pages/LoginPage');
const InventoryPage = require('./pages/InventoryPage');
const CartPage = require('./pages/CartPage');
const CheckoutPage = require('./pages/CheckoutPage');

test.describe('Checkout Process', () => {
  let loginPage;
  let inventoryPage;
  let cartPage;
  let checkoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/.*inventory.html/);

    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
  });

  test(qase(10, 'User can complete checkout with valid information'), async ({ page }) => {
    qase.fields({ severity: 'critical', priority: 'critical', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tComplete Flow');
    qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

    await test.step('Fill checkout information', async () => {
      await test.step('Enter customer details', async () => {
        await checkoutPage.fillInfo('John', 'Doe', '12345');
      });

      await test.step('Continue to overview', async () => {
        await checkoutPage.continue();
        await expect(page).toHaveURL(/.*checkout-step-two.html/);
      });
    });

    await test.step('Complete the order', async () => {
      await checkoutPage.finish();
      await expect(page).toHaveURL(/.*checkout-complete.html/);
    });

    await test.step('Verify order completion', async () => {
      const completeMessage = await checkoutPage.getCompleteMessage();
      expect(completeMessage).toContain('Thank you for your order');
      qase.attach({
        name: 'order-complete.txt',
        content: completeMessage,
        contentType: 'text/plain'
      });
    });
  });

  test(qase(11, 'Checkout fails without required information'), async ({ page }) => {
    qase.fields({ severity: 'medium', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tValidation');
    qase.parameters({ scenario: 'missing_first_name' });

    await test.step('Attempt to continue without filling first name', async () => {
      await checkoutPage.continue();
    });

    await test.step('Verify error message is displayed', async () => {
      const errorMessage = await page.locator(checkoutPage.errorMessage).textContent();
      expect(errorMessage).toContain('Error: First Name is required');
    });
  });

  test(qase(12, 'User can cancel checkout'), async ({ page }) => {
    qase.fields({ severity: 'low', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tNavigation');

    await test.step('Click cancel button', async () => {
      await page.click(checkoutPage.cancelButton);
    });

    await test.step('Verify return to cart page', async () => {
      await expect(page).toHaveURL(/.*cart.html/);
      const title = await page.locator(cartPage.pageTitle).textContent();
      expect(title).toBe('Your Cart');
    });
  });

  test(qase(13, 'Guest checkout (not implemented)'), async ({ page }) => {
    qase.ignore();
    qase.fields({ severity: 'high', priority: 'low', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tGuest Flow');
    qase.comment('This test is ignored as guest checkout feature is not yet implemented in the demo app');

    // Placeholder test for future guest checkout functionality
    expect(true).toBe(true);
  });
});
