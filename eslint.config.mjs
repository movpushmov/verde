import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  globalIgnores(['**/dist/']),
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],

    languageOptions: { globals: globals.browser },
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
]);
