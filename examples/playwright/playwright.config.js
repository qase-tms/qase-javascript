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

        testops: {
          apiToken: 'api_key',
          projectCode: 'project_code',
          baseUrl: 'https://qase.io',
          uploadAttachments: true,
          runComplete: true,
          environmentId: 1,
        },

        report: {
          path: './qase/reports',
        },
      },
    ],
  ],
};

module.exports = config;
