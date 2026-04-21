import { qase } from 'testcafe-reporter-qase/qase';
import loginPage from './pages/LoginPage.js';
import inventoryPage from './pages/InventoryPage.js';

fixture`Login Scenarios`
  .page`https://www.saucedemo.com`;

test.meta(qase.id(1).title('User can login with valid credentials').fields({
  severity: 'critical',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tAuthentication\tLogin').create())('Valid login', async t => {
  await qase.step('Navigate to login page', async () => {
    await t.expect(loginPage.loginButton.exists).ok('Login button should be visible');
  });

  await qase.step('Enter valid credentials', async () => {
    await t
      .typeText(loginPage.usernameInput, 'standard_user')
      .typeText(loginPage.passwordInput, 'secret_sauce');
  });

  await qase.step('Submit login form', async () => {
    await t.click(loginPage.loginButton);
  });

  await qase.step('Verify successful login', async () => {
    await t.expect(inventoryPage.pageTitle.innerText).eql('Products', 'Should redirect to inventory page');
  });

  await qase.comment('User successfully logged in with standard credentials');
  await qase.attach({
    name: 'login-credentials.txt',
    content: 'Username: standard_user\nPassword: secret_sauce',
    type: 'text/plain'
  });
});

test.meta(qase.id(2).title('Invalid password shows error').fields({
  severity: 'major',
  priority: 'high',
  layer: 'e2e'
}).suite('E-commerce\tAuthentication\tLogin').parameters({
  username: 'standard_user',
  password: 'wrong_password'
}).create())('Invalid password login', async t => {
  await qase.step('Enter invalid credentials', async () => {
    await t
      .typeText(loginPage.usernameInput, 'standard_user')
      .typeText(loginPage.passwordInput, 'wrong_password');
  });

  await qase.step('Submit login form', async () => {
    await t.click(loginPage.loginButton);
  });

  await qase.step('Verify error message', async () => {
    await t.expect(loginPage.errorMessage.exists).ok('Error message should be displayed');
    const errorText = await loginPage.errorMessage.innerText;
    await t.expect(errorText).contains('Username and password do not match');
  });

  await qase.comment('Invalid credentials correctly rejected');
});

test.meta(qase.id(3).title('Locked user cannot login').fields({
  severity: 'major',
  priority: 'medium',
  layer: 'e2e'
}).suite('E-commerce\tAuthentication\tLogin').parameters({
  username: 'locked_out_user'
}).create())('Locked user login', async t => {
  await qase.step('Enter locked user credentials', async () => {
    await t
      .typeText(loginPage.usernameInput, 'locked_out_user')
      .typeText(loginPage.passwordInput, 'secret_sauce');
  });

  await qase.step('Submit login form', async () => {
    await t.click(loginPage.loginButton);
  });

  await qase.step('Verify locked user error', async () => {
    await t.expect(loginPage.errorMessage.exists).ok('Error message should be displayed');
    const errorText = await loginPage.errorMessage.innerText;
    await t.expect(errorText).contains('Sorry, this user has been locked out');
  });

  await qase.comment('Locked user correctly denied access');
});
