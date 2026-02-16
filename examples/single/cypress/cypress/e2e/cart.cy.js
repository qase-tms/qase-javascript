import { qase } from 'cypress-qase-reporter/mocha';
import InventoryPage from '../support/pages/InventoryPage';
import CartPage from '../support/pages/CartPage';

describe('Cart Management', () => {
  beforeEach(() => {
    cy.login();
  });

  qase(7,
    it('User can add product to cart', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tShopping Cart\tAdd Items');
      qase.parameters({ product: 'Sauce Labs Backpack' });

      qase.step('Verify cart is initially empty', () => {
        cy.get('.shopping_cart_badge').should('not.exist');
      });

      qase.step('Add Sauce Labs Backpack to cart', () => {
        InventoryPage.addToCart('sauce-labs-backpack');
      });

      qase.step('Verify cart badge shows 1 item', () => {
        InventoryPage.getCartBadge().should('have.text', '1');
      });

      qase.step('Navigate to cart', () => {
        InventoryPage.goToCart();
      });

      qase.step('Verify product appears in cart', () => {
        cy.url().should('include', '/cart.html');
        CartPage.getItems().should('have.length', 1);
        CartPage.getItemName().should('contain.text', 'Sauce Labs Backpack');
      });

      qase.step('Attach cart state', () => {
        CartPage.getItems().then(($items) => {
          const cartState = {
            itemCount: $items.length,
            items: ['Sauce Labs Backpack'],
            timestamp: new Date().toISOString()
          };
          qase.attach({
            name: 'cart-state.json',
            content: JSON.stringify(cartState, null, 2),
            contentType: 'application/json'
          });
        });
      });

      qase.comment('Successfully added product to cart');
    })
  );

  qase(8,
    it('User can remove product from cart', () => {
      qase.fields({ severity: 'high', priority: 'medium', layer: 'e2e' });
      qase.suite('E-commerce\tShopping Cart\tRemove Items');

      qase.step('Add product to cart', () => {
        InventoryPage.addToCart('sauce-labs-bike-light');
        InventoryPage.getCartBadge().should('have.text', '1');
      });

      qase.step('Navigate to cart', () => {
        InventoryPage.goToCart();
      });

      qase.step('Verify product is in cart', () => {
        CartPage.getItems().should('have.length', 1);
      });

      qase.step('Remove product from cart', () => {
        CartPage.removeItem('sauce-labs-bike-light');
      });

      qase.step('Verify cart is empty', () => {
        CartPage.getItems().should('have.length', 0);
        cy.get('.shopping_cart_badge').should('not.exist');
      });

      qase.comment('Successfully removed product from cart');
    })
  );

  qase(9,
    it('User can add multiple products to cart', () => {
      qase.fields({ severity: 'high', priority: 'medium', layer: 'e2e' });
      qase.suite('E-commerce\tShopping Cart\tMultiple Items');

      qase.step('Add first product to cart', () => {
        InventoryPage.addToCart('sauce-labs-backpack');
        InventoryPage.getCartBadge().should('have.text', '1');
      });

      qase.step('Add second product to cart', () => {
        InventoryPage.addToCart('sauce-labs-bolt-t-shirt');
        InventoryPage.getCartBadge().should('have.text', '2');
      });

      qase.step('Navigate to cart and verify both products', () => {
        InventoryPage.goToCart();
        CartPage.getItems().should('have.length', 2);
      });

      qase.comment('Multiple products added successfully');
    })
  );
});
