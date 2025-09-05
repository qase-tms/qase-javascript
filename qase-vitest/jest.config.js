/* eslint-disable */
module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['js', 'ts'],
  collectCoverage: true,
  testEnvironment: 'node',
};
