import { Selector } from 'testcafe';

class LoginPage {
  constructor() {
    this.usernameInput = Selector('[data-test="username"]');
    this.passwordInput = Selector('[data-test="password"]');
    this.loginButton = Selector('[data-test="login-button"]');
    this.errorMessage = Selector('[data-test="error"]');
  }
}

export default new LoginPage();
