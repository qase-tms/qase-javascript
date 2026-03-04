import { test } from 'testcafe';
import { qase } from 'testcafe-reporter-qase/qase';

fixture`Multi-project Login Scenarios`
  .page`https://www.saucedemo.com`;

// Report login test to both PROJ1 (case 1) and PROJ2 (case 2)
test.meta(qase.projects({ PROJ1: [1], PROJ2: [2] }).title('User can login with valid credentials').fields({
  severity: 'critical',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tAuthentication\tLogin').create())('Valid login', async t => {
  await qase.step('Navigate to login page', async () => {
    const loginButton = await t.eval(() => !!document.querySelector('[data-test="login-button"]'));
    await t.expect(loginButton).ok('Login button should be visible');
  });

  await qase.step('Enter valid credentials', async () => {
    await t
      .typeText('[data-test="username"]', 'standard_user')
      .typeText('[data-test="password"]', 'secret_sauce');
  });

  await qase.step('Submit login form', async () => {
    await t.click('[data-test="login-button"]');
  });

  await qase.step('Verify successful login', async () => {
    const title = await t.eval(() => document.querySelector('[data-test="title"]')?.textContent);
    await t.expect(title).eql('Products', 'Should redirect to inventory page');
  });

  await qase.comment('Login verified across both projects with standard credentials');
  await qase.attach({
    name: 'login-credentials.txt',
    content: 'Username: standard_user\nPassword: secret_sauce',
    type: 'text/plain'
  });
});

// Report invalid login to PROJ1 (case 3) and PROJ2 (case 4)
test.meta(qase.projects({ PROJ1: [3], PROJ2: [4] }).title('Invalid password shows error').fields({
  severity: 'high',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tAuthentication\tLogin').parameters({
  username: 'standard_user',
  password: 'wrong_password'
}).create())('Invalid password login', async t => {
  await qase.step('Enter invalid credentials', async () => {
    await t
      .typeText('[data-test="username"]', 'standard_user')
      .typeText('[data-test="password"]', 'wrong_password');
  });

  await qase.step('Submit login form', async () => {
    await t.click('[data-test="login-button"]');
  });

  await qase.step('Verify error message', async () => {
    const errorContainer = await t.eval(() => !!document.querySelector('[data-test="error"]'));
    await t.expect(errorContainer).ok('Error message should be displayed');
  });

  await qase.comment('Invalid credentials correctly rejected in both projects');
});

fixture`Multi-project Cart Scenarios`
  .page`https://www.saucedemo.com`
  .beforeEach(async t => {
    await t
      .typeText('[data-test="username"]', 'standard_user')
      .typeText('[data-test="password"]', 'secret_sauce')
      .click('[data-test="login-button"]');
  });

// Report cart test to PROJ1 (cases 5, 6) and PROJ2 (case 7)
test.meta(qase.projects({ PROJ1: [5, 6], PROJ2: [7] }).title('Add product to cart').fields({
  severity: 'critical',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tCart\tAdd Items').parameters({
  product: 'Sauce Labs Backpack'
}).create())('Add to cart', async t => {
  await qase.step('Add Sauce Labs Backpack to cart', async () => {
    await t.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  });

  await qase.step('Verify cart badge shows 1', async () => {
    const badge = await t.eval(() => document.querySelector('.shopping_cart_badge')?.textContent);
    await t.expect(badge).eql('1', 'Cart badge should show 1 item');
  });

  await qase.step('Navigate to cart', async () => {
    await t.click('.shopping_cart_link');
  });

  await qase.step('Verify product in cart', async () => {
    const itemName = await t.eval(() => document.querySelector('.inventory_item_name')?.textContent);
    await t.expect(itemName).eql('Sauce Labs Backpack', 'Correct product in cart');
  });

  await qase.comment('Product added to cart and reported to both projects');

  await qase.attach({
    name: 'cart-state.json',
    content: JSON.stringify({
      product: 'Sauce Labs Backpack',
      quantity: 1,
      projects: ['PROJ1', 'PROJ2']
    }, null, 2),
    type: 'application/json'
  });
});

// Report checkout test to PROJ1 (case 8) and PROJ2 (case 9)
test.meta(qase.projects({ PROJ1: [8], PROJ2: [9] }).title('Complete checkout flow').fields({
  severity: 'critical',
  priority: 'critical',
  layer: 'e2e'
}).suite('E-commerce\tCheckout\tComplete').parameters({
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345'
}).create())('Complete checkout', async t => {
  await qase.step('Add product and go to cart', async () => {
    await t
      .click('[data-test="add-to-cart-sauce-labs-backpack"]')
      .click('.shopping_cart_link');
  });

  await qase.step('Start checkout', async () => {
    await t.click('[data-test="checkout"]');
  });

  await qase.step('Fill checkout information', async (s1) => {
    await s1.step('Enter first name', async () => {
      await t.typeText('[data-test="firstName"]', 'John');
    });

    await s1.step('Enter last name', async () => {
      await t.typeText('[data-test="lastName"]', 'Doe');
    });

    await s1.step('Enter postal code', async () => {
      await t.typeText('[data-test="postalCode"]', '12345');
    });
  });

  await qase.step('Continue and finish', async () => {
    await t
      .click('[data-test="continue"]')
      .click('[data-test="finish"]');
  });

  await qase.step('Verify order confirmation', async () => {
    const header = await t.eval(() => document.querySelector('.complete-header')?.textContent);
    await t.expect(header).eql('Thank you for your order!', 'Should show confirmation message');
  });

  await qase.comment('Full checkout flow verified across both projects');

  await qase.attach({
    name: 'order-details.json',
    content: JSON.stringify({
      customer: { firstName: 'John', lastName: 'Doe', postalCode: '12345' },
      product: 'Sauce Labs Backpack',
      status: 'completed'
    }, null, 2),
    type: 'application/json'
  });
});

test.meta(qase.projects({ PROJ1: [10], PROJ2: [11] }).ignore().create())('Ignored multi-project test', async t => {
  await t.expect(true).ok('This will not be reported to Qase');
  await qase.comment('This test demonstrates ignore with multi-project');
});
