import { qase } from 'cypress-qase-reporter/mocha';
import InventoryPage from '../support/pages/InventoryPage';

describe('Product Inventory', () => {
  beforeEach(() => {
    cy.login();
    cy.url().should('include', '/inventory.html');
  });

  qase(4,
    it('User can browse all products', () => {
      qase.fields({ severity: 'major', priority: 'high', layer: 'e2e' });
      qase.suite('E-commerce\tInventory\tBrowsing');

      let productCount = 0;

      qase.step('Verify Products page title', () => {
        InventoryPage.getTitle().should('have.text', 'Products');
      });

      qase.step('Count inventory items', () => {
        InventoryPage.getItems().should('have.length', 6).then(($items) => {
          productCount = $items.length;
        });
      });

      qase.step('Verify product names are visible', () => {
        InventoryPage.getItemNames().each(($name) => {
          cy.wrap($name).should('be.visible');
        });
      });

      qase.step('Verify product prices are visible', () => {
        InventoryPage.getItemPrices().each(($price) => {
          cy.wrap($price).should('be.visible').and('contain.text', '$');
        });
      });

      qase.step('Attach product count data', () => {
        qase.attach({
          name: 'product-count.json',
          content: JSON.stringify({ totalProducts: productCount, timestamp: new Date().toISOString() }, null, 2),
          contentType: 'application/json'
        });
      });

      qase.comment('Successfully browsed all 6 products on inventory page');
    })
  );

  qase(5,
    it('User can sort products by price', () => {
      qase.fields({ severity: 'normal', priority: 'medium', layer: 'e2e' });
      qase.suite('E-commerce\tInventory\tSorting');
      qase.parameters({ sortOption: 'lohi' });

      qase.step('Select sort by price low to high', () => {
        InventoryPage.sortBy('lohi');
      });

      qase.step('Verify prices are in ascending order', () => {
        const prices = [];
        InventoryPage.getItemPrices().each(($price) => {
          const priceText = $price.text().replace('$', '');
          prices.push(parseFloat(priceText));
        }).then(() => {
          const sortedPrices = [...prices].sort((a, b) => a - b);
          expect(prices).to.deep.equal(sortedPrices);
        });
      });

      qase.comment('Products sorted correctly by price');
    })
  );

  qase(6,
    it('User can view product details', () => {
      qase.fields({ severity: 'normal', priority: 'medium', layer: 'e2e' });
      qase.suite('E-commerce\tInventory\tProduct Details');

      qase.step('Click on first product name', () => {
        InventoryPage.getItemNames().first().click();
      });

      qase.step('Verify product detail page loads', () => {
        cy.url().should('include', '/inventory-item.html');
        cy.get('.inventory_details_name').should('be.visible');
        cy.get('.inventory_details_desc').should('be.visible');
        cy.get('.inventory_details_price').should('be.visible');
      });

      qase.step('Verify back to products button is present', () => {
        cy.get('[data-test="back-to-products"]').should('be.visible');
      });
    })
  );
});
