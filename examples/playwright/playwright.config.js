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
        debug: true,

        testops: {
          api: {
            token: 'api_key',
            baseUrl: 'http://api.qase.lo/v1',
          },

          projectCode: 'project_code',
          uploadAttachments: true,

          run: {
            complete: true,
            environment: 1,
          },
        },
      },
    ],
  ],
};

module.exports = config;
