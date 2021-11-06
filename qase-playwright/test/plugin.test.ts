import PlaywrightReporter from '../src';
import { test } from '@playwright/test';

test.describe('Client', () => {
    test('Init client', () => {
        const options = {apiToken: '', projectCode: ''};
        new PlaywrightReporter(options);
    });
});
