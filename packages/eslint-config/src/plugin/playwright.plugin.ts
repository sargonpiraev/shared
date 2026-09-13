import type { ESLint, Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import aaaStepsRule from './playwright.aaa-steps.rule.js'
import aspectTagsRule from './playwright.aspect-tags.rule.js'
import { WEBAPP_ASPECT_TAGS } from './playwright.ast.js'

/** Colocated App Router Playwright specs next to `page.tsx` in Next apps — not Jest `*.spec.ts`. */
export const PLAYWRIGHT_SPEC_FILES = [
  '**/apps/webapp/src/app/**/page.spec.{ts,tsx,js,mjs}',
  '**/apps/docapp/src/app/**/page.spec.{ts,tsx,js,mjs}',
]

export const plugin: ESLint.Plugin = {
  meta: {
    name: 'playwright-specs',
  },
  rules: {
    'aspect-tags': aspectTagsRule,
    'aaa-steps': aaaStepsRule,
  },
}

const recommended: Linter.Config = {
  name: '@sargonpiraev/playwright-specs',
  plugins: {
    'playwright-specs': plugin,
  },
  files: [...PLAYWRIGHT_SPEC_FILES],
  languageOptions: {
    parser: tseslint.parser,
  },
  rules: {
    'playwright-specs/aspect-tags': [
      'warn',
      {
        allowedTags: [...WEBAPP_ASPECT_TAGS],
        requiredTags: [...WEBAPP_ASPECT_TAGS],
      },
    ],
    'playwright-specs/aaa-steps': 'warn',
  },
}

export const configs = {
  recommended: [recommended],
}

export default recommended
