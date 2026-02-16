const { test, expect } = require('@playwright/test');
const { qase } = require('playwright-qase-reporter');

test.describe('Multi-project Login Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
  });

  // Report to PROJ1 (case 1) and PROJ2 (case 2)
  test('User can login with valid credentials', async ({ page }) => {
    qase.projects({ PROJ1: [1], PROJ2: [2] });
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');

    await test.step('Fill in credentials and submit', async () => {
      await page.fill('[data-test="username"]', 'standard_user');
      await page.fill('[data-test="password"]', 'secret_sauce');
      await page.click('[data-test="login-button"]');
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL(/.*inventory.html/);
      qase.comment('Login successful — reported to PROJ1 and PROJ2');
    });
  });

  // Report to PROJ1 (case 3) and PROJ2 (case 4)
  test('Invalid password shows error', async ({ page }) => {
    qase.projects({ PROJ1: [3], PROJ2: [4] });
    qase.fields({ severity: 'high', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');
    qase.parameters({ username: 'standard_user', password: 'wrong_password' });

    await test.step('Attempt login with invalid password', async () => {
      await page.fill('[data-test="username"]', 'standard_user');
      await page.fill('[data-test="password"]', 'wrong_password');
      await page.click('[data-test="login-button"]');
    });

    await test.step('Verify error message is displayed', async () => {
      const error = page.locator('[data-test="error"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Username and password do not match');
    });

    qase.comment('Error correctly displayed — tracked in both projects');
  });

  // Alternative: qase.projectsTitle() in the test name
  test(qase.projectsTitle('Locked user cannot login', { PROJ1: [5], PROJ2: [6] }), async ({ page }) => {
    qase.fields({ severity: 'high', priority: 'medium', layer: 'e2e' });
    qase.suite('E-commerce\tAuthentication\tLogin');
    qase.parameters({ username: 'locked_out_user' });

    await test.step('Attempt login with locked user', async () => {
      await page.fill('[data-test="username"]', 'locked_out_user');
      await page.fill('[data-test="password"]', 'secret_sauce');
      await page.click('[data-test="login-button"]');
    });

    await test.step('Verify locked-out error message', async () => {
      const error = page.locator('[data-test="error"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText('Sorry, this user has been locked out');
    });
  });
});

test.describe('Multi-project Cart Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  // Report to PROJ1 (cases 7, 8) and PROJ2 (case 9)
  test('Add product to cart', async ({ page }) => {
    qase.projects({ PROJ1: [7, 8], PROJ2: [9] });
    qase.fields({ severity: 'critical', priority: 'high', layer: 'e2e' });
    qase.suite('E-commerce\tCart\tAdd Items');
    qase.parameters({ product: 'Sauce Labs Backpack' });

    await test.step('Add Sauce Labs Backpack to cart', async () => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    });

    await test.step('Verify cart badge', async () => {
      await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    await test.step('Navigate to cart and verify', async () => {
      await page.click('.shopping_cart_link');
      await expect(page.locator('.inventory_item_name')).toContainText('Backpack');
    });

    qase.comment('Product added to cart — reported to both projects');

    const screenshot = await page.screenshot({ encoding: 'base64' });
    qase.attach({ name: 'cart-page.png', content: screenshot, contentType: 'image/png' });
  });

  // Report to PROJ1 (case 10) and PROJ2 (case 11)
  test('Complete checkout flow', async ({ page }) => {
    qase.projects({ PROJ1: [10], PROJ2: [11] });
    qase.fields({ severity: 'critical', priority: 'critical', layer: 'e2e' });
    qase.suite('E-commerce\tCheckout\tComplete');
    qase.parameters({ firstName: 'John', lastName: 'Doe', postalCode: '12345' });

    await test.step('Add product and go to checkout', async () => {
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      await page.click('.shopping_cart_link');
      await page.click('[data-test="checkout"]');
    });

    await test.step('Fill checkout information', async () => {
      await page.fill('[data-test="firstName"]', 'John');
      await page.fill('[data-test="lastName"]', 'Doe');
      await page.fill('[data-test="postalCode"]', '12345');
    });

    await test.step('Complete and verify order', async () => {
      await page.click('[data-test="continue"]');
      await page.click('[data-test="finish"]');
      await expect(page.locator('.complete-header')).toContainText('Thank you');
    });

    qase.comment('Full checkout flow verified across both projects');

    qase.attach({
      name: 'order-details.json',
      content: JSON.stringify({
        customer: { firstName: 'John', lastName: 'Doe', postalCode: '12345' },
        product: 'Sauce Labs Backpack',
        status: 'completed'
      }, null, 2),
      contentType: 'application/json'
    });
  });

  // Alternative: annotation-based approach
  test(
    'Multi-project via annotation',
    { annotation: { type: 'QaseProjects', description: '{"PROJ1":[12],"PROJ2":[13]}' } },
    async ({ page }) => {
      qase.suite('E-commerce\tInventory\tBrowse');

      await test.step('Verify inventory page loaded', async () => {
        await expect(page.locator('[data-test="title"]')).toHaveText('Products');
      });

      await test.step('Verify products are displayed', async () => {
        const items = page.locator('.inventory_item');
        await expect(items).toHaveCount(6);
      });

      qase.comment('Inventory page verified via annotation-based multi-project mapping');
    },
  );
});
