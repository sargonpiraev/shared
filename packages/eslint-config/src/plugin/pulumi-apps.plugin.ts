import type { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import envRule from './pulumi-apps.env.rule.js'

export const PULUMI_APP_FILES = ['**/apps/*/pulumi.ts']

export const plugin: ESLint.Plugin = {
  meta: {
    name: 'pulumi-apps',
  },
  rules: {
    'no-process-env': envRule,
  },
}

const recommended: Linter.Config = {
  name: '@sargonpiraev/pulumi-apps-env',
  plugins: {
    'pulumi-apps': plugin,
  },
  files: [...PULUMI_APP_FILES],
  languageOptions: {
    parser: tseslint.parser,
  },
  rules: {
    'pulumi-apps/no-process-env': 'error',
  },
}

export const configs = {
  recommended: [recommended],
}

export default recommended
