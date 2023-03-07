const config = {
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    reporter: [
        ['list'],
        [
            'playwright-qase-reporter',
            {
                logging: true,
            },
        ],
    ],
};
module.exports = config;
