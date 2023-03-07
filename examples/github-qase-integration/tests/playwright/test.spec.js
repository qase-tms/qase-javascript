import {test, expect} from '@playwright/test'
import {qase} from 'playwright-qase-reporter/dist/playwright'

test(qase(1, 'Several ids'), () => {
    expect(true).toBe(true);
})

test(qase(2, 'Correct test'), () => {
    expect(true).toBe(true);
})

test.skip(qase(3, 'Skipped test'), () => {
    expect(true).toBe(true);
})

test(qase(4, 'Failed test'), () => {
    expect(true).toBe(false);
})
