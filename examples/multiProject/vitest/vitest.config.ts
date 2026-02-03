import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    reporters: [
      'default',
      [
        'vitest-qase-reporter',
        {
          mode: 'testops_multi',
          debug: true,
          testops: {
            api: {
              token: process.env.QASE_TOKEN ?? '<token>',
            },
          },
          testops_multi: {
            default_project: 'PROJ1',
            projects: [
              { code: 'PROJ1', run: { title: 'Vitest multi-project run', complete: true } },
              { code: 'PROJ2', run: { title: 'Vitest multi-project run', complete: true } },
            ],
          },
          captureLogs: true,
        },
      ],
    ],
  },
});
