const { qase } = require('cypress-qase-reporter/mocha');

describe('Multi-project Login Scenarios', () => {
  beforeEach(() => {
    cy.visit('https://www.saucedemo.com');
  });

  // Report to PROJ1 (case 1) and PROJ2 (case 2)
  qase.projects({ PROJ1: [1], PROJ2: [2] },
    it('User can login with valid credentials', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tAuthentication\tLogin');

      qase.step('Fill in credentials and submit', () => {
        cy.get('[data-test="username"]').type('standard_user');
        cy.get('[data-test="password"]').type('secret_sauce');
        cy.get('[data-test="login-button"]').click();
      });

      qase.step('Verify successful login', () => {
        cy.url().should('include', '/inventory.html');
        cy.get('[data-test="title"]').should('have.text', 'Products');
      });

      qase.comment('Login successful — reported to PROJ1 and PROJ2');
    }),
  );

  // Report to PROJ1 (case 3) and PROJ2 (case 4)
  qase.projects({ PROJ1: [3], PROJ2: [4] },
    it('Invalid password shows error', () => {
      qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tAuthentication\tLogin');
      qase.parameters({ username: 'standard_user', password: 'wrong_password' });

      qase.step('Attempt login with invalid credentials', () => {
        cy.get('[data-test="username"]').type('standard_user');
        cy.get('[data-test="password"]').type('wrong_password');
        cy.get('[data-test="login-button"]').click();
      });

      qase.step('Verify error message', () => {
        cy.get('[data-test="error"]')
          .should('be.visible')
          .and('contain.text', 'Username and password do not match');
      });

      qase.comment('Error correctly displayed — tracked in both projects');
    }),
  );

  // Report to PROJ1 (case 5) and PROJ2 (case 6)
  qase.projects({ PROJ1: [5], PROJ2: [6] },
    it('Locked user cannot login', () => {
      qase.fields({ severity: 'high', priority: 'medium', layer: 'e2e' });
      qase.suite('E-commerce\tAuthentication\tLogin');
      qase.parameters({ username: 'locked_out_user' });

      qase.step('Attempt login with locked user', () => {
        cy.get('[data-test="username"]').type('locked_out_user');
        cy.get('[data-test="password"]').type('secret_sauce');
        cy.get('[data-test="login-button"]').click();
      });

      qase.step('Verify locked-out error', () => {
        cy.get('[data-test="error"]')
          .should('be.visible')
          .and('contain.text', 'Sorry, this user has been locked out');
      });
    }),
  );
});

describe('Multi-project Cart Scenarios', () => {
  beforeEach(() => {
    cy.visit('https://www.saucedemo.com');
    cy.get('[data-test="username"]').type('standard_user');
    cy.get('[data-test="password"]').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory.html');
  });

  // Report to PROJ1 (cases 7, 8) and PROJ2 (case 9)
  qase.projects({ PROJ1: [7, 8], PROJ2: [9] },
    it('Add product to cart', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tCart\tAdd Items');
      qase.parameters({ product: 'Sauce Labs Backpack' });

      qase.step('Add Sauce Labs Backpack to cart', () => {
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      });

      qase.step('Verify cart badge shows 1 item', () => {
        cy.get('.shopping_cart_badge').should('have.text', '1');
      });

      qase.step('Navigate to cart and verify product', () => {
        cy.get('.shopping_cart_link').click();
        cy.get('.inventory_item_name').should('contain.text', 'Backpack');
      });

      qase.comment('Product added to cart — reported to both projects');

      qase.attach({
        name: 'cart-state.json',
        content: JSON.stringify({
          product: 'Sauce Labs Backpack',
          quantity: 1,
          projects: ['PROJ1', 'PROJ2'],
        }, null, 2),
        contentType: 'application/json',
      });
    }),
  );

  // Report to PROJ1 (case 10) and PROJ2 (case 11)
  qase.projects({ PROJ1: [10], PROJ2: [11] },
    it('Complete checkout flow', () => {
      qase.fields({ severity: 'critical', priority: 'critical', layer: 'e2e' });
      qase.suite('E-commerce\tCheckout\tComplete');
      qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

      qase.step('Add product and go to checkout', () => {
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('.shopping_cart_link').click();
        cy.get('[data-test="checkout"]').click();
      });

      qase.step('Fill checkout information', () => {
        cy.get('[data-test="firstName"]').type('John');
        cy.get('[data-test="lastName"]').type('Doe');
        cy.get('[data-test="postalCode"]').type('12345');
      });

      qase.step('Complete and verify order', () => {
        cy.get('[data-test="continue"]').click();
        cy.get('[data-test="finish"]').click();
        cy.get('.complete-header').should('contain.text', 'Thank you');
      });

      qase.comment('Full checkout flow verified across both projects');
    }),
  );
});
