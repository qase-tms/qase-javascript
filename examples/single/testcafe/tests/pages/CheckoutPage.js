import { Selector } from 'testcafe';

class CheckoutPage {
  constructor() {
    this.firstNameInput = Selector('[data-test="firstName"]');
    this.lastNameInput = Selector('[data-test="lastName"]');
    this.postalCodeInput = Selector('[data-test="postalCode"]');
    this.continueButton = Selector('[data-test="continue"]');
    this.cancelButton = Selector('[data-test="cancel"]');
    this.finishButton = Selector('[data-test="finish"]');
    this.completeHeader = Selector('.complete-header');
    this.backToProducts = Selector('[data-test="back-to-products"]');
    this.errorMessage = Selector('[data-test="error"]');
    this.pageTitle = Selector('.title');
  }
}

export default new CheckoutPage();
