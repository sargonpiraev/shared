import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      'src/generated/**',
      'bin/',
      'src/webapp/report-fn/node_modules/',
      'src/webapp/report-fn/lib/',
      'src/webapp/report-fn/deploy/',
    ],
  },
]
