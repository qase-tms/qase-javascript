import { defineConfig } from 'vitest/config';
// import { VitestQaseReporter } from 'vitest-qase-reporter';

export default defineConfig({
  test: {
    watch: false,
    reporters: [
      'default',
      ['vitest-qase-reporter',
        {
          mode: 'testops',
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
          },
          captureLogs: true,
        }
      ],
    ],
  },
});
