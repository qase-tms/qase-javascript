const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['playwright-qase-reporter',
            {
                apiToken: '7cb32d8e5527f515356706f84ec63bda0b57c408',
                projectCode: 'DEMO',
                runComplete: true,
                logging: true,
                uploadAttachments: true,
            }],
    ],
};
module.exports = config;
