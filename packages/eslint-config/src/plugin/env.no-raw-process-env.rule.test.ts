import { test } from 'node:test'
import { RuleTester } from 'eslint'
import noRawProcessEnvRule from '../../build/plugin/env.no-raw-process-env.rule.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
})

test('app-env/no-raw-process-env', () => {
  tester.run('no-raw-process-env', noRawProcessEnvRule, {
    valid: [
      {
        filename: 'apps/webapp/src/env.ts',
        code: 'export const env = schema.parse(process.env)',
      },
      {
        filename: 'apps/webapp/src/env.mjs',
        code: 'export const env = schema.parse(process.env)',
      },
      {
        filename: 'apps/webapp/src/lib/site.ts',
        code: 'export const SITE_URL = env.NEXT_PUBLIC_SITE_URL',
      },
    ],
    invalid: [
      {
        filename: 'apps/webapp/src/lib/site.ts',
        code: 'export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL',
        errors: [{ messageId: 'noRawProcessEnv' }],
      },
      {
        filename: 'apps/docapp/src/lib/site.ts',
        code: 'const mode = process.env.E2E_MODE',
        errors: [{ messageId: 'noRawProcessEnv' }],
      },
      {
        filename: 'apps/webapp/src/lib/site.ts',
        code: 'const copy = { ...process.env }',
        errors: [{ messageId: 'noRawProcessEnv' }],
      },
    ],
  })
})
