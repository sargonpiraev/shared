import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

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
      '**/coverage/**',
      '**/generated/**',
      '**/script/**',
      '**/openapi-ts.config.ts',
    ],
  },
  {
    files: ['**/*.cjs', '**/*.js', '**/*.mjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  }
)

export default project
