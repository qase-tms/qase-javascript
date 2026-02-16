const { qase } = require('wdio-qase-reporter');
const LoginPage = require('../pageobjects/LoginPage');
const InventoryPage = require('../pageobjects/InventoryPage');
const CartPage = require('../pageobjects/CartPage');
const CheckoutPage = require('../pageobjects/CheckoutPage');

describe('Checkout Flow', () => {
  beforeEach(async () => {
    await LoginPage.open();
    await LoginPage.login('standard_user', 'secret_sauce');
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/inventory.html'),
      { timeout: 5000 }
    );
    await InventoryPage.addToCart('sauce-labs-backpack');
    await InventoryPage.goToCart();
    await CartPage.checkout();
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/checkout-step-one.html'),
      { timeout: 5000 }
    );
  });

  it(qase(11, 'User can complete checkout with valid information'), async () => {
    qase.fields({ severity: 'critical', priority: 'critical', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tComplete Purchase');
    qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

    await qase.step('Fill checkout information', async (step) => {
      await step.step('Enter first name', async () => {
        await CheckoutPage.firstNameInput.setValue('John');
      });

      await step.step('Enter last name', async () => {
        await CheckoutPage.lastNameInput.setValue('Doe');
      });

      await step.step('Enter postal code', async () => {
        await CheckoutPage.postalCodeInput.setValue('12345');
      });
    });

    await qase.step('Continue to checkout overview', async () => {
      await CheckoutPage.continue();
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/checkout-step-two.html'),
        { timeout: 5000 }
      );
    });

    await qase.step('Complete the order', async () => {
      await CheckoutPage.finish();
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/checkout-complete.html'),
        { timeout: 5000 }
      );
    });

    await qase.step('Verify order completion', async () => {
      await expect(CheckoutPage.completeHeader).toHaveTextContaining('Thank you');
    });

    qase.attach({
      name: 'order-complete.txt',
      content: 'Order completed successfully for John Doe at 12345',
      type: 'text/plain'
    });

    qase.comment('Checkout completed successfully with nested step demonstration');
  });

  it(qase(12, 'Checkout fails without required information'), async () => {
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tValidation');
    qase.parameters({ scenario: 'missing_first_name' });

    await qase.step('Leave first name empty and continue', async () => {
      await CheckoutPage.lastNameInput.setValue('Doe');
      await CheckoutPage.postalCodeInput.setValue('12345');
      await CheckoutPage.continue();
    });

    await qase.step('Verify error message is shown', async () => {
      await expect(CheckoutPage.errorMessage).toBeDisplayed();
      await expect(CheckoutPage.errorMessage).toHaveTextContaining('First Name is required');
    });

    qase.comment('Form validation correctly prevents checkout without required fields');
  });

  it(qase(13, 'User can cancel checkout'), async () => {
    qase.fields({ severity: 'low', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tCancel');

    await qase.step('Fill partial information', async () => {
      await CheckoutPage.fillInfo('John', 'Doe', '12345');
    });

    await qase.step('Click cancel button', async () => {
      await CheckoutPage.cancel();
    });

    await qase.step('Verify return to cart page', async () => {
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/cart.html'),
        { timeout: 5000 }
      );
      await expect(browser).toHaveUrl('https://www.saucedemo.com/cart.html');
    });

    qase.comment('User can safely cancel checkout and return to cart');
  });

  it(qase.ignore(), 'Ignored test example', async () => {
    // This test is ignored for demonstration purposes
    await expect(true).toBe(true);
  });
});
