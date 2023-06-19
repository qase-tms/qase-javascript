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
        debug: true,

        testops: {
          api: {
            token: 'api_key',
            baseUrl: 'http://api.qase.lo/v1',
          },

          projectCode: 'project_code',

          run: {
            complete: true,
            environment: 1,
          },
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
