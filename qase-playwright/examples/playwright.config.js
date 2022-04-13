const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        ['playwright-qase-reporter',
            {
                // apiToken: 'cc8ffc61c3e9a5aa22defc090a02512cfba2bd00',
                apiToken: 'ee46bc3ec2804260eb053d8cb9d1a0e9461cd40b',
                basePath: 'http://api.qase.lo/v1',
                projectCode: 'PLRC',
                runComplete: true,
                logging: true,
                uploadAttachments: true,
            }],
    ],
};
module.exports = config;
