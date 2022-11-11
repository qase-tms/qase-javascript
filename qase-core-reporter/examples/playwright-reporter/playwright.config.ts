import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testIgnore: '**/example/**/*.*',
    reporter: 'list',
};

module.exports = config;
