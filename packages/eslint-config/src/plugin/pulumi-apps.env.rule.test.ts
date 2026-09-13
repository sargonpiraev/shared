import { test } from 'node:test'
import { RuleTester } from 'eslint'
import envRule from '../../build/plugin/pulumi-apps.env.rule.js'

const tester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
})

test('pulumi-apps/no-process-env', () => {
  tester.run('no-process-env', envRule, {
    valid: [
      {
        filename: 'apps/webapp/src/env.ts',
        code: 'export const x = process.env.VERCEL_API_TOKEN',
      },
      {
        filename: 'apps/webapp/pulumi.ts',
        code: `
          process.env.PATH = '/bin:' + (process.env.PATH ?? '')
          const env = parseWebappEnv()
          void env.VERCEL_API_TOKEN
        `,
      },
      {
        filename: 'apps/extapp/pulumi.ts',
        code: `process.env.PATH = process.env['PATH'] ?? ''`,
      },
    ],
    invalid: [
      {
        filename: 'apps/webapp/pulumi.ts',
        code: 'const t = process.env.VERCEL_API_TOKEN',
        errors: [{ messageId: 'noProcessEnv' }],
      },
      {
        filename: 'apps/extapp/pulumi.ts',
        code: 'const k = process.env.GCP_SERVICE_ACCOUNT_KEY',
        errors: [{ messageId: 'noProcessEnv' }],
      },
      {
        filename: 'apps/mobapp/pulumi.ts',
        code: 'void process.env',
        errors: [{ messageId: 'noProcessEnv' }],
      },
    ],
  })
})
