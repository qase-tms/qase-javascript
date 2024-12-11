const {defineConfig} = require("cypress");
const cucumber = require('cypress-cucumber-preprocessor').default;

module.exports = defineConfig({
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

                run: {
                    complete: true,
                },
                useV2: true,
            },

            framework: {
                cypress: {
                    screenshotsFolder: 'cypress/screenshots',
                },
            },
        },
    },
    e2e: {
        async setupNodeEvents(on, config) {
            on('file:preprocessor', cucumber())
            require('cypress-qase-reporter/plugin')(on, config);
            require('cypress-qase-reporter/metadata')(on);
        },
        specPattern: 'cypress/e2e/*.feature'
    },
});
