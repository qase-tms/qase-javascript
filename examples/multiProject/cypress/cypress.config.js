const cypress = require('cypress');
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

module.exports = cypress.defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      mode: 'testops_multi',
      debug: true,
      testops: {
        api: {
          token: 'token',
        },
      },
      testops_multi: {
        default_project: 'PROJ1',
        projects: [
          { code: 'PROJ1', run: { title: 'PROJ1 Cypress multi-project run', complete: true } },
          { code: 'PROJ2', run: { title: 'PROJ2 Cypress multi-project run', complete: true } },
        ],
      },
      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
          videosFolder: 'cypress/videos',
          uploadDelay: 10,
        },
      },
      useV2: true,
    },
  },
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-qase-reporter/plugin')(on, config);
      require('cypress-qase-reporter/metadata')(on);
      on('after:spec', async (spec, results) => {
        await afterSpecHook(spec, config);
      });
    },
  },
});
