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
            token: '<token>',
          },

          project: '<project_code>',
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
