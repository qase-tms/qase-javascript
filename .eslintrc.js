module.exports = {
  root: true,

  env: {
    node: true,
    es6: true,
  },

  parserOptions: {
    ecmaVersion: 'latest',
    project: ['tsconfig.json'],
    tsconfigRootDir: __dirname,
  },

  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },

  extends: ['eslint:recommended', 'plugin:import/recommended'],

  rules: {
    'import/no-extraneous-dependencies': 'error',
  },

  overrides: [{
    files: '**/*.ts',

    extends: [
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:@typescript-eslint/strict',
    ],

    rules: {
      // Static-only classes group a module's helpers; the codebase uses them throughout.
      '@typescript-eslint/no-extraneous-class': ['warn', { allowStaticOnly: true }],
    },
  }, {
    // Tests read private state and assert on values they have just checked.
    files: '**/test/**/*.ts',

    rules: {
      '@typescript-eslint/dot-notation': ['warn', { allowPrivateClassPropertyAccess: true, allowProtectedClassPropertyAccess: true }],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  }],
};
