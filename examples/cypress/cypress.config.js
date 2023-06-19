import cypress from 'cypress';

import plugins from './cypress/plugins/index.js';

module.exports = cypress.defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-mochawesome-reporter, cypress-qase-reporter',
    cypressMochawesomeReporterReporterOptions: {
      charts: true,
    },
    cypressQaseReporterReporterOptions: {
      debug: true,
      screenshotsFolder: 'cypress/screenshots',

      testops: {
        api: {
          token: 'api_key',
          baseUrl: 'http://api.qase.lo/v1',
        },

        projectCode: 'project_code',
        uploadAttachments: true,

        run: {
          complete: true,
          environment: 1,
        },
      },
    },
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return plugins(on, config);
    },
  },
});
