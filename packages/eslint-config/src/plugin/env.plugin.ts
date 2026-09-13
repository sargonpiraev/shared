import type { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import noRawProcessEnvRule from './env.no-raw-process-env.rule.js'

export const ENV_APP_FILES = [
  '**/apps/webapp/**/*.{ts,tsx,js,mjs,cjs}',
  '**/apps/docapp/**/*.{ts,tsx,js,mjs,cjs}',
]

export const ENV_APP_IGNORES = [
  '**/pulumi.ts',
  '**/pulumi/**',
  '**/playwright.config.ts',
  '**/playwright.*.config.ts',
  '**/playwright/**',
  '**/e2e/**',
  '**/scripts/**',
]

export const plugin: ESLint.Plugin = {
  meta: {
    name: 'app-env',
  },
  rules: {
    'no-raw-process-env': noRawProcessEnvRule,
  },
}

const recommended: Linter.Config = {
  name: '@sargonpiraev/app-env',
  plugins: {
    'app-env': plugin,
  },
  files: [...ENV_APP_FILES],
  ignores: [...ENV_APP_IGNORES],
  languageOptions: {
    parser: tseslint.parser,
  },
  rules: {
    'app-env/no-raw-process-env': 'error',
  },
}

export const configs = {
  recommended: [recommended],
}

export default recommended
