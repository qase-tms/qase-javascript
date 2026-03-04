import { qase } from 'cypress-qase-reporter/mocha';
import LoginPage from '../support/pages/LoginPage';
import InventoryPage from '../support/pages/InventoryPage';

describe('Login Scenarios', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  qase(1,
    it('User can login with valid credentials', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tAuthentication\tLogin');

      qase.step('Fill in username', () => {
        LoginPage.fillUsername('standard_user');
      });

      qase.step('Fill in password', () => {
        LoginPage.fillPassword('secret_sauce');
      });

      qase.step('Submit login form', () => {
        LoginPage.submit();
      });

      qase.step('Verify successful login', () => {
        cy.url().should('include', '/inventory.html');
        InventoryPage.getTitle().should('have.text', 'Products');
      });

      qase.comment('Login successful');
    })
  );

  qase(2,
    it('User cannot login with invalid password', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tAuthentication\tLogin');
      qase.parameters({ username: 'standard_user', password: 'wrong_password' });

      qase.step('Attempt login with invalid credentials', () => {
        LoginPage.fillUsername('standard_user');
        LoginPage.fillPassword('wrong_password');
        LoginPage.submit();
      });

      qase.step('Verify error message is shown', () => {
        LoginPage.getError()
          .should('be.visible')
          .and('contain.text', 'Username and password do not match');
      });

      qase.step('Verify still on login page', () => {
        cy.url().should('not.include', '/inventory.html');
      });
    })
  );

  qase(3,
    it('Locked user cannot login', () => {
      qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tAuthentication\tLogin');
      qase.parameters({ username: 'locked_out_user', password: 'secret_sauce' });

      qase.step('Attempt login with locked user', () => {
        LoginPage.fillUsername('locked_out_user');
        LoginPage.fillPassword('secret_sauce');
        LoginPage.submit();
      });

      qase.step('Verify locked out error message', () => {
        LoginPage.getError()
          .should('be.visible')
          .and('contain.text', 'Sorry, this user has been locked out');
      });

      qase.step('Verify cannot access inventory', () => {
        cy.url().should('not.include', '/inventory.html');
      });
    })
  );
});
