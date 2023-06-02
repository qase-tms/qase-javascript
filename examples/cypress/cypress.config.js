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
      logging: true,
      screenshotFolder: 'screenshots',

      testops: {
        apiToken: 'api_key',
        projectCode: 'project_code',
        baseUrl: 'https://qase.io',
        uploadAttachments: true,
        runComplete: true,
        environmentId: 1,
      },

      report: {
        path: './qase/reports',
      },
    },
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return plugins(on, config)
    },
  },
})
