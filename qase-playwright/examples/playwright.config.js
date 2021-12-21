const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['playwright-qase-reporter',
            {
                apiToken: 'api_key',
                projectCode: 'project_code',
                runComplete: true,
                logging: true,
                uploadAttachments: true
            }],
    ],
};
module.exports = config;
