const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['playwright-qase-reporter',
            {
                apiToken: '',
                basePath: 'https://api.qase.io/v1',
                projectCode: '',
                runComplete: true,
                logging: true,
                uploadAttachments: true,
            }],
    ],
};
module.exports = config;
