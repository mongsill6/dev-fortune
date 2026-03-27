export default [
  {
    files: ['**/*.js', '**/*.mjs', '**/*.jsx'],
    ignores: ['node_modules/**', 'web/**', '.tui-bundle.mjs', 'src/tui/.bundle.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
  {
    ignores: ['node_modules/**', 'web/**', '.tui-bundle.mjs', 'src/tui/**', 'coverage/**'],
  },
];
