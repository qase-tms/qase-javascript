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
                    token: '45a0b4c1e0cc6c64580a82565d939779490097e0d7a7d8ccfe77393346b426fb',
                },

                project: 'DEVX',
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
