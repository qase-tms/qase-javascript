const { qase } = require('wdio-qase-reporter');
const LoginPage = require('../pageobjects/LoginPage');

describe('Login Scenarios', () => {
  it(qase(1, 'User can login with valid credentials'), async () => {
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');

    await qase.step('Open login page', async () => {
      await LoginPage.open();
      await expect(LoginPage.usernameInput).toBeDisplayed();
    });

    await qase.step('Enter valid credentials and submit', async () => {
      await LoginPage.login('standard_user', 'secret_sauce');
    });

    await qase.step('Verify successful login', async () => {
      await browser.waitUntil(
        async () => (await browser.getUrl()).includes('/inventory.html'),
        { timeout: 5000, timeoutMsg: 'Expected to navigate to inventory page' }
      );
      await expect(browser).toHaveUrl('https://www.saucedemo.com/inventory.html');
    });

    qase.comment('Login successful with standard user credentials');
    qase.attach({
      name: 'login-credentials.txt',
      content: 'Username: standard_user\nPassword: secret_sauce',
      type: 'text/plain'
    });
  });

  it(qase(2, 'User cannot login with invalid password'), async () => {
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');
    qase.parameters({ username: 'standard_user', password: 'wrong_password' });

    await qase.step('Open login page', async () => {
      await LoginPage.open();
    });

    await qase.step('Enter invalid credentials', async () => {
      await LoginPage.login('standard_user', 'wrong_password');
    });

    await qase.step('Verify error message is displayed', async () => {
      await expect(LoginPage.errorMessage).toBeDisplayed();
      await expect(LoginPage.errorMessage).toHaveTextContaining('Username and password do not match');
    });

    qase.comment('Error message correctly displayed for invalid credentials');
  });

  it(qase(3, 'Locked user cannot login'), async () => {
    qase.fields({ severity: 'high', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');
    qase.parameters({ username: 'locked_out_user' });

    await qase.step('Open login page', async () => {
      await LoginPage.open();
    });

    await qase.step('Attempt login with locked user', async () => {
      await LoginPage.login('locked_out_user', 'secret_sauce');
    });

    await qase.step('Verify locked user message', async () => {
      await expect(LoginPage.errorMessage).toBeDisplayed();
      await expect(LoginPage.errorMessage).toHaveTextContaining('locked out');
    });

    qase.comment('System correctly prevents locked users from accessing the application');
  });
});
