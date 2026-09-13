import type { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import stepsRule from './datawh-etl.steps.rule.js'

/** Cloud Function job sources — not barrel `index.ts`, not compiled `lib/` / `deploy/`. */
export const DATAWH_ETL_FILES = ['**/gcp.cloudfunctions.Function/src/*.ts']

export const DATAWH_ETL_IGNORES = [
  '**/gcp.cloudfunctions.Function/src/index.ts',
  '**/lib/**',
  '**/deploy/**',
]

export const plugin: ESLint.Plugin = {
  meta: {
    name: 'datawh-etl',
  },
  rules: {
    'extract-transform-load': stepsRule,
  },
}

const recommended: Linter.Config = {
  name: '@sargonpiraev/datawh-etl',
  plugins: {
    'datawh-etl': plugin,
  },
  files: [...DATAWH_ETL_FILES],
  ignores: [...DATAWH_ETL_IGNORES],
  languageOptions: {
    parser: tseslint.parser,
    globals: {
      require: 'readonly',
      module: 'readonly',
    },
  },
  rules: {
    'datawh-etl/extract-transform-load': 'error',
    '@typescript-eslint/no-require-imports': 'off',
  },
}

export const configs = {
  recommended: [recommended],
}

export default recommended
