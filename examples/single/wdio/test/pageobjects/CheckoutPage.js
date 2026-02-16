class CheckoutPage {
  get firstNameInput() { return $('[data-test="firstName"]'); }
  get lastNameInput() { return $('[data-test="lastName"]'); }
  get postalCodeInput() { return $('[data-test="postalCode"]'); }
  get continueButton() { return $('[data-test="continue"]'); }
  get cancelButton() { return $('[data-test="cancel"]'); }
  get finishButton() { return $('[data-test="finish"]'); }
  get completeHeader() { return $('.complete-header'); }
  get backToProducts() { return $('[data-test="back-to-products"]'); }
  get errorMessage() { return $('[data-test="error"]'); }
  get pageTitle() { return $('.title'); }

  async fillInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.setValue(firstName);
    await this.lastNameInput.setValue(lastName);
    await this.postalCodeInput.setValue(postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}

module.exports = new CheckoutPage();
