import { qase } from 'testcafe-reporter-qase/qase';
import loginPage from './pages/LoginPage.js';
import inventoryPage from './pages/InventoryPage.js';
import cartPage from './pages/CartPage.js';
import checkoutPage from './pages/CheckoutPage.js';

fixture`Checkout Flow`
  .page`https://www.saucedemo.com`
  .beforeEach(async t => {
    // Login, add product, navigate to cart, and click checkout
    await t
      .typeText(loginPage.usernameInput, 'standard_user')
      .typeText(loginPage.passwordInput, 'secret_sauce')
      .click(loginPage.loginButton);
    await t.expect(inventoryPage.pageTitle.innerText).eql('Products');

    // Add a product
    await t.click(inventoryPage.addToCartButton('sauce-labs-backpack'));

    // Go to cart
    await t.click(inventoryPage.cartLink);
    await t.expect(cartPage.pageTitle.innerText).eql('Your Cart');

    // Click checkout
    await t.click(cartPage.checkoutButton);
    await t.expect(checkoutPage.pageTitle.innerText).eql('Checkout: Your Information');
  });

test.meta(qase.id(10).title('Complete checkout successfully').fields({
  severity: 'critical',
  priority: 'critical',
  layer: 'e2e'
}).suite('E-commerce\tCheckout\tComplete').parameters({
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345'
}).create())('Complete checkout', async t => {
  await qase.step('Fill checkout information', async (s1) => {
    await s1.step('Enter first name', async () => {
      await t.typeText(checkoutPage.firstNameInput, 'John');
    });

    await s1.step('Enter last name', async () => {
      await t.typeText(checkoutPage.lastNameInput, 'Doe');
    });

    await s1.step('Enter postal code', async () => {
      await t.typeText(checkoutPage.postalCodeInput, '12345');
    });
  });

  await qase.step('Continue to overview', async () => {
    await t.click(checkoutPage.continueButton);
    const title = await checkoutPage.pageTitle.innerText;
    await t.expect(title).eql('Checkout: Overview', 'Should be on overview page');
  });

  await qase.step('Finish checkout', async () => {
    await t.click(checkoutPage.finishButton);
  });

  await qase.step('Verify order confirmation', async () => {
    const confirmHeader = await checkoutPage.completeHeader.innerText;
    await t.expect(confirmHeader).eql('Thank you for your order!', 'Should show confirmation message');
  });

  await qase.comment('Order successfully completed with valid information');

  await qase.attach({
    name: 'order-details.json',
    content: JSON.stringify({
      customer: {
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '12345'
      },
      product: 'Sauce Labs Backpack',
      status: 'completed'
    }, null, 2),
    type: 'application/json'
  });
});

test.meta(qase.id(11).title('Checkout validation error').fields({
  severity: 'major',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tCheckout\tValidation').parameters({
  scenario: 'missing_first_name'
}).create())('Missing first name error', async t => {
  await qase.step('Leave first name empty', async () => {
    // Only fill last name and postal code
    await t
      .typeText(checkoutPage.lastNameInput, 'Doe')
      .typeText(checkoutPage.postalCodeInput, '12345');
  });

  await qase.step('Try to continue', async () => {
    await t.click(checkoutPage.continueButton);
  });

  await qase.step('Verify validation error', async () => {
    await t.expect(checkoutPage.errorMessage.exists).ok('Error message should be displayed');
    const errorText = await checkoutPage.errorMessage.innerText;
    await t.expect(errorText).contains('First Name is required', 'Error should mention first name');
  });

  await qase.comment('Validation correctly prevents checkout with missing first name');
});

test.meta(qase.id(12).title('Cancel checkout').fields({
  severity: 'medium',
  priority: 'medium',
  layer: 'e2e'
}).suite('E-commerce\tCheckout\tCancel').create())('Cancel checkout', async t => {
  await qase.step('Click cancel button', async () => {
    await t.click(checkoutPage.cancelButton);
  });

  await qase.step('Verify returned to cart', async () => {
    await t.expect(cartPage.pageTitle.innerText).eql('Your Cart', 'Should return to cart page');
  });

  await qase.step('Verify product still in cart', async () => {
    const itemCount = await cartPage.items.count;
    await t.expect(itemCount).eql(1, 'Product should still be in cart');
  });

  await qase.comment('Checkout cancelled and returned to cart successfully');
});

test.meta(qase.ignore().create())('Ignored checkout test', async t => {
  await qase.step('This test is ignored', async () => {
    await t.expect(true).ok('This will not be reported to Qase');
  });

  await qase.comment('This test demonstrates the ignore functionality');
});
