import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    testTimeout: 10000,
    include: ['test/**/*.test.ts'],
    reporters: [
      'default',
      ['vitest-qase-reporter',
        {
          debug: true,
          testops: {
            api: {
              token: "<token>",
            },
            run: {
              complete: true,
            },
            project: "<project_code>",
            uploadAttachments: true,
            showPublicReportLink: true,
          },
          captureLogs: true,
        }
      ],
    ],
  },
});
