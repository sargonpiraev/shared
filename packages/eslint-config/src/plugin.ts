import type { ESLint } from 'eslint'
import aaaStepsRule from './rules/aaa-steps.js'
import aspectTagsRule from './rules/aspect-tags.js'

export const playwrightSpecsPlugin: ESLint.Plugin = {
  meta: {
    name: 'playwright-specs',
  },
  rules: {
    'aspect-tags': aspectTagsRule,
    'aaa-steps': aaaStepsRule,
  },
}
