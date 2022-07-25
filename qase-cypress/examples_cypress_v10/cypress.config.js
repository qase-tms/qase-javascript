const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-mochawesome-reporter, cypress-qase-reporter',
    cypressMochawesomeReporterReporterOptions: {
      charts: true,
    },
    cypressQaseReporterReporterOptions: {
      apiToken: 'api_key',
      projectCode: 'project_code',
      logging: true,
      basePath: 'https://api.qase.io/v1',
      screenshotFolder: 'screenshots',
      sendScreenshot: true,
      runComplete: true,
      environmentId: 1,
      rootSuiteTitle: 'Cypress tests',
    },
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
