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
                runComplete: true,
                logging: true,
                uploadAttachments: true,
                basePath: 'https://api.qase.io/v1',
                environmentId: 1
            }],
    ],
};
module.exports = config;
