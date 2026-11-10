// ESLint (flat config) para backend (CommonJS/Node) e frontend (ESM/React).
const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', 'backend/prisma/migrations/**'] },
  js.configs.recommended,
  {
    files: ['backend/**/*.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: { ...globals.node } },
  },
  {
    files: ['backend/tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ['frontend/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Sem eslint-plugin-react: marca variáveis usadas só em JSX como usadas.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['frontend/**/*.test.{js,jsx}', 'frontend/src/test/**'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  prettier,
];
