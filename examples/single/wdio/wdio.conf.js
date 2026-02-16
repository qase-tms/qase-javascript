const WDIOQaseReporter = require('wdio-qase-reporter').default;
const { afterRunHook, beforeRunHook } = require('wdio-qase-reporter');

exports.config = {
  runner: 'local',
  specs: ['./test/specs/**/*.spec.js'],
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--disable-gpu'],
      },
    },
  ],
  logLevel: 'warn',
  baseUrl: 'https://www.saucedemo.com',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  reporters: [
    [
      WDIOQaseReporter,
      {
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
        useCucumber: false,
      },
    ],
  ],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  onPrepare: async function () {
    await beforeRunHook();
  },
  onComplete: async function () {
    await afterRunHook();
  },
};
