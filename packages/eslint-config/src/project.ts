import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import * as datawhEtlPlugin from './plugin/datawh-etl.plugin.js'
import * as envPlugin from './plugin/env.plugin.js'
import * as playwrightPlugin from './plugin/playwright.plugin.js'
import * as pulumiAppsPlugin from './plugin/pulumi-apps.plugin.js'

/** Flat-config preset for TypeScript / JavaScript source. Not a repo-governance gate. */
const project = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/.source/**',
      '**/.wxt/**',
      '**/_archive/**',
      '**/coverage/**',
      '**/generated/**',
      '**/script/**',
      '**/openapi-ts.config.ts',
      '**/pulumi/functions/**/lib/**',
      '**/pulumi/functions/**/deploy/**',
      '**/pulumi/sdks/**',
      '**/.venv/**',
      '**/.expo/**',
      '**/next-env.d.ts',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.cjs', '**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        require: 'off',
        module: 'off',
        exports: 'off',
        __dirname: 'off',
        __filename: 'off',
      },
    },
  },
  ...playwrightPlugin.configs.recommended,
  ...envPlugin.configs.recommended,
  ...pulumiAppsPlugin.configs.recommended,
  ...datawhEtlPlugin.configs.recommended
)

export default project
