module.exports = {
  globals: {},
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  reporters: [
    'default',
    [
      'jest-qase-reporter',
      {
        mode: 'testops_multi',
        debug: true,
        testops: {
          api: {
            token: process.env.QASE_TOKEN || 'api_key',
          },
        },
        testops_multi: {
          default_project: 'PROJ1',
          projects: [
            { code: 'PROJ1', run: { title: 'Jest multi-project run', complete: true } },
            { code: 'PROJ2', run: { title: 'Jest multi-project run', complete: true } },
          ],
        },
      },
    ],
  ],
  roots: ['<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.js?(x)',
    '**/?(*.)+(spec|test).js?(x)',
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
};
