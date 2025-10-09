import cypress from 'cypress';
import { afterSpecHook } from 'cypress-qase-reporter/hooks';

module.exports = cypress.defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-qase-reporter',
    cypressQaseReporterReporterOptions: {
      debug: true,

      testops: {
        api: {
          token: '<token>',
        },

        project: '<project_code>',
        uploadAttachments: true,
        showPublicReportLink: true,

        run: {
          complete: true,
        },
        useV2: true,
      },

      framework: {
        cypress: {
          screenshotsFolder: 'cypress/screenshots',
          videosFolder: 'cypress/videos',
          uploadDelay: 10, // Delay in seconds before uploading video files (default: 10)
        },
      },
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
