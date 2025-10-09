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
          },

          project: 'project_code',
          uploadAttachments: true,
          showPublicReportLink: true,

          run: {
            complete: true,
          },
        },
      },
    ],
  ],
};

module.exports = config;
