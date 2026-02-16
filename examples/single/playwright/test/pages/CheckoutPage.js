class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.firstName = '[data-test="firstName"]';
    this.lastName = '[data-test="lastName"]';
    this.postalCode = '[data-test="postalCode"]';
    this.continueButton = '[data-test="continue"]';
    this.cancelButton = '[data-test="cancel"]';
    this.finishButton = '[data-test="finish"]';
    this.completeHeader = '.complete-header';
    this.backToProducts = '[data-test="back-to-products"]';
    this.errorMessage = '[data-test="error"]';
    this.pageTitle = '.title';
  }

  async fillInfo(first, last, zip) {
    await this.page.fill(this.firstName, first);
    await this.page.fill(this.lastName, last);
    await this.page.fill(this.postalCode, zip);
  }

  async continue() {
    await this.page.click(this.continueButton);
  }

  async finish() {
    await this.page.click(this.finishButton);
  }

  async getCompleteMessage() {
    return await this.page.textContent(this.completeHeader);
  }
}

module.exports = CheckoutPage;
