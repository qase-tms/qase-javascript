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
                basePath: 'https://api.qase.io/v1',
                uploadAttachments: true,
                runComplete: true,
                logging: true,
            }],
    ],
};
module.exports = config;
