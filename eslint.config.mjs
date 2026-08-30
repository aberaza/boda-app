import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'src/data/flight-routes.json',
      '.astro/**',
      '*.jpeg',
      '**/*.astro',
      '.netlify/**',
      'memories/**',
    ],
  },
  js.configs.recommended,
  ...astro.configs.recommended,
  tseslint.configs.recommended[0],
  tseslint.configs.recommended[1],
  {
    ...tseslint.configs.recommended[2],
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ...tseslint.configs.recommended[0].languageOptions,
      globals: globals.browser,
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.mjs', '*.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**/*.ts', 'scripts/**/*.mjs', 'tests/**/*.ts', '*.config.ts'],
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
