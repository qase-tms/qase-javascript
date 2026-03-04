const { defineConfig } = require('cypress');
const cucumber = require('cypress-cucumber-preprocessor').default;
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

const qaseReporterOptions = {
  debug: true,
  mode: 'testops_multi',
  testops: {
    api: { token: process.env.QASE_TOKEN || '<token>' },
  },
  testops_multi: {
    default_project: 'PROJ1',
    projects: [
      { code: 'PROJ1', run: { title: 'Cypress Cucumber multi-project run', complete: true } },
      { code: 'PROJ2', run: { title: 'Cypress Cucumber multi-project run', complete: true } },
    ],
  },
  framework: {
    cypress: { screenshotsFolder: 'cypress/screenshots' },
  },
  useV2: true,
};

module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: qaseReporterOptions,
  },
  e2e: {
    specPattern: 'cypress/e2e/*.feature',
    supportFile: 'cypress/support/e2e.js',
    async setupNodeEvents(on, config) {
      on('file:preprocessor', cucumber());
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
      on('after:spec', async (spec, results) => {
        await afterSpecHook(spec, config);
      });
      return config;
    },
  },
});
