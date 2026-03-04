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
        mode: 'testops_multi',
        debug: true,
        testops: {
          api: {
            token: 'token',
          },
        },
        testops_multi: {
          default_project: 'PROJ1',
          projects: [
            { code: 'PROJ1', run: { title: 'PROJ1 Playwright multi-project run', complete: true } },
            { code: 'PROJ2', run: { title: 'PROJ2 Playwright multi-project run', complete: true } },
          ],
        },
      },
    ],
  ],
};

module.exports = config;
