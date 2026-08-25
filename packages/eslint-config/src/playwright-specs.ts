import type { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { playwrightSpecsPlugin } from './plugin.js'
import { WEBAPP_ASPECT_TAGS } from './playwright-ast.js'

/** Playwright spec rules (warn while existing suites migrate). */
export const playwrightSpecsConfig: Linter.Config[] = [
  {
    name: '@sargonpiraev/playwright-specs',
    plugins: {
      'playwright-specs': playwrightSpecsPlugin,
    },
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.mjs'],
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
  },
]
