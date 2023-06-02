module.exports = {
  root: true,

  env: {
    node: true,
    es6: true,
  },

  parserOptions: {
    ecmaVersion: "latest",
    project: ['tsconfig.json'],
    tsconfigRootDir: __dirname,
  },

  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },

  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
  ],

  rules: {
    'import/no-extraneous-dependencies': 'error',
  },

  overrides: [{
    files: "**/*.ts",

    extends: [
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:@typescript-eslint/strict',
    ],
  }]
};
