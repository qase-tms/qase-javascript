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
          },

          project: 'project_code',

          run: {
            complete: true,
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
