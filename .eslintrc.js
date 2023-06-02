module.exports = {
  root: true,

  env: {
    node: true,
    es6: true,
  },

  parserOptions: {
    project: ['tsconfig.json'],
    tsconfigRootDir: __dirname,
  },

  extends: [
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
  ],

  rules: {
    'import/no-extraneous-dependencies': 'error',
  },
};
