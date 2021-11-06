import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testIgnore: '**/examples/**/*.*',
    reporter: 'list',
};

module.exports = config;
