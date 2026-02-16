const { qase } = require('wdio-qase-reporter');

describe('Multi-project Login Scenarios', () => {
  // Report login test to PROJ1 (case 1) and PROJ2 (case 2)
  it(qase.projects({ PROJ1: [1], PROJ2: [2] }, 'User can login with valid credentials'), async () => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');

    await qase.step('Open login page', async () => {
      await browser.url('https://www.saucedemo.com');
      await expect($('[data-test="username"]')).toBeDisplayed();
    });

    await qase.step('Enter valid credentials and submit', async () => {
      await $('[data-test="username"]').setValue('standard_user');
      await $('[data-test="password"]').setValue('secret_sauce');
      await $('[data-test="login-button"]').click();
    });

    await qase.step('Verify successful login', async () => {
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/inventory.html'),
        { timeout: 5000, timeoutMsg: 'Expected to navigate to inventory page' }
      );
      await expect(browser).toHaveUrl('https://www.saucedemo.com/inventory.html');
    });

    qase.comment('Login successful — reported to both PROJ1 and PROJ2');
    qase.attach({
      name: 'login-credentials.txt',
      content: 'Username: standard_user\nPassword: secret_sauce',
      type: 'text/plain'
    });
  });

  // Report invalid login to PROJ1 (case 3) and PROJ2 (case 4)
  it(qase.projects({ PROJ1: [3], PROJ2: [4] }, 'Invalid password shows error'), async () => {
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');
    qase.parameters({ username: 'standard_user', password: 'wrong_password' });

    await qase.step('Open login page', async () => {
      await browser.url('https://www.saucedemo.com');
    });

    await qase.step('Enter invalid credentials', async () => {
      await $('[data-test="username"]').setValue('standard_user');
      await $('[data-test="password"]').setValue('wrong_password');
      await $('[data-test="login-button"]').click();
    });

    await qase.step('Verify error message is displayed', async () => {
      await expect($('[data-test="error"]')).toBeDisplayed();
      await expect($('[data-test="error"]')).toHaveTextContaining('Username and password do not match');
    });

    qase.comment('Error message correctly displayed — tracked in both projects');
  });
});

describe('Multi-project Cart Scenarios', () => {
  beforeEach(async () => {
    await browser.url('https://www.saucedemo.com');
    await $('[data-test="username"]').setValue('standard_user');
    await $('[data-test="password"]').setValue('secret_sauce');
    await $('[data-test="login-button"]').click();
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/inventory.html'),
      { timeout: 5000 }
    );
  });

  // Report cart test to PROJ1 (cases 5, 6) and PROJ2 (case 7)
  it(qase.projects({ PROJ1: [5, 6], PROJ2: [7] }, 'User can add product to cart'), async () => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCart\tAdd Items');
    qase.parameters({ product: 'Sauce Labs Backpack' });

    await qase.step('Add product to cart', async () => {
      await $('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    });

    await qase.step('Verify cart badge shows item count', async () => {
      await expect($('.shopping_cart_badge')).toHaveText('1');
    });

    await qase.step('Navigate to cart page', async () => {
      await $('.shopping_cart_link').click();
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/cart.html'),
        { timeout: 5000 }
      );
    });

    await qase.step('Verify product is in cart', async () => {
      await expect($('.cart_item .inventory_item_name')).toHaveTextContaining('Backpack');
    });

    qase.comment('Product added to cart — reported to both projects');

    qase.attach({
      name: 'cart-state.json',
      content: JSON.stringify({
        product: 'Sauce Labs Backpack',
        quantity: 1,
        projects: ['PROJ1', 'PROJ2']
      }, null, 2),
      type: 'application/json'
    });
  });

  // Report checkout to PROJ1 (case 8) and PROJ2 (case 9)
  it(qase.projects({ PROJ1: [8], PROJ2: [9] }, 'User can complete checkout'), async () => {
    qase.fields({ severity: 'critical', priority: 'critical', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tComplete Purchase');
    qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

    await qase.step('Add product and go to cart', async () => {
      await $('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      await $('.shopping_cart_link').click();
    });

    await qase.step('Start checkout', async () => {
      await $('[data-test="checkout"]').click();
    });

    await qase.step('Fill checkout information', async (step) => {
      await step.step('Enter first name', async () => {
        await $('[data-test="firstName"]').setValue('John');
      });

      await step.step('Enter last name', async () => {
        await $('[data-test="lastName"]').setValue('Doe');
      });

      await step.step('Enter postal code', async () => {
        await $('[data-test="postalCode"]').setValue('12345');
      });
    });

    await qase.step('Continue and finish', async () => {
      await $('[data-test="continue"]').click();
      await $('[data-test="finish"]').click();
    });

    await qase.step('Verify order completion', async () => {
      await expect($('.complete-header')).toHaveTextContaining('Thank you');
    });

    qase.attach({
      name: 'order-complete.txt',
      content: 'Order completed for John Doe — reported to PROJ1 and PROJ2',
      type: 'text/plain'
    });

    qase.comment('Checkout completed — tracked across both projects');
  });
});
