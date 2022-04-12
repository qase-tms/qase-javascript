const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['playwright-qase-reporter',
            {
                apiToken: 'cc8ffc61c3e9a5aa22defc090a02512cfba2bd00',
                projectCode: 'PRC',
                runComplete: true,
                logging: true,
                uploadAttachments: true,
            }],
    ],
};
module.exports = config;
