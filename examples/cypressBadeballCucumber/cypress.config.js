const { defineConfig } = require("cypress");
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const addCucumberPreprocessorPlugin = require('@badeball/cypress-cucumber-preprocessor').addCucumberPreprocessorPlugin;
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
const { afterSpecHook } = require('cypress-qase-reporter/hooks');

// Qase reporter configuration
const qaseReporterOptions = {
    debug: true,
    mode: "testops",
    testops: {
        api: {
            token: '<token>',
        },
        project: '<project_code>',
        uploadAttachments: true,
        run: {
            complete: true,
        },
    },
    framework: {
        cypress: {
            screenshotsFolder: 'cypress/screenshots',
        },
    },
};

module.exports = defineConfig({
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        reporterEnabled: 'cypress-qase-reporter',
        cypressQaseReporterReporterOptions: qaseReporterOptions,
    },
    e2e: {
        specPattern: 'cypress/e2e/**/*.feature',
        supportFile: 'cypress/support/e2e.js',
        
        async setupNodeEvents(on, config) {
            // 1. Set up the Cucumber preprocessor FIRST
            await addCucumberPreprocessorPlugin(on, config);
            on(
                'file:preprocessor',
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                    define: { global: "globalThis" },
                    platform: 'browser',
                })
            );
            
            // 2. Set up the Qase reporter plugin
            require('cypress-qase-reporter/plugin')(on, config);
            require('cypress-qase-reporter/metadata')(on);
            
            // 3. Register the manual hooks
            on('after:spec', async (spec, results) => {
                await afterSpecHook(spec, config);
            });
            
            // 4. Return the final, modified config object
            return config;
        },
    },
});
