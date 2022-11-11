const { add, mul, sub, div } = require('./arith');
const { qase } = require('playwright-qase-reporter/dist/playwright');
const { test, expect } = require('@playwright/test');

test.describe.parallel('Test suite. Level 1', () => {
    test(qase(6, 'open page and check title'), async ({ page }) => {
        await page.goto('https://qase.io/');
        expect(await page.title()).toBe(
            'Qase | TMS'
        );
    });

    test.skip(qase(1, '2 + 3 = 5'), () => {
        expect(add(2, 3)).toBe(5);
    });

    test(qase([2], '3 * 4 = 12'), async () => {
        await new Promise((r) => setTimeout(r, 2000));
        expect(mul(3, 4)).toBe(12);
    });

    test('3 * 4 = 12', async () => {
        await new Promise((r) => setTimeout(r, 2000));
        expect(mul(3, 4)).toBe(12);
    });

        test('5 - 6 = -1', () => {
            expect(sub(5, 6)).toBe(-1);
        });

        test.describe('Test suite. Level 2', () => {

        test('5 - 6 = -2', () => {
            expect(sub(5, 6)).toBe(-2);
        });

        test('8 / 4 = 2', () => {
            expect(div(8, 4)).toBe(2);
        });
    });


});
