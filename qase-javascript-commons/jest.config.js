/* eslint-disable */
module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        skipLibCheck: true,
      },
      isolatedModules: true,
    }],
  },
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['js', 'ts'],
  collectCoverage: true,
  testEnvironment: 'node',
};
