import { qase } from 'cypress-qase-reporter/mocha';
import InventoryPage from '../support/pages/InventoryPage';
import CartPage from '../support/pages/CartPage';
import CheckoutPage from '../support/pages/CheckoutPage';

describe('Checkout Flow', () => {
  beforeEach(() => {
    cy.login();
    InventoryPage.addToCart('sauce-labs-backpack');
    InventoryPage.goToCart();
    CartPage.checkout();
  });

  qase(10,
    it('User can complete checkout with valid information', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tCheckout\tComplete Flow');
      qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

      qase.step('Verify on checkout information page', () => {
        cy.url().should('include', '/checkout-step-one.html');
        CheckoutPage.getTitle().should('have.text', 'Checkout: Your Information');
      });

      qase.step('Fill in checkout information', () => {
        CheckoutPage.fillInfo('John', 'Doe', '12345');
      });

      qase.step('Continue to overview', () => {
        CheckoutPage.continue();
      });

      qase.step('Verify on checkout overview page', () => {
        cy.url().should('include', '/checkout-step-two.html');
        CheckoutPage.getTitle().should('have.text', 'Checkout: Overview');
      });

      qase.step('Verify order details are correct', () => {
        cy.get('.cart_item').should('have.length', 1);
        cy.get('[data-test="inventory-item-name"]').should('contain.text', 'Sauce Labs Backpack');
        cy.get('.summary_total_label').should('be.visible');
      });

      qase.step('Complete the order', () => {
        CheckoutPage.finish();
      });

      qase.step('Verify order completion', () => {
        cy.url().should('include', '/checkout-complete.html');
        CheckoutPage.getCompleteHeader().should('have.text', 'Thank you for your order!');
      });

      qase.step('Attach order details', () => {
        const orderDetails = `Order Details:
Customer: John Doe
Postal Code: 12345
Product: Sauce Labs Backpack
Order Date: ${new Date().toISOString()}
Status: Complete`;

        qase.attach({
          name: 'order-details.txt',
          content: orderDetails,
          contentType: 'text/plain'
        });
      });

      qase.comment('Checkout completed successfully');
    })
  );

  qase(11,
    it('Checkout fails without required information', () => {
      qase.fields({ severity: 'major', priority: 'medium', layer: 'e2e' });
      qase.suite('E-commerce\tCheckout\tValidation');
      qase.parameters({ scenario: 'missing_first_name' });

      qase.step('Verify on checkout information page', () => {
        cy.url().should('include', '/checkout-step-one.html');
      });

      qase.step('Fill only last name and postal code', () => {
        CheckoutPage.fillLastName('Smith');
        CheckoutPage.fillPostalCode('54321');
      });

      qase.step('Attempt to continue without first name', () => {
        CheckoutPage.continue();
      });

      qase.step('Verify error message is displayed', () => {
        CheckoutPage.getError()
          .should('be.visible')
          .and('contain.text', 'Error: First Name is required');
      });

      qase.step('Verify still on information page', () => {
        cy.url().should('include', '/checkout-step-one.html');
      });

      qase.comment('Validation working correctly');
    })
  );

  qase(12,
    it('User can cancel checkout', () => {
      qase.fields({ severity: 'normal', priority: 'low', layer: 'e2e' });
      qase.suite('E-commerce\tCheckout\tNavigation');

      qase.step('Verify on checkout information page', () => {
        cy.url().should('include', '/checkout-step-one.html');
      });

      qase.step('Click cancel button', () => {
        CheckoutPage.cancel();
      });

      qase.step('Verify returned to cart page', () => {
        cy.url().should('include', '/cart.html');
        CartPage.getTitle().should('have.text', 'Your Cart');
      });

      qase.step('Verify product still in cart', () => {
        CartPage.getItems().should('have.length', 1);
      });

      qase.comment('Cancel navigation works correctly');
    })
  );

  qase(13,
    it('Demo test that will be ignored in reporting', () => {
      qase.ignore();
      qase.fields({ severity: 'minor', priority: 'low', layer: 'e2e' });
      qase.suite('E-commerce\tCheckout\tDemo');

      // This test demonstrates qase.ignore() feature
      // It will run but won't be reported to Qase TestOps
      cy.log('This test is ignored in Qase reporting');
      cy.url().should('include', '/checkout-step-one.html');

      qase.comment('This test is intentionally ignored for demonstration purposes');
    })
  );
});
